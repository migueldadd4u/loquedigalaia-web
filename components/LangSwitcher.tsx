"use client";

import { useEffect, useRef, useState } from "react";
import { defaultLocale, locales, localePrefixes, type Locale } from "@/content/locales";

// Un único componente cliente que sirve igual en todas las salidas de idioma: deduce el
// idioma activo del prefijo de la URL y construye los enlaces cambiando ese prefijo. Las
// cabeceras SEO (lang/hreflang/canonical) las pone scripts/i18n-build.mjs en el <head>.
// La clase .lang-switcher hace que el pipeline NO traduzca ni prefije este bloque.

function activeFrom(pathname: string): { locale: Locale; logical: string } {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && localePrefixes.includes(first)) {
    const locale = locales.find((l) => l.prefix === first) ?? defaultLocale;
    const logical = "/" + segments.slice(1).join("/");
    return { locale, logical: logical === "/" ? "/" : logical + "/" };
  }
  return { locale: defaultLocale, logical: pathname || "/" };
}

function hrefFor(locale: Locale, logical: string): string {
  if (!locale.prefix) return logical || "/";
  return logical === "/" ? `/${locale.prefix}/` : `/${locale.prefix}${logical}`;
}

const grupos: { titulo: string; items: Locale[] }[] = [
  { titulo: "Idiomas", items: locales.filter((l) => l.group === "idioma") },
  { titulo: "Lenguas de España", items: locales.filter((l) => l.group === "cooficial") },
  { titulo: "Variantes por país", items: locales.filter((l) => l.group === "variante") },
];

export function LangSwitcher() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<{ locale: Locale; logical: string }>({
    locale: defaultLocale,
    logical: "/",
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Deliberado: SSR/hidratación pintan el idioma por defecto (servidor y cliente
    // coinciden) y, ya montados, se ajusta al idioma real de la URL.
    setState(activeFrom(window.location.pathname));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const { locale: active, logical } = state;

  const Item = ({ l }: { l: Locale }) => (
    <a
      className={`lang-item${l.id === active.id ? " active" : ""}`}
      href={hrefFor(l, logical)}
      hrefLang={l.hreflang}
      lang={l.hreflang}
      role="option"
      aria-selected={l.id === active.id}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="lang-flag" src={`/flags/${l.flag}`} alt="" aria-hidden="true" />
      <span>{l.name}</span>
    </a>
  );

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        type="button"
        className="lang-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Idioma: ${active.name}. Cambiar idioma`}
        onClick={() => setOpen((v) => !v)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="lang-flag" src={`/flags/${active.flag}`} alt="" aria-hidden="true" />
        <span className="lang-name">{active.name}</span>
        <span className="lang-caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="lang-menu" role="listbox" aria-label="Elegir idioma o país">
          {grupos.map((g) => (
            <div key={g.titulo}>
              <p className="lang-group">{g.titulo}</p>
              {g.items.map((l) => (
                <Item key={l.id} l={l} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
