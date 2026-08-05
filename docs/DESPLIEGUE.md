# Despliegue

## Estado para el relevo (03/08/2026)

| Entrada | Resultado |
|---|---|
| Worker con Static Assets | ✅ `loquedigalaia` · versión del relevo `238940d6-a552-4ce5-a917-8485721dc1b0`, y `d60afe9e-2a8f-4344-b947-19db2b2bfd5e` tras integrar el PR #7. **No fijes aquí la versión vigente**: el pulso publica solo varias veces al día, así que cualquier ID escrito a mano caduca en horas — consúltala con `npx wrangler deployments list` |
| URL de respaldo | ✅ https://loquedigalaia.add4u.workers.dev |
| Dominio canónico | ✅ https://loquedigalaia.com |
| `www` | ✅ `301` permanente a `https://loquedigalaia.com`, conservando ruta y query string |
| Zona de Cloudflare | ✅ activa y autoritativa |
| TLS | ✅ certificado válido para apex y `www` |
| Cachés DNS públicas | ✅ limpias desde el 03/08 a las 19:35:35Z — A y AAAA correctos para apex y `www` en 1.1.1.1, 8.8.8.8 y 9.9.9.9 |
| `curl` normal (sin `--resolve` ni DoH) | ✅ los cuatro correctos desde el 03/08 a las 20:21:48Z |

La cuenta de Cloudflare es la de `migueld@add4u.com`. La zona delega en:

```text
damien.ns.cloudflare.com
hope.ns.cloudflare.com
```

La publicación que creó los Custom Domains fue
`c067f344-6513-4aef-9d63-cdf6942da38e`. A las 18:19Z otro proceso de la misma
cuenta desplegó `238940d6-a552-4ce5-a917-8485721dc1b0`; se detectó por el
cambio de artefacto y se repitió sobre ella toda la verificación final.

La evidencia completa —DNS, despliegue, canonical/hreflang, TLS y dos pasadas
de toda la matriz requerida— está en [TESTING.md](./TESTING.md).

El cierre global exigía dos rondas consecutivas limpias en 1.1.1.1 y 8.8.8.8 y
un `curl` normal sin `--resolve` ni DNS-over-HTTPS. **Ambas condiciones se
cumplieron el 03/08/2026**: las rondas DNS a las 19:35:35Z y los cuatro `curl`
normales a las 20:21:48Z. La cronología, y por qué el rezagado fue el registro
AAAA y no el A, está en [TESTING.md](./TESTING.md).

## Configuración aplicada

El Worker sirve `out/` como Static Assets. [`wrangler.jsonc`](../wrangler.jsonc)
declara los dos Custom Domains y conserva de forma intencionada la URL
`workers.dev` como respaldo:

```jsonc
"workers_dev": true,
"assets": {
  "directory": "./out",
  "not_found_handling": "404-page"
},
"routes": [
  { "pattern": "loquedigalaia.com", "custom_domain": true },
  { "pattern": "www.loquedigalaia.com", "custom_domain": true }
]
```

La canónica elegida es el dominio raíz. En **Rules → Redirect Rules** hay una
Single Redirect activa llamada `www-to-apex-canonical`:

```text
Filtro:   http.host eq "www.loquedigalaia.com"
Destino:  concat("https://loquedigalaia.com", http.request.uri.path)
Código:   301 Permanent Redirect
Query:    Preserve query string = ON
```

En **SSL/TLS → Edge Certificates**, `Always Use HTTPS` está activado. Por
tanto, HTTP en el apex salta a HTTPS y tanto HTTP como HTTPS de `www` terminan
en el apex seguro, conservando ruta y parámetros.

Esto coincide con el pipeline i18n: los `canonical`, `og:url` y `hreflang`
publicados usan siempre `https://loquedigalaia.com`.

## DNS aplicado

Se eliminaron los cuatro registros importados del aparcamiento de IONOS:

```text
A     @     217.160.0.116
A     www   217.160.0.116
AAAA  @     2001:8d8:100f:f000::200
AAAA  www   2001:8d8:100f:f000::200
```

Los Custom Domains publican ahora las direcciones anycast gestionadas por
Cloudflare para apex y `www`.

Los registros de correo importados se conservaron: los dos MX de IONOS, el TXT
SPF y los CNAME `autodiscover`, `_dmarc` y `_domainconnect`. Estos tres CNAME
quedaron en modo **DNS only**.

## Publicar una versión nueva

Desde el commit que vaya a publicarse —normalmente `main`, después de integrar
el PR— y con el árbol limpio:

```bash
git branch --show-current
git status --short
npm ci
npm run pulso:restore
npm run snapshot:daily
npm run gate
npm run deploy:out
```

`pulso:restore` recupera y valida el checkpoint público de producción; si aún no
existe, valida el fallback versionado en el repositorio. `snapshot:daily`
actualiza el estado únicamente en el árbol de trabajo y, solo ante un consenso
pendiente, realiza una segunda lectura después de cinco minutos. `npm run gate` genera `out/`, ejecuta
la suite que cubre todas las rutas y locales y añade `out/pulso-state.json`.
`deploy:out` pasa el guardián —incluida la igualdad entre el checkpoint y
`/pulso.json`— y usa la versión fijada de Wrangler.

