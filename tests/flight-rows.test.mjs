// Integridad del payload RSC en los HTML localizados.
//
// Las filas de texto largo del flight payload (`<id>:T<lenHex>,<contenido>`) declaran
// la longitud de su contenido en BYTES UTF-8. Si la traducción cambia el contenido sin
// recomputar ese prefijo, el lector RSC del navegador lee bytes de más o de menos, pisa
// la fila siguiente y la página entera cae con «Connection closed» (ocurrió en
// producción: /en/manifiesto y /en/faq devolvían la página de error de Next pese a que
// el verificador i18n, que solo mira texto visible, los daba por buenos).
//
// El stream flight llega troceado entre varios <script> push y una fila T puede cruzar
// el corte: hay que recomponer el stream entero antes de medir (lección del arreglo).
// Este test exige que, tras los bytes declarados por cada fila T, empiece otra fila
// válida o termine el stream — es decir, que el prefijo recomputado por
// scripts/i18n-build.mjs (fixFlightTextRows) casa con el contenido real.
// Corre tras `npm run build:static` (lo encadena el propio `npm test`).
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const OUT = join(process.cwd(), "out");
const FLIGHT_RE = /<script>self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)<\/script>/g;

const localesSrc = await readFile(join(process.cwd(), "content", "locales.ts"), "utf8");
const prefixes = [...localesSrc.matchAll(/prefix: "([^"]+)"/g)].map(([, p]) => p).filter(Boolean);

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && entry.name.endsWith(".html")) {
      out.push(join(entry.parentPath ?? entry.path, entry.name));
    }
  }
  return out;
}

// El stream flight de la página, recomponiendo los trozos de cada <script> push.
function flightStream(html) {
  const parts = [];
  for (const m of html.matchAll(FLIGHT_RE)) {
    try { parts.push(JSON.parse(`"${m[1]}"`)); } catch { /* literal ajeno: fuera */ }
  }
  return parts.join("");
}

// Para cada fila T: tras sus bytes declarados debe empezar otra fila (`<hex>:`)
// o terminar el stream.
function framingErrors(stream) {
  const errors = [];
  const buf = Buffer.from(stream, "utf8");
  for (const m of stream.matchAll(/\n([0-9a-f]{1,2}):T([0-9a-f]+),/g)) {
    const byteStart = Buffer.byteLength(stream.slice(0, m.index + m[0].length), "utf8");
    const endByte = byteStart + parseInt(m[2], 16);
    if (endByte > buf.length) {
      errors.push(`fila T «${m[1]}»: declara 0x${m[2]} bytes y se sale del stream (${buf.length} B)`);
      continue;
    }
    const after = buf.subarray(endByte, endByte + 4).toString("utf8");
    if (after.length && !/^[0-9a-f]{1,2}:/.test(after)) {
      errors.push(`fila T «${m[1]}»: tras los bytes declarados viene ${JSON.stringify(after)} y no otra fila`);
    }
  }
  return errors;
}

for (const prefix of ["", ...prefixes]) {
  const dir = prefix ? join(OUT, prefix) : OUT;
  const label = prefix || "es";
  test(`payload RSC íntegro en /${label}/ (filas T con longitud real)`, async () => {
    const files = (await htmlFiles(dir)).filter((f) => {
      const rel = f.slice(OUT.length + 1);
      // del español solo la raíz: sus copias localizadas se cubren con su prefijo
      return prefix || !prefixes.some((p) => rel.startsWith(p + "/"));
    });
    const bad = [];
    for (const file of files) {
      const html = await readFile(file, "utf8");
      for (const err of framingErrors(flightStream(html))) {
        bad.push(`${file.replace(OUT, "out")}: ${err}`);
      }
    }
    assert.deepEqual(bad, []);
  });
}
