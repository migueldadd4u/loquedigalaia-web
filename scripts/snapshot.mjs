// Gate de ingesta del pulso — contrato en docs/DATOS.md (réplica del patrón GDBi de add4u-web).
//
//   node scripts/snapshot.mjs [--now=<ISO>] [--input=<fichero>]
//
// Lee la fuente de cada clon (URL pública de data/sources.json; mientras esté
// retenida, el fichero sample), valida y publica:
//   - data/pulso.json        → lo que hornea el build (lo lee lib/pulso.ts)
//   - data/history.json      → último valor válido + serie para la evolución
//   - data/source-status.json→ rachas de fallo (§6: nada muere en silencio)
//
// Gate, en orden (DATOS.md):
//   1. Esquema cerrado (data/schema/pulso.schema.json). Inválido = fuente
//      descartada esta noche; caen todos sus indicadores al último válido.
//   2. Frescura: asOf con más de 48 h se acepta pero se marca `stale`
//      (la página lo muestra atenuado, con su fecha).
//   3. Monotonía: un contador acumulativo que decrece se descarta; se conserva
//      el último válido (fallback por indicador, con motivo).
//   4. Consenso: un cambio brusco (>20 % sobre el último válido) exige dos
//      lecturas iguales separadas ≥ 5 min (data/pending.json). Hasta entonces
//      se muestra el último válido.
//   5. Fallback por indicador: cada indicador cae individualmente a su último
//      valor válido de data/history.json. La página nunca se rompe ni inventa
//      un número.
//   6. Nada muere en silencio: 7 ejecuciones fallidas seguidas → aviso para
//      abrir issue (la Action lo convierte en issue real).
//
// Salida: 0 si se pudo escribir data/pulso.json (aunque todo sea fallback);
// 1 si no hay ni dato válido ni historia — eso sí rompería la página.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name) => {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : null;
};
const NOW = arg("now") ? new Date(arg("now")) : new Date();
if (Number.isNaN(NOW.getTime())) {
  console.error(`snapshot: --now inválido: ${arg("now")}`);
  process.exit(1);
}
const INPUT_OVERRIDE = arg("input");

const FRESHNESS_MS = 48 * 3600 * 1000; // §2: 48 h
const CONSENSUS_MIN_MS = 5 * 60 * 1000; // §4: lecturas separadas ≥ 5 min
const ABRUPT_RATIO = 0.2; //               §4: cambio brusco > 20 %
const HISTORY_CAP = 90; //                 lecturas conservadas por indicador
const FAIL_ISSUE_DAYS = 7; //              §6: racha que abre issue

const p = (rel) => resolve(ROOT, rel); // resolve: respeta rutas absolutas (--input=/tmp/…)
const readJson = (rel) => JSON.parse(readFileSync(p(rel), "utf-8"));
const writeJson = (rel, obj) => {
  mkdirSync(dirname(p(rel)), { recursive: true });
  writeFileSync(p(rel), JSON.stringify(obj, null, 2) + "\n");
};

/* ---------- 1. Validación de esquema (cerrado, sin dependencias) ---------- */
// El esquema es pequeño y cerrado por contrato; se valida a mano para no meter
// ajv como dependencia (AGENTS.md §8: menos piezas). Si el esquema crece, ajv.
const CLONES = new Set(["clonmadv3", "jarvis"]);
const IND_KEYS = new Set(["id", "label", "value", "unit", "asOf", "source", "monotonic"]);
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function validate(payload) {
  const errors = [];
  if (typeof payload !== "object" || payload === null || Array.isArray(payload))
    return ["raíz: no es un objeto"];
  for (const k of Object.keys(payload))
    if (!["clone", "asOf", "indicators"].includes(k)) errors.push(`raíz: clave no permitida «${k}»`);
  if (!CLONES.has(payload.clone)) errors.push(`clone: «${payload.clone}» no está en el contrato`);
  if (typeof payload.asOf !== "string" || Number.isNaN(Date.parse(payload.asOf)))
    errors.push("asOf: no es una fecha ISO válida");
  if (!Array.isArray(payload.indicators) || payload.indicators.length < 1)
    errors.push("indicators: debe ser un array con al menos 1 elemento");
  else
    payload.indicators.forEach((ind, i) => {
      const w = `indicators[${i}]`;
      if (typeof ind !== "object" || ind === null) return errors.push(`${w}: no es un objeto`);
      for (const k of Object.keys(ind))
        if (!IND_KEYS.has(k)) errors.push(`${w}: clave no permitida «${k}»`);
      if (typeof ind.id !== "string" || !/^[a-z0-9-]+$/.test(ind.id)) errors.push(`${w}.id inválido`);
      if (typeof ind.label !== "string" || ind.label.length > 80) errors.push(`${w}.label inválido`);
      if (typeof ind.value !== "number" || !Number.isFinite(ind.value)) errors.push(`${w}.value no es número`);
      if (typeof ind.unit !== "string" || ind.unit.length > 20) errors.push(`${w}.unit inválido`);
      if (typeof ind.asOf !== "string" || !DATE.test(ind.asOf)) errors.push(`${w}.asOf debe ser YYYY-MM-DD`);
      if (typeof ind.source !== "string" || ind.source.length > 120) errors.push(`${w}.source inválido`);
      if ("monotonic" in ind && typeof ind.monotonic !== "boolean") errors.push(`${w}.monotonic debe ser booleano`);
    });
  return errors;
}

