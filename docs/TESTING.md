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

## 2026-08-03 (cierre) — consolidación en `main` y 12 idiomas verificados

Todo el trabajo repartido en ramas quedó fusionado en `main` (commit de merge
`01866e4`), que es la base de la sesión limpia de despliegue al dominio.

| Comprobación | Método | Resultado |
|---|---|---|
| Diccionarios vs inventario | script de sincronización sobre los 12 | ⚠️ **ninguno cuadraba**: a los 12 les sobraban 17 claves obsoletas y a los 8 nuevos les faltaban las 13 de marca, nombres y dominios → sincronizados a 419 exactas |
| Calidad de la traducción | muestra de la misma frase en los 8 idiomas nuevos | ✅ traducción real, no copia: eu «Konponduko dugun arazorik handiena bezain handiak gara», oc «Èm tan grans coma eth mès gran problèma que resolveram», zh-TW con vocabulario de Taiwán |
| Falso positivo del test | `npm test` | ⚠️ exigía que TODA cadena larga difiriera del castellano; «Aviso legal» es idéntico en gallego y «Política de cookies» en catalán → sustituido por un umbral del 85 %, que es lo que delata una copia |
| Suite completa | `npm test` | ✅ 45/45 |
| Gate | `npm run gate` | ✅ lint + build estático + tests |
| Guardián de publicación | `node scripts/antes-de-publicar.mjs` | ✅ publicable: nada sin traducir, ningún enlace roto |
| Títulos de los 12 idiomas | grep sobre `out/<locale>/index.html` | ✅ los 12 con título propio y la marca intacta |
| Producción | 15 rutas de idioma × 2 pasadas | ✅ todas 200 |

Pendiente conocido: los 4 indicadores del pulso siguen con `source: "sample"`, y los seis
idiomas cooficiales están publicados sin revisión de hablante nativo.

## 2026-08-03 — publicación en loquedigalaia.com

Alcance: delegación DNS, Custom Domains, retirada del aparcamiento de IONOS,
canónica única, TLS y verificación del artefacto ya desplegado. No se modificó
contenido ni ningún diccionario de traducción.

### Base y gate anterior al despliegue

```text
$ git branch --show-current
codex/domain-launch

$ git rev-parse --short HEAD
5d7af39

$ npm run gate
...
✓ 45/45 tests
✓ gate OK

$ node scripts/antes-de-publicar.mjs out
...
✓ sitemap.xml completo
✓ Nada queda sin traducir y ningún enlace se ha roto.
✓ Publicable.
```

La etapa i18n del build informó 280 copias HTML localizadas (14 fuentes × 20
prefijos) y un inventario de 419 cadenas. El artefacto completo contiene 296
ficheros HTML: 273 páginas de contenido, 21 copias de `/_not-found/` y los dos
ficheros 404 de Next/export.

```text
$ find out -type f -name '*.html' | wc -l
296
$ find out -type f -name '*.html' | rg -v '/_not-found/index\.html$|/404(?:/index)?\.html$' | wc -l
273
$ find out -type f -path '*/_not-found/index.html' | wc -l
21
$ find out -type f \( -path '*/404.html' -o -path '*/404/index.html' \) | wc -l
2
```

El mensaje `sitemap.xml completo` del guardián significa únicamente que las
rutas legales exigidas están presentes; ese guardián no cuenta las URLs ni
excluye `/_not-found/`. La inspección semántica independiente figura al final.

### Gate del commit local entregado a Claude

Después de detectar que `origin/main` había avanzado, el commit de dominio se
rebasó sobre `9503a39` y se repitieron gate y guardián. Salida final literal:

```text
$ git branch --show-current
codex/domain-launch
$ git rev-parse --short origin/main
9503a39

$ npm run gate
...
i18n-build · 21 locales · 280 HTML generados · 416 strings en inventario · con traducción: en, zh, ko, ja, pt, zh-TW, oc-aranes, ast, ca, eu, gl, va, pt-BR
1..45
# tests 45
# pass 45
# fail 0
gate · lint, build estático y tests deterministas: OK

$ node scripts/antes-de-publicar.mjs out
...
Idiomas
  ✓ los 20 idiomas tienen todas sus páginas
Rastro
  ✓ sitemap.xml completo
✓ Nada queda sin traducir y ningún enlace se ha roto.
✓ Publicable.
```

