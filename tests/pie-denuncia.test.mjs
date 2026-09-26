// Enlace del pie al portal de la denuncia contra esPublico (content/es/site.ts →
// portalDenuncia). Es EXTERNO y absoluto: no puede llevar prefijo de idioma, y su
// destino cambia con el idioma porque el portal solo existe en es, en y fr.
// Corre tras `npm run build:static` (lo encadena el propio `npm test`).
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { parse } from "node-html-parser";

const ROOT = process.cwd();
const OUT = join(ROOT, "out");
const PORTAL = "https://www.todolocontrarioaespublico.es";
const ES = `${PORTAL}/es/`;
const EN = `${PORTAL}/en/`;

// Oráculo escrito a mano, a propósito: si alguien cambia portalDenuncia.enIngles,
// este test obliga a decidirlo en voz alta. Inglés para quien lee en inglés,
// chino, coreano, japonés o portugués; castellano para el castellano, sus
// variantes y las lenguas de España.
const A_INGLES = new Set(["en", "zh", "ko", "ja", "pt", "zh-TW", "pt-BR"]);

const localesSrc = await readFile(join(ROOT, "content", "locales.ts"), "utf8");
const locales = [
  ...localesSrc.matchAll(/\{ id: "([^"]+)",\s*prefix: "([^"]*)"/g),
].map(([, id, prefix]) => ({ id, prefix }));
assert.ok(locales.length >= 17, `locales leídos de content/locales.ts: ${locales.length}`);

const esperado = (l) => (A_INGLES.has(l.id) ? EN : ES);

// Rutas con pie: una muestra que cubre portada, contenido y legales.
const RUTAS = ["index.html", "manifiesto/index.html", "contacto/index.html", "aviso-legal/index.html"];

test("el oráculo cubre todos los locales y solo nombra locales que existen", () => {
  const ids = new Set(locales.map((l) => l.id));
  for (const id of A_INGLES) assert.ok(ids.has(id), `A_INGLES nombra ${id}, que no está en content/locales.ts`);
  assert.equal(locales.filter((l) => A_INGLES.has(l.id)).length, A_INGLES.size);
});

test("cada locale enlaza el portal en su idioma, absoluto y sin prefijo", async () => {
  const mal = [];
  for (const l of locales)
    for (const ruta of RUTAS) {
      const where = `${l.prefix || "es"}/${ruta}`;
      const html = await readFile(join(OUT, l.prefix, ruta), "utf8");
      const footer = parse(html).querySelector("footer");
      const enlaces = (footer?.querySelectorAll("a") ?? []).filter((a) =>
        (a.getAttribute("href") ?? "").includes("todolocontrarioaespublico"),
      );
      if (enlaces.length !== 1) {
        mal.push(`${where}: ${enlaces.length} enlaces al portal en el pie`);
        continue;
      }
      const href = enlaces[0].getAttribute("href");
      if (href !== esperado(l)) mal.push(`${where}: ${href} (esperado ${esperado(l)})`);
      if (!enlaces[0].text.includes("Lo contrario a esPublico"))
        mal.push(`${where}: el texto perdió el nombre del portal: «${enlaces[0].text}»`);
      // Ni /es/ en una página que va a /en/ ni al revés: ni en el HTML visible ni
      // en el payload RSC, que React usa al hidratar.
      const otro = esperado(l) === ES ? EN : ES;
      if (html.includes(otro)) mal.push(`${where}: queda ${otro} en el fichero`);
    }
  assert.deepEqual(mal, [], mal.slice(0, 10).join(" · "));
});

test("el castellano canónico: grupo «Otras webs» y texto del enlace", async () => {
  const root = parse(await readFile(join(OUT, "index.html"), "utf8"));
  const grupo = root
    .querySelectorAll("footer nav h2")
    .find((h) => h.text.trim() === "Otras webs");
  assert.ok(grupo, "falta el grupo «Otras webs» en el pie");
  const enlace = grupo.parentNode.querySelector("a");
  assert.equal(enlace?.getAttribute("href"), ES);
  assert.equal(enlace?.text.trim(), "Lo contrario a esPublico — la denuncia");
});

test("el enlace no lleva parámetros de seguimiento en ningún fichero publicado", async () => {
  for (const l of locales) {
    const html = await readFile(join(OUT, l.prefix, "index.html"), "utf8");
    const urls = [...html.matchAll(/https:\/\/www\.todolocontrarioaespublico\.es[^"\\\s<]*/g)].map(([u]) => u);
    for (const u of urls) assert.ok(u === ES || u === EN, `${l.prefix || "es"}: ${u}`);
  }
});
