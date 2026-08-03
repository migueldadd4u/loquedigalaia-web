import type { Metadata } from "next";
import { pulso as copy } from "@/content/es/site";
import { readPulso, isSample } from "@/lib/pulso";

export const metadata: Metadata = {
  title: "El pulso",
  description:
    "Los datos diarios publicados por los clones de los fundadores: construcción en público, con métricas.",
};

export default function PulsoPage() {
  const data = readPulso();
  const sample = isSample(data);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-4xl mb-4">{copy.titulo}</h1>
      <p className="max-w-3xl text-lg mb-6" style={{ color: "var(--fg-soft)" }}>
        {copy.intro}
      </p>

      {sample ? (
        <p
          role="status"
          className="rounded-md border px-4 py-3 mb-8 max-w-3xl"
          style={{ borderColor: "var(--cobre, #a5794a)", color: "var(--fg)" }}
        >
          <strong>Aviso:</strong> {copy.avisoSample}
        </p>
      ) : null}

      <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 m-0">
        {data.indicators.map((i) => (
          <div
            key={i.id}
            className="rounded-lg border p-5"
            style={{ borderColor: "var(--border)" }}
          >
            <dt className="text-sm" style={{ color: "var(--fg-soft)" }}>
              {i.label}
            </dt>
            <dd className="m-0 mt-1 text-3xl font-semibold">
              {i.value.toLocaleString("es-ES")}
              <span className="text-base font-normal ms-2">{i.unit}</span>
            </dd>
            <dd className="m-0 mt-2 text-xs" style={{ color: "var(--fg-soft)" }}>
              dato del {i.asOf}
              {i.source === "sample" ? " · ejemplo" : ""}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-8 text-sm max-w-3xl" style={{ color: "var(--fg-soft)" }}>
        Fase 1: datos del clon ClonMADv3. Fase 2: suma de ClonMADv3 y Jarvis.
        Contrato de calidad: esquema validado, frescura de 48 h, contadores
        monotónicos y reserva del último valor válido si un dato falla.
      </p>
    </div>
  );
}
