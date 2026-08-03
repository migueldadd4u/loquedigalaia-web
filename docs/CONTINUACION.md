# Cómo continuar sin el orquestador

Este documento existe para que **cualquier agente** (Kimi K3, Codex, otro Claude) o persona pueda retomar el proyecto sin contexto previo. Léelo entero antes de tocar nada; después, tu fuente de trabajo es [PLAN.md](../PLAN.md) y tu contrato es [AGENTS.md](../AGENTS.md).

## Estado a 2026-08-03 (cierre de jornada) — TODO CONSOLIDADO EN `main`

`main` es la única base. Ya no hay ramas divergentes que reconciliar: lo que estaba
repartido entre `f1-scaffold`, `legal-pie`, `f2-contenido` y `f4-fotos-problemas` está
fusionado, verificado y desplegado.

| Qué | Estado |
|---|---|
| **Web en producción** | https://loquedigalaia.add4u.workers.dev — 13 rutas × 21 locales (280 HTML) |
| **Idiomas** | **12 diccionarios completos** (es fuente + en, zh, zh-TW, ja, ko, pt, ca, gl, eu, va, oc-aranes, ast), 419 cadenas cada uno; 8 variantes por país heredan es/pt |
| **Páginas legales** | `/aviso-legal`, `/privacidad`, `/cookies`, `/accesibilidad`, `/respaldo` en los 21 idiomas |
| **Imágenes** | Un hero IA por página con etiqueta oficial UE + 8 fotos reales acreditadas en `/problemas` |
| **Pulso** | `scripts/snapshot.mjs` con su gate; ⚠️ los 4 indicadores publicados siguen con `source: "sample"` |
| **Controles** | `npm test` 45/45 · `npm run gate` OK · `node scripts/antes-de-publicar.mjs` publicable |
| **Dominio propio** | ⏳ en curso por MAD + Codex en la rama `codex/domain-launch` |

Para verla en local: `npm install && npm run dev` (puerto 3210). Para la salida real de
producción: `npm run build:static` y servir `out/` — el dev server **no** genera las
carpetas de idioma, que se crean tras el build.

Los encargos tal y como se entregaron a cada agente están en [PROMPTS-AGENTES.md](PROMPTS-AGENTES.md).

⚠️ **Trampa del árbol compartido:** varios agentes trabajan sobre el mismo directorio, así
que **la rama activa cambia bajo tus pies**. Ya pasó dos veces: un commit acabó en la rama
de otro agente, y un fichero de test volvió atrás. **Comprueba `git branch --show-current`
antes de cada `git add`** y `git pull` antes de empezar.

> [!important] **Para publicar: `npm run deploy`. Nunca `npx wrangler deploy` a secas.**
> `npm run deploy` compila y pasa por `scripts/antes-de-publicar.mjs`, que **aborta**
> si falta una página legal o ha perdido sus datos, si algún idioma se ha quedado sin
> páginas, si el sitemap no las lista o si queda texto sin traducir. Existe porque la
> web estuvo a un despliegue de perder el aviso legal: producción salía de una rama y
> el trabajo seguía en otra. Ya está todo fusionado en `f1-scaffold`, y el guardián
> está para que no vuelva a depender de que alguien se acuerde.

## Cola de trabajo, por orden

1. **Dominio propio** (en curso, MAD + Codex): que `loquedigalaia.com` sea el punto final de despliegue. Ver [DESPLIEGUE.md](DESPLIEGUE.md).
2. **Pulso con datos reales** (Kimi): `snapshot.mjs` funciona y `source-status.json` dice que la fuente responde, pero los 4 indicadores publicados siguen marcados `sample`. Averiguar si el frontal del clon aún no expone el contrato de [DATOS.md](DATOS.md) o si falta cablear el mapeo — y si el bloqueo es del lado del clon, decirlo en vez de darlo por cerrado.
3. **Revisión nativa de seis idiomas**: catalán, gallego, euskera, valenciano, aranés y asturiano están publicados sin lectura de hablante nativo, y las páginas legales llevan terminología jurídica. Funcionan, pero antes de dar publicidad al lanzamiento conviene una revisión humana.
4. **Formulario de contacto** (F5): worker + D1, **primer campo obligatorio: «¿Qué problema grande del mundo crees que puedes arreglar con nuestra ayuda?»**.
5. **Checks de producción** (F6): patrón deploy-check de add4u-web.

## Decisiones ya tomadas — no reabrir

Las cinco de [DECISIONES.md](DECISIONES.md) están cerradas por los fundadores (03/08). En particular: los 17 idiomas de add4u.com, fotos y nombres de los fundadores desde el día 1, Cloudflare, datos de ClonMAD primero (suma con Jarvis en fase 2, con el total de tokens como indicador obligatorio), y el manifiesto es texto definitivo — **solo se le corrigen erratas**.

## Reglas que no se negocian

- Datos personales: los **públicos de los fundadores sí**; los de **terceros nunca**. Ante la duda, parar y anotar en DECISIONES.md.
- Toda imagen generada con IA se renderiza con el componente `AiImage` (etiqueta oficial UE); elegir la esquina que no tape lo relevante. Fotos reales siempre señaladas como tales.
- Ningún «verificado» sin comando ejecutado y salida registrada en TESTING.md.
- Trabajo por rama + PR. `git pull` antes de empezar: aquí trabajan varios agentes.
- No publicar ni tocar DNS sin aprobación expresa de los fundadores.

## Trampas conocidas (aprendidas hoy)

- El copy vive en `content/es/site.ts` y `content/es/faq.ts`; el manifiesto en `MANIFIESTO.md` se importa, no se copia. **Una sola fuente por contenido.**
- `/manifiesto` retira el banner interno del markdown con una regex sobre la primera cita — si cambias el banner, revisa esa regex.
- El póster del hero se recorta con `object-position: center 22%`; si se cambia la imagen, verificar en 375/768/1280 que las caras quedan visibles y nada tapa el texto del cartel.
- En la agenda de contactos hay un «Miguel Angel Dominguez Puente» que **no es** el fundador; su número no debe usarse jamás. Los datos de contacto correctos son los que ya están en `/contacto`.

## Acceso al vault del clon (solo agentes en la máquina de los fundadores)

Decisión de MAD (03/08): Kimi K3 y Codex son equipo y **pueden leer el vault** (`~/MADClon-Storage/MAD-brain/`) para contexto — manifiestos, handoffs, principios, fichas. Condiciones, definidas en `~/MADClon-Storage/AGENTS.md` (leerlo antes):

- **Lectura sí; escritura en el vault solo con `claim.sh`.** Vuestro carril de escritura es este repo.
- **Cortafuegos de privacidad:** el vault contiene datos personales de terceros. **Nada de lo leído allí puede acabar en este repo público** salvo que ya sea público. Ante la duda, no se copia y se pregunta.
- Las zonas sagradas del vault (motor hermes, credenciales, launchd) ni se miran ni se tocan.
- Nota operativa: si vuestra caja de confinamiento (`sandbox-exec`) no os deja leer el vault, no la rodeéis — pedidle a MAD que la abra a propósito.

## Si algo se rompe y no sabes seguir

No inventes: deja el estado escrito en un issue del repo con lo que intentaste y su salida, y marca la fase como bloqueada. Los fundadores leen los issues — nada muere en silencio.