No se hizo `push` ni un nuevo despliegue desde esta rama: esos dos pasos forman
parte del relevo solicitado a Claude.

### Delegación, DNS y correo preservado

Cloudflare activó la zona con los nameservers asignados. Después se eliminaron
los cuatro registros de aparcamiento importados (A y AAAA de apex y `www`) y
se desplegaron los Custom Domains. Consulta final contra el nameserver
autoritativo:

```text
$ dig +short @damien.ns.cloudflare.com loquedigalaia.com NS
damien.ns.cloudflare.com.
hope.ns.cloudflare.com.

$ dig +short @damien.ns.cloudflare.com loquedigalaia.com A
188.114.96.5
188.114.97.5

$ dig +short @damien.ns.cloudflare.com loquedigalaia.com AAAA
2a06:98c1:3120::5
2a06:98c1:3121::5

$ dig +short @damien.ns.cloudflare.com www.loquedigalaia.com A
188.114.97.5
188.114.96.5

$ dig +short @damien.ns.cloudflare.com www.loquedigalaia.com AAAA
2a06:98c1:3120::5
2a06:98c1:3121::5

$ dig +short DS loquedigalaia.com
(sin salida: no quedó un DS antiguo en el registrador)
```

En apex y `www` ya no se publica ninguna de las dos IP de IONOS
(`217.160.0.116`, `2001:8d8:100f:f000::200`). Los registros de correo
permanecen:

```text
$ dig +short @damien.ns.cloudflare.com loquedigalaia.com MX
10 mx00.ionos.es.
10 mx01.ionos.es.

$ dig +short @damien.ns.cloudflare.com loquedigalaia.com TXT
"v=spf1 include:_spf-eu.ionos.com ~all"

$ for name in autodiscover _dmarc _domainconnect; do
>   dig +short @damien.ns.cloudflare.com "$name.loquedigalaia.com" CNAME
> done
adsredir.ionos.info.
dmarc.ionos.es.
_domainconnect.ionos.com.
```

La inspección del volcado accesible de la tabla **DNS → Records** confirmó
además el inventario gestionado tras el borrado. Resumen de esa inspección (no
es salida de shell):

```text
You have used 8 of 200 available DNS records in this domain.
oldIpv4After: 0
oldIpv6After: 0
mail: mx00=true mx01=true spf=true autodiscover=true dmarc=true domainconnect=true
managedWorker: apex=true www=true
```

Los ocho registros visibles son los seis de correo anteriores y los dos
registros `Worker loquedigalaia · Proxied` gestionados por los Custom Domains.

### Delegación pública y cachés al entregar el relevo

La delegación normal —sin consultar directamente al autoritativo— ya apunta a
Cloudflare:

```text
$ dig +short NS loquedigalaia.com
hope.ns.cloudflare.com.
damien.ns.cloudflare.com.
```

Google Public DNS ya resolvía y navegaba íntegramente por Cloudflare sin fijar
ninguna IP:

```bash
curl --silent --show-error --head --output /dev/null \
  --doh-url https://dns.google/dns-query --proto '=https' --tlsv1.2 \
  --write-out 'DoH apex HTTPS=%{http_code} SSL_VERIFY=%{ssl_verify_result} IP=%{remote_ip}\n' \
  https://loquedigalaia.com/
curl --silent --show-error --head --output /dev/null \
  --doh-url https://dns.google/dns-query \
  --write-out 'DoH www HTTPS=%{http_code} LOCATION=%{redirect_url} SSL_VERIFY=%{ssl_verify_result} IP=%{remote_ip}\n' \
  'https://www.loquedigalaia.com/faq/?canonical_probe=doh'
```

```text
DoH apex HTTPS=200 SSL_VERIFY=0 IP=188.114.96.5
DoH www HTTPS=301 LOCATION=https://loquedigalaia.com/faq/?canonical_probe=doh SSL_VERIFY=0 IP=188.114.96.5
```

