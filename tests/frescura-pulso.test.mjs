import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { indicadoresViejos } from "../scripts/frescura-pulso.mjs";

const SCRIPT = fileURLToPath(new URL("../scripts/frescura-pulso.mjs", import.meta.url));

// El pulso real que publicó producción el 01/11/2026 a las 04:18Z: la fuente
// respondía, el gate lo aceptó y el run salió verde con el dato del 21/10.
const congelado = {
  clone: "clonmadv3",
  asOf: "2026-10-21",
  indicators: [
    { id: "tokens-consumidos-total", value: 892670096, asOf: "2026-10-21", stale: true },
    { id: "dias-construyendo", value: 80, asOf: "2026-10-21", stale: true },
    { id: "tareas-despachadas-7d", value: 266, asOf: "2026-10-21", stale: true },
    { id: "canales-vigilados", value: 3, asOf: "2026-10-21", stale: true },
  ],
};

function ejecutar(pulso, now) {
  const dir = mkdtempSync(join(tmpdir(), "frescura-"));
  const file = join(dir, "pulso.json");
  writeFileSync(file, JSON.stringify(pulso));
  return spawnSync(process.execPath, [SCRIPT, file, `--now=${now}`], { encoding: "utf-8" });
}

test("un pulso del día no tiene indicadores viejos", () => {
  const pulso = { indicators: [{ id: "a", asOf: "2026-11-01" }] };
  assert.deepEqual(indicadoresViejos(pulso, new Date("2026-11-01T04:18:00Z")), []);
});

test("la regla de edad es la del gate: más de 48 h desde las 00:00Z del asOf", () => {
  const pulso = { indicators: [{ id: "a", asOf: "2026-10-30" }] };
  assert.equal(indicadoresViejos(pulso, new Date("2026-11-01T00:00:00Z")).length, 0);
  assert.equal(indicadoresViejos(pulso, new Date("2026-11-01T00:00:01Z")).length, 1);
});

test("un fallback viejo cuenta aunque no lleve la marca stale", () => {
  const pulso = { indicators: [{ id: "a", asOf: "2026-10-21", fallback: "fuente inválida" }] };
  assert.equal(indicadoresViejos(pulso, new Date("2026-11-01T04:18:00Z")).length, 1);
});

test("el pulso congelado del 01/11 pone el run en rojo y nombra cada indicador", () => {
  const r = ejecutar(congelado, "2026-11-01T04:18:55Z");
  assert.equal(r.status, 1);
  assert.match(r.stdout, /^::error title=Pulso sin refrescar::clonmadv3: 4 de 4 indicadores/m);
  for (const ind of congelado.indicators) assert.match(r.stdout, new RegExp(`${ind.id} \\(2026-10-21\\)`));
});

test("un pulso al día sale con código 0", () => {
  const alDia = {
    ...congelado,
    asOf: "2026-11-01",
    indicators: congelado.indicators.map(({ stale, ...i }) => ({ ...i, asOf: "2026-11-01" })),
  };
  const r = ejecutar(alDia, "2026-11-01T16:15:00Z");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /4 indicadores de 2026-11-01, al día/);
});
