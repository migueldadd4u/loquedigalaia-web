# loquedigalaIA.com

Web pública de **Lo que diga la IA** — una *venture operating company* que los fundadores construyen junto a sus clones de IA (**Jarvis** y **ClonMADv3**) para crear una factoría de unicornios improbables de gente buena que resuelve problemas grandes de la humanidad.

Este repositorio es **público**. Política de datos (aclarada por los fundadores el 03/08): la **identidad pública de los fundadores** (nombres, fotos ya publicadas, contactos públicos) puede versionarse aquí — es información que ellos ya han hecho pública; si algo es privado, lo dirán expresamente. Lo que **nunca** entra: datos de terceros, credenciales, tokens o rutas de máquinas privadas. Ver [AGENTS.md](AGENTS.md).

## Qué es esta web

- El **escaparate del Milagro 0**: la propia empresa construyéndose en público.
- **Estática en el despliegue, viva en los datos**: se reconstruye cada día con el pulso publicado por los clones de los fundadores (ver [docs/DATOS.md](docs/DATOS.md)).
- **Accesible AA**, multidispositivo y multiidioma (español canónico + inglés; mecanismo extensible).
- Misma metodología técnica que la refactorización de la web de Add4u: Next.js + React + TypeScript, export estático, gate determinista de datos, tests sobre el HTML renderizado, cero claims sin evidencia.

## Documentos

| Documento | Qué contiene |
|---|---|
| [PLAN.md](PLAN.md) | Plan de implantación completo por fases, con gates y reparto de trabajo |
| [AGENTS.md](AGENTS.md) | Contrato para los agentes ejecutores (Kimi K3, Codex) y el orquestador/QA (Claude) |
| [MANIFIESTO.md](MANIFIESTO.md) | Texto definitivo y validado de la constitución y los principios; fuente única de `/manifiesto` |
| [docs/DATOS.md](docs/DATOS.md) | Contrato de datos vivos: esquema, gate, fallback |
| [docs/IDENTIDAD.md](docs/IDENTIDAD.md) | Brief de identidad visual y tono |
| [docs/ACCESIBILIDAD.md](docs/ACCESIBILIDAD.md) | Checklist AA verificable |
| [docs/DECISIONES.md](docs/DECISIONES.md) | Decisiones abiertas que solo los fundadores pueden cerrar |

## Desarrollo

Esqueleto creado en F1: Next.js 16 + React 19 + TypeScript + Tailwind CSS 4, export estático e i18n post-build (español canónico en raíz + `/en/` generado desde `content/i18n/en.json`). Requiere Node.js ≥ 22.13.

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor de desarrollo |
| `npm run build:static` | Sello de build (`build-stamp.mjs`) → `next build` estático (`export-static.mjs`) → generación de `/en/` (`i18n-build.mjs`) en `out/` |
| `npm run lint` | ESLint (flat config, reglas de Next) |
| `npm test` | Build estático + suite `node --test` sobre el HTML exportado (rutas, lang/hreflang, un `<h1>`, landmarks, skip-link, selector de idioma, diccionario, accesibilidad en CSS, cero datos personales) |
| `npm run gate` | Gate F2 completo: lint + test + checks binarios de contenido, fuentes e i18n (`scripts/gate.mjs`) |

Las 7 rutas de PLAN.md §2 viven en `app/`. `/manifiesto` lee directamente `MANIFIESTO.md`; las páginas editoriales leen `content/es/` y se renderizan como Markdown seguro, sin HTML crudo. El diccionario completo está en `content/i18n/en.json`; la utilidad compartida del mecanismo i18n es `scripts/i18n-client.mjs`.

## Publicación

No se publica nada en producción ni se toca DNS sin aprobación expresa de los fundadores. El dominio `loquedigalaia.com` está registrado en IONOS; el plan de DNS está en PLAN.md §F6.
