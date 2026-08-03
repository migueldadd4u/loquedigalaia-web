import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import test from "node:test";
import { parse } from "node-html-parser";

const ROOT = process.cwd();
const OUT = join(ROOT, "out");
const BASE_URL = "https://loquedigalaia.com";

async function filesBelow(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await filesBelow(path)));
    else files.push(path);
  }
  return files;
}

function routeFromHtml(relativeHtml) {
  const unix = relativeHtml.split(sep).join("/");
  if (unix === "index.html") return "/";
  return `/${unix.replace(/\/index\.html$/, "").replace(/\.html$/, "")}/`;
}

function mirrorFromRoute(route) {
  return route === "/"
    ? "index.md"
    : `${route.replace(/^\//, "").replace(/\/$/, "")}.md`;
}

function normalizeText(value) {
  return value
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}

function lexicalTokens(value) {
  return value.normalize("NFC").match(/[\p{L}\p{M}\p{N}]+|[^\s\p{L}\p{M}\p{N}]/gu) ?? [];
}

function htmlLexicalTokens(main) {
  const clean = parse(main.toString());
  for (const hidden of clean.querySelectorAll("script, style, noscript, template, svg")) {
    hidden.remove();
  }
  const tokens = [];
  const visit = (node) => {
    if (node.nodeType === 3) {
      tokens.push(...lexicalTokens(node.text ?? node.textContent ?? ""));
      return;
    }
    for (const child of node.childNodes ?? []) visit(child);
  };
  visit(clean);
  return tokens;
}

function visibleHtmlText(main) {
  const clean = parse(main.toString());
  for (const hidden of clean.querySelectorAll("script, style, noscript, template, svg")) {
    hidden.remove();
  }
  return normalizeText(clean.structuredText);
}