La propagación recursiva global no se registró aún como cerrada. En la última
ronda antes del relevo, Google estaba limpio pero un nodo anycast de 1.1.1.1
seguía sirviendo parte del TTL antiguo:

```text
$ date -u +%FT%TZ
2026-08-03T18:29:54Z
$ for resolver in 1.1.1.1 8.8.8.8; do
>   for name in loquedigalaia.com www.loquedigalaia.com; do
>     a="$(dig +short @"$resolver" "$name" A | paste -sd, -)"
>     aaaa="$(dig +short @"$resolver" "$name" AAAA | paste -sd, -)"
>     printf '%s %s A=%s; AAAA=%s\n' "$resolver" "$name" "$a" "$aaaa"
>   done
> done
1.1.1.1 loquedigalaia.com A=217.160.0.116; AAAA=2001:8d8:100f:f000::200
1.1.1.1 www.loquedigalaia.com A=188.114.96.5,188.114.97.5; AAAA=2001:8d8:100f:f000::200
8.8.8.8 loquedigalaia.com A=188.114.97.5,188.114.96.5; AAAA=2a06:98c1:3121::5,2a06:98c1:3120::5
8.8.8.8 www.loquedigalaia.com A=188.114.96.5,188.114.97.5; AAAA=2a06:98c1:3121::5,2a06:98c1:3120::5
```

Por ello queda pendiente para quien tome el relevo: obtener dos rondas
consecutivas en 1.1.1.1 y 8.8.8.8 sin ninguna IP de IONOS y después ejecutar
`curl` normal —sin `--resolve` ni `--doh-url`— para apex y `www`.

### Despliegue de Worker y Custom Domains

El primer intento detectó correctamente la colisión con el A de aparcamiento:

```text
$ npx wrangler deploy
...
Hostname 'loquedigalaia.com' already has externally managed DNS records
(A, CNAME, etc). Delete them first or try a different hostname. [code: 100117]
Successful trigger changes were not rolled back.
```

No se ignoró el fallo: se borraron los cuatro registros web de IONOS y se
repitió el despliegue. Resultado final:

```text
$ npx wrangler deploy
...
Deployed loquedigalaia triggers
  https://loquedigalaia.add4u.workers.dev
  loquedigalaia.com (custom domain)
  www.loquedigalaia.com (custom domain)
Current Version ID: c067f344-6513-4aef-9d63-cdf6942da38e
```

Ese despliegue estableció los dominios, pero dejó de ser la versión actual al
detectarse un despliegue concurrente posterior desde la misma cuenta:

```text
$ npx wrangler deployments list
...
Created:     2026-08-03T18:19:24.151Z
Author:      migueld@add4u.com
Version(s):  (100%) 238940d6-a552-4ce5-a917-8485721dc1b0
                 Created:  2026-08-03T18:19:21.891Z
```

Por tanto, todas las comprobaciones finales se repitieron sobre
`238940d6-a552-4ce5-a917-8485721dc1b0`; no se dio por vigente la evidencia de
la versión anterior.

`workers_dev: true` quedó explícito en `wrangler.jsonc`: al añadir rutas,
Wrangler lo deshabilitó por defecto y la comprobación detectó un 404 en la URL
de respaldo:

```text
$ curl -sS -o /dev/null -w 'workers.dev HTTP=%{http_code}\n' \
>   https://loquedigalaia.add4u.workers.dev/
workers.dev HTTP=404
```

El despliegue final la restauró:

```text
$ curl -sS -o /dev/null \
>   -w 'workers.dev HTTP=%{http_code} SSL_VERIFY=%{ssl_verify_result}\n' \
>   https://loquedigalaia.add4u.workers.dev/
workers.dev HTTP=200 SSL_VERIFY=0
```

### Canónica y redirección

Se desplegó en Cloudflare la Single Redirect
`www-to-apex-canonical`: filtro
`http.host eq "www.loquedigalaia.com"`, destino dinámico
`concat("https://loquedigalaia.com", http.request.uri.path)`, código 301 y
conservación de query activada. El listado del panel mostró la regla
`Active`. También se activó `Always Use HTTPS`; el panel confirmó
`checkbox "Always Use HTTPS" [checked]`.

