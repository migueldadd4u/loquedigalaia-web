import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";
import { SITE, VERBOS } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SITE.name },
  description:
    "La IA multiplica, el humano elige, el sistema ejecuta, la realidad valida.",
};

export default function HomePage() {
  return (
    <>
      <section aria-labelledby="hero">
        <h1 id="hero" className="text-4xl font-bold tracking-tight sm:text-5xl">
          {SITE.name}
        </h1>
        <Placeholder>Tesis en una frase (PLAN.md §2, ruta `/`).</Placeholder>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {VERBOS.map((verbo) => (
            <li
              key={verbo}
              className="rounded-lg border border-petrol/20 p-4 text-lg font-semibold dark:border-ivory/20"
            >
              {verbo}
            </li>
          ))}
        </ul>
        <p className="mt-10">
          <a
            href="/contacto/"
            className="inline-block rounded-lg bg-petrol px-6 py-3 text-lg font-semibold text-ivory no-underline dark:bg-ivory dark:text-petrol-deep"
          >
            Solicitar conversación
          </a>
        </p>
      </section>
    </>
  );
}
