# Prompts de arranque para los agentes (03/08/2026)

Los encargos vigentes, tal y como se entregaron. Si retomas el proyecto, comprueba antes en `CONTINUACION.md` qué está ya hecho: estos prompts se quedan obsoletos a medida que las fases avanzan.

## Kimi K3 — cifras reales + cierre de F1

> `git pull` en `~/Code/loquedigalaia-web` (rama `f1-scaffold`) y lee `docs/CONTINUACION.md`. El multiidioma **ya está hecho** (17 locales, inglés completo: `npm run build:static`). Tu trabajo ahora es:
>
> 1. **Las cifras reales del front office público de ClonMAD tienen que verse en la web**: un extracto destacado en la **portada** (encabezado por el total de tokens) y el **detalle completo en `/pulso`** con fecha, evolución y metodología. Implementa `scripts/snapshot.mjs` según `docs/DATOS.md` (esquema, frescura 48 h, monotonía, fallback por indicador al último válido). Mientras el front office siga retenido, trabaja contra `data/sample/` y deja el cambio a real como una URL en `data/sources.json`.
> 2. Suite `npm test` sobre el HTML renderizado (rutas × locales, hreflang, un h1 por página, marca sin traducir) y axe-core sin violaciones AA.
>
> Registra evidencia en `docs/TESTING.md` y abre PR con comandos y salida. Tienes lectura del vault para contexto (`~/MADClon-Storage/AGENTS.md`): nada del vault al repo público.

## Codex — F2

> `git pull` en `~/Code/loquedigalaia-web` (rama `f1-scaffold`) y lee `docs/CONTINUACION.md`. Tu fase es F2:
>
> 1. **Cada página lleva su propio hero generado con IA**, igual que en add4u.com: ilustración de fondo + etiqueta oficial de la UE superpuesta **como HTML, nunca incrustada en el bitmap**, en un componente que impida que falte en ninguna página (allí fue `PageHeroArt`; aquí tienes `AiImage` y el hero de la portada como referencia). Cuida el contraste AA del texto sobre la imagen y que la etiqueta no tape nada relevante.
> 2. **Fotos reales (no IA)** para los 8 problemas, con licencia verificada y atribución en `public/images/CREDITS.md` — sustituyen los huecos «pendiente».
> 3. Los **7 diccionarios que faltan** (ca, gl, eu, va, oc-aranes, ast, pt), partiendo de `content/i18n/_inventory.json`; `en.json` ya está completo y sirve de modelo.
> 4. La capa agentes+SEO de PLAN §2.1: espejos `.md` por página, `llms.txt`, JSON-LD (Organization, Dataset en /pulso) y Open Graph.
>
> Rama `f2-contenido`, PR con el checklist del gate. **No toques `MANIFIESTO.md` ni `content/es/faq.ts`: los fundadores los han dado por definitivos.**

## Reservado a los fundadores

- Alta de la zona en Cloudflare y cambio de nameservers en IONOS (cuando exista staging, F5).
- Abrir la caja `sandbox-exec` de los agentes si les impide leer el vault.
- Cualquier cambio de fondo en el manifiesto o en las preguntas y respuestas.
