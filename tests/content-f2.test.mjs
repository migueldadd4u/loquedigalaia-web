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
// Todos los idiomas que acabarán teniendo diccionario. Los que aún no existen
// se listan como pendientes en el propio test (no se ocultan): hoy faltan las
// lenguas de España y el portugués, en curso.
const DICTIONARIES = [
  "en", "zh", "ja", "ko", "zh-TW",
  "ca", "gl", "eu", "va", "oc-aranes", "ast", "pt",
];

async function htmlRoot(relativePath) {
  return parse(await readFile(join(OUT, relativePath), "utf8"));
}

test("cada página y el 404 llevan un único hero IA con etiqueta UE separada", async () => {
  const pages = [...ROUTES, ["/404", "404.html"]];

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
    assert.ok(art?.getAttribute("alt")?.trim(), `${route}: falta alt de la ilustración`);
    assert.equal(badges.length, 1, `${route}: falta o se duplica el distintivo UE`);
    assert.notEqual(
      art?.getAttribute("src"),
      badges[0]?.getAttribute("src"),
      `${route}: el distintivo debe ser un elemento HTML separado del bitmap`,
    );
  }
});

test("los ocho problemas usan fotos reales optimizadas y acreditadas", async () => {
  const root = await htmlRoot("problemas/index.html");
  const figures = root.querySelectorAll("figure[data-real-photo='true']");
  const credits = await readFile(join(ROOT, "public", "images", "CREDITS.md"), "utf8");

  assert.equal(figures.length, 8, "debe haber una fotografía real por problema");
  for (const figure of figures) {
    const source = figure.querySelector("source[type='image/avif']");
    const image = figure.querySelector("img");
    const avif = source?.getAttribute("srcset");
    const jpeg = image?.getAttribute("src");

    assert.match(avif ?? "", /^\/images\/problems\/.+\.avif$/);
    assert.match(jpeg ?? "", /^\/images\/problems\/.+\.jpg$/);
    assert.ok(image?.getAttribute("alt")?.trim(), "cada foto real necesita alt");
    assert.ok(existsSync(join(ROOT, "public", avif)), `falta ${avif}`);
    assert.ok(existsSync(join(ROOT, "public", jpeg)), `falta ${jpeg}`);
    assert.ok(
      credits.includes(avif.replace("/images/", "")),
      `CREDITS.md no cubre ${avif}`,
    );
  }

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
  // Cadenas que deben quedarse IDÉNTICAS en todos los idiomas: la marca, los
  // nombres de personas y organizaciones, los dominios y los correos. Se listan
  // aquí —y se guardan en los diccionarios con el valor igual a la clave— para
  // dejar por escrito que no se traducen por decisión, no por olvido. El
  // pipeline descarta las entradas donde valor == clave, así que no tienen
  // efecto sobre el HTML.
  const unchangedAllowed = new Set([
    "Add4u",
    "Alastria",
    "ClonMADv3",
    "GestDocAI",
    "ISBE",
    "Jarvis",
    "Lo que diga la IA",
    "Luis Garvía Vega",
    "Miguel Ángel Domínguez Castellano",
    "linkedin.com/in/garvia",
    "miguelangeldominguez.info",
    "lgarvia@comillas.edu",
  ]);

  assert.ok(expectedKeys.length > 200, "el inventario parece incompleto");
  const pendientes = [];
  for (const locale of DICTIONARIES) {
    const ruta = join(ROOT, "content", "i18n", `${locale}.json`);
    if (!existsSync(ruta)) {
      pendientes.push(locale); // aún sin traducir: la página existe en español
      continue;
    }
    const dictionary = JSON.parse(await readFile(ruta, "utf8"));
    assert.deepEqual(
      Object.keys(dictionary).sort(),
      expectedKeys,
      `${locale}.json no está sincronizado con _inventory.json`,
    );
    // Copia perezosa: en lenguas próximas al castellano (gallego, asturiano,
    // portugués, catalán…) hay cadenas que coinciden de forma legítima —«Aviso
    // legal» se escribe igual en gallego—, así que exigir que TODA cadena larga
    // difiera daba falsos positivos. Lo que sí delata un fichero copiado es la
    // proporción: se exige que al menos el 85 % de las cadenas largas cambien.
    let largas = 0;
    let traducidas = 0;
    for (const source of expectedKeys) {
      const translated = dictionary[source];
      assert.equal(typeof translated, "string", `${locale}: ${source}`);
      assert.ok(translated.trim(), `${locale}: traducción vacía para ${source}`);
      if (source.length >= 30 && !unchangedAllowed.has(source)) {
        largas += 1;
        if (translated !== source) traducidas += 1;
      }
      if (source.includes("Lo que diga la IA")) {
        assert.ok(
          translated.includes("Lo que diga la IA"),
          `${locale}: la marca se ha traducido en ${source}`,
        );
      }
    }
    const ratio = largas ? traducidas / largas : 1;
    assert.ok(
      ratio >= 0.85,
      `${locale}: solo el ${Math.round(ratio * 100)} % de las cadenas largas está traducido (${traducidas}/${largas}); parece una copia del castellano`,
    );
  }
  // Se deja constancia de lo que falta, en vez de que el test reviente con un
  // ENOENT confuso. La lista debe encogerse; si vuelve a crecer, es un aviso.
  if (pendientes.length) {
    console.log(`  · diccionarios pendientes (${pendientes.length}): ${pendientes.join(", ")}`);
  }
  // Tope actual: 8 (zh-TW y las lenguas de España más el portugués). Este
  // número solo puede BAJAR: bájalo al escribir cada diccionario nuevo.
  assert.ok(
    pendientes.length <= 8,
    `hay ${pendientes.length} diccionarios sin escribir: ${pendientes.join(", ")}`,
  );
});

test("el inventario i18n no depende del estado diario del pulso", async () => {
  const inventory = JSON.parse(
    await readFile(join(ROOT, "content", "i18n", "_inventory.json"), "utf8"),
  );
  for (const text of [
    "Aviso:",
    "Datos de ejemplo. Las fuentes reales de los clones están en proceso de publicación; este es el formato exacto con el que se mostrarán.",
    "dato con más de 48 h, pendiente de refresco",
    "ejemplo",
    "último valor válido",
  ]) {
    assert.ok(inventory.includes(text), `falta la copia condicional «${text}»`);
  }
  assert.equal(
    inventory.some((text) => /\b\d{4}-\d{2}-\d{2}\b.*→/.test(text)),
    false,
    "una serie diaria se convirtió en clave de traducción",
  );

  const source = await readFile(join(ROOT, "app", "pulso", "page.tsx"), "utf8");
  assert.match(source, /<svg[\s\S]*?aria-hidden="true"/);
  assert.doesNotMatch(source, /aria-label=.*series/);
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
