import { problemas, home } from "@/content/es/site";
import { PageHero, RealPhoto } from "@/components/AiImage";
import { heroArtByRoute } from "@/content/es/heroes";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = pageMetadata({
  title: "Los problemas que nos importan",
  description:
    "Cárceles, salud mental, jóvenes y trabajo, tecnología, educación, soberanía tecnológica, vivienda y administración pública.",
  path: "/problemas/",
});

export default function ProblemasPage() {
  return (
    <>
      <PageHero
        title={home.problemasTitulo}
        eyebrow="Ocho focos"
        description={
          <p>
            {home.problemasIntro} La ilustración abre el mapa; después, cada
            problema se muestra con una fotografía real y acreditada.
          </p>
        }
        {...heroArtByRoute["/problemas/"]}
      />
      <div className="mx-auto max-w-4xl px-4 py-14">
        <div className="grid gap-12">
          {problemas.map((p) => (
            <article
              key={p.id}
              id={p.id}
              className="grid sm:grid-cols-[1.15fr_2fr] gap-6 items-start scroll-mt-6"
            >
              <RealPhoto
                src={p.foto.src}
                fallbackSrc={p.foto.fallbackSrc}
                alt={p.foto.alt}
              />
              <div>
                <p
                  className="m-0 text-xs uppercase tracking-wide"
                  style={{ color: "var(--accent)" }}
                >
                  {p.estado}
                </p>
                <h2 className="text-2xl mt-1 mb-2">{p.titulo}</h2>
                <p className="m-0">{p.texto}</p>
              </div>
            </article>
          ))}
        </div>
        <p
          className="mt-8 text-right text-sm"
          style={{ color: "var(--fg-soft)" }}
        >
          <Link href="/images/CREDITS.md">Créditos fotográficos</Link>
        </p>
      </div>
    </>
  );
}
