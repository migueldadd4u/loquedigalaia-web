# Despliegue

## Estado (03/08/2026)

| Entorno | URL | Estado |
|---|---|---|
| Cloudflare Workers (assets) | https://loquedigalaia.add4u.workers.dev | ✅ **en vivo** — 303 ficheros, 21 idiomas |
| Dominio propio | https://loquedigalaia.com | ⏳ pendiente de dos pasos manuales (abajo) |

Cuenta de Cloudflare: la de `migueld@add4u.com` (`c68c7dde…`). Worker: `loquedigalaia`, configurado en [`wrangler.jsonc`](../wrangler.jsonc).

## Publicar una versión nueva

```bash
npm run build:static && npx wrangler deploy
```

`build:static` genera `out/` (HTML por idioma, espejos Markdown, sitemap, llms.txt) y `wrangler deploy` sube ese directorio como Static Assets. No hay servidor: todo es estático.

Tras desplegar, los primeros minutos algunas rutas pueden devolver 404 mientras el manifiesto de assets se propaga por los nodos de Cloudflare — se estabiliza solo. Comprobado el 03/08: dos pasadas completas sin fallos a los ~2 minutos.

## Runbook del dominio (paso a paso, 03/08)

**Lo que hace un fundador** (3 minutos, en el panel de Cloudflare con la cuenta de `migueld@add4u.com`):

1. *Add a site* → escribir `loquedigalaia.com` → plan **Free**.
2. Cloudflare escanea el DNS actual y muestra **dos nameservers** propios (`algo.ns.cloudflare.com`).
3. Entrar en IONOS → dominio `loquedigalaia.com` → **cambiar los nameservers**: quitar los cuatro `ui-dns.*` y poner los dos de Cloudflare.
4. Avisar. La zona pasa a `active` sola cuando la propagación llega (de minutos a unas horas).

⚠️ Al importar la zona, Cloudflare copiará el registro `A` que hoy apunta a `217.160.0.116` (la página de aparcamiento de IONOS). **Ese registro sobra**: el paso siguiente lo sustituye.

**Lo que hago yo en cuanto la zona esté activa** (un solo comando):

```bash
cd ~/Code/loquedigalaia-web && npx wrangler deploy
```

…tras añadir a `wrangler.jsonc` este bloque, que ya está redactado y solo espera a que exista la zona:

```jsonc
"routes": [
  { "pattern": "loquedigalaia.com", "custom_domain": true },
  { "pattern": "www.loquedigalaia.com", "custom_domain": true }
]
```

Cloudflare crea entonces los registros DNS y el certificado TLS por su cuenta.

## Pasos pendientes para servir en loquedigalaia.com

Hoy el dominio está en **IONOS** con sus nameservers (`ns10xx.ui-dns.*`) y **no existe como zona en Cloudflare** (verificado por API: 0 zonas). El token de `wrangler login` **no tiene permiso para crear zonas** (`com.cloudflare.api.account.zone.create`), así que estos dos pasos los tiene que dar un fundador:

1. **Alta de la zona en Cloudflare** — en el panel: *Add a site* → `loquedigalaia.com` → plan Free. Cloudflare devolverá dos nameservers (algo tipo `xxx.ns.cloudflare.com`).
2. **Cambio de nameservers en IONOS** — sustituir los cuatro `ui-dns` por los dos de Cloudflare. La propagación suele tardar de minutos a unas horas.

## Cuando la zona ya esté activa

Añadir a `wrangler.jsonc` el dominio propio y volver a desplegar:

```jsonc
"routes": [
  { "pattern": "loquedigalaia.com", "custom_domain": true },
  { "pattern": "www.loquedigalaia.com", "custom_domain": true }
]
```

```bash
npx wrangler deploy
```

Cloudflare crea solo los registros DNS y el certificado. Después conviene una regla de redirección de `www` al dominio raíz (o al revés, pero una sola canónica) y comprobar que la canónica del HTML coincide: el pipeline i18n ya escribe `https://loquedigalaia.com/...` en `canonical` y en `hreflang`.

## Verificación posterior obligatoria

```bash
for p in "" en/ zh/ ja/ ko/ tw/ ca/ faq/ pulso/ sitemap.xml llms.txt; do
  printf "%-14s %s\n" "/$p" "$(curl -s -o /dev/null -w '%{http_code}' https://loquedigalaia.com/$p)"
done
```

Todo debe dar 200, y `/noexiste/` debe dar 404 con la página propia.

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
