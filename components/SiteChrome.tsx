import Link from "next/link";
import { Compass } from "./Compass";
import { LangSwitcher } from "./LangSwitcher";
import { nav, pie, site } from "@/content/es/site";

export function SiteHeader() {
  return (
    <header
      className="border-b"
      style={{ borderColor: "var(--border)", background: "var(--bg)" }}
    >
      <div className="mx-auto max-w-5xl px-4 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline"
          style={{ color: "var(--fg)" }}
        >
          <Compass size={30} />
          <span className="brand-lqdia font-semibold tracking-tight">{site.nombre}</span>
        </Link>
        <nav aria-label="Principal" className="ms-auto">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {nav.slice(1).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="no-underline hover:underline"
                  style={{ color: "var(--fg-soft)" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <LangSwitcher />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer
      className="border-t mt-16"
      style={{ borderColor: "var(--border)", background: "var(--bg-alt)" }}
    >
      <div
        className="mx-auto max-w-5xl px-4 py-10 text-sm"
        style={{ color: "var(--fg-soft)" }}
      >
        <div className="flex flex-wrap gap-8">
          <div className="grow">
            <Compass size={20} />
            <p className="mt-3 mb-0 max-w-md">
              {site.nombre} — {site.claim}. Construida en público por dos
              personas y dos clones de IA.
            </p>
          </div>
          <nav aria-label="Pie de página" className="flex flex-wrap gap-8">
            {pie.grupos.map((grupo) => (
              <div key={grupo.titulo}>
                <h2 className="text-xs font-semibold uppercase tracking-wider m-0">
                  {grupo.titulo}
                </h2>
                <ul className="list-none p-0 mt-2 mb-0 grid gap-1">
                  {grupo.enlaces.map((enlace) => (
                    <li key={enlace.href}>
                      <Link href={enlace.href}>{enlace.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/*
          Identificación del prestador en todas las páginas: el artículo 10 de la
          Ley 34/2002 (LSSI-CE) la exige permanente, fácil, directa y gratuita.
        */}
        <p
          className="mt-8 pt-6 mb-0 max-w-3xl border-t"
          style={{ borderColor: "var(--border)" }}
        >
          {pie.identificacion}
        </p>
      </div>
    </footer>
  );
}
