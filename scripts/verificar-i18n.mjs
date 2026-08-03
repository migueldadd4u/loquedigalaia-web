// Verifica que la web está realmente traducida en todos los idiomas.
//
// No se fía de que exista el fichero de diccionario: mira el HTML ya generado y
// busca texto que siga en español. Distingue dos fallos distintos, porque se
// arreglan de forma distinta:
//
//   ROTO     — hay traducción para esa cadena y aun así salió en español.
//              Es un fallo del pipeline (clave que no casa byte a byte, carácter
//              prohibido, cadena partida en varios nodos…).
//   SIN      — no hay traducción para esa cadena en ese idioma. Falta trabajo
//              de traducción, no de código.
//
// Además comprueba las invariantes que el pipeline impone en silencio: caracteres
// prohibidos, nombres propios que no deben traducirse y cifras que no deben cambiar.
//
// Uso: node scripts/verificar-i18n.mjs [directorio]   (por defecto out)

import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "node-html-parser";

const OUT = process.argv[2] ?? "out";
const DICT_DIR = "content/i18n";
const PROTEGIDOS = ["Lo que diga la IA", "ClonMADv3", "Jarvis", "Add4u", "Alastria", "ISBE", "GestDocAI"];
const PROHIBIDOS = /["<>&\\]/;

const localesSource = await readFile(new URL("../content/locales.ts", import.meta.url), "utf8");
const locales = [...localesSource.matchAll(
  /\{\s*id:\s*"([^"]+)",\s*prefix:\s*"([^"]*)",\s*hreflang:\s*"([^"]+)",[^}]*?source:\s*"([^"]+)"\s*\}/g,
)].map(([, id, prefix, hreflang, source]) => ({ id, prefix, hreflang, source }));

// --- mismas reglas de extracción que scripts/i18n-build.mjs ---
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT"]);
function skipSubtree(el) {
  if (SKIP_TAGS.has(el.tagName)) return true;
  const cls = el.getAttribute?.("class") ?? "";
  return /\bbrand-lqdia\b|\blang-switcher\b/.test(cls);
}
function traducible(core) {
  if (!core || core.length < 2) return false;
  if (/^[\d\s.,%·|/–—-]+$/.test(core)) return false;
  if (/^(https?:|mailto:|tel:|\/)/.test(core)) return false;
  return /\p{L}/u.test(core);
}
function textos(node, out) {
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      const core = child.rawText.trim();
      if (traducible(core)) out.push(core);
      continue;
    }
    if (child.nodeType !== 1 || skipSubtree(child)) continue;
    textos(child, out);
  }
  return out;
}

function cifras(texto) {
  return (texto.match(/\d+(?:[.,]\d+)*/g) ?? []).map((t) => t.replace(",", ".")).sort();
}


/**
 * Cadenas que NO hay que traducir en ningún idioma, y que por tanto no cuentan
 * como fallo si salen igual: nombres propios de la casa, dominios, correos y
 * cualquier cadena con un carácter que el pipeline descarta.
 * Es la misma regla con la que se genera la lista que reciben los traductores.
 */
function exenta(s) {
  if (PROTEGIDOS.includes(s)) return true;
  if (PROHIBIDOS.test(s)) return true;
  if (/^[^\s@]+@[^\s@]+$/.test(s)) return true; // correo suelto
  if (/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(s) && !s.includes(" ")) return true; // dominio o ruta
  return false;
}

async function htmlDe(dir) {
  const files = [];
  for (const e of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (e.isFile() && e.name.endsWith(".html")) files.push(join(e.parentPath ?? e.path, e.name));
  }
  return files;
}

// --- 1) invariantes de cada diccionario ---
const fuentes = [...new Set(locales.map((l) => l.source))].filter((s) => s !== "es");
const dicts = new Map();
let fallos = 0;

// Lo que hay que traducir: el inventario español menos lo exento.
const inventario = JSON.parse(await readFile(join(DICT_DIR, "_inventory.json"), "utf8"));
const deben = new Set(inventario.filter((s) => !exenta(s)));
console.log(`Inventario: ${inventario.length} cadenas · a traducir: ${deben.size}\n`);

