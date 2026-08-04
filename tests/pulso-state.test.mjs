import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import {
  PULSO_STATE_ASSET,
  publishPulsoState,
  restorePulsoState,
  stateFromDataDir,
  validatePulsoState,
} from "../scripts/lib/pulso-state.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const temporary = [];
const quiet = { log() {}, warn() {} };

afterEach(async () => {
  await Promise.all(temporary.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "loquedigalaia-pulso-state-"));
  temporary.push(root);
  const dataDir = join(root, "data");
  const outDir = join(root, "out");
  await cp(join(ROOT, "data"), dataDir, { recursive: true });
  return { root, dataDir, outDir };
}

test("publica un checkpoint validado con todo el estado necesario", async () => {
  const { dataDir, outDir } = await fixture();
  const publishedAt = "2026-08-04T09:00:00.000Z";
  const { state, assetPath } = await publishPulsoState({ dataDir, outDir, publishedAt });

  assert.equal(assetPath, join(outDir, PULSO_STATE_ASSET));
  assert.equal(state.version, 1);
  assert.equal(state.publishedAt, publishedAt);
  assert.deepEqual(JSON.parse(await readFile(assetPath, "utf8")), state);
  assert.ok(state.history[state.pulso.clone]);
  assert.ok("sourceStatus" in state);
  assert.ok("pending" in state);
});

test("restaura el checkpoint remoto solo después de validarlo", async () => {
  const { dataDir } = await fixture();
  const remote = structuredClone(await stateFromDataDir(dataDir));
  remote.publishedAt = "2026-08-04T09:05:00.000Z";
  remote.pulso.generatedAt = "2026-08-04T09:04:00.000Z";

  const result = await restorePulsoState({
    dataDir,
    url: "https://example.test/pulso-state.json",
    fetchImpl: async () => new Response(JSON.stringify(remote), { status: 200 }),
    logger: quiet,
  });

  assert.equal(result.source, "production");
  const restored = JSON.parse(await readFile(join(dataDir, "pulso.json"), "utf8"));
  assert.equal(restored.generatedAt, remote.pulso.generatedAt);
});

test("un checkpoint remoto inválido deja intacto y valida el fallback del repo", async () => {
  const { dataDir } = await fixture();
  const before = await readFile(join(dataDir, "pulso.json"), "utf8");

  const result = await restorePulsoState({
    dataDir,
    url: "https://example.test/pulso-state.json",
    fetchImpl: async () => new Response('{"version":999}', { status: 200 }),
    logger: quiet,
  });

  assert.equal(result.source, "repository");
  assert.equal(await readFile(join(dataDir, "pulso.json"), "utf8"), before);
});

test("falla antes del build si no son válidos ni producción ni el fallback", async () => {
  const { dataDir } = await fixture();
  await writeFile(join(dataDir, "pulso.json"), "{}\n", "utf8");

  await assert.rejects(
    restorePulsoState({
      dataDir,
      url: "https://example.test/pulso-state.json",
      fetchImpl: async () => new Response("no disponible", { status: 503 }),
      logger: quiet,
    }),
    /state\.pulso/,
  );
});

test("rechaza indicadores duplicados en un checkpoint público", async () => {
  const { dataDir } = await fixture();
  const state = await stateFromDataDir(dataDir);
  state.pulso.indicators.push(structuredClone(state.pulso.indicators[0]));
  assert.throws(() => validatePulsoState(state), /id duplicado/);
});
