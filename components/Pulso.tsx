import type { HistoryEntry, Indicator } from "@/lib/pulso";
import { home } from "@/content/es/site";

/* Piezas visuales del pulso, compartidas por la portada y /pulso.
   Reglas de diseño (una tarjeta = un indicador):
   - el valor manda: grande, cifras proporcionales; la unidad es secundaria;
   - el delta diario se calcula de la serie (numérico puro: sin texto nuevo
     que traducir en 21 idiomas);
   - la mini-traza va atenuada y solo el último punto lleva el acento;
   - el texto usa tokens de texto (fg/fg-soft), nunca el color de la serie. */

const fmt = (n: number) => n.toLocaleString("es-ES");

/* Indicadores de calendario: crecen solos y a ritmo fijo (+1 al día), así que
   ni la traza ni el delta aportan información — solo se muestra el valor. */
export const INDICADORES_CALENDARIO = new Set(["dias-construyendo"]);

/* Delta contra el punto anterior de la serie; null si no hay con qué comparar
   o la serie no está alineada con el dato mostrado. */
export function dailyDelta(
  indicator: Indicator,
  series: HistoryEntry[],
): number | null {
  if (series.length < 2) return null;
  const last = series[series.length - 1];
  if (last.asOf !== indicator.asOf || last.value !== indicator.value)
    return null;
  return last.value - series[series.length - 2].value;
}

function DeltaChip({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  const up = delta > 0;
  const flat = delta === 0;
  return (
    <span
      className="inline-flex items-baseline gap-1 text-sm font-medium"
      style={{
        color: flat
          ? "var(--fg-soft)"
          : up
            ? "var(--accent)"
            : "var(--cobre, #a5794a)",
      }}
    >
      <span aria-hidden="true">{flat ? "—" : up ? "▲" : "▼"}</span>
      <span hidden={flat}>
        {up ? "+" : "−"}
        {fmt(Math.abs(delta))}
      </span>
    </span>
  );
}

type SparkProps = {
  series: HistoryEntry[];
  /* alto en px; el ancho es fluido */
  height?: number;
  /* traza atenuada (tarjetas) o protagonista (evolución) */
  emphasis?: boolean;
  /* relleno de área bajo la línea */
  area?: boolean;
};

export function Sparkline({
  series,
  height = 44,
  emphasis = false,
  area = false,
}: SparkProps) {
  if (series.length < 2) return null;
  const w = 260;
  const h = height;
  const pad = 5;
  const values = series.map((s) => s.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pt = (s: HistoryEntry, i: number) => ({
    x: pad + (i * (w - 2 * pad)) / (series.length - 1),
    y: h - pad - ((s.value - min) * (h - 2 * pad)) / span,
  });
  const points = series.map(pt);
  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const last = points[points.length - 1];
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full block"
      style={{ height: `${h}px` }}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {area ? (
        <path
          d={`${line} L${last.x.toFixed(1)},${h - pad} L${pad},${h - pad} Z`}
          fill="var(--accent)"
          opacity="0.12"
        />
      ) : null}
      <path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={emphasis ? 1 : 0.45}
        vectorEffect="non-scaling-stroke"
      />
      {/* Punto final como trazo de longitud ~0 con extremo redondo: un
          <circle> se deformaría en elipse al estirar el viewBox. */}
      <path
        d={`M${last.x.toFixed(1)},${last.y.toFixed(1)} l0.01,0`}
        stroke="var(--accent)"
        strokeWidth="7"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

type TileProps = {
  indicator: Indicator;
  series: HistoryEntry[];
  /* la tarjeta protagonista (una por vista): a ancho completo, valor a 5xl
     y traza al lado del número */
  hero?: boolean;
  /* fondo: sobre sección alterna (portada) o sobre fondo base (/pulso) */
  onAlt?: boolean;
  className?: string;
};

export function StatTile({
  indicator: i,
  series,
  hero = false,
  onAlt = false,
  className,
}: TileProps) {
  const calendario = INDICADORES_CALENDARIO.has(i.id);
  const delta = calendario ? null : dailyDelta(i, series.slice(-30));
  return (
    <article
      className={`rounded-xl border ${hero ? "p-6" : "p-5"} flex flex-col ${
        className ?? ""
      }`}
      style={{
        borderColor: hero ? "var(--accent)" : "var(--border)",
        background: onAlt ? "var(--bg)" : "var(--bg-alt)",
        opacity: i.stale ? 0.6 : undefined,
      }}
    >
      <p className="m-0 text-sm" style={{ color: "var(--fg-soft)" }}>
        {i.label}
      </p>
      <div
        className={
          hero ? "sm:flex sm:items-end sm:gap-10" : "flex flex-col grow"
        }
      >
        <div>
          <p
            className={`m-0 mt-2 font-semibold leading-none ${
              hero ? "text-5xl" : "text-3xl"
            }`}
          >
            {fmt(i.value)}
            <span
              className={`${hero ? "text-xl" : "text-base"} font-normal ms-2`}
              style={{ color: "var(--fg-soft)" }}
            >
              {i.unit}
            </span>
          </p>
          {calendario ? null : (
            <p className="m-0 mt-2 min-h-5">
              <DeltaChip delta={delta} />
            </p>
          )}
        </div>
        <div className={hero ? "grow min-w-0 mt-4 sm:mt-0" : "mt-auto pt-3"}>
          {calendario ? null : (
            <Sparkline series={series.slice(-14)} height={hero ? 64 : 40} />
          )}
        </div>
      </div>
      <p className="m-0 mt-3 text-xs" style={{ color: "var(--fg-soft)" }}>
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
      </p>
    </article>
  );
}
