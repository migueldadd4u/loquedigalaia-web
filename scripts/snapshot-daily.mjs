import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PULSO_FILE = join(ROOT, "data", "pulso.json");
export const CONSENSUS_RETRY_MS = 5 * 60 * 1000 + 5 * 1000;

export function needsConsensusRetry(pulso) {
  return Array.isArray(pulso?.indicators)
    && pulso.indicators.some((indicator) => indicator.fallback === "consenso pendiente");
}

function executeSnapshot() {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, [join(ROOT, "scripts", "snapshot.mjs")], {
      cwd: ROOT,
      stdio: "inherit",
    });
    child.once("error", rejectPromise);
    child.once("exit", (code, signal) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`snapshot terminó con ${signal ? `señal ${signal}` : `código ${code}`}`));
    });
  });
}

async function readPublishedPulso() {
  return JSON.parse(await readFile(PULSO_FILE, "utf8"));
}

const wait = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

export async function runDailySnapshot({
  execute = executeSnapshot,
  readPulso = readPublishedPulso,
  pause = wait,
  retryMs = CONSENSUS_RETRY_MS,
  logger = console,
} = {}) {
  await execute();
  if (!needsConsensusRetry(await readPulso())) return { retried: false };

  logger.log(`snapshot diario · consenso pendiente; segunda lectura en ${Math.ceil(retryMs / 1000)} s`);
  await pause(retryMs);
  await execute();
  return { retried: true };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    await runDailySnapshot();
  } catch (error) {
    console.error(`snapshot diario: ${error.message}`);
    process.exitCode = 1;
  }
}
