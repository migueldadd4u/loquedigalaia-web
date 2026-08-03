/**
 * i18n-build.mjs — paso post-build del mecanismo i18n (PLAN.md §1).
 *
 * Sobre out/ (español canónico ya exportado por Next):
 *   1. Inyecta en cada página <link rel="canonical"> + hreflang es/en/x-default.
 *   2. Genera out/<locale>/ para cada locale con diccionario en
 *      content/i18n/<locale>.json: lang, cadenas traducidas, enlaces internos
 *      prefijados, selector de idioma con aria-current intercambiado.
 *
 * Los assets (/_next/, /images/) NO se duplican: las páginas localizadas los
 * referencian en su ruta original.
 */

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_LOCALE,
  DOMAIN,
  LOCALES,
  ROUTES,
  absoluteUrl,
  loadDictionary,
  localePath,
} from "./i18n-client.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = path.join(ROOT, "out");

/** Prefijos de href que nunca se reescriben (assets compartidos, anchors, externos). */
const HREF_SKIP_PREFIXES = ["/_next/", "/images/", "/en", "/build-stamp.json", "#"];

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** canonical + hreflang (es, en, x-default) antes de </head>. */
function injectHeadLinks(html, routePath, locale) {
  const tags = [
    `<link rel="canonical" href="${absoluteUrl(routePath, locale)}"/>`,
    ...LOCALES.map(
      (l) =>
        `<link rel="alternate" hreflang="${l}" href="${absoluteUrl(routePath, l)}"/>`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${absoluteUrl(routePath, DEFAULT_LOCALE)}"/>`,
  ].join("");
  if (!html.includes("</head>")) {
    throw new Error(`Página sin </head> en ruta ${routePath}`);
  }
  return html.replace("</head>", `${tags}</head>`);
}

/** Aplica el diccionario: claves más largas primero para evitar solapes. */
function applyDictionary(html, strings) {
  const keys = Object.keys(strings).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    html = html.replace(new RegExp(escapeRegExp(key), "g"), strings[key]);
  }
  return html;
}

/** Prefija con /<locale>/ los enlaces internos de página; assets intactos. */
function rewriteInternalHrefs(tag, locale) {
  if (tag.includes("data-lang-link")) return tag; // selector de idioma: se trata aparte
  return tag.replace(/href="([^"]+)"/, (match, href) => {
    if (!href.startsWith("/")) return match;
    if (HREF_SKIP_PREFIXES.some((p) => href.startsWith(p))) return match;
    const localized = localePath(href.endsWith("/") ? href : `${href}/`, locale);
    return `href="${localized}"`;
  });
}

/** En páginas localizadas, aria-current pasa del enlace ES al del locale activo. */
function swapLanguageSwitcher(tag, locale) {
  const langMatch = tag.match(/data-lang-link="([a-z]+)"/);
  if (!langMatch) return tag;
  const linkLocale = langMatch[1];
  const withoutCurrent = tag.replace(/\s*aria-current="page"/, "");
  if (linkLocale === locale) {
    return withoutCurrent.replace(/<a\b/, `<a aria-current="page"`);
  }
  return withoutCurrent;
}

function localizeAnchors(html, locale) {
  return html.replace(/<a\b[^>]*>/g, (tag) => {
    if (tag.includes("data-lang-link")) return swapLanguageSwitcher(tag, locale);
    return rewriteInternalHrefs(tag, locale);
  });
}

async function* walkHtml(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "en") continue; // salida de una ejecución anterior
      yield* walkHtml(full);
    } else if (entry.name.endsWith(".html")) {
      yield full;
    }
  }
}

function routePathOf(htmlFile) {
  const rel = path.relative(OUT, htmlFile);
  if (rel === "index.html") return "/";
  return `/${rel.replace(/[/\\]index\.html$/, "").replace(/\.html$/, "")}/`;
}

async function main() {
  const dictionaryLocales = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

  const pages = [];
  for await (const file of walkHtml(OUT)) pages.push(file);
  // Solo las 7 rutas canónicas (PLAN.md §2): Next emite además 404/_not-found.
  const routePages = pages.filter((f) => ROUTES.includes(routePathOf(f)));

  // Limpieza determinista de salidas anteriores.
  for (const locale of dictionaryLocales) {
    await rm(path.join(OUT, locale), { recursive: true, force: true });
  }

  const dictionaries = new Map();
  for (const locale of dictionaryLocales) {
    const dict = await loadDictionary(locale);
    dictionaries.set(locale, dict.strings ?? {});
  }

  let generated = 0;
  for (const file of routePages) {
    const routePath = routePathOf(file);
    const baseHtml = await readFile(file, "utf8");

    // Versión canónica (es): misma página + canonical/hreflang.
    const canonical = injectHeadLinks(baseHtml, routePath, DEFAULT_LOCALE);
    await writeFile(file, canonical, "utf8");

    // Versiones localizadas.
    for (const locale of dictionaryLocales) {
      let html = baseHtml.replace(`lang="${DEFAULT_LOCALE}"`, `lang="${locale}"`);
      html = applyDictionary(html, dictionaries.get(locale));
      html = localizeAnchors(html, locale);
      html = injectHeadLinks(html, routePath, locale);

      const target = path.join(OUT, locale, routePath, "index.html");
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, html, "utf8");
      generated += 1;
    }
  }

  console.log(
    `i18n-build: ${routePages.length} páginas canónicas + ${generated} localizadas ` +
      `(${dictionaryLocales.map((l) => `/${l}/`).join(", ")}) — dominio ${DOMAIN}`,
  );
}

await main();
