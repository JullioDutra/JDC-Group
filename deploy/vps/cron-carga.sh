#!/bin/sh
# Cron diário da carga de jogadores (era o "crons" do vercel.json): se a carga
# parou no meio, retoma de onde parou. Lê CRON_SECRET e BOT_PORT do .env ao lado.
# crontab: 17 0 * * * /opt/duelo-de-craques/deploy/vps/cron-carga.sh
cd "$(dirname "$0")" || exit 1
SECRET=$(grep -E '^CRON_SECRET=' .env | cut -d= -f2-)
PORT=$(grep -E '^BOT_PORT=' .env | cut -d= -f2-)
BIND=$(grep -E '^BOT_BIND=' .env | cut -d= -f2-)
curl -fsS -m 90 -H "Authorization: Bearer ${SECRET}" "http://${BIND:-127.0.0.1}:${PORT:-3010}/api/cron/import"
echo
