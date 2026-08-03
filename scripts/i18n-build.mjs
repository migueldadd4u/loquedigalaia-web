// Genera las variantes de idioma del sitio estático a partir del HTML español ya construido.
// Portado del mecanismo de add4u-web (misma filosofía, ver su scripts/i18n-build.mjs):
//  - El español es la fuente y la canónica; se queda en la raíz (solo se le inyectan
//    hreflang y canónica). Cada locale se emite en out/<prefijo>/ como copia del HTML
//    español con los textos sustituidos por su traducción (si hay diccionario en
//    content/i18n/<idioma>.json; si no, queda en español pero la URL, <html lang>,
//    canónica y hreflang existen — nada da 404) y los enlaces internos prefijados.
//  - Los assets no se duplican (rutas absolutas a la raíz).
//  - La marca va en .brand-lqdia y el selector en .lang-switcher: nunca se traducen.
//  - El texto vive DOS veces en cada HTML (nodos visibles + payload RSC): la sustitución
//    actúa sobre todo el fichero de una vez; las cadenas con " < > & \ se saltan.
//
// Uso: node scripts/i18n-build.mjs [directorio]   (por defecto out). Corre tras next build.
// Sin i18n-client: este sitio no tiene componentes cliente que pinten texto.

import { readdir, readFile, writeFile, mkdir, readFile as rf } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { parse } from "node-html-parser";

const OUT = process.argv[2] ?? "out";
const BASE = "https://loquedigalaia.com";
const DICT_DIR = "content/i18n";

// Los locales salen de content/locales.ts — fuente ÚNICA compartida con el selector.
// Antes había aquí una copia a mano y en add4u eso ya provocó divergencias: se lee el
// TS con una expresión regular para no necesitar transpilador en el script.
const localesSource = await readFile(new URL("../content/locales.ts", import.meta.url), "utf8");
const locales = [...localesSource.matchAll(
  /\{\s*id:\s*"([^"]+)",\s*prefix:\s*"([^"]*)",\s*hreflang:\s*"([^"]+)",[^}]*?source:\s*"([^"]+)"\s*\}/g,
)].map(([, id, prefix, hreflang, source]) => ({ id, prefix, hreflang, source }));
if (locales.length < 17 || locales[0].prefix !== "") {
  throw new Error(`i18n-build: se leyeron ${locales.length} locales de content/locales.ts; el formato ha cambiado`);
}

// Los segmentos con prefijo de idioma salen de la fuente única de navegación
// (content/es/site.ts) — lección de add4u: una lista a mano diverge en cuanto
// nace una sección y sus enlaces devuelven al castellano.
const navSource = await readFile(new URL("../content/es/site.ts", import.meta.url), "utf8");
const navSegments = [...navSource.matchAll(/href: "\/([a-z-]+)\/"/g)].map(([, s]) => s);
if (navSegments.length < 6) throw new Error(`i18n-build: solo ${navSegments.length} secciones leídas de content/es/site.ts; el formato cambió y los enlaces saldrían sin prefijo`);
const APP_SEGMENTS = new Set(navSegments);
const TRANSLATABLE_ATTRS = ["alt", "title", "aria-label"];
const META_KEYS = new Set(["description"]);
const OG_TW = /^(og:(title|description|image:alt)|twitter:(title|description|image:alt))$/;

function translatable(core) {
  if (!core || core.length < 2) return false;
  if (/^[\d\s.,%·|/–—-]+$/.test(core)) return false;
  if (/^(https?:|mailto:|tel:|\/)/.test(core)) return false;
  return /\p{L}/u.test(core);
}

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT"]);
function skipSubtree(el) {
  if (SKIP_TAGS.has(el.tagName)) return true;
  const cls = el.getAttribute?.("class") ?? "";
  return /\bbrand-lqdia\b|\blang-switcher\b/.test(cls);
}

function walk(node, onText, onAttr) {
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      const core = child.rawText.trim();
      if (translatable(core)) onText(core);
      continue;
    }
    if (child.nodeType !== 1) continue;
    if (onAttr) {
      for (const a of TRANSLATABLE_ATTRS) {
        const v = child.getAttribute(a);
        if (v && translatable(v.trim())) onAttr(v.trim());
      }
      if (child.tagName === "META") {
        const name = child.getAttribute("name"), prop = child.getAttribute("property");
        const content = child.getAttribute("content");
        if (content && translatable(content.trim()) && ((name && META_KEYS.has(name)) || (prop && OG_TW.test(prop)) || (name && OG_TW.test(name))))
          onAttr(content.trim());
      }
    }
    if (!skipSubtree(child)) walk(child, onText, onAttr);
  }
}

