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

Pendiente para el gate F1 completo (Kimi): suite `npm test` automatizada (hoy la verificación fue manual instrumentada), axe-core, y los 15 diccionarios que faltan (ca, gl, eu, va, oc, ast, pt — las variantes regionales de es/pt heredan su fuente).
