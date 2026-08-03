/** Suite F2 sobre el HTML estático renderizado (PLAN.md §1 y §3). */

import { createHash } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_LOCALE,
  LOCALES,
  ROUTES,
  absoluteUrl,
  localePath,
} from "../scripts/i18n-client.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = path.join(ROOT, "out");
const VALIDATED_MANIFESTO_SHA256 =
  "c472ec1446633d3f0c0507164ec5a9f3bdeb365c990929e4f758154c05bfcee4";
const INSTITUTIONAL_SOURCE_HOSTS = new Set([
  "aesia.digital.gob.es",
  "digital-decade-desi.digital-strategy.ec.europa.eu",
  "digital-strategy.ec.europa.eu",
  "digital.gob.es",
  "ec.europa.eu",
  "govern.cat",
  "pnsd.sanidad.gob.es",
  "sepe.es",
  "www.boe.es",
  "www.hacienda.gob.es",
  "www.ine.es",
  "www.interior.gob.es",
  "www.oecd.org",
  "www.sanidad.gob.es",
  "www.unesco.org",
]);

function htmlFile(locale, route) {
  return path.join(OUT, localePath(route, locale), "index.html");
}

async function html(locale, route) {
  return readFile(htmlFile(locale, route), "utf8");
}

function decodeHtml(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeText(text) {
  return decodeHtml(text)
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function articleText(content) {
  const article = content.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1] ?? "";
  const clean = article
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "");
  const segments = [...clean.matchAll(/>([^<>]+)</g)].map((match) => match[1]);
  return normalizeText(segments.join(" "));
}

function markdownText(source) {
  return normalizeText(
    source
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\s*(?:>\s*|[-+]\s+|\d+\.\s+)/gm, "")
      .replace(/[\*_~]/g, ""),
  );
}

test("el build exporta las 7 rutas × 2 idiomas", async () => {
  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      const content = await html(locale, route).catch(() => null);
      assert.ok(
        content,
        `falta ${localePath(route, locale)}index.html — ¿ejecutaste npm run build:static?`,
      );
    }
  }
});

test("<html lang> correcto en cada locale", async () => {
  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      const content = await html(locale, route);
      assert.match(content, new RegExp(`<html lang="${locale}"`), `${locale}${route}`);
    }
  }
});

test("exactamente un <h1> por página", async () => {
  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      const content = await html(locale, route);
      const count = (content.match(/<h1[\s>]/g) ?? []).length;
      assert.equal(count, 1, `${locale}${route} tiene ${count} <h1>`);
    }
  }
});

test("landmarks header/nav/main/footer en todas las páginas", async () => {
  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      const content = await html(locale, route);
      for (const landmark of ["header", "nav", "main", "footer"]) {
        assert.match(
          content,
          new RegExp(`<${landmark}[\\s>]`),
          `${locale}${route} sin <${landmark}>`,
        );
      }
    }
  }
});

test("el skip-link es el primer elemento enfocable y apunta a #contenido", async () => {
  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      const content = await html(locale, route);
      const body = content.split(/<body[^>]*>/)[1] ?? "";
      const firstAnchor = body.match(/<a\b[^>]*>/)?.[0] ?? "";
      assert.ok(
        firstAnchor.includes('href="#contenido"'),
        `${locale}${route}: primer enlace del body no es el skip-link`,
      );
      assert.match(content, /<main id="contenido"/, `${locale}${route} sin main#contenido`);
    }
  }
});

test("canonical y hreflang es/en/x-default correctos", async () => {
  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      const content = await html(locale, route);
      assert.ok(
        content.includes(`<link rel="canonical" href="${absoluteUrl(route, locale)}"/>`),
        `${locale}${route}: canonical incorrecta`,
      );
      for (const alt of LOCALES) {
        assert.ok(
          content.includes(
            `<link rel="alternate" hreflang="${alt}" href="${absoluteUrl(route, alt)}"/>`,
          ),
          `${locale}${route}: falta hreflang ${alt}`,
        );
      }
      assert.ok(
        content.includes(
          `<link rel="alternate" hreflang="x-default" href="${absoluteUrl(route, DEFAULT_LOCALE)}"/>`,
        ),
        `${locale}${route}: falta hreflang x-default`,
      );
    }
  }
});

