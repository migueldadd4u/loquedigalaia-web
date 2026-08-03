import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { parse } from "node-html-parser";

const ROOT = process.cwd();
const OUT = join(ROOT, "out");
const ROUTES = [
  ["/", "index.html"],
  ["/manifiesto/", "manifiesto/index.html"],
  ["/problemas/", "problemas/index.html"],
  ["/como-trabajamos/", "como-trabajamos/index.html"],
  ["/pulso/", "pulso/index.html"],
  ["/cofundadores/", "cofundadores/index.html"],
  ["/faq/", "faq/index.html"],
  ["/contacto/", "contacto/index.html"],
];
const DICTIONARIES = ["en", "ca", "gl", "eu", "va", "oc-aranes", "ast", "pt"];
const LOCALE_PREFIX = {
  en: "en",
  ca: "ca",
  gl: "gl",
  eu: "eu",
  va: "va",
  "oc-aranes": "oc",
  ast: "ast",
  pt: "pt",
};

async function htmlRoot(relativePath) {
  return parse(await readFile(join(OUT, relativePath), "utf8"));
}

test("cada página y el 404 llevan un único hero IA con etiqueta UE separada", async () => {
  const pages = [...ROUTES, ["/404", "404.html"]];
  const heroSources = [];

  for (const [route, relativePath] of pages) {
    const root = await htmlRoot(relativePath);
    const heroes = root.querySelectorAll("[data-ai-hero='true']");
    assert.equal(heroes.length, 1, `${route}: debe existir un único hero IA`);

    const hero = heroes[0];
    const art = hero.querySelector("img.page-hero-image");
    const badges = hero.querySelectorAll(
      "img[src='/images/eu-ai-generated-white.svg'], img[src='/images/eu-ai-generated-black.svg']",
    );
    assert.ok(art?.getAttribute("src")?.startsWith("/images/"), `${route}: falta ilustración`);
    heroSources.push(art.getAttribute("src"));
    assert.ok(art?.getAttribute("alt")?.trim(), `${route}: falta alt de la ilustración`);
    assert.equal(badges.length, 1, `${route}: falta o se duplica el distintivo UE`);
    assert.notEqual(
      art?.getAttribute("src"),
      badges[0]?.getAttribute("src"),
      `${route}: el distintivo debe ser un elemento HTML separado del bitmap`,
    );
  }

  assert.equal(
    new Set(heroSources).size,
    pages.length,
    "cada página debe tener una ilustración de hero propia",
  );
});

test("los ocho problemas usan fotos reales optimizadas y acreditadas", async () => {
  const root = await htmlRoot("problemas/index.html");
  const figures = root.querySelectorAll("figure[data-real-photo='true']");
  const credits = await readFile(join(ROOT, "public", "images", "CREDITS.md"), "utf8");
  const photoSources = [];

  assert.equal(figures.length, 8, "debe haber una fotografía real por problema");
  for (const figure of figures) {
    const source = figure.querySelector("source[type='image/avif']");
    const image = figure.querySelector("img");
    const avif = source?.getAttribute("srcset");
    const jpeg = image?.getAttribute("src");

    assert.match(avif ?? "", /^\/images\/problems\/.+\.avif$/);
    assert.match(jpeg ?? "", /^\/images\/problems\/.+\.jpg$/);
    photoSources.push(avif);
    assert.ok(image?.getAttribute("alt")?.trim(), "cada foto real necesita alt");
    assert.equal(
      figure.querySelectorAll("img[src*='eu-ai-generated']").length,
      0,
      "una foto real no debe llevar distintivo de imagen generada",
    );
    assert.ok(existsSync(join(ROOT, "public", avif)), `falta ${avif}`);
    assert.ok(existsSync(join(ROOT, "public", jpeg)), `falta ${jpeg}`);
    assert.ok(
      credits.includes(avif.replace("/images/", "")),
      `CREDITS.md no cubre ${avif}`,
    );
  }
  assert.equal(new Set(photoSources).size, 8, "cada problema necesita su propia foto");

  const html = await readFile(join(OUT, "problemas", "index.html"), "utf8");
  assert.doesNotMatch(html, /Fotografía real \(no IA\) pendiente|TODO-CONTENIDO/i);
  assert.match(credits, /Wikimedia Commons/);
  assert.match(credits, /CC BY|CC0/);
});

