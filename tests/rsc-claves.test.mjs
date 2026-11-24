// Las claves de los elementos React del payload RSC no se traducen.
//
// Cada elemento del flight payload es `["$","<tipo>","<clave>",{props}]`. La clave es un
// identificador de máquina: React la usa para reconciliar y, en /pulso, la clave de un
// indicador («tareas-despachadas-7d») abre la fila que sigue a la fila T del gráfico.
// scripts/i18n-build.mjs traduce el HTML entero de una vez y la clave corta
// «tareas»→«tasks» de en.json la reescribía: fixFlightTextRows dejaba de encontrar el
// cierre de la fila T y la build abortaba (Deploy producción en rojo del 17/11 al
// 24/11/2026, web sin desplegar esa semana).
//
// Este test exige que, para cada idioma y cada ruta, las claves sean las del español.
// Corre tras `npm run build:static` (lo encadena el propio `npm test`).
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import test from "node:test";

const OUT = join(process.cwd(), "out");
const FLIGHT_RE = /<script>self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)<\/script>/g;
const KEY_RE = /\["\$","[^"\\]+","([^"\\]+)",/g;

const localesSrc = await readFile(join(process.cwd(), "content", "locales.ts"), "utf8");
const prefixes = [...localesSrc.matchAll(/prefix: "([^"]+)"/g)].map(([, p]) => p).filter(Boolean);

const routes = [];
for (const e of await readdir(OUT, { withFileTypes: true, recursive: true })) {
  if (!e.isFile() || e.name !== "index.html") continue;
  const rel = relative(OUT, join(e.parentPath ?? e.path, e.name));
  if (prefixes.includes(rel.split("/")[0]) || rel === "404/index.html") continue;
  routes.push(rel);
}
routes.sort();

function keys(html) {
  const parts = [];
  for (const m of html.matchAll(FLIGHT_RE)) {
    try { parts.push(JSON.parse(`"${m[1]}"`)); } catch { /* literal ajeno: fuera */ }
  }
  // Las claves que son rutas o URL se localizan a propósito (prefixLinks y el enlace al
  // portal de la denuncia en su idioma): eso no es traducir y aquí no se compara.
  return [...parts.join("").matchAll(KEY_RE)].map(([, k]) => k).filter((k) => !k.includes("/"));
}

const es = new Map();
for (const rel of routes) es.set(rel, keys(await readFile(join(OUT, rel), "utf8")));

test("el español lleva claves de elemento en el payload, /pulso incluida", () => {
  assert.ok(routes.length >= 13, `solo ${routes.length} rutas en out/`);
  assert.ok(es.get("pulso/index.html")?.includes("tareas-despachadas-7d"),
    "pulso/index.html: falta la clave «tareas-despachadas-7d» que reprodujo el fallo");
});

for (const prefix of prefixes) {
  test(`claves de elemento del payload RSC sin traducir en /${prefix}/`, async () => {
    const bad = [];
    for (const [rel, want] of es) {
      const got = keys(await readFile(join(OUT, prefix, rel), "utf8"));
      const diff = want.map((k, i) => (k === got[i] ? null : `${k}→${got[i]}`)).filter(Boolean);
      if (got.length !== want.length || diff.length) {
        bad.push(`${prefix}/${rel}: ${got.length}/${want.length} claves · ${diff.slice(0, 3).join(", ")}`);
      }
    }
    assert.deepEqual(bad, []);
  });
}
