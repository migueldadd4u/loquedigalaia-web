// Guardián de publicación: se ejecuta ANTES de `wrangler deploy` y aborta si lo
// que hay en out/ no es publicable. Existe por un susto real: la web estuvo a un
// `git merge` de olvidar de perder el aviso legal, porque producción salía de una
// rama y el trabajo seguía en otra. Un despliegue no puede depender de que alguien
// se acuerde.
//
// Comprueba cuatro cosas, en este orden de gravedad:
//   1. LEGAL   — las páginas preceptivas existen y llevan sus datos. Sin esto la
//                web incumple el art. 10 de la LSSI-CE. Es motivo de aborto.
//   2. IDIOMAS — cada locale declarado tiene sus páginas. Un idioma a medias es
//                una web rota para quien la abre en ese idioma.
//   3. RASTRO  — sitemap y canónicas presentes.
//   4. PULSO   — el checkpoint público existe, es válido y contiene exactamente
//                el mismo pulso que /pulso.json.
//
// La verificación de que el TEXTO está traducido vive en scripts/verificar-i18n.mjs,
// que este guardián invoca al final: son preguntas distintas y conviene poder
// ejecutarlas por separado.
//
// Uso: node scripts/antes-de-publicar.mjs [directorio]   (por defecto out)

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import { validatePulsoState } from "./lib/pulso-state.mjs";

const OUT = process.argv[2] ?? "out";

// Lo que la ley exige que esté publicado y qué debe contener cada página.
// Los valores son fragmentos que deben aparecer literalmente en el HTML español.
const EXIGIDO = {
  "aviso-legal": [
    "01178330V", // DNI de los promotores: art. 10.e LSSI-CE
    "51429410F",
    "Calle Puerta de Abajo", // domicilio: art. 10.a
    "migueld@add4u.com", // medio de contacto directo y efectivo: art. 10.a
    "B-84428879", // deslinde de las certificaciones de Add4u
    "Ley 3/1991", // compromiso de no inducir a error
  ],
  privacidad: ["Reglamento (UE) 2016/679", "Agencia Española de Protección de Datos"],
  cookies: ["Ley 34/2002"],
  accesibilidad: ["2.2"],
  // El deslinde es lo que convierte /respaldo en legítimo: sin él, contar el
  // ENS o las ISO de Add4u sería presumir de lo ajeno (Ley 3/1991).
  respaldo: ["Las certificaciones son de", "Ninguna organización citada nos respalda"],
};

let fallos = 0;
const mal = (msg) => {
  console.error(`  ✗ ${msg}`);
  fallos += 1;
};

console.log("ANTES DE PUBLICAR\n");

// 1) Páginas preceptivas, con su contenido.
console.log("Páginas legales");
for (const [ruta, fragmentos] of Object.entries(EXIGIDO)) {
  const fichero = join(OUT, ruta, "index.html");
  if (!existsSync(fichero)) {
    mal(`/${ruta}/ NO EXISTE — la web no se puede publicar sin ella`);
    continue;
  }
  const html = await readFile(fichero, "utf8");
  const faltan = fragmentos.filter((f) => !html.includes(f));
  if (faltan.length) mal(`/${ruta}/ ha perdido: ${faltan.join(", ")}`);
  else console.log(`  ✓ /${ruta}/`);
}

// 2) Cada idioma declarado tiene sus páginas.
console.log("\nIdiomas");
const localesSource = await readFile(new URL("../content/locales.ts", import.meta.url), "utf8");
const prefijos = [...localesSource.matchAll(/prefix:\s*"([^"]*)"/g)]
  .map(([, p]) => p)
  .filter(Boolean);
const rutas = [...Object.keys(EXIGIDO), "", "manifiesto", "contacto"];
let idiomasMal = 0;
for (const prefijo of prefijos) {
  const faltan = rutas.filter((r) => !existsSync(join(OUT, prefijo, r, "index.html")));
  if (faltan.length) {
    mal(`/${prefijo}/ sin: ${faltan.map((r) => r || "(portada)").join(", ")}`);
    idiomasMal += 1;
  }
}
if (!idiomasMal) console.log(`  ✓ los ${prefijos.length} idiomas tienen todas sus páginas`);

// 3) Rastro para buscadores.
console.log("\nRastro");
const sitemap = join(OUT, "sitemap.xml");
if (!existsSync(sitemap)) mal("falta sitemap.xml");
else {
  const xml = await readFile(sitemap, "utf8");
  const faltan = Object.keys(EXIGIDO).filter((r) => !xml.includes(`/${r}/`));
  if (faltan.length) mal(`sitemap.xml no lista: ${faltan.join(", ")}`);
  else console.log("  ✓ sitemap.xml completo");
}

// 4) Checkpoint público para que la siguiente ejecución pueda recuperar el
// último estado válido sin depender de commits en data/**.
console.log("\nCheckpoint del pulso");
const stateFile = join(OUT, "pulso-state.json");
const publicPulsoFile = join(OUT, "pulso.json");
if (!existsSync(stateFile)) {
  mal("falta pulso-state.json — la siguiente ejecución perdería el estado efímero");
} else if (!existsSync(publicPulsoFile)) {
  mal("falta pulso.json");
} else {
  try {
    const state = validatePulsoState(JSON.parse(await readFile(stateFile, "utf8")));
    const publicPulso = JSON.parse(await readFile(publicPulsoFile, "utf8"));
    if (!isDeepStrictEqual(state.pulso, publicPulso)) {
      mal("pulso-state.json y pulso.json no contienen el mismo snapshot");
    } else {
      console.log(`  ✓ checkpoint v${state.version} válido y coherente con /pulso.json`);
    }
  } catch (error) {
    mal(`pulso-state.json inválido: ${error.message}`);
  }
}

// 5) Y que el texto esté además traducido.
console.log("\nTraducción\n");
const i18n = spawnSync(process.execPath, ["scripts/verificar-i18n.mjs", OUT], {
  encoding: "utf8",
});
process.stdout.write(i18n.stdout?.split("\n").slice(-3).join("\n") ?? "");
if (i18n.status !== 0) {
  mal("queda texto sin traducir — ejecuta scripts/verificar-i18n.mjs para el detalle");
}

console.log(
  fallos === 0
    ? "\n✓ Publicable.\n"
    : `\n✗ ${fallos} motivos para NO publicar. Arréglalos antes de wrangler deploy.\n`,
);
process.exit(fallos === 0 ? 0 : 1);
