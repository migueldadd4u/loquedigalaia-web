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

## Kimi K3 — traducir la web a los 11 idiomas que faltan (03/08, noche) — ⚠️ REASIGNADO

> **AVISO PARA KIMI (03/08, decisión de MAD): esta tarea la asume cc/Claude.** Estabas ocupado con otras cosas, así que **no empieces los diccionarios**: si los escribes ahora chocaríamos en los mismos ficheros (`content/i18n/*.json`). Lo que sí sigue siendo tuyo es la **tarea 2**: cerrar el pulso con datos reales — `snapshot.mjs` funciona y `source-status.json` dice que `clonmadv3` responde, pero los cuatro indicadores publicados siguen con `source: "sample"`, así que la web enseña números de ejemplo. Averigua si el frontal público del clon aún no expone el contrato de `docs/DATOS.md` o si falta cablear el mapeo, y si el bloqueo es del lado del clon dilo explícitamente en el PR en vez de dar el pulso por terminado.
>
> El encargo original se conserva abajo como referencia del método.

> Trabaja en `~/Code/loquedigalaia-web`, rama `f1-scaffold` (`git pull` primero, y comprueba `git branch --show-current` antes de cada `git add`: en este árbol trabajan varios agentes y la rama activa cambia).
>
> **Encargo:** la web ya sirve 21 idiomas, pero solo el inglés está traducido; el resto se ve en español. Tienes que escribir los **11 diccionarios que faltan**.
>
> **Cómo funciona el mecanismo** (léelo antes de traducir nada): `npm run build:static` construye el HTML español y luego `scripts/i18n-build.mjs` genera una copia por idioma sustituyendo cadenas. Cada idioma es un fichero `content/i18n/<source>.json` con pares `"cadena en español": "traducción"`. Las fuentes que faltan son exactamente estas 11: `zh` (chino simplificado), `zh-TW` (chino tradicional), `ja`, `ko`, `ca`, `gl`, `eu`, `va` (valenciano), `oc-aranes`, `ast` (asturiano), `pt` (portugués de Portugal). Las variantes por país (mx, ar, br…) **no llevan diccionario propio**: reutilizan `es` o `pt`.
>
> **De dónde salen las cadenas:** ejecuta `npm run build:static` y usa `content/i18n/_inventory.json` — es la lista completa y ordenada de todas las cadenas traducibles de la web (hoy 258; puede crecer, porque otro agente está añadiendo páginas). Usa `content/i18n/en.json` como modelo de formato y de criterio.
>
> **Reglas que el pipeline impone** (si las incumples, la cadena simplemente no se traduce y nadie te avisa):
> 1. La clave debe ser **idéntica byte a byte** a la cadena del inventario, con sus tildes, comillas angulares y guiones largos.
> 2. **Nunca traduzcas los nombres propios**: `Lo que diga la IA` (la marca), `ClonMADv3`, `Jarvis`, `Add4u`, `Alastria`, `ISBE`, `GestDocAI`. Van blindados en el script, pero tampoco deben aparecer traducidos dentro de tus valores.
> 3. **Prohibido** usar `"`, `<`, `>`, `&` o `\` en claves o valores: esas entradas se descartan. Para comillas usa « » o '.
> 4. Cuidado con las cadenas **cortas** (menos de 15 caracteres): se sustituyen con límite de palabra en todo el HTML. Ya nos pasó que `la IA` → `AI` convirtió la marca en «Lo que diga AI». Si una cadena corta es ambigua en tu idioma, es mejor no incluirla que romper otra frase.
> 5. No traduzcas números, URLs, correos ni fechas.
>
> **Criterio de traducción:** es una web de empresa con tono serio, directo y sin humo (`docs/IDENTIDAD.md`). Traduce el sentido, no palabra por palabra. En chino, japonés y coreano usa registro formal de negocio. Términos como *venture operating company*, *scale-up* o *venture studio* pueden quedarse en inglés si es lo natural en ese idioma.
>
> **Verificación obligatoria** (sin esto no vale): tras escribir los ficheros, `npm run build:static` debe imprimir los 12 idiomas en «con traducción». Comprueba en la salida real que cada idioma traduce y que la marca sigue intacta, por ejemplo:
> ```bash
> for l in zh tw ja ko ca gl eu va oc ast pt; do printf "%-4s " $l; grep -o "<title>[^<]*" out/$l/index.html; done
> ```
> Ninguno debe decir «La fábrica de milagros…» en español, y todos deben conservar `Lo que diga la IA` en el título. Registra la evidencia en `docs/TESTING.md` y abre PR con los comandos y su salida.
>
> **Prioridad:** primero `zh`, `ja`, `ko` y `zh-TW` (los pidió MAD expresamente), después las lenguas de España y el portugués.

## Reservado a los fundadores

- Alta de la zona en Cloudflare y cambio de nameservers en IONOS (cuando exista staging, F5).
- Abrir la caja `sandbox-exec` de los agentes si les impide leer el vault.
- Cualquier cambio de fondo en el manifiesto o en las preguntas y respuestas.

## Relevo 06/08 — verificar la primera noche autónoma del pulso (cc o quien retome)

> Proyecto: web pública de «Lo que diga la IA», repo `~/Code/loquedigalaia-web`, rama `main`,
> producción https://loquedigalaia.com. Lee docs/CONTINUACION.md y AGENTS.md antes de tocar nada.
> Publicar = fusionar PR a `main` (la Action reconstruye, pasa gates y despliega); nunca
> `wrangler deploy` a mano. Comprueba `git branch --show-current` antes de cada `git add`:
> el árbol es compartido con Codex y Kimi.
>
> Encargo: esta noche la cadena del pulso debía funcionar entera SIN manos por primera vez.
> Verifícalo eslabón a eslabón, con comando y salida, y deja la evidencia en docs/TESTING.md:
>
> 1. **Productor del clon** (03:43, widget-task de kimi): en `~/MADClon-Storage/front-office`,
>    `git branch --show-current` debe decir `main` (el 05/08 amaneció desviado a
>    `codex/pulso-pages-auto` y hubo que recuperarlo — si ha vuelto a pasar, ese es el fallo),
>    y `git log origin/main -1` debe ser el commit «kimi: datos front office 2026-08-06».
> 2. **Pages del frontal**: `curl -s https://migueldadd4u.github.io/madclon-front-office/data/pulso.json`
>    → `asOf` del 2026-08-06.
> 3. **Schedule de la web** (04:15 UTC ≈ 06:15 CEST; también 10:15 y 16:15 UTC):
>    `gh run list --workflow=deploy.yml` con el run de la mañana en success, y
>    `curl -s https://loquedigalaia.com/pulso.json` con los mismos valores que el frontal.
>    Ojo: GitHub retrasa los schedule hasta ~1 h; y si el frontal publicó después del run,
>    el refresco de las 10:15 lo recoge — eso no es un fallo.
> 4. **Cifra exacta** en `/` y `/pulso/` en es + al menos 3 idiomas (en, ja, eu), comparada
>    con el frontal. El salto diario de «días» seguirá siendo >20 % unos días más (3→4 = +33 %): el consenso retiene
>    el valor 5 min y lo confirma dentro del mismo run — verás «consenso pendiente →
>    confirmado» en el log del run, no es un error.
>
> Reglas: ningún «verificado» sin comando ejecutado; si el fallo está del lado del clon
> (productor, push, Pages), dilo explícitamente en vez de dar el pulso por cerrado. Si todo
> está verde, anota la evidencia, marca en CONTINUACION.md la cola item 2 como cerrada y
> sigue con la cola (revisión nativa de 6 idiomas · formulario F5).
