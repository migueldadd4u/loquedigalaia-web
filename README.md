# loquedigalaIA.com

Web pública de **Lo que diga la IA** — una *venture operating company* fundada por dos personas y sus dos clones de IA (**Jarvis** y **ClonMADv3**) para construir una factoría de unicornios improbables de gente buena que resuelve problemas grandes de la humanidad.

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
| [MANIFIESTO.md](MANIFIESTO.md) | Borrador de la constitución y los principios (pendiente de validación de los fundadores) |
| [docs/DATOS.md](docs/DATOS.md) | Contrato de datos vivos: esquema, gate, fallback |
| [docs/IDENTIDAD.md](docs/IDENTIDAD.md) | Brief de identidad visual y tono |
| [docs/ACCESIBILIDAD.md](docs/ACCESIBILIDAD.md) | Checklist AA verificable |
| [docs/DECISIONES.md](docs/DECISIONES.md) | Decisiones abiertas que solo los fundadores pueden cerrar |

## Desarrollo

El esqueleto de la aplicación se crea en la fase F1 del plan. Requerirá Node.js ≥ 22.13.

## Publicación

No se publica nada en producción ni se toca DNS sin aprobación expresa de los fundadores. El dominio `loquedigalaia.com` está registrado en IONOS; el plan de DNS está en PLAN.md §F6.
