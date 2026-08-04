import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export const PULSO_STATE_VERSION = 1;
export const PULSO_STATE_ASSET = "pulso-state.json";
export const DEFAULT_PULSO_STATE_URL = `https://loquedigalaia.com/${PULSO_STATE_ASSET}`;

const MAX_STATE_BYTES = 2 * 1024 * 1024;
const CLONES = new Set(["clonmadv3", "jarvis"]);
const ID = /^[a-z0-9-]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const STATE_FILES = {
  pulso: "pulso.json",
  history: "history.json",
  sourceStatus: "source-status.json",
  pending: "pending.json",
};

function fail(path, message) {
  throw new Error(`${path}: ${message}`);
}

function object(value, path) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(path, "debe ser un objeto");
  }
  return value;
}

function exactKeys(value, allowed, required, path) {
  object(value, path);
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) fail(path, `clave no permitida «${key}»`);
  }
  for (const key of required) {
    if (!(key in value)) fail(path, `falta «${key}»`);
  }
}

function finite(value, path) {
  if (typeof value !== "number" || !Number.isFinite(value)) fail(path, "debe ser un número finito");
}

function boundedString(value, max, path) {
  if (typeof value !== "string" || value.length === 0 || value.length > max) {
    fail(path, `debe ser texto no vacío de hasta ${max} caracteres`);
  }
}

function isoInstant(value, path, nullable = false) {
  if (nullable && value === null) return;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) fail(path, "debe ser fecha ISO");
}

function isoDate(value, path) {
  if (typeof value !== "string" || !DATE.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    fail(path, "debe ser fecha YYYY-MM-DD");
  }
}

function indicator(value, path, { history = false } = {}) {
  const allowed = history
    ? ["value", "unit", "label", "asOf", "source"]
    : ["id", "label", "value", "unit", "asOf", "source", "monotonic", "stale", "fallback"];
  const required = history
    ? ["value", "unit", "label", "asOf", "source"]
    : ["id", "label", "value", "unit", "asOf", "source"];
  exactKeys(value, allowed, required, path);
  if (!history && (typeof value.id !== "string" || !ID.test(value.id))) fail(`${path}.id`, "inválido");
  boundedString(value.label, 80, `${path}.label`);
  finite(value.value, `${path}.value`);
  boundedString(value.unit, 20, `${path}.unit`);
  isoDate(value.asOf, `${path}.asOf`);
  boundedString(value.source, 120, `${path}.source`);
  for (const flag of ["monotonic", "stale"]) {
    if (flag in value && typeof value[flag] !== "boolean") fail(`${path}.${flag}`, "debe ser booleano");
  }
  if ("fallback" in value) boundedString(value.fallback, 120, `${path}.fallback`);
}

function validatePulso(pulso) {
  exactKeys(pulso, ["clone", "asOf", "generatedAt", "indicators"], ["clone", "asOf", "indicators"], "state.pulso");
  if (!CLONES.has(pulso.clone)) fail("state.pulso.clone", "clon desconocido");
  isoDate(pulso.asOf, "state.pulso.asOf");
  if ("generatedAt" in pulso) isoInstant(pulso.generatedAt, "state.pulso.generatedAt");
  if (!Array.isArray(pulso.indicators) || pulso.indicators.length === 0 || pulso.indicators.length > 100) {
    fail("state.pulso.indicators", "debe contener entre 1 y 100 indicadores");
  }
  const ids = new Set();
  pulso.indicators.forEach((item, index) => {
    indicator(item, `state.pulso.indicators[${index}]`);
    if (ids.has(item.id)) fail("state.pulso.indicators", `id duplicado «${item.id}»`);
    ids.add(item.id);
  });
}

function validateHistory(history) {
  object(history, "state.history");
  for (const [clone, entries] of Object.entries(history)) {
    if (!CLONES.has(clone)) fail(`state.history.${clone}`, "clon desconocido");
    object(entries, `state.history.${clone}`);
    for (const [id, entry] of Object.entries(entries)) {
      if (!ID.test(id)) fail(`state.history.${clone}.${id}`, "id inválido");
      exactKeys(entry, ["lastValid", "series"], ["lastValid", "series"], `state.history.${clone}.${id}`);
      if (entry.lastValid !== null) indicator(entry.lastValid, `state.history.${clone}.${id}.lastValid`, { history: true });
      if (!Array.isArray(entry.series) || entry.series.length > 90) {
        fail(`state.history.${clone}.${id}.series`, "debe ser una serie de hasta 90 puntos");
      }
      let previous = "";
      entry.series.forEach((point, index) => {
        const path = `state.history.${clone}.${id}.series[${index}]`;
        exactKeys(point, ["asOf", "value"], ["asOf", "value"], path);
        isoDate(point.asOf, `${path}.asOf`);
        finite(point.value, `${path}.value`);
        if (point.asOf <= previous) fail(path, "la serie debe estar ordenada y sin fechas duplicadas");
        previous = point.asOf;
      });
    }
  }
}

