import assert from "node:assert/strict";
import test from "node:test";

import {
  CONSENSUS_RETRY_MS,
  needsConsensusRetry,
  runDailySnapshot,
} from "../scripts/snapshot-daily.mjs";

test("solo reintenta cuando el pulso publicado conserva consenso pendiente", () => {
  assert.equal(needsConsensusRetry({ indicators: [{ fallback: "consenso pendiente" }] }), true);
  assert.equal(needsConsensusRetry({ indicators: [{ fallback: "monotonía" }] }), false);
  assert.equal(needsConsensusRetry({ indicators: [{}] }), false);
});

test("la ejecución diaria realiza una segunda lectura después del mínimo de consenso", async () => {
  let executions = 0;
  const pauses = [];
  const result = await runDailySnapshot({
    execute: async () => { executions += 1; },
    readPulso: async () => ({ indicators: [{ fallback: "consenso pendiente" }] }),
    pause: async (milliseconds) => { pauses.push(milliseconds); },
    logger: { log() {} },
  });

  assert.deepEqual(result, { retried: true });
  assert.equal(executions, 2);
  assert.deepEqual(pauses, [CONSENSUS_RETRY_MS]);
  assert.ok(CONSENSUS_RETRY_MS >= 5 * 60 * 1000);
});

test("una lectura normal no espera ni duplica el snapshot", async () => {
  let executions = 0;
  let pauses = 0;
  const result = await runDailySnapshot({
    execute: async () => { executions += 1; },
    readPulso: async () => ({ indicators: [{ value: 2 }] }),
    pause: async () => { pauses += 1; },
  });

  assert.deepEqual(result, { retried: false });
  assert.equal(executions, 1);
  assert.equal(pauses, 0);
});