test("los ocho diccionarios traducidos coinciden exactamente con el inventario", async () => {
  const inventory = JSON.parse(
    await readFile(join(ROOT, "content", "i18n", "_inventory.json"), "utf8"),
  );
  const expectedKeys = [...inventory].sort();
  const unchangedAllowed = new Set([
    "Add4u",
    "Alastria",
    "ClonMADv3",
    "GestDocAI",
    "ISBE",
    "Jarvis",
    "La Infraestructura de Servicios Blockchain de España.",
    "Lo que diga la IA",
    "Miguel Ángel Domínguez Castellano",
  ]);
  const unchangedAllowedByLocale = {
    gl: new Set([
      "Aviso legal — Lo que diga la IA",
      "Cofundadores — Lo que diga la IA",
      "Miguel Ángel (MAD) por WhatsApp",
      "Política de cookies — Lo que diga la IA",
      "Tokens consumidos (total acumulado)",
    ]),
    pt: new Set([
      "Aviso legal — Lo que diga la IA",
      "Cofundadores — Lo que diga la IA",
      "Miguel Ángel (MAD) por WhatsApp",
      "Política de cookies — Lo que diga la IA",
      "Tokens consumidos (total acumulado)",
    ]),
    ast: new Set([
      "Cofundadores — Lo que diga la IA",
      "Luis Garvía Vega, con DNI 51429410F.",
      "Miguel Ángel (MAD) por WhatsApp",
      "Miguel Ángel Domínguez Castellano, con DNI 01178330V.",
      "Política de cookies — Lo que diga la IA",
      "Una factoría de unicornios improbables.",
      "¿Puedo ser cofundador si llego cinco años tarde?",
    ]),
  };
  const smokeSource = "Los problemas que nos importan";

  assert.ok(expectedKeys.length > 200, "el inventario parece incompleto");
  for (const locale of DICTIONARIES) {
    const dictionary = JSON.parse(
      await readFile(join(ROOT, "content", "i18n", `${locale}.json`), "utf8"),
    );
    assert.deepEqual(
      Object.keys(dictionary).sort(),
      expectedKeys,
      `${locale}.json no está sincronizado con _inventory.json`,
    );
    for (const source of expectedKeys) {
      const translated = dictionary[source];
      assert.equal(typeof translated, "string", `${locale}: ${source}`);
      assert.ok(translated.trim(), `${locale}: traducción vacía para ${source}`);
      assert.deepEqual(
        [...(translated.match(/\d+(?:[.,]\d+)*/g) ?? [])].sort(),
        [...(source.match(/\d+(?:[.,]\d+)*/g) ?? [])].sort(),
        `${locale}: la traducción alteró una cifra en ${source}`,
      );
      if (
        source.length >= 30 &&
        !unchangedAllowed.has(source) &&
        !unchangedAllowedByLocale[locale]?.has(source)
      ) {
        assert.notEqual(
          translated,
          source,
          `${locale}: cadena larga sin traducir: ${source}`,
        );
      }
      if (source.includes("Lo que diga la IA")) {
        assert.ok(
          translated.includes("Lo que diga la IA"),
          `${locale}: la marca se ha traducido en ${source}`,
        );
      }
    }

    const localizedHome = await readFile(
      join(OUT, LOCALE_PREFIX[locale], "index.html"),
      "utf8",
    );
    assert.ok(
      localizedHome.includes(dictionary[smokeSource]),
      `${locale}: el build no aplicó el diccionario a la portada`,
    );
  }
});

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("el texto de los heroes se apoya en un panel sólido con contraste AA", async () => {
  const css = await readFile(join(ROOT, "app", "globals.css"), "utf8");
  assert.match(css, /background:\s*#17232a/);
  assert.match(css, /color:\s*#f6f3ea/);
  assert.ok(
    contrast("#f6f3ea", "#17232a") >= 4.5,
    "el par del hero no cumple WCAG AA",
  );
});
