#!/bin/sh
# Atualiza o bot na VPS: baixa a versão nova do GitHub, reconstrói e troca o
# container. Só mexe no projeto "duelo-de-craques".
set -e
cd "$(dirname "$0")/../.."
git pull --ff-only
cd deploy/vps
# Com o Traefik da VPS (docker-compose.traefik.yml), usa os dois arquivos.
if [ -f docker-compose.traefik.yml ] && grep -qE '^TRAEFIK_NETWORK=.+' .env; then
  set -- -f docker-compose.yml -f docker-compose.traefik.yml
fi
docker compose "$@" build bot
docker compose "$@" up -d bot
docker compose "$@" ps bot