```bash
for host in loquedigalaia.com www.loquedigalaia.com; do
  curl --silent --show-error --head --output /dev/null \
    --resolve "$host:80:188.114.96.5" \
    --write-out "$host HTTP=%{http_code} LOCATION=%{redirect_url} IP=%{remote_ip}\n" \
    "http://$host/faq/?canonical_probe=plain-http"
done
for host in loquedigalaia.com www.loquedigalaia.com; do
  curl --silent --show-error --head --output /dev/null \
    --resolve "$host:443:188.114.96.5" \
    --write-out "$host HTTPS=%{http_code} LOCATION=%{redirect_url} SSL_VERIFY=%{ssl_verify_result} IP=%{remote_ip}\n" \
    "https://$host/faq/?canonical_probe=https"
done
```

```text
loquedigalaia.com HTTP=301 LOCATION=https://loquedigalaia.com/faq/?canonical_probe=plain-http IP=188.114.96.5
www.loquedigalaia.com HTTP=301 LOCATION=https://loquedigalaia.com/faq/?canonical_probe=plain-http IP=188.114.96.5
loquedigalaia.com HTTPS=200 LOCATION= SSL_VERIFY=0 IP=188.114.96.5
www.loquedigalaia.com HTTPS=301 LOCATION=https://loquedigalaia.com/faq/?canonical_probe=https SSL_VERIFY=0 IP=188.114.96.5
```

Se compararon en producción las etiquetas `html lang`, `og:url`,
`canonical` y `alternate hreflang` con el HTML del mismo build en `out/`.
`diff -u` no produjo diferencias y cada página contenía 22 alternates (21
locales más `x-default`):

```bash
set -euo pipefail
probe_file="$(mktemp)"
trap 'rm -f -- "$probe_file"' EXIT
pairs=(
  "/|out/index.html"
  "/manifiesto/|out/manifiesto/index.html"
  "/problemas/|out/problemas/index.html"
  "/como-trabajamos/|out/como-trabajamos/index.html"
  "/pulso/|out/pulso/index.html"
  "/cofundadores/|out/cofundadores/index.html"
  "/faq/|out/faq/index.html"
  "/contacto/|out/contacto/index.html"
  "/respaldo/|out/respaldo/index.html"
  "/aviso-legal/|out/aviso-legal/index.html"
  "/privacidad/|out/privacidad/index.html"
  "/cookies/|out/cookies/index.html"
  "/accesibilidad/|out/accesibilidad/index.html"
  "/en/|out/en/index.html"
  "/zh/|out/zh/index.html"
  "/ja/|out/ja/index.html"
)

for spec in "${pairs[@]}"; do
  IFS="|" read -r route_path local_html <<<"$spec"
  curl --fail --silent --show-error \
    --resolve loquedigalaia.com:443:188.114.96.5 \
    "https://loquedigalaia.com$route_path" --output "$probe_file"
  count="$(rg --only-matching \
    '<link rel="alternate" hreflang="[^"]+" href="[^"]+"' \
    "$probe_file" | wc -l | tr -d ' ')"
  [[ "$count" == "22" ]]
  diff -u \
    <(rg --only-matching \
      '<html lang="[^"]+"|<meta property="og:url" content="[^"]+"|<link rel="(?:canonical|alternate)"[^>]*>' \
      "$local_html" | LC_ALL=C sort) \
    <(rg --only-matching \
      '<html lang="[^"]+"|<meta property="og:url" content="[^"]+"|<link rel="(?:canonical|alternate)"[^>]*>' \
      "$probe_file" | LC_ALL=C sort)
  canonical="$(rg --only-matching \
    '<link rel="canonical" href="[^"]+"' "$probe_file")"
  printf 'OK %s · alternates=%s · %s\n' \
    "$route_path" "$count" "$canonical"
done
```

