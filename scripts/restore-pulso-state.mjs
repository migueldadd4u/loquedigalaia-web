import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_PULSO_STATE_URL, restorePulsoState } from "./lib/pulso-state.mjs";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const option = (name) => {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length) ?? null;
};

const dataDir = resolve(ROOT, option("data-dir") ?? "data");
const url = option("url") ?? process.env.PULSO_STATE_URL ?? DEFAULT_PULSO_STATE_URL;
const result = await restorePulsoState({ dataDir, url });
console.log(`pulso-state · estado inicial: ${result.source === "production" ? "producción" : "repositorio"}`);
