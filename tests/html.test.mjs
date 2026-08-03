// Suite sobre el HTML renderizado (gate F1: rutas × locales, hreflang, un h1,
// marca sin traducir, inglés completo, enlaces internos vivos).
// Corre tras `npm run build:static` (lo encadena el propio `npm test`).
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import test from "node:test";
import { parse } from "node-html-parser";

const ROOT = process.cwd();
const OUT = join(ROOT, "out");
const BASE = "https://loquedigalaia.com";
const BRAND = "Lo que diga la IA";

/* Locales: content/locales.ts es la fuente única (la leen el selector y el
   pipeline i18n); el test no lleva su propia copia — lección de add4u. */
const localesSrc = await readFile(join(ROOT, "content", "locales.ts"), "utf8");
const locales = [
  ...localesSrc.matchAll(
    /\{ id: "([^"]+)",\s*prefix: "([^"]*)",\s*hreflang: "([^"]+)"[\s\S]*?source: "([^"]+)" \}/g,
  ),
].map(([, id, prefix, hreflang, source]) => ({ id, prefix, hreflang, source }));
assert.ok(locales.length >= 17, `locales leídos de content/locales.ts: ${locales.length}`);
assert.equal(locales[0].prefix, "", "el primer locale debe ser el español canónico");

const localeUrl = (l, route) => {
  const b = l.prefix ? `/${l.prefix}` : "";
  return route === "/" ? BASE + (b || "/") : BASE + b + route + "/";
};

async function filesBelow(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await filesBelow(path)));
    else files.push(path);
  }
  return files;
}

const routeOf = (rel) =>
  "/" + rel.replace(/\.html$/, "").replace(/(^|\/)index$/, "$1").replace(/\/$/, "");

const localeDirs = new Set(locales.map((l) => l.prefix).filter(Boolean));

/* Rutas canónicas = los HTML de la raíz de out (el español es la fuente). */
const allHtml = (await filesBelow(OUT)).filter((p) => p.endsWith(".html"));
const esPages = allHtml
  .map((p) => relative(OUT, p))
  .filter((rel) => {
    const unix = rel.split(sep).join("/");
    if (unix === "404.html" || unix === "404/index.html") return false;
    if (rel.split(sep).some((part) => part.startsWith("_"))) return false;
    if (localeDirs.has(unix.split("/")[0])) return false;
    return true;
  });
const routes = esPages.map((rel) => routeOf(rel.split(sep).join("/"))).sort();
assert.ok(routes.length >= 8, `rutas canónicas: ${routes.length}`);

const relOf = (route) => (route === "/" ? "index.html" : `${route.slice(1)}/index.html`);

test("cada ruta existe en todos los locales", () => {
  const missing = [];
  for (const route of routes)
    for (const l of locales)
      if (!existsSync(join(OUT, l.prefix, relOf(route)))) missing.push(`${l.prefix || "es"}${route}`);
  assert.deepEqual(missing, [], `faltan ${missing.length} HTML: ${missing.slice(0, 5).join(", ")}`);
});

test("una sola h1 por página en todas las rutas y locales", async () => {
  const bad = [];
  for (const route of routes)
    for (const l of locales) {
      const html = await readFile(join(OUT, l.prefix, relOf(route)), "utf8");
      const count = parse(html).querySelectorAll("h1").length;
      if (count !== 1) bad.push(`${l.prefix || "es"}${route} (${count})`);
    }
  assert.deepEqual(bad, [], `páginas sin h1 única: ${bad.join(", ")}`);
});

test("hreflang completo y canonical autorreferente en todas las páginas", async () => {
  for (const route of routes)
    for (const l of locales) {
      const root = parse(await readFile(join(OUT, l.prefix, relOf(route)), "utf8"));
      const where = `${l.prefix || "es"}${route}`;
      const canonical = root.querySelector("link[rel='canonical']")?.getAttribute("href");
      assert.equal(canonical, localeUrl(l, route), `${where}: canonical`);

      const alternates = root.querySelectorAll("link[rel='alternate']");
      assert.equal(alternates.length, locales.length + 1, `${where}: ${alternates.length} alternates`);
      for (const a of locales) {
        const link = alternates.find((x) => x.getAttribute("hreflang") === a.hreflang);
        assert.ok(link, `${where}: falta hreflang ${a.hreflang}`);
        assert.equal(link.getAttribute("href"), localeUrl(a, route), `${where}: href de ${a.hreflang}`);
      }
      const xd = alternates.find((x) => x.getAttribute("hreflang") === "x-default");
      assert.equal(xd?.getAttribute("href"), localeUrl(locales[0], route), `${where}: x-default`);

      const lang = root.querySelector("html")?.getAttribute("lang");
      assert.equal(lang, l.hreflang, `${where}: <html lang>`);
    }
});

test("la marca y los nombres propios nunca se traducen", async () => {
  for (const route of routes)
    for (const l of locales) {
      const where = `${l.prefix || "es"}${route}`;
      const html = await readFile(join(OUT, l.prefix, relOf(route)), "utf8");
      assert.ok(!html.includes(""), `${where}: centinela de marca sin restaurar`);
      assert.ok(!html.includes("P"), `${where}: centinela de valor de máquina sin restaurar`);
      const root = parse(html);
      const title = root.querySelector("title")?.text ?? "";
      assert.ok(title.includes(BRAND), `${where}: <title> sin la marca: «${title}»`);
      const brand = root.querySelector(".brand-lqdia");
      assert.ok(brand?.text.includes(BRAND), `${where}: .brand-lqdia sin la marca`);
    }
});

test("inglés completo: ninguna cadena del inventario sin clave en en.json", async () => {
  const inventory = JSON.parse(await readFile(join(ROOT, "content", "i18n", "_inventory.json"), "utf8"));
  const en = JSON.parse(await readFile(join(ROOT, "content", "i18n", "en.json"), "utf8"));
  const missing = inventory.filter((s) => !(s in en));
  assert.deepEqual(missing, [], `${missing.length} cadenas sin traducir al inglés: ${missing.slice(0, 5).join(" · ")}`);
});

test("todos los enlaces internos resuelven a ficheros existentes", async () => {
  const broken = [];
  const seen = new Set();
  for (const route of routes)
    for (const l of locales) {
      const where = `${l.prefix || "es"}${route}`;
      const root = parse(await readFile(join(OUT, l.prefix, relOf(route)), "utf8"));
      for (const a of root.querySelectorAll("[href]")) {
        const href = a.getAttribute("href") ?? "";
        if (!href.startsWith("/") || href.startsWith("//")) continue;
        const path = href.split("#")[0].split("?")[0];
        if (!path || seen.has(`${where}→${path}`)) continue;
        seen.add(`${where}→${path}`);
        const target = join(OUT, path.endsWith("/") ? `${path}index.html` : path);
        if (!existsSync(target)) broken.push(`${where} → ${href}`);
      }
    }
  assert.deepEqual(broken, [], `enlaces rotos: ${broken.slice(0, 10).join(" · ")}`);
});
