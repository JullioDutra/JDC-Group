---
name: transfermarkt-sync
description: Ajuda o admin do Duelo de Craques a atualizar a base de jogadores com o Transfermarkt (totais da carreira). A coleta roda na máquina do admin, não numa sessão do Claude. Use quando o admin pedir para preparar, conferir ou publicar uma atualização do Transfermarkt, ou trouxer uma página salva para ajustar a leitura.
---

# Atualização com o Transfermarkt

Decisão do dono do bot (26/11/2026): os números de carreira vêm do Transfermarkt.
O jogo nunca acessa o site no meio da partida; ele lê a base gerada
(`src/lib/transfermarkt/dados.ts`), que vai junto no deploy.

## Quem roda a coleta: o admin, não o Claude

O robots.txt do Transfermarkt (lido em 26/11/2026) bloqueia nominalmente
agentes de IA (ClaudeBot, Claude-SearchBot, anthropic-ai, ChatGPT-User,
Operator, Devin...). Por isso:

- NÃO rode `npm run tm -- rodar` numa sessão do Claude, nem acesse páginas do
  Transfermarkt daqui (nem para "testar"). Mudar o User-Agent para passar não vale.
- O admin roda na máquina dele. O módulo é um robô comum, com nome próprio, e
  respeita o robots.txt.
- `/ceapi` (histórico de transferências e valor de mercado) é proibido para
  qualquer robô. O módulo registra "(robots.txt)" e segue só com os totais da
  carreira (jogos, gols, assistências, cartões).

## O que o Claude faz

1. Explicar ao admin os comandos (na pasta do projeto, na máquina dele):
   - `npm install`
   - `npm run tm -- status`
   - `npm run tm -- rodar --limite 300` (cerca de 1 hora; retoma de onde parou; para sozinho se o site bloquear)
   - commit e push de `src/lib/transfermarkt/dados.ts`
2. Conferir a leitura: se o relatório tiver muitos "sem leitura", pedir ao admin
   uma página salva pelo navegador dele ("dados detalhados" de um jogador) e
   ajustar `src/lib/transfermarkt/parse.ts` com ela como fixture de teste.
3. Depois do push do admin: `npm test`, `npx next build`, conferir no
   `src/lib/transfermarkt/dados.ts` se os números fazem sentido (amostra de
   craques conhecidos), registrar no plano (`docs/PLANO-MELHORIAS-2026.md`).
4. Prioridade no jogo: correção do admin > Transfermarkt > Wikipédia/Wikidata > IA.
