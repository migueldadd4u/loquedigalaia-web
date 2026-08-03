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

Pendiente para el gate F1 completo (Kimi): i18n 17 locales, suite `npm test` automatizada (hoy la verificación fue manual instrumentada), axe-core.
