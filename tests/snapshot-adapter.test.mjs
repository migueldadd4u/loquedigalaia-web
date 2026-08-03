// Tests del adaptador madclon-front-office/v1 (scripts/front-office-adapter.mjs).
// Sin red: fixtures inline que imitan los documentos del frontal público.

import { test } from "node:test";
import assert from "node:assert/strict";
import { adaptFrontOffice } from "../scripts/front-office-adapter.mjs";

const BASE = "https://migueldadd4u.github.io/madclon-front-office/data/";

const fixture = () => ({
  tokens: { contador: { total_tokens: 537373823, total_llamadas: 12501 } },
  serie: {
    serie: [
      { fecha: "2026-07-26", contexto: { tareas_hechas: 19 } },
      { fecha: "2026-08-02", contexto: { tareas_hechas: 40 } },
    ],
  },
  clones: {
    clones: [
      {
        perfil: "clon",
        canales: ["Telegram", "WhatsApp", "Email"],
        calendarios: ["Agenda A", "Agenda B", "Agenda C"],
      },
      { perfil: "ceo", canales: ["Telegram"], calendarios: [] },
    ],
  },
  manifest: { generado: "2026-08-03T01:43:17+00:00", version: 1 },
});

test("mapea los cuatro indicadores del contrato con fecha y fuente reales", () => {
  const out = adaptFrontOffice(fixture(), BASE);

  assert.equal(out.clone, "clonmadv3");
  assert.equal(out.asOf, "2026-08-03");
  assert.equal(out.indicators.length, 4);

  const byId = Object.fromEntries(out.indicators.map((i) => [i.id, i]));

  assert.equal(byId["tokens-consumidos-total"].value, 537373823);
  assert.equal(byId["tokens-consumidos-total"].monotonic, true);

  // Del 2026-07-26 al 2026-08-03 inclusive = 9 días.
  assert.equal(byId["dias-construyendo"].value, 9);
  assert.equal(byId["dias-construyendo"].monotonic, true);

  // Se toma el último registro de la serie, no el primero.
  assert.equal(byId["tareas-despachadas-7d"].value, 40);

  // 3 canales + 3 calendarios del perfil «clon» (no de otros perfiles).
  assert.equal(byId["canales-vigilados"].value, 6);

  for (const ind of out.indicators) {
    assert.equal(ind.asOf, "2026-08-03", `${ind.id} sin asOf del manifiesto`);
    assert.equal(
      ind.source,
      "https://migueldadd4u.github.io/madclon-front-office/data",
      `${ind.id} sin la fuente real`,
    );
  }
});

test("la salida cumple la forma del contrato cerrado (pulso.schema.json)", () => {
  const out = adaptFrontOffice(fixture(), BASE);
  assert.deepEqual(Object.keys(out).sort(), ["asOf", "clone", "indicators"]);
  const IND_KEYS = ["asOf", "id", "label", "source", "unit", "value"]; // + monotonic opcional
  for (const ind of out.indicators) {
    for (const k of Object.keys(ind))
      assert.ok([...IND_KEYS, "monotonic"].includes(k), `clave no permitida «${k}»`);
    assert.match(ind.id, /^[a-z0-9-]+$/);
    assert.equal(typeof ind.value, "number");
    assert.ok(ind.label.length <= 80 && ind.source.length <= 120 && ind.unit.length <= 20);
    assert.match(ind.asOf, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("documento ausente o malformado → error (la fuente se descarta, fallback)", () => {
  assert.throws(() => adaptFrontOffice({}, BASE), /manifest/);
  assert.throws(() => adaptFrontOffice({ ...fixture(), manifest: {} }, BASE), /generado/);
  assert.throws(
    () => adaptFrontOffice({ ...fixture(), tokens: { contador: {} } }, BASE),
    /total_tokens/,
  );
  assert.throws(() => adaptFrontOffice({ ...fixture(), serie: { serie: [] } }, BASE), /serie/);
  assert.throws(
    () => adaptFrontOffice({ ...fixture(), clones: { clones: [{ perfil: "ceo" }] } }, BASE),
    /perfil «clon»/,
  );
});

test("la marca y los datos personales no atraviesan: solo números agregados", () => {
  const dirty = fixture();
  dirty.tokens.contador.nota = "contacto: alguien@example.com";
  dirty.clones.clones[0].mision = "texto largo con nombres";
  const out = adaptFrontOffice(dirty, BASE);
  const json = JSON.stringify(out);
  assert.ok(!json.includes("@"), "el adaptador no debe dejar pasar correos");
  assert.ok(!json.includes("mision"), "el adaptador no copia campos narrativos");
});
