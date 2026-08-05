import { pulso as copy } from "@/content/es/site";
import { readPulso, readPulsoHistory, isSample } from "@/lib/pulso";
import { PageHero } from "@/components/AiImage";
import {
  INDICADORES_CALENDARIO,
  Sparkline,
  StatTile,
} from "@/components/Pulso";
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.indicators.map((i, idx) => (
            <StatTile
              key={i.id}
              indicator={i}
              series={
                history[data.clone]?.[i.id]?.series ?? [
                  { asOf: i.asOf, value: i.value },
                ]
              }
              hero={idx === 0}
              className={
                idx === 0
                  ? "sm:col-span-2 lg:col-span-3"
                  : idx === data.indicators.length - 1
                    ? "sm:col-span-2 lg:col-span-1"
                    : undefined
              }
            />
          ))}
        </div>

        <h2 className="text-3xl mt-14 mb-3">{copy.evolucionTitulo}</h2>
        <p className="max-w-3xl mb-6" style={{ color: "var(--fg-soft)" }}>
          {copy.evolucionIntro}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Los indicadores de calendario (p. ej. días construyendo) crecen
              a ritmo fijo: su serie no cuenta nada y no merece gráfico. */}
          {data.indicators
            .filter((i) => !INDICADORES_CALENDARIO.has(i.id))
            .map((i, idx) => {
            const series = history[data.clone]?.[i.id]?.series ?? [
              { asOf: i.asOf, value: i.value },
            ];
            const first = series[0];
            const last = series[series.length - 1];
            return (
              <article
                key={i.id}
                className={`rounded-xl border p-5 ${idx === 0 ? "sm:col-span-2" : ""}`}
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg-alt)",
                }}
              >
                <h3 className="text-base m-0 mb-3">{i.label}</h3>
                <Sparkline series={series} height={80} emphasis area />
                <p
                  className="m-0 mt-1 flex justify-between text-xs"
                  style={{ color: "var(--fg-soft)" }}
                >
                  <span>{first.asOf}</span>
                  <span>{last.asOf}</span>
                </p>
                <table
                  className="w-full text-sm mt-3"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  <tbody>
                    {series.slice(-7).map((s) => (
                      <tr
                        key={s.asOf}
                        className={s.asOf === last.asOf ? "font-semibold" : ""}
                        style={{
                          borderTop: "1px solid var(--border)",
                        }}
                      >
                        <td className="py-1" style={{ color: "var(--fg-soft)" }}>
                          {s.asOf}
                        </td>
                        <td className="py-1 text-end font-medium">
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
