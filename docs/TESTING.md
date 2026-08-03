# Evidencia de verificación

Registro de comprobaciones ejecutadas (regla: ningún «verificado» sin comando o captura de la misma sesión).

## 2026-08-03 — F1 parcial en local (rama f1-scaffold)

| Comprobación | Método | Resultado |
|---|---|---|
| Build estático de las 8 rutas + 404 | `npm run build` (output: export) | ✅ todas prerenderizadas estáticas |
| Tipos | `npx tsc --noEmit` | ✅ sin errores |
| Consola del navegador en `/` | read_console_messages | ✅ sin errores |
| Estructura semántica de `/` | árbol de accesibilidad | ✅ un `h1`, landmarks (banner/nav/main/contentinfo), skip-link primero |
| **Móvil 375 px** | viewport 375×812, captura | ✅ sin scroll horizontal, nav plegada en dos líneas, CTAs apilados |
| **Tablet 768 px** | viewport 768×1024, captura | ✅ hero en una columna (texto → póster a ancho completo, caras visibles), sin scroll horizontal |
| **Escritorio 1280 px** | viewport nativo, captura | ✅ hero partido: texto sobre panel de tinta, póster sin velo (caras visibles) |
| /contacto | captura | ✅ WhatsApp de los dos fundadores (wa.me), LinkedIn de Luis, Add4u/Alastria/ISBE, pregunta fundacional destacada |
| Hero: contraste del texto | texto marfil `#f6f3ea` sobre panel `#17232a` | ✅ ratio ≈ 12:1 (AA/AAA) |
| Etiqueta UE en imagen IA | captura del hero | ✅ SVG oficial superpuesto sin tapar caras ni texto del cartel |
| Foto real vs IA distinguibles | captura del hero | ✅ selfie con pie «Fotografía real, sin IA»; póster con etiqueta UE + crédito |
| /manifiesto renderiza MANIFIESTO.md | get_page_text | ✅ constitución completa, banner interno retirado |
| /pulso con datos sample | captura | ✅ aviso «datos de ejemplo» + fecha en cada indicador |
| /faq | captura | ✅ 13 `details` accesibles + JSON-LD FAQPage |

## 2026-08-03 (tarde) — multiidioma operativo

| Comprobación | Método | Resultado |
|---|---|---|
| Generación de locales | `npm run build:static` | ✅ 17 locales · 160 HTML · 258 cadenas en inventario · con traducción: `en` |
| Inglés traducido | `out/en/index.html` + navegador (puerto 3212) | ✅ title, h1, secciones, problemas y oferta en inglés |
| **Marca protegida** | grep del title en `out/en/` | ✅ «Lo que diga la IA» intacto. ⚠️ Primera pasada lo rompió («Lo que diga AI»): la clave corta `la IA`→`AI` entraba dentro del nombre; resuelto blindando nombres propios con centinela (script §PROTECTED) |
| Español intacto | `out/index.html` | ✅ sin cambios salvo canónica + hreflang |
| Enlaces prefijados | `out/en/index.html` | ✅ `/en/problemas/`, `/en/pulso/`… |
| Sitemap con alternativas | `out/sitemap.xml` | ✅ 9 rutas × 17 locales + x-default |
| Centinelas sin restaurar | grep en la salida | ✅ 0 |

## 2026-08-03 (noche) — banderas y despliegue en Cloudflare

| Comprobación | Método | Resultado |
|---|---|---|
| Selector con banderas | clic en el botón + volcado del menú | ✅ 21 entradas en tres grupos: Idiomas (Castellano, English, 中文简体, 한국어, 日本語, Português, 中文繁體), Lenguas de España (Aranés, Asturianu, Català, Euskera, Galego, Valencià) y Variantes por país (Argentina→Uruguay) |
| Menú fuera de pantalla | viewport 820 px | ⚠️ se salía por la izquierda al bajar de línea el selector → anclado a la izquierda por debajo de 1000 px |
| Hidratación | clic inmediato tras cargar | ⚠️ el menú no abre hasta que hidrata React (segundos); no es un fallo, pero conviene saberlo al probar |
| Rutas de los idiomas nuevos | curl a `/zh/ /ja/ /ko/ /tw/` | ✅ 200 |
| **Despliegue Cloudflare** | `npx wrangler deploy` | ✅ 303 ficheros en https://loquedigalaia.add4u.workers.dev |
| Rutas en producción | 10 rutas × 2 pasadas seguidas | ✅ todas 200; `/noexiste/` → 404 propio |
| Propagación | primeras llamadas tras desplegar | ⚠️ 404 intermitentes durante ~2 min hasta que se propaga el manifiesto de assets |
| Dominio propio | `dig` + API de zonas | ⏳ sigue en IONOS; no hay zona en Cloudflare y el token no puede crearla (ver DESPLIEGUE.md) |

Pendiente para el gate F1 completo (Kimi): suite `npm test` automatizada (hoy la verificación fue manual instrumentada), axe-core, y los 15 diccionarios que faltan (ca, gl, eu, va, oc, ast, pt — las variantes regionales de es/pt heredan su fuente).

## 2026-08-03 (noche, segunda tanda) — pulso con datos reales del frontal público

| Comprobación | Método | Resultado |
|---|---|---|
| Frontal público ClonMADv3 en vivo | `curl -o /dev/null -w '%{http_code}'` a `/`, `/data/tokens.json`, `/data/manifest.json` de `migueldadd4u.github.io/madclon-front-office` | ✅ 200 · 200 · 200 |
| Adaptador `madclon-front-office/v1` | `node --test tests/snapshot-adapter.test.mjs` | ✅ 4/4: mapeo, forma del contrato cerrado, errores → fallback, cero datos personales atravesando |
| Primera lectura real | `node scripts/snapshot.mjs` | ✅ `data/pulso.json`: 537.373.823 tokens, 9 días, 40 tareas/7 d, 6 canales — todo `asOf 2026-08-03` con la URL de la fuente como `source` |
| Migración sample→real | `data/history.json` | ✅ historia sample purgada (eran marcadores, no lecturas; evita falso consenso y monotonía falseada); documentado en DATOS.md |
| Diccionarios resincronizados | diff `_inventory.json` vs `en/ja/zh.json` | ✅ 3 cadenas del aviso «datos de ejemplo» eliminadas de los 3 diccionarios (ya no se renderizan con datos reales) |
| Gate completo | `npm run gate` | ✅ 49/49 tests + lint + build |
| `/pulso` renderiza real | grep en `out/pulso/index.html` | ✅ «537.373.823» + «dato del 2026-08-03» en los 4 indicadores; cero «· ejemplo» |
| `/en/pulso` | grep en `out/en/pulso/index.html` | ✅ «Tokens consumed (running total)» + misma cifra y fecha |
| Action diaria | `.github/workflows/pulso.yml` | ✅ cron 05:23 UTC + dispatch: snapshot → commit de datos si cambian → gate → deploy (tras `CF_DEPLOY_ENABLED`) → issue a los 7 fallos (§6). Activa al llegar a `main` |
