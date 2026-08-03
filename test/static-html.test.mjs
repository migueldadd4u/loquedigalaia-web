/**
 * Suite F1 sobre el HTML renderizado (PLAN.md §1 y §3 — patrón add4u-web):
 * rutas existen, lang/hreflang correctos, un <h1> por página, landmarks,
 * skip-link, selector de idioma, diccionario aplicado y reglas de
 * accesibilidad presentes en el CSS. Se ejecuta tras `npm run build:static`.
 */

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

function htmlFile(locale, route) {
  return path.join(OUT, localePath(route, locale), "index.html");
}

async function html(locale, route) {
  return readFile(htmlFile(locale, route), "utf8");
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

test("i18n post-build: diccionario aplicado en /en/ y assets sin duplicar", async () => {
  const enHome = await html("en", "/");
  assert.match(enHome, /Skip to main content/, "en/: skip-link sin traducir");
  assert.match(enHome, />Manifesto</, "en/: nav sin traducir");
  assert.match(enHome, /AI multiplies/, "en/: verbos sin traducir");
  assert.doesNotMatch(enHome, />Manifiesto</, "en/: queda español en la nav");
  assert.doesNotMatch(enHome, /<html lang="es"/, "en/: queda lang=es");
  assert.ok(enHome.includes('href="/en/manifiesto/"'), "en/: nav sin prefijo /en/");
  assert.ok(enHome.includes("/_next/"), "en/: assets deben seguir en /_next/ (sin duplicar)");

  const enContacto = await html("en", "/contacto/");
  assert.match(enContacto, /Request a conversation/, "en/contacto/: CTA sin traducir");
});

test("contenido pendiente marcado TODO-CONTENIDO en las 7 rutas canónicas (F1)", async () => {
  for (const route of ROUTES) {
    const content = await html("es", route);
    assert.ok(content.includes("TODO-CONTENIDO"), `es${route} sin marcador TODO-CONTENIDO`);
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

test("cero datos personales en el HTML exportado (regla 1 de AGENTS.md)", async () => {
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
