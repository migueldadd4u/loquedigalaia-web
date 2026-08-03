import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Solicitar una conversación con Lo que diga la IA.",
};

export default function ContactoPage() {
  return (
    <article>
      <h1 className="text-4xl font-bold tracking-tight">Contacto</h1>
      <p className="mt-4 text-lg">Solicitar conversación.</p>
      <Placeholder>
        CTA único: solicitar conversación. Sin formulario hasta F5 (patrón
        worker + D1 si la decisión D3 es Cloudflare). El canal de contacto
        definitivo lo aprueban los fundadores (sin datos personales en el repo).
      </Placeholder>
    </article>
  );
}
