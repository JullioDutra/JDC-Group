# Duelo de Craques

- Responda sempre em português (PT-BR).
- **Planejamento de adições:** toda rodada de conteúdo novo (listas, perguntas, jogos) começa com uma seção nova em `docs/PLANO-MELHORIAS-2026.md`. Ela traz o inventário por jogo, as metas, as fontes e o que fica de fora. No fim da rodada, registre o quadro "planejado x entregue" na mesma seção.
- Dado de 2026 só entra com fonte; o que ainda pode mudar (campeonato em andamento, final por jogar) fica de fora até ser confirmado.
- Nunca mexer no bot pessoal de finanças (instância `financas` da Evolution), nem reiniciar o container da Evolution ou os containers do Cadrius.
- Dados do Transfermarkt só por cadastro manual do admin (sem scraping).
- **Novidades com imagem:** toda atualização com mudança que o grupo percebe ganha uma entrada nova no topo de `NEWS` em `src/lib/game/novidades.ts` (id = data da versão; linhas com até 48 letras; `games: ['impostor']` no que for do Impostor). O bot manda a imagem sozinho, uma vez por grupo; o comando *novidades* mostra de novo.
- Testes: `npm test`; build: `npx next build`.
