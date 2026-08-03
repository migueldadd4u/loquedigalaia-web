import Link from "next/link";
import { Compass } from "./Compass";
import { nav, site } from "@/content/es/site";

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
        className="mx-auto max-w-5xl px-4 py-8 text-sm flex flex-wrap gap-4 items-center"
        style={{ color: "var(--fg-soft)" }}
      >
        <Compass size={20} />
        <p className="m-0">
          {site.nombre} — {site.claim}. Construida en público por dos personas y
          dos clones de IA.
        </p>
        <p className="m-0 ms-auto">
          <Link href="/manifiesto/">Manifiesto</Link> ·{" "}
          <Link href="/pulso/">Pulso</Link>
        </p>
        <nav aria-label="Idiomas" className="lang-switcher w-full">
          {/* Enlaces a la portada de cada idioma. El bloque queda fuera de la
              traducción y del prefijado (clase lang-switcher); el de español usa
              /#inicio para que el prefijador de enlaces no lo reescriba. */}
          <ul className="flex flex-wrap gap-x-3 gap-y-1 list-none p-0 m-0 text-xs">
            {[
              ["/#inicio", "Español"],
              ["/en/", "English"],
              ["/ca/", "Català"],
              ["/gl/", "Galego"],
              ["/eu/", "Euskara"],
              ["/va/", "Valencià"],
              ["/oc/", "Aranés"],
              ["/ast/", "Asturianu"],
              ["/pt/", "Português"],
              ["/br/", "Português (BR)"],
              ["/mx/", "Español (MX)"],
              ["/co/", "Español (CO)"],
              ["/cl/", "Español (CL)"],
              ["/pe/", "Español (PE)"],
              ["/ar/", "Español (AR)"],
              ["/uy/", "Español (UY)"],
              ["/ec/", "Español (EC)"],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} style={{ color: "var(--fg-soft)" }}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
