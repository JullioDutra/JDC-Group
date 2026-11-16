# Duelo de Craques

Jogo de conhecimentos de futebol, 1 x 1, jogado dentro de grupos de WhatsApp.
Dois jogadores escalam goleiro, 2 defensores, 2 meias e 1 atacante dentro de um tema
(gols, assistências, valor de mercado, idade…). A IA da Maritaca valida cada jogador e
informa o número dele; vence a melhor soma. Cada etapa chega ao grupo como imagem.

## Documentação

| Documento | Conteúdo |
|---|---|
| [docs/PLANEJAMENTO.md](docs/PLANEJAMENTO.md) | Futebol: pesquisa, 17 temas, extras, imagens, arquitetura, revisão técnica, próximos jogos |
| [docs/PLATAFORMA.md](docs/PLATAFORMA.md) | Vários jogos no mesmo número: marca, mecânicas, arquitetura multi-jogo, isolamento, fases |
| [docs/ANIMES.md](docs/ANIMES.md) | Duelo Otaku (planejamento) |
| [docs/CONHECIMENTOS-GERAIS.md](docs/CONHECIMENTOS-GERAIS.md) | Sabichão: Stop, Volta ao Mundo, Brasil de Ponta a Ponta… (planejamento) |
| [docs/MODO-GRUPO.md](docs/MODO-GRUPO.md) | Modo em Grupo: sala de 10–15 com `entrar`, 1 resposta por jogador, respostas repetidas não valem, 14 modos (planejamento) |
| [docs/TOP10.md](docs/TOP10.md) | Top 10: regras, listas no ar e temas planejados |
| [docs/EVOLUTION.md](docs/EVOLUTION.md) | Virada do número do RPG na Evolution sem afetar o bot pessoal |

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
5. Evolution: siga [docs/EVOLUTION.md](docs/EVOLUTION.md). `POST /api/admin/evolution-setup` aponta o webhook só da instância do jogo; `GET /api/admin/status` confere tudo.
6. No grupo: `ativar grupo` → `iniciar jogo`.

## Comandos no grupo

`ativar grupo` · `iniciar jogo` · `aceitar` · `regras` · `modos` · `placar` · `ranking` · `tempo` · `cancelar` · `desativar grupo`

**Em grupo:** `abrir sala` (Escalação em Grupo), `top 10`, `abrir que time é esse`, `abrir quem é` ou `abrir intruso` → cada um manda `entrar` → o anfitrião manda `começar`. Também: `sair`, `placar`, `encerrar`, `pular`.

`iniciar aleatório` sorteia o tema assim que alguém aceita. `iniciar melhor time` (ou `iniciar melhor time votação`) abre o desafio Melhor Time. Na escolha do tema, extras opcionais: `3 cego` (números secretos até o fim), `5 relâmpago` (45 s por jogada).
