# Contrato de datos vivos — /pulso

La web es estática en el despliegue y viva en los datos: un cron diario descarga el pulso publicado por los dos clones de los fundadores, lo valida y reconstruye el sitio solo si hay datos válidos nuevos.

## Fuentes

**D4 cerrada (03/08)**: fase 1 consume solo la fuente de ClonMAD; fase 2 agrega la de Jarvis y `/pulso` publica **la suma de ambos**. Indicador obligatorio desde el día 1: **total de tokens consumidos** (`id: tokens-consumidos-total`, acumulado, `monotonic: true`).

| Fuente | Qué publica | Estado |
|---|---|---|
| Frontal público de ClonMADv3 (`madclon-front-office`, GitHub Pages) | `tokens.json`, `serie.json`, `clones.json`, `manifest.json` con actividad/eficiencia del clon (incluye tokens consumidos) | **EN VIVO desde el 03/08** — fail-soft en producción por decisión de los fundadores. `scripts/front-office-adapter.mjs` (`madclon-front-office/v1`) traduce sus documentos al contrato; si falla, fallback al último válido |
| Frontal público de Jarvis | equivalente del segundo clon | fase 2 — URL pendiente |

Nota de mapeo (fase 1): `tokens-consumidos-total` toma `contador.total_tokens` tal como lo publica la fuente (suma de medido + estimado); `dias-construyendo` cuenta desde la primera fecha de `serie.json` (primer día con pulso público); `tareas-despachadas-7d` es el último registro de la serie; `canales-vigilados` suma canales + calendarios del perfil principal. Migración 03/08: la historia sembrada con datos sample se purgó al activar la fuente real (eran marcadores, no lecturas).

Las URLs concretas viven en `data/sources.json` (versionado; solo URLs públicas, jamás credenciales).

## Esquema

`data/schema/pulso.schema.json` define el contrato mínimo. Principios:

- Todo indicador lleva `value`, `unit`, `asOf` (fecha ISO) y `source`.
- Nada de datos personales ni identificadores internos: solo agregados (conteos, porcentajes, fechas).
- El esquema es **cerrado** (`additionalProperties: false`): lo que no está en el contrato no se publica.

## Gate de ingesta (scripts/snapshot.mjs)

Réplica del patrón GDBi de add4u-web:

1. **Validación de esquema** — JSON inválido = fuente descartada esa noche.
2. **Frescura** — `asOf` con más de 48 h se marca `stale` (se muestra con su fecha, atenuado).
3. **Monotonía** — los contadores acumulativos no pueden decrecer; si decrecen, se descarta el valor y se conserva el último válido.
4. **Consenso** — dos lecturas separadas ≥ 5 min deben coincidir antes de aceptar un cambio brusco (>20 %).
5. **Fallback por indicador** — cada indicador cae individualmente a su último valor válido de `data/history.json`; nunca se rompe la página ni se inventa un número.
6. **Nada muere en silencio** — si una fuente falla 7 días seguidos, la Action abre un issue.

## Render

- `/pulso` muestra siempre la fecha de cada dato («dato del 2026-08-02»).
- Mientras las fuentes reales estén en NO-GO, la página declara de forma visible que son **datos de ejemplo**.
- El HTML final no hace fetch en cliente: los datos van horneados en el build (funciona sin JS, imprimible, indexable).
