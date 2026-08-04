export const FRESHNESS_MS = 48 * 3600 * 1000;
export const CONSENSUS_MIN_MS = 5 * 60 * 1000;
export const ABRUPT_RATIO = 0.2;

export function gateIndicator(
  ind,
  hist,
  pending,
  log,
  {
    now = new Date(),
    freshnessMs = FRESHNESS_MS,
    consensusMinMs = CONSENSUS_MIN_MS,
    abruptRatio = ABRUPT_RATIO,
  } = {},
) {
  const out = { ...ind, monotonic: ind.monotonic ?? false };
  const prev = hist?.lastValid ?? null;
  const key = ind.id;

  const ageMs = now.getTime() - new Date(`${ind.asOf}T00:00:00Z`).getTime();
  if (ageMs > freshnessMs) {
    out.stale = true;
    log.push(`  · ${ind.id}: dato de ${ind.asOf} (>48 h) → se muestra atenuado`);
  }

  if (!prev) {
    delete pending[key];
    return { accepted: out, hadValue: true };
  }

  if (out.monotonic && ind.value < prev.value) {
    delete pending[key];
    log.push(
      `  ✗ ${ind.id}: ${ind.value} < último válido ${prev.value} en un contador monotónico → descartado, se conserva el del ${prev.asOf}`,
    );
    return { accepted: { ...prev, id: ind.id, monotonic: true, fallback: "monotonía" }, hadValue: true };
  }

  const base = prev.value;
  const jump = base !== 0 ? Math.abs(ind.value - base) / Math.abs(base) : 0;
  if (jump > abruptRatio) {
    const pend = pending[key];
    const matches = pend && (out.monotonic
      ? pend.value === ind.value
      : Math.abs(pend.value - ind.value) / Math.abs(ind.value || 1) <= 0.01);
    if (pend && matches && now.getTime() - new Date(pend.firstSeen).getTime() >= consensusMinMs) {
      delete pending[key];
      log.push(`  ✓ ${ind.id}: cambio brusco (${(jump * 100).toFixed(0)} %) confirmado por segunda lectura ≥5 min → aceptado`);
    } else {
      pending[key] = { value: ind.value, firstSeen: matches ? pend.firstSeen : now.toISOString() };
      log.push(
        `  ✗ ${ind.id}: cambio brusco ${prev.value} → ${ind.value} (${(jump * 100).toFixed(0)} %) pendiente de consenso → se conserva ${prev.value} del ${prev.asOf}`,
      );
      return { accepted: { ...prev, id: ind.id, monotonic: out.monotonic, fallback: "consenso pendiente" }, hadValue: true };
    }
  } else {
    // Un candidato anterior deja de ser pertinente en cuanto la lectura actual
    // entra en el rango normal. El checkpoint solo conserva consensos vivos.
    delete pending[key];
  }

  return { accepted: out, hadValue: true };
}
