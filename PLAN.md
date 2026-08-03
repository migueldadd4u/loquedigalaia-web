# Plan de implantación — loquedigalaIA.com

Estado: **v1.1 — F0 CERRADA (03/08, D1–D5 resueltas en docs/DECISIONES.md); F1 y F2 en ejecución**. Ejecutores: Kimi K3 y/o Codex, con Claude como orquestador y gate de calidad. Contrato de trabajo en [AGENTS.md](AGENTS.md).

## 0. Principios que gobiernan este plan

Heredados de la refactorización de add4u.com y de los principios del panel de los fundadores:

1. **Keep it simple.** Arquitectura suficiente, no infinita. Nada de crecer por crecer.
2. **Cero claims sin evidencia.** Todo número visible tiene fuente verificable o no se publica.
3. **Nada muere en silencio.** Todo pipeline de datos tiene gate, log y fallback visible.
4. **Estática en el despliegue, viva en los datos.** El HTML se sirve estático; los datos se renuevan con rebuild diario.
5. **Accesibilidad AA no negociable.** Es criterio de gate, no de pulido final.
6. **Datos personales: los públicos de los fundadores sí; los de terceros nunca.** Aclarado el 03/08: nombres, fotos y contactos públicos de los fundadores pueden versionarse (D2 aprobada, toda esa información ya es pública); si algo es privado, ellos lo dirán. Datos de terceros, credenciales y rutas privadas siguen vetados.

## 1. Stack técnico (espejo de add4u-web)

| Capa | Elección | Nota |
|---|---|---|
| Framework | Next.js 16 + React 19 + TypeScript | App Router |
| Build | vinext + Vite, export estático (`build:static`) | mismo pipeline que add4u-web |
| Estilos | Tailwind CSS 4 | tokens de color desde docs/IDENTIDAD.md |
| i18n | **D1 cerrada**: mismos idiomas que add4u.com — español canónico en raíz + 16 locales (`en, ca, gl, eu, va→ca-ES-valencia, oc, ast, pt, br→pt-BR, mx/co/cl/pe/ar/uy/ec→es-*`) generados post-build desde diccionarios `content/i18n/<locale>.json` | mismo mecanismo que add4u-web (hreflang, canónica, sin duplicar assets); los es-* regionales reutilizan la fuente es |
| Datos | JSON estáticos en `data/` validados por gate en build | ver docs/DATOS.md |
| Tests | `node --test` sobre el HTML renderizado (contenido, hreflang, accesibilidad, datos) | mismo patrón que add4u-web |
| Hosting | **D3 cerrada**: Cloudflare Workers/Static Assets, para compartir metodología de deploy con add4u-web. Resolución completa en docs/DECISIONES.md | |
| CI | GitHub Actions: lint + test en PR; cron diario de datos (F3) | |
| Agentes + SEO | Cada página con espejo Markdown, `llms.txt`, sitemap, JSON-LD y metadatos completos (ver §2.1) | requisito de los fundadores (03/08) |

## 2.1 Web legible por agentes + SEO (requisito de gate F2/F4)

La web tiene dos audiencias: personas y agentes de IA. Ambas deben encontrar y entender el contenido:

- **Espejo Markdown por página**: cada ruta publica su contenido también como `.md` (`/manifiesto.md`, `/problemas.md`, …) generado en build desde la misma fuente única — un agente puede leer la web entera sin parsear HTML. Índice en `/index.md`.
- **`/llms.txt`** en raíz: qué es la empresa, mapa de contenidos con enlaces a los `.md`, contrato de datos de `/pulso` y cómo citarnos. `/robots.txt` sin bloqueos a crawlers de IA (la web es pública a propósito).
- **SEO Google**: `sitemap.xml`, canónicas + hreflang (ya en el pipeline i18n), metadatos únicos por página, Open Graph con el poster, y **JSON-LD** (`Organization` en raíz, `FAQPage` donde aplique, `Dataset` en `/pulso`).
- **Datos accesibles a máquina**: `/pulso` publica también el JSON validado (`/pulso.json`) con la fecha de cada dato — el mismo que hornea el HTML, nunca dos fuentes.
- **Gate**: test que verifica que cada ruta HTML tiene su `.md` espejo con el mismo contenido textual, que `llms.txt` enlaza todos los `.md`, y que el JSON-LD valida contra schema.org.

## 2. Arquitectura de contenidos (rutas)

Todas las rutas en español canónico; `/en/...` generado por i18n.

