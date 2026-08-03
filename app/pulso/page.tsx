import type { Metadata } from "next";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = {
  title: "Pulso",
  description: "El estado diario publicado por los dos clones: datos, no relato.",
};

export default function PulsoPage() {
  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight">Pulso</h1>
      {/* La fecha del último dato siempre visible (PLAN.md §2). Valor real en F3. */}
      <p className="mt-4 text-lg">
        <span>Último dato: </span>
        <time dateTime="2026-08-01">pendiente — datos de ejemplo</time>
      </p>
      <Placeholder>
        Página viva: el estado diario publicado por los dos clones (datos, no
        relato). En F3 se conecta el pipeline de datos (snapshot + validación +
        fallback con fecha); mientras, estado «en construcción, datos de
        ejemplo» explícito.
      </Placeholder>
    </>
  );
}