const localeDirs = new Set(locales.map((l) => l.prefix).filter(Boolean));
async function sourceHtml() {
  const files = [];
  for (const e of await readdir(OUT, { withFileTypes: true, recursive: true })) {
    if (!e.isFile() || !e.name.endsWith(".html")) continue;
    const rel = relative(OUT, join(e.parentPath ?? e.path, e.name));
    if (localeDirs.has(rel.split("/")[0])) continue;
    if (rel === "404.html") continue; // la página de error no es una ruta: sin copias ni sitemap
    files.push(rel);
  }
  return files;
}
const routeOf = (rel) => "/" + rel.replace(/\.html$/, "").replace(/(^|\/)index$/, "$1").replace(/\/$/, "");
const localeUrl = (l, route) => { const b = l.prefix ? `/${l.prefix}` : ""; return route === "/" ? BASE + (b || "/") : BASE + b + route + "/"; };

function alternatesBlock(route) {
  const links = locales.map((l) => `<link rel="alternate" hreflang="${l.hreflang}" href="${localeUrl(l, route)}"/>`);
  links.push(`<link rel="alternate" hreflang="x-default" href="${localeUrl(locales[0], route)}"/>`);
  return links.join("");
}
const canonicalTag = (l, route) => `<link rel="canonical" href="${localeUrl(l, route)}"/>`;

function prefixLinks(html, prefix) {
  if (!prefix) return html;
  const segAlt = [...APP_SEGMENTS].join("|");
  html = html.replace(/(href|action)="(\/[^"]*)"/g, (m, attr, url) => {
    if (url === "/") return `${attr}="/${prefix}/"`;
    return APP_SEGMENTS.has(url.split("/")[1]) ? `${attr}="/${prefix}${url}"` : m;
  });
  html = html.replace(new RegExp(`\\\\"(/(?:${segAlt})(?:/[^"\\\\]*)?)\\\\"`, "g"), (m, url) => `\\"/${prefix}${url}\\"`);
  html = html.replace(/\\"href\\":\\"\/\\"/g, `\\"href\\":\\"/${prefix}/\\"`);
  return html;
}

const SPECIAL = /["<>&\\]/;
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function buildReplacer(dict) {
  if (!dict) return null;
  const entries = Object.entries(dict)
    .filter(([k, v]) => v !== k && !SPECIAL.test(k) && !SPECIAL.test(v))
    .sort((a, b) => b[0].length - a[0].length);
  const longs = entries.filter(([k]) => k.length >= 15);
  const shorts = entries.filter(([k]) => k.length < 15);
  let re = null; const map = new Map(shorts);
  if (shorts.length) re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${shorts.map(([k]) => escRe(k)).join("|")})(?![\\p{L}\\p{N}])`, "gu");
  return { longs, re, map };
}
// Nombres propios que NUNCA se traducen. Sin esto, la clave corta «la IA»→«AI»
// convertía la marca en «Lo que diga AI» (pasó en la primera pasada): se blindan
// con un centinela sin letras antes de traducir y se restauran al final.
const PROTECTED = ["Lo que diga la IA", "ClonMADv3", "Jarvis", "Add4u", "Alastria", "ISBE", "GestDocAI"];
const sentinel = (i) => `\u0001N${i}\u0001`;
// Se protege el HTML y TAMBIEN las claves/valores del diccionario, para que las cadenas
// largas que contienen la marca sigan casando (ambos lados llevan centinela).
function protectNames(s) {
  PROTECTED.forEach((name, i) => { s = s.split(name).join(sentinel(i)); });
  return s;
}
function restoreNames(s) {
  PROTECTED.forEach((name, i) => { s = s.split(sentinel(i)).join(name); });
  return s;
}

// Las rutas son datos, no copy. Sin esto, una clave corta que coincida con un
// segmento de URL lo traduce dentro del propio enlace: `manifiesto`→`manifesto`
// convertía href="/manifiesto/" en href="/manifesto/" y, de rebote, prefixLinks
// ya no lo reconocía y el enlace se quedaba sin prefijo de idioma. Pasaba en los
// 12 idiomas y en silencio. Se protegen antes de traducir, en el HTML visible y
// en el payload de React, y se restauran después.
const RUTAS = [...APP_SEGMENTS];
const ROUTE_RE = new RegExp(
  `/(?:${RUTAS.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})/`,
  "g",
);
const routeSentinel = (i) => `\u0002R${i}\u0002`;
const protectRoutes = (s) =>
  s.replace(ROUTE_RE, (m) => routeSentinel(RUTAS.indexOf(m.slice(1, -1))));
const restoreRoutes = (s) =>
  s.replace(/\u0002R(\d+)\u0002/g, (_, i) => `/${RUTAS[Number(i)]}/`);

function translate(html, r) {
  if (!r) return html;
  html = protectRoutes(protectNames(html));
  for (const [from, to] of r.longs) html = html.split(from).join(to);
  if (r.re) html = html.replace(r.re, (m) => r.map.get(m) ?? m);
  return restoreNames(restoreRoutes(html));
}

function localize(html, l, route, entries) {
  html = translate(html, entries);
  html = prefixLinks(html, l.prefix);
  html = html.replace(/<html lang="es">/, `<html lang="${l.hreflang}">`);
  html = html.replace(/\\"lang\\":\\"es\\"/g, `\\"lang\\":\\"${l.hreflang}\\"`);
  html = html.replace(
    /(<meta property="og:url" content=")[^"]*(")/,
    `$1${localeUrl(l, route)}$2`,
  );
  if (html.includes('rel="canonical"')) {
    html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${localeUrl(l, route)}$2`);
  } else {
    html = html.replace("</head>", `${canonicalTag(l, route)}</head>`);
  }
  if (!html.includes('hreflang="x-default"')) html = html.replace("</head>", `${alternatesBlock(route)}</head>`);
  return html;
}

