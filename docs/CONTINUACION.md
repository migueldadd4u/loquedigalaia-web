# Cómo continuar sin el orquestador

Este documento existe para que **cualquier agente** (Kimi K3, Codex, otro Claude) o persona pueda retomar el proyecto sin contexto previo. Léelo entero antes de tocar nada; después, tu fuente de trabajo es [PLAN.md](../PLAN.md) y tu contrato es [AGENTS.md](../AGENTS.md).

## Estado a 2026-08-03 (tarde)

| Rama | Contenido |
|---|---|
| `main` | Documentación completa: plan, contratos, manifiesto validado, decisiones D1–D5 **cerradas**, imágenes públicas de los fundadores |
| `f1-scaffold` | **La web funciona**: Next 16 export estático, 8 rutas + 404 con contenido real en español, hero partido con las dos fotos, FAQ con JSON-LD, contacto con WhatsApp de los fundadores. Verificación con evidencia en [TESTING.md](TESTING.md) |

Para verla: `npm install && npm run dev` (puerto 3210). El build de referencia es `npm run build` (debe generar todas las rutas como estáticas, hoy lo hace sin errores).

Los encargos tal y como se entregaron a cada agente están en [PROMPTS-AGENTES.md](PROMPTS-AGENTES.md).

## ⚠️ Lo primero al retomar: reconciliar tres ramas

La noche del 03/08 los tres trabajamos en paralelo desde puntos distintos y hay **duplicación real**. Nadie debe seguir construyendo hasta resolver esto:

| Rama | Qué trae | Qué hacer |
|---|---|---|
| `f1-scaffold` (cc) | Scaffold + **contenido y diseño**: hero partido con fotos, 8 rutas + 404, FAQ con JSON-LD, contacto, i18n de 17 locales con `en.json` completo (258 cadenas) y la marca blindada | **Base recomendada**: es la que está verificada con evidencia y la que MAD ha visto |
| `f1-scaffold-kimi` | **Scaffold paralelo** partiendo de antes del mío (su propio header/footer/`lib/site.ts`, su `i18n-build`, `build-stamp`, `export-static`) **+ dos piezas que a la base le faltan: `scripts/gate.mjs` y `test/static-html.test.mjs`, y `eslint.config.mjs`** | Rescatar el **gate, los tests y el eslint**; descartar el scaffold duplicado. Comparar su `i18n-build` con el de la base por si trae algo mejor |
| `f2-contenido` (Codex) | Prosa en `content/es/{problemas,como-trabajamos,cofundadores}.md` + su propio `en.json` (189 entradas) | Fundir la prosa con `content/es/site.ts` (decidir **una** fuente: o markdown o TS, no las dos) y **fusionar los `en.json`**, no sobrescribir |

Causa: se les dio el encargo antes de que existiera la rama con el esqueleto, y arrancaron desde `main`. Lección para la próxima tanda: **el encargo dice desde qué commit se parte**.

Después de reconciliar, actualiza esta tabla y borra la sección.

## Cola de trabajo, por orden

1. **Terminar F1** (rama `f1-scaffold`): el **multiidioma ya está operativo** (`npm run build:static` → 17 locales, inglés traducido al completo, sitemap con hreflang). Queda: suite `npm test` sobre el HTML renderizado, axe-core, y **las cifras reales del front office de ClonMAD en portada y en `/pulso`** (encargo de MAD). Gate en PLAN §F1.
2. **PR y merge a `main`** cuando el gate F1 esté verde. El PR debe llevar comandos + salida.
3. **F2**: **un hero generado con IA por página** con la etiqueta oficial UE, como en add4u.com (encargo de MAD); fotos reales (no IA) de los 8 problemas con licencia y `CREDITS.md`; los 7 diccionarios que faltan (ca, gl, eu, va, oc-aranes, ast, pt — `en.json` ya está completo; partir de `content/i18n/_inventory.json`); capa agentes+SEO de PLAN §2.1 (espejos `.md` por página, `llms.txt`, JSON-LD Organization/Dataset, Open Graph).
4. **F3**: `scripts/snapshot.mjs` con el contrato de [DATOS.md](DATOS.md). Ojo: la fuente real (front-office de ClonMADv3) sigue **retenida**; se trabaja contra `data/sample/` y el cambio a real es solo la URL en `data/sources.json`.
5. **F5**: formulario (worker + D1, **primer campo obligatorio: «¿Qué problema grande del mundo crees que puedes arreglar con nuestra ayuda?»**), deploy a Cloudflare y dominio real. El alta de zona y los nameservers en IONOS los ejecuta un fundador — pedírselo, no intentarlo.
6. **F6**: checks de producción (patrón deploy-check de add4u-web).

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