| Ruta | Contenido |
|---|---|
| `/` | Hero + tesis en una frase + los 4 verbos (la IA multiplica · el humano elige · el sistema ejecuta · la realidad valida) + CTA único |
| `/manifiesto` | La constitución completa (MANIFIESTO.md renderizado) |
| `/problemas` | Los 8 problemas foco: cárceles, salud mental, jóvenes y trabajo, tecnología que cambia el mundo, educación, soberanía tecnológica, vivienda, administración pública. Una sección por problema con foto real (no IA) |
| `/como-trabajamos` | Metodología: venture operating company, Milagro 0, sistema operativo de founder, los principios de trabajo en comunidad (adaptación de los 10 principios de la jungla) |
| `/pulso` | **Página viva**: el estado diario publicado por los dos clones (datos, no relato). Fecha de último dato siempre visible |
| `/cofundadores` | «Cualquiera puede ser cofundador aunque llegue cinco años después»: qué significa, cómo se entra, formulario/CTA |
| `/contacto` | CTA único: solicitar conversación. Sin formulario hasta F5 (se replica el patrón worker+D1 de add4u si D3=Cloudflare) |

## 3. Fases y gates

Cada fase termina en un **gate determinista** (script `scripts/gate.mjs`, checks binarios). No se pasa de fase con el gate en rojo.

### F0 — Identidad y decisiones (fundadores + Claude) — bloqueante
- [ ] Cerrar las 5 decisiones de [docs/DECISIONES.md](docs/DECISIONES.md).
- [ ] Validar MANIFIESTO.md (texto definitivo de la constitución).
- [ ] Generar identidad visual definitiva (logo brújula ya existe; falta paleta y tipografías finales conforme a docs/IDENTIDAD.md).
- **Gate F0**: decisiones D1–D5 marcadas como cerradas en DECISIONES.md.

### F1 — Esqueleto técnico (Kimi K3 o Codex)
- [ ] Scaffold Next.js 16 + TypeScript + Tailwind 4 con export estático, replicando la estructura de scripts de add4u-web (`build:static`, `export-static.mjs`, `i18n-build.mjs`, `i18n-client.mjs`, `build-stamp.mjs`).
- [ ] Layout base: header, footer, skip-link, landmarks semánticos, selector de idioma, modo claro/oscuro respetando `prefers-color-scheme`.
- [ ] Las 7 rutas con contenido placeholder marcado `TODO-CONTENIDO`.
- [ ] Suite de tests inicial sobre HTML renderizado (rutas existen, lang/hreflang correctos, un `<h1>` por página).
- **Gate F1**: `npm run lint` y `npm test` verdes; build estático genera las 7 rutas × 2 idiomas.

### F2 — Contenido real es/en (Codex redacta, Claude revisa)
- [ ] Volcar MANIFIESTO.md a `/manifiesto` (una sola fuente: el markdown se importa, no se duplica).
- [ ] Redactar los 8 problemas con datos citables (cada afirmación con fuente pública enlazada).
- [ ] Página cofundadores con el mensaje: los primeros en apostar y poner dinero fueron los dos fundadores humanos, pero cualquiera es bienvenido y puede ser considerado cofundador aunque venga cinco años después.
- [ ] Diccionario `content/i18n/en.json` completo.
- [ ] Capa agentes + SEO de §2.1: espejos `.md`, `llms.txt`, sitemap, JSON-LD, Open Graph.
- [ ] Tono según docs/IDENTIDAD.md §tono: claro, elegante, directo, ambicioso, cero humo.
- **Gate F2**: cero `TODO-CONTENIDO` en build; test de i18n (ninguna clave sin traducir); revisión de copy contra REGLAS de tono.

### F3 — Datos vivos (Kimi K3 + Claude)
- [ ] Implementar el contrato de [docs/DATOS.md](docs/DATOS.md): `scripts/snapshot.mjs` descarga los JSON publicados por los clones, valida contra `data/schema/pulso.schema.json`, aplica reglas (consenso, monotonía donde aplique, frescura) y escribe `data/pulso.json` + `data/history.json`. **D4 cerrada**: fase 1 solo la fuente de ClonMAD; fase 2 agrega la de Jarvis y publica la suma; indicador obligatorio desde el día 1: **total de tokens consumidos** (acumulado, monotónico).
- [ ] Fallback por indicador: si un dato no pasa el gate, se muestra el último válido con su fecha — nunca un número inventado, nunca una página rota.
- [ ] GitHub Action con cron diario: snapshot → si hay cambios válidos → rebuild → deploy.
- [ ] Mientras el frontal público del Clon de MAD siga retenido (NO-GO actual), la web consume `data/sample/` y `/pulso` muestra el estado «en construcción, datos de ejemplo» de forma explícita.
- **Gate F3**: `snapshot.mjs --dry-run` verde con los sample; la página `/pulso` nunca renderiza un dato sin fecha de origen.

