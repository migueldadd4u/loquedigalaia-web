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

## Ciclo diario del pulso (F3)

`.github/workflows/pulso.yml` corre cada día a las 05:23 UTC (tras el refresco del frontal público de ClonMADv3): `snapshot.mjs` → si hay datos válidos nuevos, commit de `data/` → gate completo → deploy. Dos condiciones para que el deploy automático se active (decisión de los fundadores):

1. Variable del repo `CF_DEPLOY_ENABLED=true` (*Settings → Variables*).
2. Secreto `CLOUDFLARE_API_TOKEN` con permiso de Workers en la cuenta (*Settings → Secrets*).
3. Variable `CLOUDFLARE_ACCOUNT_ID` con el ID de la cuenta (empieza por `c68c7dde…`; no es secreto, está en la URL del panel de Cloudflare).

Mientras no existan, el workflow hace snapshot + gate y el deploy se hace manual con el comando de arriba. Si la fuente falla 7 ejecuciones seguidas, la Action abre un issue (DATOS.md §6).

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