function visibleMarkdownText(markdown) {
  return normalizeText(
    markdown
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/!\[[^\]]*\]\([^\n)]*\)/g, "")
      .replace(/\[([^\]]+)\]\([^\n)]*\)/g, "$1")
      .replace(/^\s{0,3}(?:#{1,6}\s+|>\s?|[-*+]\s+|\d+\.\s+)/gm, "")
      .replace(/^\s*---\s*$/gm, "")
      .replace(/\\([\\`*_\[\]])/g, "$1")
      .replace(/[*_`]/g, ""),
  );
}

function meta(root, selector) {
  return root.querySelector(selector)?.getAttribute("content")?.trim() ?? "";
}

function canonicalUrl(root) {
  return root.querySelector("link[rel='canonical']")?.getAttribute("href")?.trim() ?? "";
}

function expectedOpenGraphLocale(lang) {
  const defaults = {
    es: "es_ES", en: "en_US", ca: "ca_ES", gl: "gl_ES", eu: "eu_ES",
    oc: "oc_ES", ast: "ast_ES", pt: "pt_PT", ko: "ko_KR", ja: "ja_JP",
    "zh-Hans": "zh_CN", "zh-Hant": "zh_TW",
  };
  if (defaults[lang]) return defaults[lang];
  const [language, ...rest] = lang.split("-");
  const territory = rest.find((part) => /^[A-Z]{2}$/.test(part));
  return territory ? `${language}_${territory}` : lang.replaceAll("-", "_");
}

async function canonicalPages() {
  const pages = [];
  for (const htmlPath of await filesBelow(OUT)) {
    const rel = relative(OUT, htmlPath);
    const unixRel = rel.split(sep).join("/");
    if (
      !rel.endsWith(".html") ||
      unixRel === "404.html" ||
      unixRel === "404/index.html"
    ) continue;
    if (rel.split(sep).some((part) => part.startsWith("_"))) continue;
    const html = await readFile(htmlPath, "utf8");
    const root = parse(html, { comment: true });
    if (root.querySelector("html")?.getAttribute("lang") !== "es") continue;
    const main = root.querySelector("main#contenido");
    if (!main) continue;
    const route = routeFromHtml(rel);
    pages.push({ htmlPath, rel, route, mirror: mirrorFromRoute(route), root, main });
  }
  return pages.sort((a, b) => a.route.localeCompare(b.route));
}

function jsonLd(root) {
  return root
    .querySelectorAll("script[type='application/ld+json']")
    .map((script) => JSON.parse(script.text));
}

function insideLanguageSwitcher(node) {
  let current = node.parentNode;
  while (current?.nodeType === 1) {
    const classes = current.getAttribute?.("class") ?? "";
    if (/(?:^|\s)lang-switcher(?:\s|$)/.test(classes)) return true;
    current = current.parentNode;
  }
  return false;
}

function assertSchemaNode(node, type) {
  assert.equal(node["@context"], "https://schema.org");
  assert.equal(node["@type"], type);
}

test("cada página canónica tiene un espejo Markdown textual generado", async () => {
  const pages = await canonicalPages();
  assert.ok(pages.length >= 8, `se esperaban al menos 8 páginas, encontradas: ${pages.length}`);

  for (const page of pages) {
    const mirrorPath = join(OUT, page.mirror);
    assert.ok(existsSync(mirrorPath), `${page.route} no tiene /${page.mirror}`);
    const markdown = await readFile(mirrorPath, "utf8");
    assert.match(markdown, /Generado desde .* no editar a mano/);
    assert.deepEqual(
      lexicalTokens(visibleMarkdownText(markdown)),
      htmlLexicalTokens(page.main),
      `${page.route} y /${page.mirror} no contienen el mismo texto visible`,
    );
    for (const link of page.main.querySelectorAll("a[href]")) {
      const href = link.getAttribute("href");
      assert.ok(markdown.includes(`](${href})`), `${page.route}: el espejo perdió ${href}`);
    }
  }

  assert.ok(existsSync(join(OUT, "index.md")), "falta el índice Markdown /index.md");
});

test("llms.txt enlaza todos los espejos y documenta el contrato de Pulso", async () => {
  const pages = await canonicalPages();
  const llms = await readFile(join(OUT, "llms.txt"), "utf8");

  assert.match(llms, /^# Lo que diga la IA$/m);
  for (const page of pages) {
    assert.ok(
      llms.includes(`${BASE_URL}/${page.mirror}`),
      `llms.txt no enlaza /${page.mirror}`,
    );
  }
  for (const path of await filesBelow(OUT)) {
    const rel = relative(OUT, path).split(sep).join("/");
    if (!rel.endsWith(".md")) continue;
    assert.ok(llms.includes(`${BASE_URL}/${rel}`), `llms.txt no enlaza /${rel}`);
  }
  assert.ok(llms.includes(`${BASE_URL}/pulso.json`));
  assert.ok(!llms.includes(`${BASE_URL}/404.md`), "llms.txt no debe publicar el 404 como contenido");
  assert.match(llms, /cada indicador incluye identificador, etiqueta, valor, unidad, fecha del dato y fuente/i);
  assert.match(llms, /Cómo citarnos/);
});

test("robots.txt permite el rastreo público sin bloqueos", async () => {
  const robots = await readFile(join(OUT, "robots.txt"), "utf8");
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, new RegExp(`^Sitemap: ${BASE_URL.replaceAll(".", "\\.")}\/sitemap\\.xml$`, "m"));
  const blocked = [...robots.matchAll(/^Disallow:\s*(.+)$/gim)].map((match) => match[1].trim()).filter(Boolean);
  assert.deepEqual(blocked, [], `robots.txt bloquea rutas: ${blocked.join(", ")}`);
});

test("todas las páginas tienen canonical y metadatos Open Graph únicos", async () => {
  const pages = await canonicalPages();
  const titles = new Set();
  const descriptions = new Set();

  for (const page of pages) {
    const canonical = canonicalUrl(page.root);
    const ogTitle = meta(page.root, "meta[property='og:title']");
    const description = meta(page.root, "meta[name='description']");
    const ogDescription = meta(page.root, "meta[property='og:description']");
    const ogUrl = meta(page.root, "meta[property='og:url']");
    const ogImage = meta(page.root, "meta[property='og:image']");
    const ogImageAlt = meta(page.root, "meta[property='og:image:alt']");
    const twitterCard = meta(page.root, "meta[name='twitter:card']");

    assert.equal(canonical, new URL(page.route, `${BASE_URL}/`).toString(), `${page.route}: canonical`);
    assert.equal(ogUrl, canonical, `${page.route}: og:url debe coincidir con canonical`);
    assert.ok(ogTitle, `${page.route}: falta og:title`);
    assert.ok(description, `${page.route}: falta description`);
    assert.equal(ogDescription, description, `${page.route}: og:description diverge`);
    assert.equal(ogImage, `${BASE_URL}/images/poster-lanzamiento.jpg`);
    assert.match(ogImageAlt, /generado con IA/i);
    assert.equal(twitterCard, "summary_large_image");
    assert.ok(!titles.has(ogTitle), `${page.route}: og:title duplicado`);
    assert.ok(!descriptions.has(description), `${page.route}: description duplicada`);
    titles.add(ogTitle);
    descriptions.add(description);
  }
});

test("las variantes de idioma mantienen og:url alineado con su canonical", async () => {
  for (const htmlPath of await filesBelow(OUT)) {
    const rel = relative(OUT, htmlPath);
    const unixRel = rel.split(sep).join("/");
    if (
      !rel.endsWith(".html") ||
      unixRel === "404.html" ||
      unixRel === "404/index.html"
    ) continue;
    if (rel.split(sep).some((part) => part.startsWith("_"))) continue;
    const root = parse(await readFile(htmlPath, "utf8"));
    if (!root.querySelector("main#contenido")) continue;
    const canonical = canonicalUrl(root);
    const lang = root.querySelector("html")?.getAttribute("lang");
    assert.ok(lang, `${rel}: falta lang`);
    assert.equal(meta(root, "meta[property='og:url']"), canonical, `${rel}: og:url localizado`);
    assert.equal(
      meta(root, "meta[property='og:locale']"),
      expectedOpenGraphLocale(lang),
      `${rel}: og:locale localizado`,
    );
  }
});

test("los enlaces internos localizados conservan su ruta, prefijo y destino", async () => {
  for (const htmlPath of await filesBelow(OUT)) {
    const rel = relative(OUT, htmlPath);
    const unixRel = rel.split(sep).join("/");
    if (
      !rel.endsWith(".html") ||
      unixRel === "404.html" ||
      /(?:^|\/)404\/index\.html$/.test(unixRel)
    ) continue;
    if (rel.split(sep).some((part) => part.startsWith("_"))) continue;
    const prefix = unixRel.split("/")[0];
    if (!prefix || prefix.endsWith(".html")) continue;
    const root = parse(await readFile(htmlPath, "utf8"));
    if (!root.querySelector("main#contenido")) continue;
    if (root.querySelector("html")?.getAttribute("lang") === "es") continue;

    for (const link of root.querySelectorAll("a[href]")) {
      const href = link.getAttribute("href");
      if (!href?.startsWith("/") || insideLanguageSwitcher(link)) continue;
      const pathname = href.split(/[?#]/, 1)[0];
      if (/\.[a-z0-9]+$/i.test(pathname)) {
        assert.ok(
          existsSync(join(OUT, pathname.slice(1))),
          `${rel}: recurso raíz inexistente ${href}`,
        );
        continue;
      }
      assert.ok(
        href === `/${prefix}/` || href.startsWith(`/${prefix}/`),
        `${rel}: enlace sin prefijo o ruta traducida: ${href}`,
      );
      const target = pathname.endsWith("/")
        ? join(OUT, pathname.slice(1), "index.html")
        : join(OUT, `${pathname.slice(1)}.html`);
      assert.ok(existsSync(target), `${rel}: destino inexistente ${href}`);
    }
  }
});

test("Organization, Dataset y FAQ usan vocabulario schema.org y campos verificables", async () => {
  const pages = await canonicalPages();
  const home = pages.find((page) => page.route === "/");
  const pulsoPage = pages.find((page) => page.route === "/pulso/");
  const faqPage = pages.find((page) => page.route === "/faq/");
  assert.ok(home && pulsoPage && faqPage);

  const organization = jsonLd(home.root).find((node) => node["@type"] === "Organization");
  assert.ok(organization, "la portada no publica Organization");
  assertSchemaNode(organization, "Organization");
  assert.equal(organization.name, "Lo que diga la IA");
  assert.equal(organization.url, `${BASE_URL}/`);
  assert.match(organization["@id"], /^https:\/\//);
  assert.equal(organization.logo["@type"], "ImageObject");
  assert.match(organization.logo.url, /^https:\/\//);
  assert.match(organization.foundingDate, /^\d{4}-\d{2}-\d{2}$/);

  const dataset = jsonLd(pulsoPage.root).find((node) => node["@type"] === "Dataset");
  assert.ok(dataset, "/pulso no publica Dataset");
  assertSchemaNode(dataset, "Dataset");
  assert.equal(dataset.url, `${BASE_URL}/pulso/`);
  assert.ok(!Number.isNaN(Date.parse(dataset.dateModified)), "Dataset.dateModified no es una fecha");
  assert.equal(dataset.creator["@id"], organization["@id"]);
  assert.equal(dataset.publisher["@id"], organization["@id"]);
  assert.ok(dataset.name && dataset.description);
  assert.equal(dataset.distribution[0]["@type"], "DataDownload");
  assert.equal(dataset.distribution[0].encodingFormat, "application/json");
  assert.equal(dataset.distribution[0].contentUrl, `${BASE_URL}/pulso.json`);
  assert.ok(dataset.variableMeasured.length > 0);
  for (const property of dataset.variableMeasured) {
    assert.equal(property["@type"], "PropertyValue");
    assert.ok(property.propertyID && property.name);
    assert.equal(typeof property.value, "number");
  }


  for (const htmlPath of await filesBelow(OUT)) {
    const rel = relative(OUT, htmlPath).split(sep).join("/");
    if (!/(?:^|\/)pulso\/index\.html$/.test(rel) || rel === "pulso/index.html") continue;
    const localized = parse(await readFile(htmlPath, "utf8"));
    const localizedDataset = jsonLd(localized).find((node) => node["@type"] === "Dataset");
    assert.deepEqual(localizedDataset, dataset, `${rel}: el Dataset canónico fue traducido o corrompido`);
  }

  const faq = jsonLd(faqPage.root).find((node) => node["@type"] === "FAQPage");
  assert.ok(faq, "/faq no publica FAQPage");
  assertSchemaNode(faq, "FAQPage");
  assert.ok(faq.mainEntity.length > 0);
  for (const question of faq.mainEntity) {
    assert.equal(question["@type"], "Question");
    assert.ok(question.name);
    assert.equal(question.acceptedAnswer["@type"], "Answer");
    assert.ok(question.acceptedAnswer.text);
  }
});

test("pulso.json, el HTML y Dataset salen del mismo snapshot", async () => {
  const published = JSON.parse(await readFile(join(OUT, "pulso.json"), "utf8"));
  const sourcePath = existsSync(join(ROOT, "data", "pulso.json"))
    ? join(ROOT, "data", "pulso.json")
    : join(ROOT, "data", "sample", "pulso.sample.json");
  const source = JSON.parse(await readFile(sourcePath, "utf8"));
  assert.deepEqual(published, source, "/pulso.json no coincide con la fuente que hornea la web");

  const page = (await canonicalPages()).find((candidate) => candidate.route === "/pulso/");
  assert.ok(page);
  const text = visibleHtmlText(page.main);
  const dataset = jsonLd(page.root).find((node) => node["@type"] === "Dataset");
  assert.equal(dataset.dateModified, published.asOf);
  assert.equal(dataset.variableMeasured.length, published.indicators.length);

  for (const indicator of published.indicators) {
    assert.ok(text.includes(indicator.label), `HTML: falta ${indicator.label}`);
    assert.ok(text.includes(indicator.value.toLocaleString("es-ES")), `HTML: falta ${indicator.value}`);
    assert.ok(text.includes(indicator.asOf), `HTML: falta fecha ${indicator.asOf}`);
    const property = dataset.variableMeasured.find((item) => item.propertyID === indicator.id);
    assert.deepEqual(
      { name: property?.name, value: property?.value, unit: property?.unitText },
      { name: indicator.label, value: indicator.value, unit: indicator.unit },
    );
  }
});

test("sitemap.xml contiene todas las rutas canónicas y sus alternates", async () => {
  const sitemap = await readFile(join(OUT, "sitemap.xml"), "utf8");
  assert.ok(!sitemap.includes(`${BASE_URL}/404/`), "sitemap no debe indexar el 404");
  for (const page of await canonicalPages()) {
    const url = new URL(page.route, `${BASE_URL}/`).toString();
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), `sitemap: falta ${url}`);
    assert.ok(
      sitemap.includes(`hreflang="x-default" href="${url}"`),
      `sitemap: falta x-default de ${url}`,
    );
  }
});
