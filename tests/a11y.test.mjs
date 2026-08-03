// axe-core sobre el HTML renderizado (gate F1: cero violaciones WCAG 2.x AA).
// jsdom no calcula layout real: la regla color-contrast se desactiva aquí y el
// contraste se verifica con medición manual registrada en docs/TESTING.md.
// Corre tras `npm run build:static` (lo encadena el propio `npm test`).
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import test from "node:test";
import { JSDOM } from "jsdom";
import axe from "axe-core";

const OUT = join(process.cwd(), "out");

async function filesBelow(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await filesBelow(path)));
    else files.push(path);
  }
  return files;
}

/* Español (raíz, la fuente) e inglés (traducción completa): las dos caras del
   contrato de contenido. Las variantes regionales heredan el mismo HTML. */
const targets = (await filesBelow(OUT))
  .map((p) => relative(OUT, p).split(sep).join("/"))
  .filter((rel) => {
    if (!rel.endsWith(".html")) return false;
    if (rel === "404.html" || rel === "404/index.html") return false;
    if (rel.split("/").some((part) => part.startsWith("_"))) return false;
    return !rel.includes("/") || rel.startsWith("en/"); // es en la raíz + /en/
  })
  .sort();
assert.ok(targets.length >= 16, `páginas para axe: ${targets.length}`);

for (const rel of targets) {
  test(`axe-core AA: ${rel}`, async () => {
    const html = await readFile(join(OUT, rel), "utf8");
    const dom = new JSDOM(html, { url: "https://loquedigalaia.com/", pretendToBeVisual: true });
    for (const k of ["Node", "Element", "HTMLElement", "SVGElement", "getComputedStyle", "NodeList", "CustomEvent", "Event"])
      globalThis[k] = dom.window[k] ?? globalThis[k];
    const results = await axe.run(dom.window.document.documentElement, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
      rules: { "color-contrast": { enabled: false } }, // jsdom sin layout; contraste medido a mano (TESTING.md)
    });
    dom.window.close();
    assert.deepEqual(
      results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`),
      [],
      `${rel}: ${results.violations.length} violaciones`,
    );
  });
}
