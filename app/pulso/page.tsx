import { home, pulso as copy } from "@/content/es/site";
import { readPulso, readPulsoHistory, isSample } from "@/lib/pulso";
import type { HistoryEntry } from "@/lib/pulso";
import { PageHero } from "@/components/AiImage";
import { heroArtByRoute } from "@/content/es/heroes";
import {
  datasetJsonLd,
  pageMetadata,
  serializeJsonLd,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "El pulso",
  description:
    "Los datos diarios publicados por los clones de los fundadores: construcción en público, con métricas.",
  path: "/pulso/",
});

/* Sparkline SVG puro (sin JS): la web es estática e imprimible. */
function Sparkline({ series }: { series: HistoryEntry[] }) {
  if (series.length < 2) return null;
  const w = 260;
  const h = 48;
  const pad = 4;
  const values = series.map((s) => s.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const d = series
    .map((s, i) => {
      const x = pad + (i * (w - 2 * pad)) / (series.length - 1);
      const y = h - pad - ((s.value - min) * (h - 2 * pad)) / span;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-12"
      aria-hidden="true"
    >
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2" />
    </svg>
  );
}

export default function PulsoPage() {
  const data = readPulso();
  const history = readPulsoHistory();
  const sample = isSample(data);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(datasetJsonLd(data)),
        }}
      />
      <PageHero
        title={copy.titulo}
        eyebrow="Evidencia diaria"
        description={<p>{copy.intro}</p>}
        {...heroArtByRoute["/pulso/"]}
      />
      <div className="mx-auto max-w-4xl px-4 py-14">
        <p
          role="status"
          hidden={!sample}
          className="rounded-md border px-4 py-3 mb-8 max-w-3xl"
          style={{ borderColor: "var(--cobre, #a5794a)", color: "var(--fg)" }}
        >
          <strong>{copy.avisoEtiqueta}</strong> {copy.avisoSample}
        </p>

        <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 m-0">
          {data.indicators.map((i) => (
            <div
              key={i.id}
              className="rounded-lg border p-5"
              style={{
                borderColor: "var(--border)",
                opacity: i.stale ? 0.6 : undefined,
              }}
            >
              <dt className="text-sm" style={{ color: "var(--fg-soft)" }}>
                {i.label}
              </dt>
              <dd className="m-0 mt-1 text-3xl font-semibold">
                {i.value.toLocaleString("es-ES")}
                <span className="text-base font-normal ms-2">{i.unit}</span>
              </dd>
              <dd
                className="m-0 mt-2 text-xs"
                style={{ color: "var(--fg-soft)" }}
              >
                {home.pulsoDatoDel} {i.asOf}
                <span hidden={i.source !== "sample"}>
                  <span aria-hidden="true"> · </span>
                  <span>{home.pulsoEjemplo}</span>
                </span>
                <span hidden={!i.fallback}>
                  <span aria-hidden="true"> · </span>
                  <span>{home.pulsoUltimoValido}</span>
                </span>
                <span hidden={!i.stale}>
                  <span aria-hidden="true"> · </span>
                  <span>{home.pulsoDatoAtenuado}</span>
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <h2 className="text-3xl mt-14 mb-3">{copy.evolucionTitulo}</h2>
        <p className="max-w-3xl mb-6" style={{ color: "var(--fg-soft)" }}>
          {copy.evolucionIntro}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {data.indicators.map((i) => {
            const series = history[data.clone]?.[i.id]?.series ?? [
              { asOf: i.asOf, value: i.value },
            ];
            return (
              <article
                key={i.id}
                className="rounded-lg border p-5"
                style={{ borderColor: "var(--border)" }}
              >
                <h3 className="text-base m-0 mb-2">{i.label}</h3>
                <Sparkline series={series} />
                <table className="w-full text-sm mt-2">
                  <tbody>
                    {series.slice(-7).map((s) => (
                      <tr key={s.asOf}>
                        <td style={{ color: "var(--fg-soft)" }}>{s.asOf}</td>
                        <td className="text-end font-medium">
                          {s.value.toLocaleString("es-ES")} {i.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            );
          })}
        </div>

        <h2 className="text-3xl mt-14 mb-3">{copy.metodologiaTitulo}</h2>
        <p className="max-w-3xl mb-4" style={{ color: "var(--fg-soft)" }}>
          {copy.metodologiaIntro}
        </p>
        <ol className="max-w-3xl list-decimal ps-6 grid gap-2">
          {copy.metodologiaReglas.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
        <p
          className="mt-6 text-sm max-w-3xl"
          style={{ color: "var(--fg-soft)" }}
        >
          {copy.metodologiaFuentes}
        </p>
      </div>
    </>
  );
}
