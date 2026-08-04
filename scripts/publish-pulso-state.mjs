import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { publishPulsoState } from "./lib/pulso-state.mjs";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outDir = resolve(ROOT, process.argv[2] ?? "out");
const dataDir = resolve(ROOT, process.argv[3] ?? "data");
const { assetPath, state } = await publishPulsoState({ dataDir, outDir });

console.log(
  `pulso-state · checkpoint v${state.version} publicado en ${assetPath} · ${state.pulso.indicators.length} indicadores`,
);
