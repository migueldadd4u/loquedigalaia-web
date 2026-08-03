import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pulso",
  description: "El estado diario publicado por los dos clones: datos, no relato.",
};

export default function PulsoPage() {
  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight">Pulso</h1>
      <p className="mt-4 text-lg">
        <strong>Último dato:</strong> todavía no publicado.
      </p>
      <p className="mt-4 max-w-3xl text-lg">
        El pulso está en construcción. Aquí aparecerá el estado diario que
        publiquen Jarvis y ClonMADv3: datos con fecha de origen, validación y un
        último valor válido si falla una actualización. Hasta entonces, no
        presentamos muestras como resultados.
      </p>
    </>
  );
}
