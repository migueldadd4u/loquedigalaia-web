import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = {
  title: "Cómo trabajamos",
  description: "Metodología de Lo que diga la IA.",
};

export default function ComoTrabajamosPage() {
  return (
    <article>
      <h1 className="text-4xl font-bold tracking-tight">Cómo trabajamos</h1>
      <Placeholder>
        Metodología: venture operating company, Milagro 0, sistema operativo de
        founder y los principios de trabajo en comunidad. Redacción en F2.
      </Placeholder>
    </article>
  );
}
