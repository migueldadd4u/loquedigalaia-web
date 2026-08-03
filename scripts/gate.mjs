/**
 * Gate F2 determinista (PLAN.md §3): contenido real es/en, manifiesto como
 * fuente única, ocho problemas con evidencia pública y cero placeholders.
 */

import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES, ROUTES, localePath } from "./i18n-client.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = path.join(ROOT, "out");
const VALIDATED_MANIFESTO_SHA256 =
  "c472ec1446633d3f0c0507164ec5a9f3bdeb365c990929e4f758154c05bfcee4";
const INVARIANT_I18N_KEYS = new Set([
  "Lo que diga la IA",
  "ES",
  "EN",
  "Eurostat,",
  "Unemployment statistics and beyond",
  "Milagro 0",
]);
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

let failures = 0;

function check(ok, label) {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failures += 1;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function boundedKeyPattern(key) {
  const characters = [...key];
  const startsWithWord = /[\p{L}\p{N}]/u.test(characters[0]);
  const endsWithWord = /[\p{L}\p{N}]/u.test(characters.at(-1));
  return `${startsWithWord ? "(?<![\\p{L}\\p{N}])" : ""}${escapeRegExp(key)}${endsWithWord ? "(?![\\p{L}\\p{N}])" : ""}`;
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

function visibleTextSegments(html) {
  const clean = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<!--([\s\S]*?)-->/g, "");
  return [...clean.matchAll(/>([^<>]+)</g)]
    .map((match) => decodeHtml(match[1]).trim())
    .filter(Boolean);
}

function localizedTextSegments(html) {
  const attributes = [
    ...html.matchAll(/\b(?:aria-label|alt|title)="([^"]*)"/g),
  ].map((match) => decodeHtml(match[1]).trim());
  const descriptions = [...html.matchAll(/<meta\b[^>]*>/g)]
    .map((match) => match[0])
    .filter((tag) => /\bname="description"/.test(tag))
    .map((tag) => decodeHtml(tag.match(/\bcontent="([^"]*)"/)?.[1] ?? "").trim());
  return [...visibleTextSegments(html), ...attributes, ...descriptions].filter(Boolean);
}

function normalizeText(text) {
  return decodeHtml(text)
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function markdownPlainText(markdown) {
  return normalizeText(
    markdown
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^\s*(?:>\s*|[-+]\s+|\d+\.\s+)/gm, "")
      .replace(/[\*_~]/g, ""),
  );
}

function articleMarkup(html) {
  return html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1] ?? "";
}

