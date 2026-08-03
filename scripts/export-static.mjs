/**
 * export-static.mjs — compila Next.js en modo export estático (out/).
 * Equivale al build:static de add4u-web (PLAN.md §1): next.config.ts fija
 * output:"export" + trailingSlash, así `next build` emite HTML estático.
 */

import { spawnSync } from "node:child_process";
import { access } from "node:fs/promises";

const build = spawnSync("npx", ["next", "build"], { stdio: "inherit" });
if (build.status !== 0) {
  console.error(`export-static: next build falló (exit ${build.status})`);
  process.exit(build.status ?? 1);
}

try {
  await access(new URL("../out/index.html", import.meta.url));
  console.log("export-static: out/ generado correctamente");
} catch {
  console.error("export-static: ERROR — no existe out/index.html tras next build");
  process.exit(1);
}