```text
OK / · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/"
OK /manifiesto/ · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/manifiesto/"
OK /problemas/ · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/problemas/"
OK /como-trabajamos/ · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/como-trabajamos/"
OK /pulso/ · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/pulso/"
OK /cofundadores/ · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/cofundadores/"
OK /faq/ · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/faq/"
OK /contacto/ · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/contacto/"
OK /respaldo/ · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/respaldo/"
OK /aviso-legal/ · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/aviso-legal/"
OK /privacidad/ · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/privacidad/"
OK /cookies/ · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/cookies/"
OK /accesibilidad/ · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/accesibilidad/"
OK /en/ · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/en"
OK /zh/ · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/zh"
OK /ja/ · alternates=22 · <link rel="canonical" href="https://loquedigalaia.com/ja"
```

La comparación confirma el host canónico exigido y que producción coincide con
el pipeline. También hace visible una deuda SEO preexistente: Cloudflare sirve
las portadas como `/en/`, `/zh/` y `/ja/`, mientras el pipeline escribe sus
canónicas sin barra final (`/en`, `/zh`, `/ja`). No se ocultó ni se corrigió en
este cambio de dominio.

### TLS

```text
$ for host in loquedigalaia.com www.loquedigalaia.com; do
>   printf '\n=== %s ===\n' "$host"
>   openssl s_client -connect 188.114.96.5:443 -servername "$host" \
>     -verify_hostname "$host" -verify_return_error -brief </dev/null 2>&1 | \
>     rg '^(Protocol version|Peer certificate|Verification:|Verified peername:)'
> done

=== loquedigalaia.com ===
Protocol version: TLSv1.3
Peer certificate: CN=loquedigalaia.com
Verification: OK
Verified peername: loquedigalaia.com

=== www.loquedigalaia.com ===
Protocol version: TLSv1.3
Peer certificate: CN=loquedigalaia.com
Verification: OK
Verified peername: www.loquedigalaia.com
```

### Dos pasadas limpias tras la propagación de assets

Para separar la propagación de Static Assets de las cachés DNS antiguas se
probaron consecutivamente las dos IP A publicadas por el DNS autoritativo, con
Host y SNI reales. Además del código se exigió una firma de contenido distinta
por ruta, de modo que un 200 de una página de aparcamiento no pudiera pasar.

<details>
<summary>Comando exacto ejecutado</summary>

```bash
set -euo pipefail
probe_file="$(mktemp)"
trap 'rm -f -- "$probe_file"' EXIT
checks=(
  "/|Una factoría de unicornios improbables."
  "/manifiesto/|Manifiesto de Lo que diga la IA"
  "/problemas/|Los problemas que nos importan"
  "/como-trabajamos/|Cómo trabajamos"
  "/pulso/|El pulso de la empresa"
  "/cofundadores/|Cualquiera puede ser cofundador"
  "/faq/|Preguntas y respuestas"
  "/contacto/|Hablemos"
  "/respaldo/|Qué hay detrás"
  "/aviso-legal/|Aviso legal"
  "/privacidad/|Política de privacidad"
  "/cookies/|Política de cookies"
  "/accesibilidad/|Accesibilidad"
  "/en/|A factory of improbable unicorns."
  "/zh/|一座制造不太可能的独角兽的工厂。"
  "/ja/|ありそうにないユニコーンをつくる工場。"
  "/sitemap.xml|<urlset"
  "/llms.txt|# Lo que diga la IA"
)
probe_ips=(188.114.96.5 188.114.97.5)
pass=0

for probe_ip in "${probe_ips[@]}"; do
  pass=$((pass + 1))
  clean=1
  printf '=== PASADA %s · versión 238940d6 · IP %s · %s ===\n' \
    "$pass" "$probe_ip" "$(date -u +%FT%TZ)"

  for spec in "${checks[@]}"; do
    IFS="|" read -r probe_route marker <<<"$spec"
    code="$(curl --silent --show-error --connect-timeout 10 --max-time 30 \
      --resolve "loquedigalaia.com:443:$probe_ip" \
      --output "$probe_file" --write-out '%{http_code}' \
      "https://loquedigalaia.com$probe_route")" || code="curl"
    if [[ "$code" == "200" ]] &&
       rg --fixed-strings --quiet -- "$marker" "$probe_file"; then
      printf 'OK   %s %s\n' "$code" "$probe_route"
    else
      printf 'FAIL %s %s\n' "$code" "$probe_route"
      clean=0
    fi
  done

  code="$(curl --silent --show-error --connect-timeout 10 --max-time 30 \
    --resolve "loquedigalaia.com:443:$probe_ip" \
    --output "$probe_file" --write-out '%{http_code}' \
    https://loquedigalaia.com/noexiste/)" || code="curl"
  if [[ "$code" == "404" ]] &&
     rg --fixed-strings --quiet -- 'Ni la IA sabe dónde está esto.' "$probe_file" &&
     rg --fixed-strings --quiet -- 'Volver a la brújula' "$probe_file"; then
    printf 'OK   404 /noexiste/ · 404 propio\n'
  else
    clean=0
  fi

  [[ "$clean" == "1" ]] || exit 1
  printf 'PASADA %s LIMPIA\n' "$pass"
  [[ "$pass" == "2" ]] || sleep 15
done
printf 'VERIFICADO: versión 238940d6, dos pasadas limpias consecutivas\n'
```