function externalHrefs(html) {
  return [...html.matchAll(/<a\b[^>]*href="(https:\/\/[^"#]+)"/g)]
    .map((match) => decodeHtml(match[1]))
    .sort();
}

function numberTokens(text) {
  return (text.match(/\d+(?:[.,]\d+)*/g) ?? [])
    .map((token) => token.replace(",", "."));
}

function sameArray(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

const pages = new Map();

// 1) Las 7 rutas × 2 idiomas existen.
for (const locale of LOCALES) {
  for (const route of ROUTES) {
    const routePath = localePath(route, locale);
    const file = path.join(OUT, routePath, "index.html");
    const exists = await access(file).then(
      () => true,
      () => false,
    );
    check(exists, `existe ${routePath}index.html`);
    pages.set(`${locale}:${route}`, exists ? await readFile(file, "utf8") : "");
  }
}

const headerSource = await readFile(
  path.join(ROOT, "components", "site-header.tsx"),
  "utf8",
);
check(
  !/["']use client["']|usePathname/.test(headerSource),
  "la cabecera ES/EN es estática y no revierte copy al hidratar",
);

// 2) F2 sustituye todos los placeholders, tanto en ES como en EN.
for (const locale of LOCALES) {
  for (const route of ROUTES) {
    check(
      !pages.get(`${locale}:${route}`).includes("TODO-CONTENIDO"),
      `${locale}${route} sin TODO-CONTENIDO`,
    );
  }
}

// 3) /manifiesto se genera desde la única fuente validada, MANIFIESTO.md.
const manifestoSource = await readFile(path.join(ROOT, "MANIFIESTO.md"), "utf8");
const manifestoHash = createHash("sha256").update(manifestoSource).digest("hex");
const manifestoHtml = pages.get("es:/manifiesto/");
check(
  manifestoHash === VALIDATED_MANIFESTO_SHA256,
  "MANIFIESTO.md coincide con la fuente validada",
);
check(
  manifestoHtml.includes('data-content-source="MANIFIESTO.md"'),
  "/manifiesto declara MANIFIESTO.md como fuente",
);
check(
  manifestoHtml.includes(`data-content-sha256="${manifestoHash}"`),
  "/manifiesto conserva la huella SHA-256 de la fuente",
);
const publicManifestoSource = manifestoSource.replace(/^(# [^\n]+\n\n)>[^\n]+\n\n/, "$1");
check(publicManifestoSource !== manifestoSource, "/manifiesto separa la nota editorial interna");
check(
  !manifestoHtml.includes("D5 cerrada") && !manifestoHtml.includes("vía QA"),
  "/manifiesto no publica metadatos internos",
);
check(
  normalizeText(visibleTextSegments(articleMarkup(manifestoHtml)).join(" ")) ===
    markdownPlainText(publicManifestoSource),
  "/manifiesto renderiza íntegro el contenido público de la fuente",
);

// 4) Los ocho problemas tienen foco propio y toda evidencia enlaza una fuente HTTPS.
const problemsSource = await readFile(
  path.join(ROOT, "content", "es", "problemas.md"),
  "utf8",
);
const problemParts = problemsSource
  .split(/^## /m)
  .slice(1)
  .filter((part) => /^[1-8]\. /.test(part));
check(problemParts.length === 8, `/problemas contiene 8 secciones (${problemParts.length})`);

let evidenceBlocks = 0;
let sourcedEvidenceBlocks = 0;
let focusBlocks = 0;
const problemHeadings = [];
for (const [index, part] of problemParts.entries()) {
  const [heading, ...bodyLines] = part.split("\n");
  const body = bodyLines.join("\n");
  problemHeadings.push(heading.trim());
  check(
    heading.startsWith(`${index + 1}. `),
    `/problemas sección ${index + 1} numerada y titulada`,
  );
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const focus = paragraphs.filter((item) => item.startsWith("**Nuestro foco.**"));
  const evidence = paragraphs.filter(
    (item) => /^\*\*[^*]+\.\*\*/.test(item) && !item.startsWith("**Nuestro foco.**"),
  );
  focusBlocks += focus.length;
  evidenceBlocks += evidence.length;
  sourcedEvidenceBlocks += evidence.filter((item) => /\]\(https:\/\//.test(item)).length;
  check(focus.length === 1, `/problemas sección ${index + 1} tiene un único foco`);
  check(evidence.length >= 1, `/problemas sección ${index + 1} contiene evidencia factual`);
  check(
    evidence.every((item) => /\]\(https:\/\//.test(item)),
    `/problemas sección ${index + 1} enlaza cada bloque factual`,
  );
  check(
    paragraphs.slice(1).every((item) => item.startsWith("**")),
    `/problemas sección ${index + 1} etiqueta todo párrafo tras la tesis`,
  );
}
check(focusBlocks === 8, `/problemas tiene 8 bloques «Nuestro foco» (${focusBlocks})`);
check(
  sourcedEvidenceBlocks === evidenceBlocks,
  `/problemas enlaza fuente pública en cada afirmación factual (${sourcedEvidenceBlocks}/${evidenceBlocks})`,
);

const sourceUrls = [
  ...problemsSource.matchAll(/\]\((https:\/\/[^)]+)\)/g),
].map((match) => match[1]);
const uniqueSourceUrls = [...new Set(sourceUrls)];
check(sourceUrls.length >= evidenceBlocks, `/problemas aporta ${sourceUrls.length} enlaces para ${evidenceBlocks} bloques factuales`);
check(
  sourceUrls.every((url) => INSTITUTIONAL_SOURCE_HOSTS.has(new URL(url).hostname)),
  `/problemas limita sus ${uniqueSourceUrls.length} fuentes únicas a dominios institucionales públicos`,
);

const problemsHtml = pages.get("es:/problemas/");
check(
  problemsHtml.includes('data-content-source="content/es/problemas.md"'),
  "/problemas renderiza el documento canónico",
);
check(
  problemHeadings.every((heading) => problemsHtml.includes(`>${heading}<`)),
  "/problemas renderiza las 8 secciones",
);
check(
  uniqueSourceUrls.every((url) =>
    problemsHtml.includes(`href="${url.replaceAll("&", "&amp;")}"`),
  ),
  `/problemas renderiza sus ${uniqueSourceUrls.length} fuentes enlazadas`,
);

// 5) Diccionario completo: usado, no vacío, cifras preservadas y HTML EN efectivo.
const dictionaryRaw = await readFile(
  path.join(ROOT, "content", "i18n", "en.json"),
  "utf8",
);
const dictionary = JSON.parse(dictionaryRaw);
const strings = dictionary?.strings ?? {};
const entries = Object.entries(strings);
check(dictionary?.locale === "en", "content/i18n/en.json declara locale=en");
check(entries.length > 0, `content/i18n/en.json contiene ${entries.length} cadenas`);
check(
  entries.every(
    ([key, value]) => key.trim().length > 0 && typeof value === "string" && value.trim().length > 0,
  ),
  "todas las traducciones tienen clave y valor",
);

const spanishSegmentsByRoute = new Map(
  ROUTES.map((route) => [route, localizedTextSegments(pages.get(`es:${route}`))]),
);
const englishSegmentsByRoute = new Map(
  ROUTES.map((route) => [route, localizedTextSegments(pages.get(`en:${route}`))]),
);
const allSpanishCopy = [...spanishSegmentsByRoute.values()].flat().join("\n");
const allEnglishCopy = [...englishSegmentsByRoute.values()].flat().join("\n");
const allSpanishHtml = ROUTES.map((route) => pages.get(`es:${route}`)).join("\n");
const allEnglishHtml = ROUTES.map((route) => pages.get(`en:${route}`)).join("\n");
const unusedKeys = entries.filter(([key]) => !allSpanishCopy.includes(key));
const missingValues = entries.filter(([, value]) => !allEnglishCopy.includes(value));
const changedNumbers = entries.filter(
  ([key, value]) => !sameArray(numberTokens(key), numberTokens(value)),
);
const invalidIdentities = entries.filter(
  ([key, value]) => key === value && !INVARIANT_I18N_KEYS.has(key),
);
const missingIdentities = [...INVARIANT_I18N_KEYS].filter((key) => strings[key] !== key);
check(unusedKeys.length === 0, `todas las claves ES aparecen en el build (${entries.length - unusedKeys.length}/${entries.length})`);
check(missingValues.length === 0, `todas las traducciones EN aparecen en el build (${entries.length - missingValues.length}/${entries.length})`);
check(changedNumbers.length === 0, `i18n conserva las cifras (${entries.length - changedNumbers.length}/${entries.length})`);
check(
  invalidIdentities.length === 0 && missingIdentities.length === 0,
  `solo ${INVARIANT_I18N_KEYS.size} nombres/códigos explícitos permanecen invariantes`,
);
if (unusedKeys.length) console.error("  Claves sin uso:", unusedKeys.slice(0, 5).map(([key]) => key));
if (missingValues.length) console.error("  Valores ausentes:", missingValues.slice(0, 5).map(([, value]) => value));
if (changedNumbers.length) console.error("  Cifras alteradas:", changedNumbers.slice(0, 5));
if (invalidIdentities.length) console.error("  Identidades no permitidas:", invalidIdentities);
if (missingIdentities.length) console.error("  Identidades ausentes:", missingIdentities);

const dictionaryKeys = Object.keys(strings).sort((left, right) => right.length - left.length);
const coveragePattern = new RegExp(dictionaryKeys.map(escapeRegExp).join("|"), "g");
const translationPattern = new RegExp(dictionaryKeys.map(boundedKeyPattern).join("|"), "gu");
const uncoveredSegments = [];
for (const route of ROUTES) {
  for (const segment of spanishSegmentsByRoute.get(route)) {
    const remainder = segment
      .replace(coveragePattern, "")
      .replace(/[\p{N}\p{P}\p{S}\p{Z}\s]/gu, "");
    if (/\p{L}/u.test(remainder)) uncoveredSegments.push({ route, segment, remainder });
  }
}
check(uncoveredSegments.length === 0, "todas las cadenas visibles ES están cubiertas por el diccionario");
if (uncoveredSegments.length) console.error("  Segmentos sin cubrir:", uncoveredSegments.slice(0, 5));

const translationMismatches = [];
for (const route of ROUTES) {
  const expected = spanishSegmentsByRoute
    .get(route)
    .map((segment) => segment.replace(translationPattern, (key) => strings[key]));
  const actual = englishSegmentsByRoute.get(route);
  if (!sameArray(expected, actual)) {
    const mismatchIndex = expected.findIndex((segment, index) => segment !== actual[index]);
    translationMismatches.push({
      route,
      expected: expected[mismatchIndex],
      actual: actual[mismatchIndex],
      index: mismatchIndex,
    });
  }
}
check(
  translationMismatches.length === 0,
  "cada nodo visible y metadato ES corresponde exactamente con su versión EN",
);
if (translationMismatches.length) {
  console.error("  Desajustes i18n:", translationMismatches.slice(0, 5));
}

for (const route of ROUTES) {
  check(
    sameArray(
      externalHrefs(pages.get(`es:${route}`)),
      externalHrefs(pages.get(`en:${route}`)),
    ),
    `${route} conserva enlaces externos en EN`,
  );
}

for (const route of ["/problemas/", "/como-trabajamos/", "/cofundadores/"]) {
  const esLinks = [...articleMarkup(pages.get(`es:${route}`)).matchAll(/href="(\/[^"#]+)"/g)]
    .map((match) => match[1]);
  const enArticle = articleMarkup(pages.get(`en:${route}`));
  check(
    esLinks.every((href) => enArticle.includes(`href="/en${href}"`)),
    `${route} localiza en EN todos sus enlaces internos editoriales`,
  );
}

for (const [route, expected] of [
  ["/", "We are building with a public-interest purpose"],
  ["/manifiesto/", "The Lo que diga la IA Manifesto"],
  ["/problemas/", "Eight problems worth serious work"],
  ["/como-trabajamos/", "A community that builds"],
  ["/pulso/", "not yet published"],
  ["/cofundadores/", "The door remains open"],
  ["/contacto/", "A good conversation begins with a specific problem"],
]) {
  check(pages.get(`en:${route}`).includes(expected), `en${route} contiene copy traducido`);
}
check(
  allEnglishHtml.includes(">Lo que diga la IA<") && !allEnglishHtml.includes("Lo que diga AI"),
  "el nombre Lo que diga la IA se conserva intacto en EN",
);

// 6) Privacidad básica verificable en fuentes y build.
const editorialSources = [
  manifestoSource,
  problemsSource,
  await readFile(path.join(ROOT, "content", "es", "como-trabajamos.md"), "utf8"),
  await readFile(path.join(ROOT, "content", "es", "cofundadores.md"), "utf8"),
].join("\n");
const founderLines = `${editorialSources}\n${dictionaryRaw}`
  .split("\n")
  .filter((line) => /fundador|cofundador/i.test(line));
const humanFullName = /\b\p{Lu}\p{Ll}+(?:\s+\p{Lu}\p{Ll}+){1,3}\b/u;
check(
  founderLines.every((line) => !humanFullName.test(line)),
  "las menciones a fundadores no incluyen nombres de persona",
);
for (const [label, text] of [
  ["fuentes editoriales", editorialSources],
  ["HTML exportado", `${allSpanishHtml}\n${allEnglishHtml}`],
]) {
  check(!text.includes("/Users/"), `${label}: cero rutas locales`);
  check(!/[\w.+-]+@[\w.-]+\.\w{2,}/.test(text), `${label}: cero correos electrónicos`);
  check(
    !/(?:api[_-]?key|password|secret|token)\s*[:=]\s*["']?[\w.-]{8,}/i.test(text),
    `${label}: cero secretos con formato asignado`,
  );
}

if (failures > 0) {
  console.error(`\nGate F2: ROJO (${failures} checks fallidos)`);
  process.exit(1);
}
console.log("\nGate F2: VERDE");
