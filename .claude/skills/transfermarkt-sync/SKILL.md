---
name: transfermarkt-sync
description: Atualiza a base de jogadores do Duelo de Craques com o Transfermarkt (totais da carreira, clubes com empréstimos, valor de mercado), em ritmo lento e respeitando o robots.txt. Use quando o admin pedir para atualizar ou ampliar os dados do Transfermarkt, ver o status da base do Transfermarkt ou incluir mais jogadores nela.
---

# Atualizar a base com o Transfermarkt

Decisão do dono do bot (26/11/2026): os números de jogador vêm do Transfermarkt,
lidos por este módulo. O jogo nunca acessa o site no meio da partida; ele lê a
base gerada (`src/lib/transfermarkt/dados.ts`), que vai junto no deploy.

## Regras (não mudar sem o admin pedir)

- Ritmo: 1 pedido a cada 4 s (mínimo de 2 s no código). Nada de pedidos em paralelo.
- User-Agent do bot e robots.txt respeitado (caminho proibido fica de fora).
- Bloqueio (403, ou 429/503 insistente): o script PARA. Não contornar: nada de
  trocar IP, usar proxy, se passar por navegador ou resolver captcha. Conte ao
  admin e tente outro dia.
- Correção do admin (*corrigir*, *tm*) vale mais que o Transfermarkt; o
  Transfermarkt vale mais que Wikidata, Wikipédia e IA.

## Passos

1. Rede: `curl -s -o /dev/null -w "%{http_code}" https://www.transfermarkt.com/robots.txt`.
   Se o proxy recusar, o host `www.transfermarkt.com` precisa estar liberado no
   ambiente (configuração de rede do ambiente da sessão).
2. Alvos (uma vez, ou para ampliar): `npx tsx scripts/tm-sync.ts alvos --min-fama 30 --max 5000`
   (Wikidata; espera sozinho se o serviço limitar). Para ir mais fundo, rode de
   novo com `--min-fama` menor.
3. Leitura em lotes, em segundo plano: `npx tsx scripts/tm-sync.ts rodar --limite 300`
   (300 jogadores ≈ 1 hora). Retoma de onde parou; salva a cada 10.
4. Conferir: `npx tsx scripts/tm-sync.ts status`; olhar no relatório os "sem
   leitura" (formato da página mudou? então ajustar `src/lib/transfermarkt/parse.ts`
   com uma página real como fixture de teste antes de seguir).
5. `npm test` e `npx next build`; commit de `src/lib/transfermarkt/dados.ts` e
   `data/transfermarkt-alvos.json`; push (o deploy leva a base nova ao bot).
6. Registrar no plano (`docs/PLANO-MELHORIAS-2026.md`): quantos jogadores, data e
   o que ficou de fora.
