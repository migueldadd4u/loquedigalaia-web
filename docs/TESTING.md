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

## 2026-08-03 (noche) — pulso con gate de ingesta + suite npm test + axe-core (Kimi)

Encargo de MAD: cifras del front office en portada y `/pulso`, `scripts/snapshot.mjs` según DATOS.md, suite sobre el HTML renderizado y axe-core AA.

| Comprobación | Método | Resultado |
|---|---|---|
| Snapshot contra sample | `node scripts/snapshot.mjs` | ✅ `data/pulso.json` con 4 indicadores; `history.json` y `source-status.json` escritos; jarvis omitido (fase 2, sin URL ni sample) |
| Frescura 48 h | `snapshot.mjs --now=2026-08-07T10:00:00Z` | ✅ los 4 indicadores marcados `stale` («se muestra atenuado») |
| Monotonía | sample con tokens 900000 < 1063908 | ✅ valor descartado; se conserva el del 2026-08-03 con `fallback: monotonía` |
| Consenso (>20 %) | salto 1063908 → 2100000 (97 %) | ✅ 1ª lectura: fallback `consenso pendiente`; 2ª lectura idéntica 6 min después: aceptado |
| Esquema cerrado | indicador con clave extra `email` | ✅ fuente descartada esa noche; los 4 indicadores caen a `data/history.json` (`fallback: fuente inválida`) |
| Suplantación de clon | payload `clonmadv3` en fuente de otro clon | ✅ descartado (bug encontrado y corregido en la misma sesión: `--input` solo aplica a fuentes con sample) |
| Extracto en portada | `out/index.html` | ✅ tarjeta destacada encabezada por el total de tokens (1.063.908) + 3 indicadores secundarios, cada uno con fecha y «ejemplo» |
| /pulso completo | `out/pulso/index.html` | ✅ fecha por indicador, flags stale/fallback visibles, sección Evolución (serie + sparkline SVG sin JS) y sección Metodología (6 reglas del gate + fuentes) |
| **Suite HTML** | `node --test tests/html.test.mjs` | ✅ 6/6: 13 rutas × 21 locales existen, un h1 por página, canonical + 22 hreflang por página, marca y nombres intactos (0 centinelas), inglés completo (419/419 cadenas con clave en `en.json`), 0 enlaces internos rotos |
| **axe-core AA** | `node --test tests/a11y.test.mjs` | ✅ 26 páginas (13 es + 13 en) × wcag2a+wcag2aa, **0 violaciones**. `color-contrast` desactivada en jsdom (sin layout); contraste medido a mano arriba (≈12:1 en el hero) |
| Canonical páginas legales | tests html + agents-seo | ⚠️ las 5 páginas del pie heredaban el canonical de `/` → corregido con `pageMetadata({path})` en cada una |
| **Gate completo** | `npm run gate` (lint + build estático + tests) | ✅ **45/45 tests** · tsc sin errores · 280 HTML · 419 cadenas en inventario · con traducción: en, zh, ja |

Notas: `--input` solo sustituye al sample de fuentes que lo tienen (nunca a jarvis). `pending.json` y `source-status.json` son estado entre ejecuciones del cron. Los 9 diccionarios restantes (ko, zh-TW, ca, gl, eu, va, oc-aranes, ast, pt) los asume cc (commit 46c8e98); el test de diccionarios los declara pendientes con tope decreciente.
## Los 21 idiomas, traducidos y verificados (2026-08-03)

Antes solo estaba el inglés; el resto de la web se veía en español. Ahora los
12 diccionarios están completos y la comprobación es automática, no visual.

`node scripts/verificar-i18n.mjs out` mira el **HTML ya generado** y busca texto
que siga en español. Distingue dos fallos, porque se arreglan distinto:

- **ROTO** — había traducción y aun así salió en español. Fallo del pipeline.
- **SIN** — no hay traducción para esa cadena. Falta trabajo de traducción.

Además valida lo que el pipeline impone en silencio (caracteres prohibidos,
nombres propios que no deben traducirse, cifras que no pueden perderse) y que
ningún enlace interno se haya traducido.