No se debe hacer `git add`, commit ni push de `data/pulso.json`,
`data/history.json`, `data/source-status.json` o `data/pending.json`: en este
modelo son estado efímero del runner. Si cualquier comando anterior falla,
Wrangler no llega a ejecutarse y producción conserva su versión previa.

Después de cada despliegue hay que esperar la propagación del manifiesto de
assets: durante unos dos minutos alguna ruta puede devolver un 404 transitorio.
No se cierra una publicación hasta obtener dos pasadas completas y consecutivas
sin fallos, siguiendo la matriz registrada en [TESTING.md](./TESTING.md).

## Comprobaciones rápidas

```bash
dig +short NS loquedigalaia.com
curl -I http://loquedigalaia.com/
curl -I http://www.loquedigalaia.com/
curl -I https://loquedigalaia.com/
curl -I 'https://www.loquedigalaia.com/faq/?canonical_probe=1'
curl -sS -o /tmp/loquedigalaia-404.html -w '%{http_code}\n' \
  https://loquedigalaia.com/noexiste/
rg -F 'Ni la IA sabe dónde está esto.' /tmp/loquedigalaia-404.html
rg -F 'Volver a la brújula' /tmp/loquedigalaia-404.html
curl -I https://loquedigalaia.com/sitemap.xml
curl -I https://loquedigalaia.com/llms.txt
```

Resultados esperados: ambos HTTP `301` a HTTPS apex; HTTPS apex `200`; HTTPS
`www` `301` al mismo path y query del apex; `/noexiste/` `404`; `sitemap.xml`
y `llms.txt` `200`.

## Observación conocida

El sitemap está accesible, pero el generador actual incluye también
`/_not-found/` y sus variantes localizadas:
294 `<loc>` en vez de las 273 URLs de contenido (13 × 21). Es un defecto SEO
preexistente del generador, no de DNS ni del despliegue. Su corrección queda
como deuda técnica fuera de esta publicación del dominio.

Las portadas localizadas se sirven con barra (`/en/`, `/zh/`, `/ja/`), pero el
pipeline actual genera sus canonical/hreflang sin ella (`/en`, `/zh`, `/ja`).
El host canónico sí es correcto y producción coincide con `out/`; normalizar la
barra final queda como una segunda deuda SEO del pipeline.

## Publicación automática del pulso (modelo sin commits, 04/08/2026)

El pulso se publica todos los días en portada y `/pulso`, en los 21 locales, sin
depender de una máquina encendida y sin ensuciar el historial Git.

| Pieza | Dónde | Cuándo |
|---|---|---|
| **Workflow único** | `.github/workflows/deploy.yml` | push de código a `main`, 04:15 / 10:15 / 16:15 UTC y manual |
| **Checkpoint anterior** | `https://loquedigalaia.com/pulso-state.json` | inicio de cada ejecución |
| **Checkpoint siguiente** | `out/pulso-state.json` | después del build y antes del deploy |

La concurrencia `deploy-produccion` no cancela una publicación en curso y
garantiza una única tubería de producción. El workflow tiene permisos Git de
solo lectura y no contiene comandos `git add`, `commit` ni `push`. Los secretos
`CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` ya están configurados en
Actions; solo se exponen al último paso.

Cloudflare Workers Builds sigue conectado al repositorio para conservar los
checks y las URLs de preview, pero no publica producción: en **Settings → Build**
los comandos de producción y de ramas no productivas son ambos
`npx wrangler versions upload`. Por tanto, Workers Builds solo crea versiones
inertes; la única promoción a producción es `npm run deploy:out` desde esta
Action, después del checkpoint y todos los gates.

El horario son tres pasadas diarias (04:15, 10:15 y 16:15 UTC). La primera
equivale a 05:15 CET / 06:15 CEST y queda siempre después del productor de
ClonMAD, programado a las 03:43 `Europe/Madrid`; las otras dos recogen
publicaciones extraordinarias del frontal y cubren el caso de un schedule que
GitHub retrase o se salte. Una pasada sin datos nuevos es idempotente: parte
del checkpoint de producción y republica exactamente las mismas cifras.

### Retirada de escritores antiguos

La retirada operativa se completó el 4 de agosto de 2026 después del canary de
producción: se eliminó del crontab la entrada de `agent/snapshot-cron.sh` y se
deshabilitaron tanto el escritor diario como el vigía legado de Kimi. La copia
reversible del estado anterior y posterior está en
`/Users/madclon/MADClon-Storage/backups/loquedigalaia-retirada/20260804T114719+0200/`.
El script local permanece como stub deprecado y no mutante por defensa en
profundidad.

### Recuperación

En el primer despliegue, `/pulso-state.json` todavía devolverá 404 y la Action
usará el estado validado del repositorio. A partir de ese despliegue, cada
ejecución hereda el último estado publicado. Si el asset remoto es ilegible o
no cumple el contrato, se usa el fallback del repo; si tampoco es válido, el
workflow falla antes del build. Como Cloudflare sustituye el conjunto de Static
Assets solo al final, un fallo conserva íntegra la producción anterior.