console.log("DICCIONARIOS\n");
for (const fuente of fuentes) {
  const ruta = join(DICT_DIR, `${fuente}.json`);
  if (!existsSync(ruta)) {
    console.log(`  ✗ ${fuente.padEnd(10)} no existe`);
    fallos += 1;
    continue;
  }
  const dict = JSON.parse(await readFile(ruta, "utf8"));
  dicts.set(fuente, dict);

  const problemas = [];
  for (const [k, v] of Object.entries(dict)) {
    // Las claves exentas (marca, dominios, correos, `<!DOCTYPE html>`) están en
    // los diccionarios porque alguien los normalizó contra el inventario. El
    // pipeline no las aplica nunca, así que quejarse de ellas es ruido — y un
    // aviso que salta siempre acaba ignorándose, que es peor que no tenerlo.
    if (exenta(k)) continue;
    if (PROHIBIDOS.test(k) || PROHIBIDOS.test(v)) problemas.push(`carácter prohibido: ${k.slice(0, 40)}`);
    // Las cifras no pueden perderse ni cambiar de valor. Dos matices, aprendidos
    // a base de falsos positivos:
    //  - No se exige el mismo multiconjunto: hay idiomas que reescriben las fechas
    //    («10 de enero de 1991» → «1991 年 1 月 10 日») repitiendo o reordenando.
    //  - Solo se exigen las cifras que son REFERENCIA —las que llevan barra o
    //    punto («34/2002», «6.1») o tienen tres dígitos o más—. Un número suelto
    //    y pequeño puede escribirse con letra sin perder nada: «Fase 1» es
    //    «第一阶段» en chino, y eso es una traducción correcta, no un fallo.
    const referencia = (n) => /[./]/.test(n) || n.replace(/\D/g, "").length >= 3;
    const perdidas = cifras(k).filter((n) => referencia(n) && !cifras(v).includes(n));
    if (perdidas.length) problemas.push(`pierde las cifras ${perdidas.join(", ")}: ${k.slice(0, 40)}`);
    for (const nombre of PROTEGIDOS) {
      if (k.includes(nombre) && !v.includes(nombre)) problemas.push(`pierde «${nombre}»: ${k.slice(0, 40)}`);
    }
  }
  // Una entrada con valor igual a la clave significa «en este idioma se escribe
  // igual», y para una palabra suelta es normal. Para una FRASE LARGA es casi
  // siempre un olvido disfrazado de decisión: así se quedó el título de la
  // portada en castellano dentro del asturiano, y lo vio MAD a ojo antes que
  // este script. No es motivo de aborto —a veces coinciden de verdad—, pero
  // tiene que decirse en voz alta y quedar revisado.
  const identicas = Object.entries(dict)
    .filter(([k, v]) => k === v && k.length > 40)
    .map(([k]) => k);

  const marca = problemas.length === 0 ? "✓" : "✗";
  console.log(
    `  ${marca} ${fuente.padEnd(10)} ${String(Object.keys(dict).length).padStart(4)} entradas` +
      `${problemas.length ? ` · ${problemas.length} problemas` : ""}` +
      `${identicas.length ? ` · ⚠ ${identicas.length} frases largas idénticas al español` : ""}`,
  );
  for (const p of problemas.slice(0, 5)) console.log(`      · ${p}`);
  for (const k of identicas.slice(0, 5)) console.log(`      ⚠ sin traducir (o idéntica): ${k.slice(0, 70)}`);
  if (problemas.length) fallos += problemas.length;
}

// --- 2) texto que sigue en español en el HTML generado ---
console.log("\nHTML GENERADO (texto que sigue en español)\n");
console.log("  idioma       páginas   ROTO   SIN   ejemplo");
for (const locale of locales) {
  // Las variantes por país del español (es-MX, es-AR…) comparten el texto
  // castellano a propósito: que estén en español no es un fallo.
  if (!locale.prefix || locale.source === "es") continue;
  const dir = join(OUT, locale.prefix);
  if (!existsSync(dir)) {
    console.log(`  ✗ ${locale.id.padEnd(10)} sin directorio`);
    fallos += 1;
    continue;
  }
  const dict = dicts.get(locale.source) ?? {};
  const ficheros = await htmlDe(dir);
  const roto = new Set();
  const sin = new Set();
  for (const f of ficheros) {
    const root = parse(await readFile(f, "utf8"));
    for (const t of textos(root, [])) {
      if (exenta(t) || !deben.has(t)) continue;
      // Si el diccionario mapea la cadena a sí misma, el traductor está diciendo
      // «en este idioma se escribe igual»: es una decisión, no un olvido.
      if (Object.hasOwn(dict, t)) {
        if (dict[t] !== t) roto.add(t); // había traducción y el pipeline no la aplicó
        continue;
      }
      sin.add(t);
    }
  }
  const ok = roto.size === 0 && sin.size === 0;
  const ejemplo = [...roto][0] ?? [...sin][0] ?? "";
  console.log(
    `  ${ok ? "✓" : "✗"} ${locale.id.padEnd(10)} ${String(ficheros.length).padStart(5)}  ${String(roto.size).padStart(5)} ${String(sin.size).padStart(5)}   ${ejemplo.slice(0, 45)}`,
  );
  if (roto.size) {
    fallos += roto.size;
    for (const r of [...roto].slice(0, 3)) console.log(`      ROTO · ${r.slice(0, 80)}`);
  }
  if (sin.size) {
    fallos += sin.size;
    for (const s of [...sin].slice(0, 3)) console.log(`      SIN  · ${s.slice(0, 80)}`);
  }
}

// --- 3) los enlaces internos no pueden traducirse ---
// Una clave corta que coincida con un segmento de URL rompe el enlace y encima
// le quita el prefijo de idioma. Ya pasó con `manifiesto`: aquí se vigila.
console.log("\nENLACES INTERNOS\n");
const enlacesDe = async (fichero) => {
  const html = await readFile(fichero, "utf8");
  return new Set([...html.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1]));
};
const enlacesEs = await enlacesDe(join(OUT, "index.html"));
for (const locale of locales) {
  if (!locale.prefix) continue;
  const fichero = join(OUT, locale.prefix, "index.html");
  if (!existsSync(fichero)) continue;
  const suyos = [...(await enlacesDe(fichero))].map((l) =>
    l.startsWith(`/${locale.prefix}/`) ? l.slice(locale.prefix.length + 1) : l,
  );
  const rotos = suyos.filter((l) => !enlacesEs.has(l));
  console.log(`  ${rotos.length ? "✗" : "✓"} ${locale.id.padEnd(10)} ${rotos.length ? rotos.join(", ") : "todos apuntan a una ruta real"}`);
  fallos += rotos.length;
}

console.log(
  fallos === 0
    ? "\n✓ Nada queda sin traducir y ningún enlace se ha roto."
    : `\n✗ ${fallos} problemas. Nada se publica hasta que esto salga limpio.`,
);
process.exit(fallos === 0 ? 0 : 1);