Salida del 03/08, tras completar los diccionarios:

```
Inventario: 393 cadenas · a traducir: 380

DICCIONARIOS
  ✓ en 380 · zh 380 · ko 380 · ja 380 · pt 380 · zh-TW 380
  ✓ oc-aranes 380 · ast 380 · ca 380 · eu 380 · gl 380 · va 380

HTML GENERADO (texto que sigue en español)
  idioma       páginas   ROTO   SIN
  ✓ (los 13 con diccionario)   15      0     0

ENLACES INTERNOS
  ✓ los 20 locales: todos apuntan a una ruta real

✓ Nada queda sin traducir y ningún enlace se ha roto.
```

Verificado también contra producción: `/aviso-legal/` responde 200 en los 21
idiomas con su título traducido y los datos identificativos presentes.

### Un fallo que llevaba tiempo publicado

La clave corta `manifiesto` traducía el segmento dentro del propio enlace:
`href="/manifiesto/"` salía como `href="/manifesto/"`, y de rebote `prefixLinks`
ya no lo reconocía y el enlace perdía el prefijo de idioma. Ocurría en los 12
idiomas y sin ningún aviso. Arreglado en `scripts/i18n-build.mjs`: `translate()`
blinda con centinelas los segmentos de URL además de la marca. La comprobación
de enlaces del verificador existe para que no vuelva a pasar en silencio.

## El guardián de publicación (2026-08-03)

`scripts/antes-de-publicar.mjs` responde a una pregunta concreta de MAD: **¿qué
hago para que nada se borre?** La respuesta no puede ser «acordarse»: es que el
despliegue falle si lo que hay en `out/` no es publicable.

`npm run deploy` compila y pasa por él antes de llamar a `wrangler`. Comprueba,
por orden de gravedad:

1. **Páginas legales** — que existan y conserven sus datos (los dos DNI, el
   domicilio, los correos, el CIF de Add4u, la referencia a la Ley 3/1991, el
   RGPD, la Ley 34/2002 y el deslinde de `/respaldo`). Sin esto la web incumple
   el artículo 10 de la LSSI-CE.
2. **Idiomas** — que cada locale declarado tenga todas sus páginas.
3. **Rastro** — sitemap presente y con las rutas legales listadas.
4. **Traducción** — delega en `verificar-i18n.mjs`.

Probado provocando las tres regresiones que de verdad pueden ocurrir:

| Se provoca | Qué dice | Salida |
|---|---|---|
| Borrar `out/aviso-legal/` | `/aviso-legal/ NO EXISTE — la web no se puede publicar sin ella` | 1 |
| Borrar `out/eu/` entero | `/eu/ sin: aviso-legal, privacidad, cookies…` | 1 |
| Vaciar los DNI y el CIF | `/aviso-legal/ ha perdido: 01178330V, B-84428879` | 1 |
| Todo correcto | `✓ Publicable.` | 0 |

Estado tras integrar el pie legal con la F2 de Codex: **135 rutas verificadas en
producción (15 idiomas × 9 rutas), 0 fallos**, con las fotos y los heroes de
Codex intactos y los 12 diccionarios cubriendo las 419 cadenas del inventario.

### Un aviso que faltaba: frases largas idénticas al español

MAD detectó a ojo que el `<title>` de la portada salía en castellano en
asturiano, mientras el verificador decía que no quedaba nada sin traducir.

La regla «valor igual a la clave = el traductor dice que en su idioma se escribe
igual» es correcta para una palabra suelta y peligrosa para una frase larga: ahí
es casi siempre un olvido disfrazado de decisión. El verificador lo avisa ahora,
sin abortar, porque a veces coinciden de verdad:

```
  ✓ ast         419 entradas · ⚠ 4 frases largas idénticas al español
      ⚠ sin traducir (o idéntica): La fábrica de milagros empresariales nativos de IA
```

Segunda lección, de método: lo que se miró era un `out/` anterior a la fusión.
**Al dar algo por verificado hay que decir contra qué build**, o el «está bien»
no significa nada.
