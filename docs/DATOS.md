# Contrato de datos vivos — /pulso

La web es estática en producción y viva en los datos: GitHub Actions descarga el
pulso, lo valida y reconstruye el sitio una vez al día. La ingesta ocurre en el
runner y **no crea commits**: el HTML, el JSON-LD, los 21 idiomas, `/pulso.json`
y los espejos Markdown siguen saliendo del mismo build y funcionan sin
JavaScript.

## Fuentes

**D4 cerrada (03/08)**: fase 1 consume solo la fuente de ClonMAD; fase 2
agregará la de Jarvis y `/pulso` publicará la suma de ambos. Indicador
obligatorio desde el día 1: **total de tokens consumidos**
(`id: tokens-consumidos-total`, acumulado, `monotonic: true`).

| Fuente | Qué publica | Estado |
|---|---|---|
| Frontal público de ClonMADv3 | JSON agregado de actividad/eficiencia, incluidos tokens consumidos | **Activa** |
| Frontal público de Jarvis | Equivalente del segundo clon | Fase 2 — URL pendiente |

Las URLs concretas viven en `data/sources.json` y son públicas, sin
credenciales. El downstream nunca inventa datos que la fuente no haya
publicado.

## Esquema

`data/schema/pulso.schema.json` define el contrato mínimo de entrada:

- Todo indicador lleva `value`, `unit`, `asOf` y `source`.
- Solo se admiten agregados; nunca datos personales ni identificadores internos.
- El esquema es cerrado (`additionalProperties: false`).

## Gate de ingesta (`scripts/snapshot.mjs`)

1. **Validación de esquema** — JSON inválido = fuente descartada esa ejecución.
2. **Frescura** — `asOf` con más de 48 h se marca `stale`.
3. **Monotonía** — un contador acumulativo no puede decrecer.
4. **Consenso** — un salto superior al 20 % exige dos lecturas coincidentes
   separadas al menos cinco minutos.
5. **Fallback por indicador** — un dato rechazado cae a su último valor válido.
6. **Racha visible** — los fallos consecutivos quedan en `source-status` y, a
   partir de siete ejecuciones, `snapshot.mjs` emite una advertencia explícita
   en el log de Actions.

## Continuidad sin commits

La continuidad vive en el asset público `/pulso-state.json`. Es un checkpoint
versionado que contiene `pulso`, `history`, `sourceStatus` y `pending`; no
contiene secretos ni datos personales.

Cada ejecución sigue este orden:

1. Descarga el checkpoint de producción con caché desactivada.
2. Valida completamente el sobre y sus cuatro secciones **antes** de restaurar
   nada. Si no existe o está corrupto, valida y usa el estado incluido en el
   repositorio como fallback de arranque.
3. Ejecuta el snapshot contra las fuentes públicas. Los ficheros de `data/`
   modificados solo existen en el runner; no hay `git add`, commit ni push.
4. Ejecuta TypeScript, tests, export estático, SEO, accesibilidad e i18n.
5. Publica dentro de `out/` un checkpoint nuevo y comprueba que su `pulso`
   coincide exactamente con `out/pulso.json`.
6. Ejecuta el guardián y, solo si todo está verde, despliega `out/` de forma
   atómica en Cloudflare.

Wrangler es el último paso. Si falla la restauración sin fallback, el snapshot,
el build, un test o el guardián, no se despliega nada y producción conserva el
último artefacto válido. Una fuente temporalmente caída puede seguir sirviendo
el último dato válido conforme a la regla de fallback.

## Render

- `/pulso` muestra la fecha de cada indicador y sus flags de frescura/fallback.
- La portada, `/pulso`, `/pulso.json` y el Dataset JSON-LD comparten snapshot.
- El HTML final no hace fetch en cliente: queda horneado, imprimible, indexable
  y utilizable sin JavaScript en los 21 idiomas.