function validateSourceStatus(sourceStatus) {
  object(sourceStatus, "state.sourceStatus");
  for (const [clone, status] of Object.entries(sourceStatus)) {
    if (!CLONES.has(clone)) fail(`state.sourceStatus.${clone}`, "clon desconocido");
    const path = `state.sourceStatus.${clone}`;
    exactKeys(status, ["consecutiveFailures", "lastOk", "lastFailure", "lastError"], ["consecutiveFailures", "lastOk", "lastFailure", "lastError"], path);
    if (!Number.isInteger(status.consecutiveFailures) || status.consecutiveFailures < 0) {
      fail(`${path}.consecutiveFailures`, "debe ser entero no negativo");
    }
    isoInstant(status.lastOk, `${path}.lastOk`, true);
    isoInstant(status.lastFailure, `${path}.lastFailure`, true);
    if (status.lastError !== null && (typeof status.lastError !== "string" || status.lastError.length > 1000)) {
      fail(`${path}.lastError`, "debe ser null o texto de hasta 1000 caracteres");
    }
  }
}

function validatePending(pending) {
  object(pending, "state.pending");
  for (const [clone, entries] of Object.entries(pending)) {
    if (!CLONES.has(clone)) fail(`state.pending.${clone}`, "clon desconocido");
    object(entries, `state.pending.${clone}`);
    for (const [id, item] of Object.entries(entries)) {
      const path = `state.pending.${clone}.${id}`;
      if (!ID.test(id)) fail(path, "id inválido");
      exactKeys(item, ["value", "firstSeen"], ["value", "firstSeen"], path);
      finite(item.value, `${path}.value`);
      isoInstant(item.firstSeen, `${path}.firstSeen`);
    }
  }
}

export function validatePulsoState(state) {
  exactKeys(
    state,
    ["version", "publishedAt", "pulso", "history", "sourceStatus", "pending"],
    ["version", "publishedAt", "pulso", "history", "sourceStatus", "pending"],
    "state",
  );
  if (state.version !== PULSO_STATE_VERSION) fail("state.version", `debe ser ${PULSO_STATE_VERSION}`);
  isoInstant(state.publishedAt, "state.publishedAt");
  validatePulso(state.pulso);
  validateHistory(state.history);
  validateSourceStatus(state.sourceStatus);
  validatePending(state.pending);

  const cloneHistory = state.history[state.pulso.clone];
  if (!cloneHistory) fail("state.history", `falta historia de «${state.pulso.clone}»`);
  for (const item of state.pulso.indicators) {
    if (!cloneHistory[item.id]?.lastValid) {
      fail("state.history", `falta último válido de «${state.pulso.clone}/${item.id}»`);
    }
  }
  return state;
}

async function jsonFile(path) {
  let text;
  try {
    text = await readFile(path, "utf8");
  } catch (error) {
    throw new Error(`${path}: no se pudo leer (${error.message})`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${path}: JSON inválido (${error.message})`);
  }
}

export async function stateFromDataDir(dataDir, { publishedAt = new Date().toISOString() } = {}) {
  const entries = await Promise.all(
    Object.entries(STATE_FILES).map(async ([key, file]) => [key, await jsonFile(join(dataDir, file))]),
  );
  return validatePulsoState({ version: PULSO_STATE_VERSION, publishedAt, ...Object.fromEntries(entries) });
}

async function atomicJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, path);
}

export async function writeStateToDataDir(state, dataDir) {
  validatePulsoState(state);
  await Promise.all(
    Object.entries(STATE_FILES).map(([key, file]) => atomicJson(join(dataDir, file), state[key])),
  );
}

export async function publishPulsoState({ dataDir, outDir, publishedAt = new Date().toISOString() }) {
  const state = await stateFromDataDir(dataDir, { publishedAt });
  const assetPath = join(outDir, PULSO_STATE_ASSET);
  await atomicJson(assetPath, state);
  return { state, assetPath };
}

function withCacheBuster(rawUrl) {
  const url = new URL(rawUrl);
  url.searchParams.set("restore", Date.now().toString());
  return url;
}

export async function restorePulsoState({
  dataDir,
  url = DEFAULT_PULSO_STATE_URL,
  fetchImpl = fetch,
  timeoutMs = 30_000,
  logger = console,
} = {}) {
  try {
    const response = await fetchImpl(withCacheBuster(url), {
      headers: { accept: "application/json", "cache-control": "no-cache" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const declared = Number(response.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > MAX_STATE_BYTES) throw new Error("respuesta demasiado grande");
    const text = await response.text();
    if (Buffer.byteLength(text) > MAX_STATE_BYTES) throw new Error("respuesta demasiado grande");
    const state = validatePulsoState(JSON.parse(text));
    await writeStateToDataDir(state, dataDir);
    logger.log(`pulso-state · restaurado checkpoint validado de ${url}`);
    return { source: "production", state };
  } catch (error) {
    logger.warn(`pulso-state · checkpoint remoto no utilizable (${error.message}); se valida el fallback del repositorio`);
    const state = await stateFromDataDir(dataDir);
    logger.log("pulso-state · fallback del repositorio validado");
    return { source: "repository", state };
  }
}