test("selector de idioma: aria-current en el locale activo y enlace al alternativo", async () => {
  for (const route of ROUTES) {
    const es = await html("es", route);
    const esSelf = es.match(/<a data-lang-link="es"[^>]*>/)?.[0] ?? "";
    const esAlt = es.match(/<a data-lang-link="en"[^>]*>/)?.[0] ?? "";
    assert.ok(esSelf.includes('aria-current="page"'), `es${route}: ES sin aria-current`);
    assert.ok(!esAlt.includes("aria-current"), `es${route}: EN con aria-current`);
    assert.ok(
      esAlt.includes(`href="${localePath(route, "en")}"`),
      `es${route}: EN no enlaza a ${localePath(route, "en")}`,
    );

    const en = await html("en", route);
    const enSelf = en.match(/<a [^>]*data-lang-link="en"[^>]*>/)?.[0] ?? "";
    const enAlt = en.match(/<a data-lang-link="es"[^>]*>/)?.[0] ?? "";
    assert.ok(enSelf.includes('aria-current="page"'), `en${route}: EN sin aria-current`);
    assert.ok(!enAlt.includes("aria-current"), `en${route}: ES con aria-current`);
    assert.ok(enAlt.includes(`href="${route}"`), `en${route}: ES no enlaza a ${route}`);
  }
});

test("i18n post-build: copy F2 traducido, marca y assets preservados", async () => {
  const enHome = await html("en", "/");
  assert.match(enHome, /Skip to main content/, "en/: skip-link sin traducir");
  assert.match(enHome, />Manifesto</, "en/: nav sin traducir");
  assert.match(enHome, /AI multiplies/, "en/: verbos sin traducir");
  assert.match(
    enHome,
    /We are building with a public-interest purpose/,
    "en/: tesis sin traducir",
  );
  assert.doesNotMatch(enHome, />Manifiesto</, "en/: queda español en la nav");
  assert.doesNotMatch(enHome, /<html lang="es"/, "en/: queda lang=es");
  assert.doesNotMatch(enHome, /Lo que diga AI/, "en/: nombre de marca alterado");
  assert.match(enHome, />Lo que diga la IA</, "en/: nombre de marca ausente");
  assert.ok(enHome.includes('href="/en/manifiesto/"'), "en/: nav sin prefijo /en/");
  assert.ok(enHome.includes("/_next/"), "en/: assets deben seguir en /_next/ (sin duplicar)");

  const expectations = new Map([
    ["/manifiesto/", "The Lo que diga la IA Manifesto"],
    ["/problemas/", "Eight problems worth serious work"],
    ["/como-trabajamos/", "A community that builds"],
    ["/pulso/", "not yet published"],
    ["/cofundadores/", "The door remains open"],
    ["/contacto/", "A good conversation begins with a specific problem"],
  ]);
  for (const [route, expected] of expectations) {
    assert.ok((await html("en", route)).includes(expected), `en${route}: copy sin traducir`);
  }
});

test("F2 no deja TODO-CONTENIDO en ninguna de las 14 páginas", async () => {
  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      const content = await html(locale, route);
      assert.ok(!content.includes("TODO-CONTENIDO"), `${locale}${route} conserva un placeholder`);
    }
  }
});

