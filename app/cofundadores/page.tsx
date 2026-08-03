import type { Metadata } from "next";
import Link from "next/link";
import { cofundadores, origenes } from "@/content/es/site";

export const metadata: Metadata = {
  title: "Cofundadores",
  description:
    "Cualquiera puede ser cofundador de Lo que diga la IA, aunque llegue cinco años después.",
};

export default function CofundadoresPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl mb-4">{cofundadores.titulo}</h1>
      <p className="text-lg" style={{ color: "var(--fg-soft)" }}>
        {cofundadores.intro}
      </p>
      <p className="text-lg font-medium mt-4">{cofundadores.tesis}</p>

      <h2 className="text-2xl mt-10 mb-3">{cofundadores.comoTitulo}</h2>
      <ol className="list-decimal ps-6 grid gap-2">
        {cofundadores.como.map((paso) => (
          <li key={paso}>{paso}</li>
        ))}
      </ol>

      <h2 className="text-2xl mt-10 mb-3">{origenes.titulo}</h2>
      <ul className="list-none p-0 grid gap-2">
        {origenes.enlaces.map((e) => (
          <li key={e.href}>
            <strong>{e.pregunta}</strong> <a href={e.href}>{e.etiqueta}</a>
          </li>
        ))}
      </ul>

      <p className="mt-10">
        <Link
          href="/contacto/"
          className="no-underline rounded-md px-5 py-3 font-medium inline-block"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
        >
          {cofundadores.cta}
        </Link>
      </p>
    </div>
  );
}
