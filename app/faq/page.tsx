import { faqs } from "@/content/es/faq";
import { PageHero } from "@/components/AiImage";
import { heroArtByRoute } from "@/content/es/heroes";
import { pageMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Preguntas y respuestas",
  description:
    "Qué es Lo que diga la IA, por qué dos clones son parte del equipo fundador y cómo puedes ser cofundador aunque llegues tarde.",
  path: "/faq/",
});

// JSON-LD FAQPage (§2.1 del plan): misma fuente que el HTML, nunca dos copias.
function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd()) }}
      />
      <PageHero
        title="Preguntas y respuestas"
        eyebrow="Sin letra pequeña"
        description={
          <p>Las que más nos hacen — y las que más nos gusta responder.</p>
        }
        {...heroArtByRoute["/faq/"]}
      />
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="grid gap-4">
          {faqs.map((f) => (
            <details
              key={f.id}
              id={f.id}
              className="rounded-lg border p-5 scroll-mt-6"
              style={{ borderColor: "var(--border)" }}
            >
              <summary className="text-xl font-semibold cursor-pointer">
                {f.q}
              </summary>
              <p className="mt-3 mb-0">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