</details>

```text
=== PASADA 1 · versión 238940d6 · IP 188.114.96.5 · 2026-08-03T18:23:48Z ===
OK   200 /
OK   200 /manifiesto/
OK   200 /problemas/
OK   200 /como-trabajamos/
OK   200 /pulso/
OK   200 /cofundadores/
OK   200 /faq/
OK   200 /contacto/
OK   200 /respaldo/
OK   200 /aviso-legal/
OK   200 /privacidad/
OK   200 /cookies/
OK   200 /accesibilidad/
OK   200 /en/
OK   200 /zh/
OK   200 /ja/
OK   200 /sitemap.xml
OK   200 /llms.txt
OK   404 /noexiste/ · 404 propio
PASADA 1 LIMPIA

=== PASADA 2 · versión 238940d6 · IP 188.114.97.5 · 2026-08-03T18:24:04Z ===
OK   200 /
OK   200 /manifiesto/
OK   200 /problemas/
OK   200 /como-trabajamos/
OK   200 /pulso/
OK   200 /cofundadores/
OK   200 /faq/
OK   200 /contacto/
OK   200 /respaldo/
OK   200 /aviso-legal/
OK   200 /privacidad/
OK   200 /cookies/
OK   200 /accesibilidad/
OK   200 /en/
OK   200 /zh/
OK   200 /ja/
OK   200 /sitemap.xml
OK   200 /llms.txt
OK   404 /noexiste/ · 404 propio
PASADA 2 LIMPIA

VERIFICADO: versión 238940d6, dos pasadas limpias consecutivas
```

### Sitemap y llms.txt

Ambos recursos responden 200 y contienen las firmas esperadas. La inspección
también dejó visible un defecto preexistente del generador:

```bash
set -euo pipefail
sitemap_file="$(mktemp)"
llms_file="$(mktemp)"
trap 'rm -f -- "$sitemap_file" "$llms_file"' EXIT
curl --fail --silent --show-error \
  --resolve loquedigalaia.com:443:188.114.96.5 \
  https://loquedigalaia.com/sitemap.xml --output "$sitemap_file"
curl --fail --silent --show-error \
  --resolve loquedigalaia.com:443:188.114.96.5 \
  https://loquedigalaia.com/llms.txt --output "$llms_file"
locs="$(rg --only-matching '<loc>' "$sitemap_file" | wc -l | tr -d ' ')"
alternates="$(rg --only-matching '<xhtml:link ' "$sitemap_file" | wc -l | tr -d ' ')"
not_found="$(rg --only-matching '/_not-found/' "$sitemap_file" | wc -l | tr -d ' ')"
printf 'sitemap.xml HTTP=200 loc=%s alternates=%s _not-found=%s\n' \
  "$locs" "$alternates" "$not_found"
rg --fixed-strings '# Lo que diga la IA' "$llms_file"
rg --fixed-strings 'https://loquedigalaia.com/pulso.json' "$llms_file"
rg --fixed-strings '## Cómo citarnos' "$llms_file"
printf 'llms.txt HTTP=200 firmas=3/3\n'
```

