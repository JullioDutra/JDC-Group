# Busca de jogadores: plano para acabar com "não encontrado" e jogador trocado

Problemas relatados em 17/11/2026, nos primeiros jogos de verdade:
1. Muito "não encontrei" e "não tenho um dado confiável de gols".
2. A pessoa digita um jogador e o bot entende outro.

## 1. Por que acontece (diagnóstico no código)

| # | Causa | Onde | Efeito |
|---|---|---|---|
| 1 | Uma única pergunta à IA pede a identidade **e** 17 números de uma vez, com a ordem "se não souber, use null" | `src/lib/ai/maritaca.ts` (prompt) | A IA devolve muitos campos vazios → "sem dado confiável" (gols, assistências, Libertadores, Brasileirão) |
| 2 | O prompt manda "na dúvida, prefira exists:false" | idem | Jogador real menos famoso, apelido ou grafia diferente vira "não encontrei" |
| 3 | O app aceita qualquer jogador que a IA devolver, sem conferir se o nome tem a ver com o que foi digitado | `src/lib/ai/index.ts` | Digitou X, veio Y, e o jogo segue com Y |
| 4 | O cache guarda por 30 dias o que a IA respondeu, pelo texto digitado, para todos os grupos | `createLookup` + `player_cache` | Um erro de identidade se repete por um mês; "não existe" fica 1 dia |
| 5 | Não há registro das buscas | — | Não dá para medir quantas erram nem quais nomes são problemáticos |

O contexto da jogada (posição + time) já foi incluído em 17/11 e resolve parte do item 3 ("Victor" + goleiro + Atlético-MG). O resto pede as mudanças abaixo.

## 2. A solução, em camadas

### A. Identificar antes de medir
Primeira chamada leve: a IA devolve **até 3 candidatos** (nome, nome completo, posições, seleção, principais clubes, período). O app decide:
- descarta quem não cabe no contexto (posição, clube ou seleção da rodada);
- confere a semelhança com o que foi digitado (sobrenome, apelido, erro de digitação). Se não tiver nada a ver, não aceita;
- **1 candidato claro** → segue;
- **2 ou mais plausíveis** → o bot pergunta, sem tirar a vez:
  `Qual deles? 1) Victor (goleiro · Atlético-MG, 2012–2021)  2) Vitor Roque (atacante · Barcelona)`;
- **nenhum** → "não achei", com a sugestão mais próxima ("você quis dizer Vítor Pereira?").

### B. Base de verdade: Wikidata
Base aberta e gratuita, sem chave, com nome, nascimento, altura, nacionalidade, posição, **lista de clubes com datas** e, para muitos jogadores, jogos e gols por clube.
- Identidade e clubes passam a vir do Wikidata, com a IA só interpretando o que foi digitado.
- A IA fica com o que o Wikidata não tem: assistências, valor de mercado, títulos, gols em Champions, Libertadores e Brasileirão.
- Se o Wikidata não responder, o jogo usa só a IA, como hoje.

### C. Dado do tema com uma segunda pergunta focada
Com o jogador já identificado, uma pergunta só sobre **o número que o tema pede** ("quantos gols Victor Bagy marcou na carreira"), com nome completo, clubes e período, e permissão para a **melhor estimativa**. O valor estimado aparece com `~` na imagem. "Sem dado confiável" só quando a IA disser que não sabe mesmo, ou o número for impossível.

### D. Cache que não perpetua erro
- Versão nova do cache: descarta as fichas atuais (inclui as erradas).
- Chave pela **identidade** (id do Wikidata ou nome completo + nascimento), não pelo texto digitado.
- "Não encontrado" guardado só por 10 minutos.
- Lista curada de nomes ambíguos famosos (Ronaldo, Ronaldinho, Marcos, Fred, Juninho, Victor, Rafael, Dida, Edílson, Zé Roberto...) com a escolha padrão por contexto.
- Correção pelo admin, no grupo: `corrigir Victor = Victor Bagy`. E uma rota `/api/admin/jogador` para ver e apagar uma ficha.

### E. Transparência no chat
- Ao aceitar, o bot diz quem entendeu: `✅ Victor (goleiro · Atlético-MG 2012–2021) · 0 gols`.
- Se não for quem a pessoa quis, ela manda `não é esse` em até 30 s. O bot oferece os outros candidatos, sem perder a vez e sem queimar o nome.

### F. Medir e não regredir
- Tabela `lookup_log`: o que foi digitado, contexto, quem foi escolhido, resultado (ok / ambíguo / não achou / sem dado) e tempo de resposta.
- `/api/admin/status` passa a mostrar as taxas das últimas 24 h e os 10 nomes que mais falharam.
- Conjunto de teste com 150 nomes difíceis (homônimos, apelidos, grafias erradas, jogadores antigos, futebol feminino, nomes em espanhol), rodado a cada mudança.

**Metas:**
- ≥ 95% de identidade correta;
- ≤ 3% de "não encontrado" para jogadores reais;
- ≤ 5% de "sem dado" no tema.

## 3. Fases

| Fase | Entrega | Como testo |
|---|---|---|
| **1** | A (candidatos + checagem do nome + pergunta "qual deles?"), C (pergunta focada no número), D (cache novo, 10 min para "não achou", lista curada, `corrigir`), E (mostra quem entendeu + `não é esse`) | Testes automáticos com a IA simulada |
| **2** | B (Wikidata para identidade, clubes e dados básicos) | Esta sessão não alcança o Wikidata; testo pelo app no ar (rota de admin) depois do deploy |
| **3** | F (registro, taxas no status, conjunto de 150 nomes) e ajuste fino do prompt com os erros reais | Rodando o conjunto contra a IA de verdade, pela Vercel |

**Custo e tempo:** na primeira vez que alguém escolhe um jogador são 2 chamadas em vez de 1 (cerca de 2 a 3 s). Depois, cache. A Maritaca cobra por uso, e a mudança dobra só as consultas de jogadores novos.

## 4. O que ajuda agora

Exemplos reais dos erros: o nome digitado, o tema e o clube ou seleção da rodada, e o que o bot respondeu. Eles entram no conjunto de teste da fase 3.
