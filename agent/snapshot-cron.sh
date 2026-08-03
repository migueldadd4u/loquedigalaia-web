#!/bin/bash
# Snapshot diario del pulso — mismo patrón que agent/snapshot-cron.sh de add4u-web.
#
# Qué hace, en orden: trae main, lee el pulso publicado por el front office del
# clon, y si hay datos nuevos válidos los commitea, los sube y publica la web.
# El push a data/** dispara además el workflow de GitHub como red de seguridad,
# pero el despliegue primario se hace aquí porque wrangler ya está autenticado
# en esta máquina (la Action necesita secretos que hoy no están configurados).
#
# Se despliega con `npm run deploy`, NUNCA con `wrangler deploy` a secas: ese
# script pasa por scripts/antes-de-publicar.mjs, que aborta si falta una página
# legal, si un idioma se queda sin traducir o si el sitemap no las lista.
#
# Instalación (una vez):
#   ( crontab -l 2>/dev/null; echo '47 7 * * * /bin/zsh -lc "$HOME/Code/loquedigalaia-web/agent/snapshot-cron.sh" >>"$HOME/Code/loquedigalaia-web/agent/snapshot-cron.log" 2>&1' ) | crontab -
set -u
cd "$(dirname "$0")/.." || exit 1

echo "=== $(date '+%Y-%m-%d %H:%M:%S') ==="

git checkout main --quiet 2>/dev/null
git pull --rebase --autostash || exit 1

node scripts/snapshot.mjs || exit 1

# Solo se publica si el pulso ha cambiado de verdad: si el clon no ha movido
# sus cifras, no se toca producción.
if git diff --quiet data/; then
  echo "sin datos nuevos: no se publica"
  exit 0
fi

git add data/
git commit -m "data: snapshot del pulso (cron)" || exit 1
git push || { git pull --rebase --autostash && git push; }

npm run deploy || exit 1
echo "publicado"
