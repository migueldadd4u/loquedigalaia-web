// Los segmentos de ruta del payload RSC no se traducen.
//
// La fila 0 del flight payload lleva el árbol del router (`"f":[[["",{"children":
// ["manifiesto",{…}]}…]]`) y las partes de la URL canónica (`"c":["","manifiesto",""]`).
// Son identificadores de máquina: el router de Next los usa como claves de caché y de
// prefetch. scripts/i18n-build.mjs traduce el HTML entero de una vez y la clave corta
// «manifiesto»→«宣言» de zh.json se comía el segmento: /zh/manifiesto/ lanzaba en consola
// `InvalidCharacterError: Failed to execute 'btoa'` desde createSegmentRequestKeyPart
// (visto en producción el 26/09/2026). En los idiomas de alfabeto latino no había
// excepción, pero el árbol decía «manifesto» para una ruta que se llama «manifiesto».
//
// Este test exige que, para cada idioma y cada ruta, el árbol y las partes canónicas
// sean idénticos a los del español.
// Corre tras `npm run build:static` (lo encadena el propio `npm test`).
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import test from "node:test";

const OUT = join(process.cwd(), "out");
const FLIGHT_RE = /<script>self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)<\/script>/g;

const localesSrc = await readFile(join(process.cwd(), "content", "locales.ts"), "utf8");
const prefixes = [...localesSrc.matchAll(/prefix: "([^"]+)"/g)].map(([, p]) => p).filter(Boolean);

// Las rutas españolas que i18n-build copia a cada idioma (la página de error no se copia).
const routes = [];
for (const e of await readdir(OUT, { withFileTypes: true, recursive: true })) {
  if (!e.isFile() || e.name !== "index.html") continue;
  const rel = relative(OUT, join(e.parentPath ?? e.path, e.name));
  if (prefixes.includes(rel.split("/")[0]) || rel === "404/index.html") continue;
  routes.push(rel);
}
routes.sort();

function flightStream(html) {
  const parts = [];
  for (const m of html.matchAll(FLIGHT_RE)) {
    try { parts.push(JSON.parse(`"${m[1]}"`)); } catch { /* literal ajeno: fuera */ }
  }
  return parts.join("");
}

// La fila 0 es JSON en una sola línea: de ella salen `c` y el árbol `f[0][0]`.
function routerRow(html) {
  const m = /(?:^|\n)0:([^\n]*)/.exec(flightStream(html));
  if (!m) return null;
  const row = JSON.parse(m[1]);
  const segments = [];
  const walk = ([segment, slots], path) => {
    const here = `${path}${JSON.stringify(segment)}`;
    segments.push(here);
    for (const key of Object.keys(slots ?? {}).sort()) walk(slots[key], `${here} ${key}→`);
  };
  walk(row.f[0][0], "");
  return { c: row.c, segments };
}

const es = new Map();
for (const rel of routes) es.set(rel, routerRow(await readFile(join(OUT, rel), "utf8")));

test("el español tiene árbol de router y sus partes canónicas casan con la ruta", () => {
  assert.ok(routes.length >= 13, `solo ${routes.length} rutas en out/`);
  for (const [rel, row] of es) {
    assert.ok(row, `${rel}: sin fila 0 en el payload RSC`);
    const parts = rel === "index.html" ? ["", ""] : ["", ...rel.replace(/\/index\.html$/, "").split("/"), ""];
    assert.deepEqual(row.c, parts, `${rel}: "c" no casa con la ruta`);
    const leaf = parts.at(-2);
    if (leaf) {
      assert.ok(row.segments.some((s) => s.endsWith(JSON.stringify(leaf)) || s.endsWith(JSON.stringify(`/${leaf}`))),
        `${rel}: el árbol no contiene el segmento «${leaf}»: ${row.segments.join(" | ")}`);
    }
  }
});

for (const prefix of prefixes) {
  test(`segmentos de ruta del payload RSC sin traducir en /${prefix}/`, async () => {
    const bad = [];
    for (const [rel, want] of es) {
      const got = routerRow(await readFile(join(OUT, prefix, rel), "utf8"));
      if (!got) { bad.push(`${prefix}/${rel}: sin fila 0 en el payload RSC`); continue; }
      if (JSON.stringify(got.c) !== JSON.stringify(want.c)) {
        bad.push(`${prefix}/${rel}: "c" ${JSON.stringify(got.c)} ≠ ${JSON.stringify(want.c)}`);
      }
      if (JSON.stringify(got.segments) !== JSON.stringify(want.segments)) {
        bad.push(`${prefix}/${rel}: árbol ${got.segments.join(" | ")} ≠ ${want.segments.join(" | ")}`);
      }
    }
    assert.deepEqual(bad, []);
  });
}
