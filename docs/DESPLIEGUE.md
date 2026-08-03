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
