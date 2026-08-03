import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export type Indicator = {
  id: string;
  label: string;
  value: number;
  unit: string;
  asOf: string;
  source: string;
  monotonic?: boolean;
  /* Flags que añade scripts/snapshot.mjs (docs/DATOS.md):
     stale → dato con más de 48 h (se muestra atenuado, con su fecha);
     fallback → valor servido desde data/history.json porque el nuevo no pasó el gate. */
  stale?: boolean;
  fallback?: string;
};

export type Pulso = {
  clone: string;
  asOf: string;
  generatedAt?: string;
  indicators: Indicator[];
};

export type HistoryEntry = { asOf: string; value: number };
export type PulsoHistory = Record<
  string,
  Record<string, { lastValid: Indicator | null; series: HistoryEntry[] }>
>;

/* Lee el pulso en build (la web es estática: sin fetch en cliente).
   Orden de preferencia: data/pulso.json (salida de snapshot.mjs)
   → data/sample/pulso.sample.json. */
export function readPulso(): Pulso {
  const real = join(process.cwd(), "data", "pulso.json");
  const sample = join(process.cwd(), "data", "sample", "pulso.sample.json");
  const path = existsSync(real) ? real : sample;
  return JSON.parse(readFileSync(path, "utf-8")) as Pulso;
}

/* Serie temporal por indicador para la evolución de /pulso. */
export function readPulsoHistory(): PulsoHistory {
  const path = join(process.cwd(), "data", "history.json");
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, "utf-8")) as PulsoHistory;
}

export function isSample(p: Pulso): boolean {
  return p.indicators.every((i) => i.source === "sample");
}
