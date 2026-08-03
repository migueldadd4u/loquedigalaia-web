/**
 * i18n-client.mjs — utilidades compartidas del mecanismo i18n post-build
 * (PLAN.md §1: español canónico en raíz + /<locale>/ generado desde
 * diccionarios JSON, hreflang, canónica, sin duplicar assets).
 *
 * Lo usan scripts/i18n-build.mjs, scripts/gate.mjs y la suite de tests.
 * La web funciona sin JavaScript de cliente: aquí no hay runtime de navegador.
 */

import { readFile } from "node:fs/promises";

export const SITE_NAME = "Lo que diga la IA";
export const DOMAIN = "https://loquedigalaia.com";
export const DEFAULT_LOCALE = "es";
export const LOCALES = ["es", "en"];

/** Las 7 rutas canónicas de PLAN.md §2 (con trailing slash, como el export). */
export const ROUTES = [
  "/",
  "/manifiesto/",
  "/problemas/",
  "/como-trabajamos/",
  "/pulso/",
  "/cofundadores/",
  "/contacto/",
];

/** Ruta localizada: es queda en raíz; el resto bajo /<locale>/. */
export function localePath(routePath, locale) {
  if (locale === DEFAULT_LOCALE) return routePath;
  return `/${locale}${routePath === "/" ? "/" : routePath}`;
}

/** URL absoluta canónica de una ruta en un locale. */
export function absoluteUrl(routePath, locale) {
  return `${DOMAIN}${localePath(routePath, locale)}`;
}

/** Carga content/i18n/<locale>.json relativo a este script. */
export async function loadDictionary(locale) {
  const raw = await readFile(
    new URL(`../content/i18n/${locale}.json`, import.meta.url),
    "utf8",
  );
  return JSON.parse(raw);
}