// Diccionarios: comillas rectas → « » para que el reemplazo sea seguro en HTML y RSC.
const sanitize = (v) => v.replace(/"([^"]*)"/g, "«$1»").replace(/"/g, "'");
const entriesBySource = {};
for (const l of locales) {
  const p = join(DICT_DIR, `${l.source}.json`);
  if (l.source !== "es" && !(l.source in entriesBySource) && existsSync(p)) {
    const raw = JSON.parse(await rf(p, "utf8"));
    const clean = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [protectNames(k), protectNames(sanitize(v))]),
    );
    entriesBySource[l.source] = buildReplacer(clean);
  }
}

// Inventario para traductores (strings únicos, ordenados).
const sources = await sourceHtml();
const inventory = new Set();
for (const rel of sources) {
  const root = parse(await readFile(join(OUT, rel), "utf8"), { comment: true });
  walk(root, (core) => inventory.add(core), (core) => inventory.add(core));
}
await mkdir(DICT_DIR, { recursive: true });
await writeFile(join(DICT_DIR, "_inventory.json"), JSON.stringify([...inventory].sort(), null, 2));

// Generación.
let written = 0;
for (const rel of sources) {
  const es = await readFile(join(OUT, rel), "utf8");
  const route = routeOf(rel);
  let esOut = es;
  if (!esOut.includes('rel="canonical"')) esOut = esOut.replace("</head>", `${canonicalTag(locales[0], route)}</head>`);
  if (!esOut.includes('hreflang="x-default"')) esOut = esOut.replace("</head>", `${alternatesBlock(route)}</head>`);
  if (esOut !== es) await writeFile(join(OUT, rel), esOut);
  for (const l of locales) {
    if (!l.prefix) continue;
    const out = join(OUT, l.prefix, rel);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, localize(esOut, l, route, entriesBySource[l.source]));
    written++;
  }
}

// Sitemap con alternativas hreflang.
const routes = sources.map(routeOf).sort();
const lastmod = new Date().toISOString();
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes.map((r) => locales.map((l) => `  <url>
    <loc>${localeUrl(l, r)}</loc>
${locales.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${localeUrl(a, r)}"/>`).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${localeUrl(locales[0], r)}"/>
    <lastmod>${lastmod}</lastmod>
  </url>`).join("\n")).join("\n")}
</urlset>
`;
await writeFile(join(OUT, "sitemap.xml"), sitemap);

const withDict = locales.filter((l) => entriesBySource[l.source]).map((l) => l.id);
console.log(`i18n-build · ${locales.length} locales · ${written} HTML generados · ${inventory.size} strings en inventario · con traducción: ${withDict.length ? withDict.join(", ") : "ninguno aún"}`);
