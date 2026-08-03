import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = {
  title: "Manifiesto",
  description: "La constitución completa de Lo que diga la IA.",
};

export default function ManifiestoPage() {
  return (
    <article>
      <h1 className="text-4xl font-bold tracking-tight">Manifiesto</h1>
      <Placeholder>
        La constitución completa. En F2 se importa MANIFIESTO.md (una sola
        fuente: el markdown se importa, no se duplica).
      </Placeholder>
    </article>
  );
}
