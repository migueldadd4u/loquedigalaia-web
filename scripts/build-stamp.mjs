/**
 * build-stamp.mjs — sello de compilación (fecha + commit corto).
 * Escribe public/build-stamp.json, que el pie de página lee en build.
 * Nada muere en silencio: la web muestra cuándo se generó (PLAN.md §0.3).
 * No incluye autor ni rutas de máquina (regla 1 de AGENTS.md).
 */

import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

function shortCommit() {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      encoding: "utf8",
    }).trim();
  } catch {
    return "desconocido";
  }
}

const stamp = {
  builtAt: new Date().toISOString(),
  commit: shortCommit(),
};

const target = new URL("../public/build-stamp.json", import.meta.url);
await mkdir(new URL("../public/", import.meta.url), { recursive: true });
await writeFile(target, `${JSON.stringify(stamp, null, 2)}\n`, "utf8");
console.log(`build-stamp: ${stamp.builtAt} (commit ${stamp.commit})`);
