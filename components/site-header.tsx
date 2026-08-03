"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, SITE } from "@/lib/site";

function enPath(pathname: string): string {
  return pathname === "/" ? "/en/" : `/en${pathname}`;
}

/**
 * Cabecera: wordmark + nav principal + selector de idioma.
 * Es componente cliente solo para conocer la ruta activa (aria-current y
 * enlaces del selector de idioma); en la exportación estática el HTML sale
 * prerenderizado por ruta, con anchors reales: funciona sin JavaScript.
 *
 * Los anchors del selector llevan data-lang-link para que scripts/i18n-build.mjs
 * los trate aparte (no se prefijan con /en/ y se intercambia aria-current).
 */
export function SiteHeader() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="border-b border-petrol/20 dark:border-ivory/20">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight no-underline"
        >
          {SITE.name}
        </Link>

        <nav aria-label="Navegación principal">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-base">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="underline decoration-transparent transition-colors hover:decoration-current aria-[current=page]:font-semibold aria-[current=page]:decoration-current"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Selector de idioma" className="text-sm font-medium">
          <ul className="flex items-center gap-2">
            <li>
              <a
                data-lang-link="es"
                href={pathname}
                aria-current="page"
                aria-label="Versión en español"
                className="underline decoration-transparent aria-[current=page]:font-bold aria-[current=page]:no-underline"
              >
                ES
              </a>
            </li>
            <li aria-hidden="true">·</li>
            <li>
              <a
                data-lang-link="en"
                href={enPath(pathname)}
                aria-label="Versión en inglés"
                className="underline decoration-transparent hover:decoration-current aria-[current=page]:font-bold aria-[current=page]:no-underline"
              >
                EN
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
