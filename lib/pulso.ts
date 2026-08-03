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
};

export type Pulso = {
  clone: string;
  asOf: string;
  indicators: Indicator[];
};

/* Lee el pulso en build (la web es estática: sin fetch en cliente).
   Orden de preferencia: data/pulso.json (real, escrito por snapshot.mjs en F3)
   → data/sample/pulso.sample.json. */
export function readPulso(): Pulso {
  const real = join(process.cwd(), "data", "pulso.json");
  const sample = join(process.cwd(), "data", "sample", "pulso.sample.json");
  const path = existsSync(real) ? real : sample;
  return JSON.parse(readFileSync(path, "utf-8")) as Pulso;
}

export function isSample(p: Pulso): boolean {
  return p.indicators.every((i) => i.source === "sample");
}
