import { readFileSync } from "node:fs";
import { join } from "node:path";
import { markdownToHtml } from "@/lib/markdown";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/AiImage";
import { heroArtByRoute } from "@/content/es/heroes";

export const metadata = pageMetadata({
  title: "Manifiesto",
  description:
    "La constitución de Lo que diga la IA: por qué nace, los ocho problemas y cómo nos comportamos.",
  path: "/manifiesto/",
});

export default function ManifiestoPage() {
  const md = readFileSync(join(process.cwd(), "MANIFIESTO.md"), "utf-8");
  // Se retira el banner de control interno (la cita inicial) del render público.
  const publicMd = md.replace(/^> \*\*Texto definitivo\*\*.*$/m, "");
  const title = publicMd.match(/^#\s+(.+)$/m)?.[1] ?? "Manifiesto";
  // El h1 se presenta en el hero; el cuerpo sigue saliendo del mismo Markdown.
  const bodyMd = publicMd.replace(/^#\s+.+\n?/m, "");
  const html = markdownToHtml(bodyMd);

  return (
    <>
      <PageHero
        title={title}
        eyebrow="Nuestra constitución"
        description={
          <p>
            Por qué nace Lo que diga la IA, qué problemas elige y cómo se
            comporta cuando nadie mira.
          </p>
        }
        {...heroArtByRoute["/manifiesto/"]}
      />
      <div className="mx-auto max-w-3xl px-4 py-14">
        <article
          className="prose-md"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </>
  );
}
