import assert from "node:assert/strict";
import test from "node:test";

import { gateIndicator } from "../scripts/lib/pulso-indicator-gate.mjs";

const indicator = {
  id: "dias-construyendo",
  label: "Días construyendo en público",
  value: 2,
  unit: "días",
  asOf: "2026-08-04",
  source: "front-office",
  monotonic: true,
};
const history = {
  lastValid: { ...indicator, value: 1, asOf: "2026-08-03" },
};

test("un cambio normal elimina candidatos de consenso obsoletos", () => {
  const pending = { "dias-construyendo": { value: 99, firstSeen: "2026-08-03T00:00:00Z" } };
  const normal = { ...indicator, value: 11 };
  const normalHistory = { lastValid: { ...indicator, value: 10 } };

  const result = gateIndicator(normal, normalHistory, pending, [], {
    now: new Date("2026-08-04T10:00:00Z"),
  });

  assert.equal(result.accepted.value, 11);
  assert.deepEqual(pending, {});
});

test("un salto brusco se confirma con una segunda lectura tras cinco minutos", () => {
  const pending = {};
  const first = gateIndicator(indicator, history, pending, [], {
    now: new Date("2026-08-04T10:00:00Z"),
  });
  assert.equal(first.accepted.fallback, "consenso pendiente");
  assert.equal(pending["dias-construyendo"].value, 2);

  const second = gateIndicator(indicator, history, pending, [], {
    now: new Date("2026-08-04T10:06:00Z"),
  });
  assert.equal(second.accepted.value, 2);
  assert.equal(second.accepted.fallback, undefined);
  assert.deepEqual(pending, {});
});
