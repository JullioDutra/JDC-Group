#!/bin/sh
# Atualiza o bot na VPS: baixa a versão nova do GitHub, reconstrói e troca o
# container. Só mexe no projeto "duelo-de-craques".
set -e
cd "$(dirname "$0")/../.."
git pull --ff-only
cd deploy/vps
docker compose build bot
docker compose up -d bot
docker compose ps bot