/* ---------- Carga de la fuente (URL real o sample) ---------- */
async function fetchSource(src) {
  if (src.url) {
    const res = await fetch(src.url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${src.url}`);
    return { payload: await res.json(), via: src.url };
  }
  const file = src.sample ? (INPUT_OVERRIDE ?? src.sample) : null; // --input solo sustituye al sample
  if (!file) return null; // fase 2: fuente aún sin sample ni URL
  return { payload: readJson(file), via: file };
}

/* ---------- Gate por indicador ---------- */
function gateIndicator(ind, hist, pending, log) {
  const out = { ...ind, monotonic: ind.monotonic ?? false };
  const prev = hist?.lastValid ?? null;

  // 2. Frescura: se acepta pero se marca.
  const ageMs = NOW.getTime() - new Date(`${ind.asOf}T00:00:00Z`).getTime();
  if (ageMs > FRESHNESS_MS) {
    out.stale = true;
    log.push(`  · ${ind.id}: dato de ${ind.asOf} (>48 h) → se muestra atenuado`);
  }

  if (!prev) return { accepted: out, hadValue: true }; // primera lectura: no hay con qué comparar

  // 3. Monotonía.
  if (out.monotonic && ind.value < prev.value) {
    log.push(
      `  ✗ ${ind.id}: ${ind.value} < último válido ${prev.value} en un contador monotónico → descartado, se conserva el del ${prev.asOf}`,
    );
    return { accepted: { ...prev, id: ind.id, monotonic: true, fallback: "monotonía" }, hadValue: true };
  }

  // 4. Consenso ante cambio brusco (>20 %).
  const base = prev.value;
  const jump = base !== 0 ? Math.abs(ind.value - base) / Math.abs(base) : 0;
  if (jump > ABRUPT_RATIO) {
    const key = ind.id;
    const pend = pending[key];
    const matches = pend && (out.monotonic ? pend.value === ind.value : Math.abs(pend.value - ind.value) / Math.abs(ind.value || 1) <= 0.01);
    if (pend && matches && NOW.getTime() - new Date(pend.firstSeen).getTime() >= CONSENSUS_MIN_MS) {
      delete pending[key];
      log.push(`  ✓ ${ind.id}: cambio brusco (${(jump * 100).toFixed(0)} %) confirmado por segunda lectura ≥5 min → aceptado`);
    } else {
      pending[key] = { value: ind.value, firstSeen: matches ? pend.firstSeen : NOW.toISOString() };
      log.push(
        `  ✗ ${ind.id}: cambio brusco ${prev.value} → ${ind.value} (${(jump * 100).toFixed(0)} %) pendiente de consenso → se conserva ${prev.value} del ${prev.asOf}`,
      );
      return { accepted: { ...prev, id: ind.id, monotonic: out.monotonic, fallback: "consenso pendiente" }, hadValue: true };
    }
  }
  return { accepted: out, hadValue: true };
}

/* ---------- Ejecución ---------- */
const sources = readJson("data/sources.json").sources;
const history = existsSync(p("data/history.json")) ? readJson("data/history.json") : {};
const pending = existsSync(p("data/pending.json")) ? readJson("data/pending.json") : {};
const status = existsSync(p("data/source-status.json")) ? readJson("data/source-status.json") : {};

const published = [];
let fatal = false;

for (const src of sources) {
  const st = (status[src.clone] ??= { consecutiveFailures: 0, lastOk: null, lastFailure: null, lastError: null });
  const log = [];
  console.log(`■ ${src.clone}${src.url ? ` → ${src.url}` : " (sin URL pública: sample)"}`);

  let raw = null;
  const configured = src.url || src.sample; // --input solo aplica a fuentes con sample
  if (!configured) {
    console.log("  · fase 2: sin URL ni sample todavía; se omite");
    continue;
  }
  try {
    raw = await fetchSource(src);
  } catch (e) {
    log.push(`  ✗ fuente inalcanzable: ${e.message}`);
  }

  // 1. Esquema.
  let errors = [];
  if (raw) {
    try {
      errors = validate(raw.payload);
    } catch (e) {
      errors = [`JSON ilegible: ${e.message}`];
    }
    if (errors.length) log.push(`  ✗ esquema inválido (fuente descartada esta noche): ${errors.join(" · ")}`);
    // El payload debe ser del clon que anuncia la fuente: un JSON válido de otro
    // clon en esta URL/sample se descarta igual que un esquema inválido.
    else if (raw.payload.clone !== src.clone) {
      errors = [`clone «${raw.payload.clone}» no coincide con la fuente «${src.clone}»`];
      log.push(`  ✗ ${errors[0]} → fuente descartada esta noche`);
    }
  }

  const cloneHist = (history[src.clone] ??= {});
  const clonePending = (pending[src.clone] ??= {});
  const indicators = [];

  if (raw && !errors.length) {
    st.consecutiveFailures = 0;
    st.lastOk = NOW.toISOString();
    st.lastError = null;
    for (const ind of raw.payload.indicators) {
      const { accepted } = gateIndicator(ind, cloneHist[ind.id], clonePending, log);
      indicators.push(accepted);
      // Solo la historia registra valores que pasaron el gate (sin fallback).
      if (!accepted.fallback) {
        const h = (cloneHist[ind.id] ??= { lastValid: null, series: [] });
        h.lastValid = {
          value: accepted.value,
          unit: accepted.unit,
          label: accepted.label,
          asOf: accepted.asOf,
          source: accepted.source,
        };
        const last = h.series[h.series.length - 1];
        if (last && last.asOf === accepted.asOf) last.value = accepted.value;
        else if (!last || last.asOf < accepted.asOf) h.series.push({ asOf: accepted.asOf, value: accepted.value });
        h.series = h.series.slice(-HISTORY_CAP);
      }
    }
  } else {
    // Fuente descartada: fallback total por indicador (§5).
    st.consecutiveFailures += 1;
    st.lastFailure = NOW.toISOString();
    st.lastError = log[log.length - 1] ?? "error desconocido";
    for (const [id, h] of Object.entries(cloneHist)) {
      if (h?.lastValid) indicators.push({ id, ...h.lastValid, fallback: "fuente inválida" });
    }
    if (!indicators.length) {
      console.error(`  ✗✗ ${src.clone}: sin dato válido ni historia — no se puede publicar`);
      fatal = true;
    } else {
      log.push(`  → fallback: ${indicators.length} indicadores servidos desde data/history.json`);
    }
  }

  if (st.consecutiveFailures >= FAIL_ISSUE_DAYS)
    console.log(
      `  ⚠ NADA MUERE EN SILENCIO: ${src.clone} lleva ${st.consecutiveFailures} ejecuciones fallando → la Action abre issue (DATOS.md §6)`,
    );

  if (indicators.length) {
    published.push({
      clone: src.clone,
      asOf: indicators.map((i) => i.asOf).sort().at(-1),
      generatedAt: NOW.toISOString(),
      indicators,
    });
  }
  for (const line of log) console.log(line);
}

if (fatal || !published.length) {
  writeJson("data/source-status.json", status);
  console.error("snapshot: sin datos publicables; data/pulso.json NO se toca (la web sigue con el último build válido)");
  process.exit(1);
}

// Fase 1 (D4): una sola fuente. En fase 2 aquí se suman clonmadv3 + jarvis.
writeJson("data/pulso.json", published[0]);
writeJson("data/history.json", history);
writeJson("data/source-status.json", status);
if (Object.values(pending).every((x) => Object.keys(x).length === 0)) {
  writeJson("data/pending.json", {});
} else {
  writeJson("data/pending.json", pending);
}

const n = published[0].indicators.length;
const fb = published[0].indicators.filter((i) => i.fallback).length;
const stale = published[0].indicators.filter((i) => i.stale).length;
console.log(
  `snapshot OK · data/pulso.json con ${n} indicadores` +
    (fb ? ` · ${fb} en fallback` : "") +
    (stale ? ` · ${stale} stale` : "") +
    ` · historia y estado actualizados`,
);
