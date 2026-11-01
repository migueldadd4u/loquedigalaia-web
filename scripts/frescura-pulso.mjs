// Nada muere en silencio (docs/DATOS.md §6), tampoco cuando la fuente responde.
//
//   node scripts/frescura-pulso.mjs [out/pulso.json] [--now=<ISO>]
//
// snapshot.mjs solo cuenta como fallo una fuente caída o con esquema inválido.
// Una fuente que sigue respondiendo con el mismo dato viejo pasa el gate, la
// página lo atenúa («pendiente de refresco») y el run sale verde. Así estuvo el
// pulso del 23/10 al 01/11/2026: 28 publicaciones verdes con el dato del 21/10,
// porque el frontal de ClonMAD no conseguía desplegar.
//
// Va DESPUÉS del deploy: la web se publica igual —y dice que el dato es viejo—;
// lo que cambia es que el run sale rojo y anota qué indicadores y desde cuándo.
// Usa la misma regla de edad que el gate, también para los valores en fallback,
// que no llevan la marca `stale`.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FRESHNESS_MS } from "./lib/pulso-indicator-gate.mjs";

export function indicadoresViejos(pulso, now = new Date(), freshnessMs = FRESHNESS_MS) {
  return (pulso?.indicators ?? []).filter(
    (ind) => now.getTime() - new Date(`${ind.asOf}T00:00:00Z`).getTime() > freshnessMs,
  );
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const nowArg = process.argv.find((x) => x.startsWith("--now="));
  const NOW = nowArg ? new Date(nowArg.slice(6)) : new Date();
  const file = process.argv.slice(2).find((x) => !x.startsWith("--")) ?? "out/pulso.json";
  const pulso = JSON.parse(readFileSync(resolve(file), "utf-8"));
  const viejos = indicadoresViejos(pulso, NOW);

  if (viejos.length) {
    const lista = viejos.map((i) => `${i.id} (${i.asOf}${i.fallback ? `, fallback: ${i.fallback}` : ""})`).join(", ");
    console.log(
      `::error title=Pulso sin refrescar::${pulso.clone}: ${viejos.length} de ${pulso.indicators.length} ` +
        `indicadores con más de 48 h — ${lista}. La fuente responde pero no trae dato nuevo: ` +
        `mirar si su frontal publica (data/sources.json).`,
    );
    process.exitCode = 1;
  } else {
    console.log(`frescura · ${pulso.clone}: ${pulso.indicators.length} indicadores de ${pulso.asOf}, al día`);
  }
}
