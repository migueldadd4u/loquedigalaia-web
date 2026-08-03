import type { Metadata } from "next";
import { faqs } from "@/content/es/faq";

export const metadata: Metadata = {
  title: "Preguntas y respuestas",
  description:
    "Qué es Lo que diga la IA, por qué dos clones son parte del equipo fundador y cómo puedes ser cofundador aunque llegues tarde.",
};

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
    <div className="mx-auto max-w-3xl px-4 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      <h1 className="text-4xl mb-4">Preguntas y respuestas</h1>
      <p className="text-lg mb-10" style={{ color: "var(--fg-soft)" }}>
        Las que más nos hacen — y las que más nos gusta responder.
      </p>
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
  );
}