test("/manifiesto renderiza íntegra la fuente validada sin publicar su nota editorial", async () => {
  const source = await readFile(path.join(ROOT, "MANIFIESTO.md"), "utf8");
  const digest = createHash("sha256").update(source).digest("hex");
  const content = await html("es", "/manifiesto/");
  const publicSource = source.replace(/^(# [^\n]+\n\n)>[^\n]+\n\n/, "$1");

  assert.equal(digest, VALIDATED_MANIFESTO_SHA256);
  assert.notEqual(publicSource, source, "no se encontró la nota editorial esperada");
  assert.ok(content.includes('data-content-source="MANIFIESTO.md"'));
  assert.ok(content.includes(`data-content-sha256="${digest}"`));
  assert.doesNotMatch(content, /D5 cerrada|vía QA/);
  assert.equal(articleText(content), markdownText(publicSource));
});

test("/problemas: 8 secciones y cada bloque factual enlaza una fuente pública", async () => {
  const source = await readFile(path.join(ROOT, "content", "es", "problemas.md"), "utf8");
  const sections = source
    .split(/^## /m)
    .slice(1)
    .filter((section) => /^[1-8]\. /.test(section));
  assert.equal(sections.length, 8);

  let evidenceCount = 0;
  let focusCount = 0;
  for (const section of sections) {
    const [, ...bodyLines] = section.split("\n");
    const paragraphs = bodyLines
      .join("\n")
      .split(/\n\s*\n/)
      .map((item) => item.trim())
      .filter(Boolean);
    const evidence = paragraphs.filter(
      (item) => /^\*\*[^*]+\.\*\*/.test(item) && !item.startsWith("**Nuestro foco.**"),
    );
    evidenceCount += evidence.length;
    const focus = paragraphs.filter((item) => item.startsWith("**Nuestro foco.**"));
    focusCount += focus.length;
    assert.equal(focus.length, 1);
    assert.ok(evidence.length >= 1);
    assert.ok(evidence.every((item) => /\]\(https:\/\//.test(item)));
    assert.ok(paragraphs.slice(1).every((item) => item.startsWith("**")));
  }
  assert.equal(focusCount, 8);

  const urls = [...source.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map((match) => match[1]);
  assert.ok(urls.length >= evidenceCount);
  assert.ok(urls.every((url) => INSTITUTIONAL_SOURCE_HOSTS.has(new URL(url).hostname)));
  const es = await html("es", "/problemas/");
  const en = await html("en", "/problemas/");
  for (const url of new Set(urls)) {
    const renderedUrl = url.replaceAll("&", "&amp;");
    assert.ok(es.includes(`href="${renderedUrl}"`), `ES no renderiza ${url}`);
    assert.ok(en.includes(`href="${renderedUrl}"`), `EN no conserva ${url}`);
  }
});

test("el diccionario completo se usa, se renderiza y conserva todas las cifras", async () => {
  const dictionary = JSON.parse(
    await readFile(path.join(ROOT, "content", "i18n", "en.json"), "utf8"),
  );
  const es = (await Promise.all(ROUTES.map((route) => html("es", route)))).join("\n");
  const en = (await Promise.all(ROUTES.map((route) => html("en", route)))).join("\n");
  const numbers = (text) =>
    (text.match(/\d+(?:[.,]\d+)*/g) ?? [])
      .map((number) => number.replace(",", "."));

  for (const [key, value] of Object.entries(dictionary.strings)) {
    assert.ok(es.includes(key), `clave ES sin uso: ${key}`);
    assert.ok(en.includes(value), `valor EN no renderizado: ${value}`);
    assert.deepEqual(numbers(value), numbers(key), `la traducción altera cifras: ${key}`);
  }
});

test("CSS: focus visible, color-scheme y prefers-reduced-motion presentes", async () => {
  async function* walkCss(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) yield* walkCss(full);
      else if (entry.name.endsWith(".css")) yield full;
    }
  }
  let css = "";
  for await (const file of walkCss(path.join(OUT, "_next"))) {
    css += await readFile(file, "utf8");
  }
  assert.ok(css.length > 0, "no hay CSS exportado");
  assert.ok(css.includes(":focus-visible"), "CSS sin :focus-visible");
  assert.ok(css.includes("color-scheme"), "CSS sin color-scheme (claro/oscuro)");
  assert.ok(css.includes("prefers-reduced-motion"), "CSS sin prefers-reduced-motion");
});

test("el HTML público no filtra rutas locales ni correos electrónicos", async () => {
  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      const content = await html(locale, route);
      assert.doesNotMatch(content, /\/Users\//, `${locale}${route} contiene una ruta local`);
      assert.doesNotMatch(
        content,
        /[\w.-]+@[\w.-]+\.\w{2,}/,
        `${locale}${route} contiene un correo electrónico`,
      );
    }
  }
});
