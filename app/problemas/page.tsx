import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";
import { PROBLEMAS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Problemas",
  description: "Los 8 problemas foco de Lo que diga la IA.",
};

export default function ProblemasPage() {
  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight">Problemas</h1>
      <Placeholder>
        Los 8 problemas foco: una sección por problema con datos citables y foto
        real (no IA). Contenido y evidencias en F2; imágenes documentales en F4.
      </Placeholder>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {PROBLEMAS.map((problema) => (
          <li
            key={problema}
            className="rounded-lg border border-petrol/20 p-4 text-lg font-semibold dark:border-ivory/20"
          >
            {problema}
          </li>
        ))}
      </ul>
    </>
  );
}
