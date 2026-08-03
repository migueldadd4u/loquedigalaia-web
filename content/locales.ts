// Fuente única de la internacionalización. La usan el selector (LangSwitcher) y el
// pipeline de build (scripts/i18n-build.mjs), que lee este mismo fichero.
//
// - `prefix`: segmento de URL. El español va en la raíz ("" = canónica y x-default).
// - `hreflang`: BCP-47 para <html lang> y las alternativas.
// - `name`: lo que se lee en el selector (idiomas → autónimo; variantes → país).
// - `flag`: fichero en /flags/.
// - `group`: "idioma" traduce el contenido; "cooficial" también (lenguas de España);
//   "variante" comparte el contenido de `source` y solo cambia bandera y hreflang.
//
// ORDEN fijado por los fundadores (03/08): primero español, inglés y chino; después el
// resto de idiomas en alfabético; luego las lenguas cooficiales de España; y al final
// las variantes por país.

export type LocaleGroup = "idioma" | "cooficial" | "variante";

export interface Locale {
  id: string;
  prefix: string;
  hreflang: string;
  name: string;
  flag: string;
  group: LocaleGroup;
  source: string;
}

export const locales: Locale[] = [
  // Los tres primeros, por decisión de los fundadores
  { id: "es",        prefix: "",    hreflang: "es",             name: "Castellano",   flag: "es.png",        group: "idioma",    source: "es" },
  { id: "en",        prefix: "en",  hreflang: "en",             name: "English",      flag: "en.png",        group: "idioma",    source: "en" },
  { id: "zh",        prefix: "zh",  hreflang: "zh-Hans",        name: "中文（简体）",   flag: "cn.svg",        group: "idioma",    source: "zh" },
  // Resto de idiomas, alfabético
  { id: "ko",        prefix: "ko",  hreflang: "ko",             name: "한국어",         flag: "kr.svg",        group: "idioma",    source: "ko" },
  { id: "ja",        prefix: "ja",  hreflang: "ja",             name: "日本語",         flag: "jp.svg",        group: "idioma",    source: "ja" },
  { id: "pt",        prefix: "pt",  hreflang: "pt-PT",          name: "Português",    flag: "pt.png",        group: "idioma",    source: "pt" },
  { id: "zh-TW",     prefix: "tw",  hreflang: "zh-Hant",        name: "中文（繁體）",   flag: "tw.svg",        group: "idioma",    source: "zh-TW" },
  // Lenguas cooficiales y propias de España, alfabético
  { id: "oc-aranes", prefix: "oc",  hreflang: "oc",             name: "Aranés",       flag: "oc-aranes.svg", group: "cooficial", source: "oc-aranes" },
  { id: "ast",       prefix: "ast", hreflang: "ast",            name: "Asturianu",    flag: "ast.svg",       group: "cooficial", source: "ast" },
  { id: "ca",        prefix: "ca",  hreflang: "ca",             name: "Català",       flag: "ca.svg",        group: "cooficial", source: "ca" },
  { id: "eu",        prefix: "eu",  hreflang: "eu",             name: "Euskera",      flag: "eu.svg",        group: "cooficial", source: "eu" },
  { id: "gl",        prefix: "gl",  hreflang: "gl",             name: "Galego",       flag: "gl.svg",        group: "cooficial", source: "gl" },
  { id: "va",        prefix: "va",  hreflang: "ca-ES-valencia", name: "Valencià",     flag: "va.svg",        group: "cooficial", source: "va" },
  // Variantes por país, alfabético
  { id: "es-AR",     prefix: "ar",  hreflang: "es-AR",          name: "Argentina",    flag: "ar.png",        group: "variante",  source: "es" },
  { id: "pt-BR",     prefix: "br",  hreflang: "pt-BR",          name: "Brasil",       flag: "br.png",        group: "variante",  source: "pt" },
  { id: "es-CL",     prefix: "cl",  hreflang: "es-CL",          name: "Chile",        flag: "cl.png",        group: "variante",  source: "es" },
  { id: "es-CO",     prefix: "co",  hreflang: "es-CO",          name: "Colombia",     flag: "co.png",        group: "variante",  source: "es" },
  { id: "es-EC",     prefix: "ec",  hreflang: "es-EC",          name: "Ecuador",      flag: "ec.png",        group: "variante",  source: "es" },
  { id: "es-MX",     prefix: "mx",  hreflang: "es-MX",          name: "México",       flag: "mx.png",        group: "variante",  source: "es" },
  { id: "es-PE",     prefix: "pe",  hreflang: "es-PE",          name: "Perú",         flag: "pe.png",        group: "variante",  source: "es" },
  { id: "es-UY",     prefix: "uy",  hreflang: "es-UY",          name: "Uruguay",      flag: "uy.png",        group: "variante",  source: "es" },
];

export const defaultLocale = locales[0];
export const localePrefixes = locales.map((l) => l.prefix).filter(Boolean);
