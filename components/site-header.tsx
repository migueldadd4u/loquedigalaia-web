/* eslint-disable @next/next/no-html-link-for-pages -- Plain anchors keep post-build locale links server-static. */
import { NAV_ITEMS, SITE } from "@/lib/site";

/**
 * Cabecera: wordmark + nav principal + selector de idioma.
 * Es deliberadamente un componente de servidor: el paso post-build conoce la
 * ruta y fija href/aria-current para que /en/ no dependa de hidratar copy ES.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-petrol/20 dark:border-ivory/20">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4">
        <a
          href="/"
          className="text-xl font-bold tracking-tight no-underline"
        >
          {SITE.name}
        </a>

        <nav aria-label="Navegación principal">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-base">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  data-route-link={item.href}
                  href={item.href}
                  className="underline decoration-transparent transition-colors hover:decoration-current aria-[current=page]:font-semibold aria-[current=page]:decoration-current"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Selector de idioma" className="text-sm font-medium">
          <ul className="flex items-center gap-2">
            <li>
              <a
                data-lang-link="es"
                href="/"
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
                href="/en/"
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
