# Duelo de Craques

Jogo de conhecimentos de futebol, 1 x 1, jogado dentro de grupos de WhatsApp.
Dois jogadores escalam goleiro, 2 defensores, 2 meias e 1 atacante dentro de um tema
(gols, assistências, valor de mercado, idade…). A IA da Maritaca valida cada jogador e
informa o número dele; vence a melhor soma. Cada etapa chega ao grupo como imagem.

Planejamento completo (pesquisa, regras, imagens, arquitetura, roadmap): [docs/PLANEJAMENTO.md](docs/PLANEJAMENTO.md).

## Stack

Next.js 15 (Vercel) · Neon Postgres · Maritaca AI · Evolution API ou Z-API · Satori (`next/og`) para as imagens.

## Rodando local

```bash
npm install
cp .env.example .env.local   # opcional: sem chaves, roda em modo demo
npm run dev                  # http://localhost:3000  ·  simulador em /jogar
npm test                     # testes do motor do jogo
npm run render:samples       # gera todas as imagens em ./samples
```

Sem `DATABASE_URL` o estado fica em memória; sem `MARITACA_API_KEY` a IA usa um elenco
de demonstração com números aproximados. O simulador `/jogar` exige `ADMIN_KEY`.

## Deploy

1. Importe o repositório na Vercel.
2. Vercel → Storage → Neon, região **São Paulo (aws-sa-east-1)**, a mesma das funções (`gru1` em `vercel.json`). Isso cria `DATABASE_URL`.
3. Configure as variáveis de `.env.example`.
4. Crie as tabelas: `curl -X POST https://SEU-APP/api/admin/migrate -H "Authorization: Bearer $ADMIN_KEY"`
5. No gateway de WhatsApp, aponte o webhook de mensagens para `https://SEU-APP/api/webhook?token=$WEBHOOK_SECRET`.
6. No grupo: `ativar grupo` → `iniciar jogo`.

## Comandos no grupo

`ativar grupo` · `iniciar jogo` · `aceitar` · `regras` · `modos` · `placar` · `ranking` · `tempo` · `cancelar` · `desativar grupo`