```text
sitemap.xml HTTP=200 loc=294 alternates=6468 _not-found=483
# Lo que diga la IA
- Datos JSON: https://loquedigalaia.com/pulso.json
## Cómo citarnos
llms.txt HTTP=200 firmas=3/3
```

Los 294 `<loc>` son 14 × 21: además de las 13 rutas de contenido, el
generador está incluyendo `/_not-found/` y sus alternates. El recurso está
accesible, pero no se registra como semánticamente limpio. Los `lastmod` se
generan en cada build, por lo que no se afirmó una igualdad byte a byte con un
`out/` recompilado después. La corrección del generador queda como deuda
técnica fuera de esta publicación del dominio.

## 2026-08-04 — ingesta efímera sin commits

Se sustituyó el cron escritor por una única tubería de Actions. El estado entre
ejecuciones viaja en `out/pulso-state.json`; `data/**` solo se modifica en el
runner y Wrangler sigue siendo el último paso.

| Comprobación | Método | Resultado |
|---|---|---|
| Lockfile reproducible | `npm ci` | ✅ 127 paquetes instalados desde lock; Wrangler fijado en `4.118.0` |
| Restauración remota válida | `node --test tests/pulso-state.test.mjs` | ✅ valida el sobre completo antes de escribir y restaura los cuatro ficheros |
| Remoto inválido | mismo test focal | ✅ deja intacto y valida el fallback del repositorio |
| Remoto y fallback inválidos | mismo test focal | ✅ aborta antes del build |
| Checkpoint publicado | mismo test focal | ✅ versión, fecha, pulso, historia, estado de fuentes y consenso presentes |
| Workflow sin escritores Git | `node --test tests/pulso-workflow.test.mjs` | ✅ permisos `contents: read`; ningún `git add`, `commit` ni `push`; orden restore → snapshot → gate → deploy |
| Cron local legado | mismo test + `bash agent/snapshot-cron.sh` | ✅ stub deprecado, no mutante, mensaje claro y código 0 |
| Gate completo final | `npm run gate` | ✅ 54/54 tests; TypeScript, export estático, SEO, axe, 21 locales y checkpoint |
| Coherencia del artefacto | `npm run antes-de-publicar` | ✅ `pulso-state.json.pulso` coincide exactamente con `out/pulso.json`; publicable |
| Primer arranque real | `npm run pulso:restore` contra producción | ✅ `/pulso-state.json` devolvió 404; fallback del repositorio validado y seleccionado |
| Empaquetado Cloudflare | `wrangler 4.118.0 deploy --dry-run` | ✅ 782 assets leídos; terminó sin publicar |
| Extremos públicos | `curl` a raw, Pages y producción | ⚠️ raw ya sirve 2026-08-04 / 550.059.799 tokens; Pages y producción conservan 2026-08-03 / 550.039.338 hasta integrar y ejecutar el canary |
| Despliegue real | no ejecutado en esta rama | ⏳ requiere canary manual de Actions después de integrar |

Salida focal final:

```text
1..9
# tests 9
# pass 9
# fail 0
```

Salida del gate y guardián final:

```text
1..54
# tests 54
# pass 54
# fail 0
i18n-build · 21 locales · 280 HTML generados
pulso-state · checkpoint v1 publicado · 4 indicadores
gate · lint, build estático, tests y checkpoint efímero: OK
Checkpoint del pulso
  ✓ checkpoint v1 válido y coherente con /pulso.json
✓ Publicable.
```

El primer intento de build dentro del sandbox administrado falló porque
Turbopack no podía abrir su puerto local (`Operation not permitted`). Se repitió
el mismo `npm run gate` fuera de ese aislamiento, como exige el entorno, y dio
la salida verde anterior. No fue un fallo de código.

La actualización de `package-lock.json` es grande por el árbol nuevo de
Wrangler/workerd y sus binarios opcionales. Se compararon las versiones de todos
los paquetes comunes antes y después: no cambió ninguna dependencia ya
existente.

Pendiente operativo tras el canary: retirar la entrada del crontab y desactivar
los dos escritores Kimi externos (diario y vigía). No se desactivaron todavía
para no eliminar el camino de recuperación antes de verificar la primera Action.
