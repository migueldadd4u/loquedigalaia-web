import type { Metadata } from "next";
import { problemas, home } from "@/content/es/site";
import { PhotoPending } from "@/components/AiImage";

export const metadata: Metadata = {
  title: "Los problemas que nos importan",
  description:
    "Cárceles, salud mental, jóvenes y trabajo, tecnología, educación, soberanía tecnológica, vivienda y administración pública.",
};

export default function ProblemasPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-4xl mb-4">{home.problemasTitulo}</h1>
      <p className="max-w-3xl text-lg mb-10" style={{ color: "var(--fg-soft)" }}>
        {home.problemasIntro} Cada problema se ilustra con fotografía real — no
        generada con IA — porque los problemas de personas reales se miran de
        frente.
      </p>
      <div className="grid gap-10">
        {problemas.map((p) => (
          <article
            key={p.id}
            id={p.id}
            className="grid sm:grid-cols-[1fr_2fr] gap-6 items-start scroll-mt-6"
          >
            <PhotoPending label={p.titulo} />
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
    </div>
  );
}
