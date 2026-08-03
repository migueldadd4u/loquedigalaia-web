# Despliegue

## Estado para el relevo (03/08/2026)

| Entrada | Resultado |
|---|---|
| Worker con Static Assets | ✅ `loquedigalaia` · versión actual `238940d6-a552-4ce5-a917-8485721dc1b0` |
| URL de respaldo | ✅ https://loquedigalaia.add4u.workers.dev |
| Dominio canónico | ✅ https://loquedigalaia.com |
| `www` | ✅ `301` permanente a `https://loquedigalaia.com`, conservando ruta y query string |
| Zona de Cloudflare | ✅ activa y autoritativa |
| TLS | ✅ certificado válido para apex y `www` |
| Cachés DNS públicas | ⏳ Google limpio; algunos nodos de 1.1.1.1 aún sirven el TTL antiguo de IONOS |

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

No debe marcarse el cierre global hasta obtener dos rondas consecutivas limpias
en 1.1.1.1 y 8.8.8.8 y un `curl` normal sin `--resolve` ni DNS-over-HTTPS. El
estado exacto que queda pendiente está registrado en `TESTING.md`.

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
npm run gate
node scripts/antes-de-publicar.mjs out
npx wrangler deploy
```

`npm run gate` genera `out/` y ejecuta la suite que cubre todas las rutas y
locales. El guardián vuelve a comprobar las páginas legales, siete rutas
críticas en los 20 prefijos localizados, la presencia de las rutas exigidas en
el sitemap y las traducciones antes del despliegue.

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

## Publicación automática del pulso (desde el 03/08/2026)

El pulso se publica solo, todos los días, en portada y en `/pulso`, en los 21 locales.

| Pieza | Dónde | Cuándo |
|---|---|---|
| **Cron diario (primario)** | `agent/snapshot-cron.sh` en el crontab de esta máquina | 07:47 |
| **Workflow de GitHub (red de seguridad)** | `.github/workflows/deploy.yml` | al tocar `data/**`, a las 07:53 UTC y a mano |

El cron trae `main`, ejecuta `scripts/snapshot.mjs` contra el front office del clon y **solo
si el pulso ha cambiado** commitea, empuja y publica con `npm run deploy` — que pasa por el
guardián `scripts/antes-de-publicar.mjs`. Si el clon no mueve sus cifras, producción no se
toca. El registro queda en `agent/snapshot-cron.log` (no se versiona).

Se despliega desde el cron y no desde la Action porque **wrangler ya está autenticado en
esta máquina**. ⚠️ El workflow de GitHub **todavía no puede desplegar**: el repositorio no
tiene configurados los secretos `CLOUDFLARE_API_TOKEN` ni `CLOUDFLARE_ACCOUNT_ID`
(verificado: 0 secretos). Hasta que un fundador cree el token en el panel de Cloudflare con
permiso «Workers Scripts: Edit» y lo añada en *Settings → Secrets and variables → Actions*,
la red de seguridad no existe: si esta máquina está apagada, el pulso no se actualiza.

## Relevo a Claude

La rama local preparada es `codex/domain-launch`. Solo contiene cambios en
`wrangler.jsonc`, `docs/DESPLIEGUE.md` y `docs/TESTING.md`.

1. Confirmar la rama antes de cualquier `git add`.
2. Rebasar sobre el `origin/main` más reciente y ejecutar `npm run gate` más
   `node scripts/antes-de-publicar.mjs out`.
3. Subir la rama y abrir el PR contra `main`; no hacer cambios directos en
   `main`.
4. Tras integrar el PR, desplegar una única vez desde el `main` fusionado con
   `npx wrangler deploy`.
5. Consultar `npx wrangler deployments list` para fijar el ID realmente vigente
   y repetir dos pasadas limpias de la matriz; otro despliegue invalida las
   pasadas anteriores.
6. Esperar dos rondas DNS públicas limpias y completar en `TESTING.md` los
   `curl` normales finales de apex y `www`.
