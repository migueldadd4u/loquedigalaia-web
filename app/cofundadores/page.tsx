import Link from "next/link";
import { cofundadores, origenes } from "@/content/es/site";
import { PageHero } from "@/components/AiImage";
import { heroArtByRoute } from "@/content/es/heroes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cofundadores",
  description:
    "Cualquiera puede ser cofundador de Lo que diga la IA, aunque llegue cinco años después.",
  path: "/cofundadores/",
});

export default function CofundadoresPage() {
  return (
    <>
      <PageHero
        title={cofundadores.titulo}
        eyebrow="Una mesa abierta"
        description={
          <>
            <p>{cofundadores.intro}</p>
            <p className="font-semibold">{cofundadores.tesis}</p>
          </>
        }
        {...heroArtByRoute["/cofundadores/"]}
      />
      <div className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-2xl mb-3">{cofundadores.comoTitulo}</h2>
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
    </>
  );
}
