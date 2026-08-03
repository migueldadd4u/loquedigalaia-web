/**
 * gate.mjs — gate determinista de fase (PLAN.md §3). Checks binarios.
 *
 * Gate F1: el build estático genera las 7 rutas × 2 idiomas, todas las
 * páginas canónicas llevan el marcador TODO-CONTENIDO (contenido pendiente
 * por contrato) y el diccionario en.json es válido.
 * (`npm run lint` y `npm test` son parte del gate pero se ejecutan aparte.)
 */

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_LOCALE, LOCALES, ROUTES, localePath } from "./i18n-client.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = path.join(ROOT, "out");

let failures = 0;

function check(ok, label) {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failures += 1;
}

// 1) Las 7 rutas × 2 idiomas existen como HTML exportado.
for (const locale of LOCALES) {
  for (const route of ROUTES) {
    const file = path.join(OUT, localePath(route, locale), "index.html");
    const exists = await access(file).then(() => true, () => false);
    check(exists, `existe ${localePath(route, locale)}index.html`);
  }
}

// 2) F1: contenido pendiente marcado en cada página canónica (gate F2 exigirá cero).
for (const route of ROUTES) {
  const file = path.join(OUT, route, "index.html");
  const html = await readFile(file, "utf8").catch(() => "");
  check(html.includes("TODO-CONTENIDO"), `${route} marcada TODO-CONTENIDO`);
}

// 3) Diccionarios i18n válidos.
for (const locale of LOCALES.filter((l) => l !== DEFAULT_LOCALE)) {
  try {
    const dict = JSON.parse(
      await readFile(
        path.join(ROOT, "content", "i18n", `${locale}.json`),
        "utf8",
      ),
    );
    check(
      dict && typeof dict.strings === "object" && Object.keys(dict.strings).length > 0,
      `content/i18n/${locale}.json válido (${Object.keys(dict.strings).length} cadenas)`,
    );
  } catch (error) {
    check(false, `content/i18n/${locale}.json válido (${error.message})`);
  }
}

if (failures > 0) {
  console.error(`\nGate F1: ROJO (${failures} checks fallidos)`);
  process.exit(1);
}
console.log("\nGate F1: VERDE");