### F4 — Accesibilidad AA + imágenes (Codex)
- [ ] Pasar la checklist completa de [docs/ACCESIBILIDAD.md](docs/ACCESIBILIDAD.md) e integrarla al test suite (contrastes computados, alt, focus visible, orden de tabulación, `prefers-reduced-motion`).
- [ ] Imágenes generadas con IA: siempre con el distintivo de transparencia (etiqueta visible «Imagen generada con IA» conforme al art. 50 del Reglamento europeo de IA) — componente `<AiImage>` que lo impone por construcción.
- [ ] Imágenes reales (no IA) para los 8 problemas: fotografía documental con licencia verificada (Unsplash/Wikimedia con atribución en `public/images/CREDITS.md`).
- [ ] Fotos de los fundadores y los clones: **D2 cerrada (sí desde el día 1)** — pueden versionarse en `public/images/` directamente (aclaración 03/08); los ficheros los aporta un fundador.
- **Gate F4**: axe-core sin violaciones AA en las 7 rutas × 2 idiomas; toda `<img>` IA lleva el distintivo; CREDITS.md cubre el 100 % de las imágenes.

### F5 — Staging y formulario (Kimi K3)
- [ ] Deploy a staging en Cloudflare y puesta en marcha del dominio real según la resolución de D3 (docs/DECISIONES.md); el alta en el registrador la ejecuta un fundador.
- [ ] Formulario de contacto/cofundadores replicando el patrón de add4u-web (worker + D1 + honeypot + rate limit) si D3=Cloudflare.
- [ ] Verificación E2E en staging: navegación, idiomas, formulario, /pulso con datos sample.
- **Gate F5**: E2E verde documentado en `docs/TESTING.md` con evidencia (no vale «probado»).

### F6 — Producción y DNS (solo con aprobación expresa de los fundadores)
- [ ] Plan DNS: el dominio está en IONOS. Si D3=Cloudflare: cambiar nameservers a Cloudflare (o CNAME si se retiene IONOS como DNS). Si GitHub Pages: A/AAAA de Pages + CNAME www.
- [ ] Redirecciones: apex ↔ www, http→https, `loquedigalaia.com/en` operativo.
- [ ] Publicar fotos aprobadas en D2.
- [ ] Anuncio de lanzamiento (fuera del alcance de este repo).
- **Gate F6**: deploy-check (mismo patrón `deploy-check.mjs` de add4u-web) verde contra producción.

## 4. Reparto de trabajo

| Quién | Hace | No hace |
|---|---|---|
| **Claude** (orquestador/QA) | gates, revisión de PRs, contrato de datos, copy final | commits directos a `main` sin gate |
| **Kimi K3** | F1 scaffold, F3 pipeline de datos, F5 deploy | tocar MANIFIESTO.md, decidir identidad |
| **Codex** | F2 contenido, F4 accesibilidad e imágenes | tocar DNS, publicar |
| **Fundadores** | D1–D5, validar manifiesto, aprobar producción | — |

Kimi y Codex son intercambiables en cualquier tarea técnica: el contrato es la fase + su gate, no la herramienta. Trabajo siempre por rama + PR; `main` protegida por CI.

## 5. Riesgos ya conocidos

- **El frontal del Clon de MAD está en NO-GO** (contrato JSON sin sanear). La web no debe bloquearse por esto: F3 arranca con sample y el switch a datos reales es un cambio de URL en `snapshot.mjs`.
- **Fotos de los fundadores**: pueden ir directamente a `public/images/` (aclaración del 03/08 — su identidad es pública; D2 aprobada). `assets-privados/` queda reservado para lo que ellos marquen como privado. Caras de terceros reconocibles: solo con permiso documentado.
- **Nombre del dominio con mayúsculas** (`loquedigalaIA.com`) es solo branding: DNS es case-insensitive; usar siempre minúsculas en configuración.
- **No convertirse en web corporativa muerta**: si `/pulso` deja de actualizarse 7 días, el cron abre un issue automáticamente (nada muere en silencio).
