# Plano da próxima fase

> **Andamento (18/11, tarde):** F1 e F2 entregues, com três correções urgentes. Detalhes na seção 8. O plano seguinte (com os números de uso, os dados de 2026 e a Grade nova) está em `PLANO-MELHORIAS-2026.md`.

18/11/2026. Seis frentes:
1. Verificar se tudo subiu.
2. Dados atualizados à mão, com o Transfermarkt como referência.
3. Garantir o jogador correto.
4. Modos novos.
5. Mais conteúdo e variedade nos jogos que já existem.
6. Ajuda em imagem.

## 1. Situação hoje (verificado)

| Item | Estado |
|---|---|
| WhatsApp do número do jogo | Conectado. Depois de reler o QR (17/11), nenhum "Connection Closed" nas 12 h seguintes |
| Base de jogadores | 77.156 e crescendo (carga do Wikidata em andamento) |
| Erros nas últimas 12 h | 4 buscas em que a IA demorou mais de 25 s, 1 erro 502 da Maritaca, 2 reações lentas, 1 imagem que saiu na 2ª tentativa |
| Monitoramento | `https://duelo-de-craques-peach.vercel.app/api/health`: conexão, banco, tamanho da base, andamento da carga e como terminaram as buscas de 24 h (só contagens) |
| Ajuda | Imagem com todos os comandos (`ajuda`); `ajuda texto` continua existindo e é o plano B automático |

### Buscas de jogador nas últimas 24 h (18/11, 11h)

| Resultado | Buscas | % |
|---|---|---|
| Achou na base | 1.062 | 42% |
| A IA achou (entrou na base) | 620 | 25% |
| A IA não achou | 517 | 21% |
| Achou, mas fora do contexto da rodada | 200 | 8% |
| A IA devolveu outro nome (recusado) | 86 | 3% |
| "Não achei" recente | 21 | 1% |

A carga ainda está nos nascidos em dez/1984, na parte "mundo". A maioria dos escolhidos é mais recente e por isso ainda vai para a IA, então a parte da base deve subir bastante quando a carga passar dos anos 1990.

O ponto de atenção são os **21% de "a IA não achou"**. Parte é recusa correta (apelido, erro de digitação, conversa que parece nome); para separar, a rota `GET /api/admin/lookups?resultado=ia-nao-achou` lista os nomes que mais falharam.

## 2. Dados à mão (Transfermarkt)

**Regra:** o Transfermarkt considera os dados dele protegidos e não permite coleta automática nem redistribuição sem autorização ([relato de 2018, citando o próprio Transfermarkt](https://stat.ethz.ch/pipermail/r-package-devel/2018q1/002405.html); os serviços de raspagem também avisam que o cumprimento dos termos é responsabilidade de quem usa, por exemplo o [Apify](https://apify.com/automation-lab/transfermarkt-scraper)). Por isso **o jogo não raspa o site**. Quem atualiza é o admin, olhando o Transfermarkt e digitando o número. Cada valor guarda a fonte e a data ("manual · Transfermarkt · 18/11/2026").

**Prioridade dos dados:** manual > Wikidata > IA. A IA nunca sobrescreve um número manual.

**Ferramentas:**

| Ferramenta | Uso |
|---|---|
| Página `/admin/jogadores` (protegida pela ADMIN_KEY) | Buscar jogador, ver a ficha (clubes, números, fonte e data de cada número), editar, juntar duplicados, marcar "nome famoso aceito" |
| Comando no grupo (só admin) | `corrigir Neymar valor 180`, `corrigir Neymar gols 439`, `corrigir Neymar jogos 742` |
| Planilha | Colar ou enviar um CSV `jogador; dado; valor; data` para atualizar em lote |

**Novos dados:**
- **Valor de mercado atual** (hoje só existe o maior da carreira). Abre o tema novo "Vitrine atual".
- **Data de atualização** de cada número, que aparece no placar final ("números de 18/11/2026").

**Primeira lista (cerca de 500 jogadores):**
- os 300 mais escolhidos no jogo (vêm do registro de buscas);
- os titulares atuais do Brasileirão e das 5 grandes ligas;
- os craques históricos mais usados.

**Ritmo de atualização:**
- **Valor de mercado:** a cada janela de transferências (jan/jul), quando o Transfermarkt costuma revisar.
- **Gols e jogos de quem está em atividade:** uma vez por mês, só os mais usados.

## 3. Jogador correto

**Como medir:** a página de saúde mostra como as buscas terminaram nas últimas 24 h:
- `base` / `base+dado`: achou na base;
- `ia`: a IA pesquisou e o jogador entrou na base;
- `ia-nome-diferente` / `ia-nao-achou` / `nao-achou-recente`: recusado ou não achado;
- `base-fora-do-contexto`: achou o jogador, mas ele não cabe na rodada.

**Metas:**
- ≥ 95% de buscas resolvidas na base;
- ≤ 3% de "não achou" para nome válido.

| # | Ação | Resolve |
|---|---|---|
| 1 | **Preferência pelo Brasil**: entre homônimos igualmente famosos, ganha quem jogou no Brasil ou pela seleção brasileira | "Victor", "Marcos", "Rafael", "Alex" sem contexto |
| 2 | **Juntar duplicados**: a ficha que a IA criou e a do Wikidata da mesma pessoa (mesmo nome e nascimento) viram uma só, sem perder os números | Jogador aparecendo duas vezes |
| 3 | **Nomes famosos aceitos** (lista que o admin edita): exceções à regra quando o nome famoso no Brasil difere do Wikidata | Casos como "Gabigol", se você decidir aceitar |
| 4 | **Correção pelo admin**: "X, nesta posição e clube, é o jogador Z" | Erro pontual corrigido na hora, para todos os grupos |
| 5 | **Transparência sem confirmação**: o placar e o campinho mostram nome completo + clube da rodada | Todo mundo vê quem foi aceito |
| 6 | **IA mais estável**: se a Maritaca demorar, uma nova tentativa no modelo rápido (`sabiazinho-4`); a base cobre quase tudo depois da carga | Os estouros de 25 s e o erro 502 |
| 7 | **Posições**: completar as que faltam no Wikidata (volante, lateral, ponta) e revisar o mapeamento | "É meia e a rodada pede atacante" injusto |
| 8 | **Conjunto de teste com 150 nomes reais** (Victor, Marcos, Fred, Juninho, Ricardinho, Dida, Luizão, Zé Roberto, Thiago Silva, Willian, Alex, Diego, Ronaldo, Rafael...), rodado a cada mudança | Para não regredir |

## 4. Modos novos

Com mais de 77 mil jogadores na base (clubes com datas, seleção, posição), dá para criar jogos que **se geram sozinhos**, sem curadoria e sem repetir.

| Modo | Formato | Como funciona | Conteúdo |
|---|---|---|---|
| **Carreira** | Grupo, corrida | O bot mostra a trajetória: "Paulista → Grêmio → Atlético-MG". Quem acertar primeiro leva. Dicas extras saem com o tempo (seleção, posição, nascimento) | Gerado da base (jogadores conhecidos com 3+ clubes) |
| **Ponte** | Grupo, várias certas | **4 clubes** por rodada (pedido de 18/11): passou pelos 4 = 10 pontos, por 3 = 6, por 2 = 3, por 1 = 1. 1 palpite por pessoa por rodada. Ninguém repete | Validado pela base |
| **Grade 3x3** | 1x1 (jogo da velha) ou grupo | Linhas = clubes, colunas = seleções ou clubes. Cada casa pede um jogador que cumpra os dois. Fechou 3 em linha, venceu | Validado pela base |
| **Pênaltis** | 1x1 | 5 cobranças alternadas. Cada cobrança: cite um jogador que cumpra a regra sorteada ("atacante que jogou no Milan"). Errou, o goleiro defendeu. Empate vai para morte súbita | Validado pela base |
| **Maior ou Menor** | Grupo, eliminação | Dois jogadores: quem tem mais gols, jogos ou valor? Errou, está fora | Números da base (manuais primeiro) |
| **Leilão** | Grupo (4–8) | Orçamento de 300 mi €. Cada rodada é uma posição; lances no chat; o valor do jogador vem do mercado | Precisa do valor de mercado atual (frente 2) |
| **Elenco Campeão** | Grupo, várias certas | "Cite jogadores do Brasil campeão de 2002": lista fechada, ninguém repete | Curado (elencos de Copa, Libertadores, Champions) |
| **Quem sou eu? (números)** | Grupo, corrida | Dicas só com números: nascimento, altura, nº de clubes, gols pela seleção | Gerado da base |

**Ordem sugerida:** Carreira, Ponte, Grade 3x3 e Pênaltis primeiro, porque usam a base e não têm limite de conteúdo. Leilão depois do valor de mercado atual.

## 5. Mais conteúdo e variedade nos jogos que já existem

**a) Sem repetição por grupo.** Tabela `group_seen`: cada pergunta, lista ou bandeira não se repete no mesmo grupo até o banco acabar. O sorteio prioriza o que o grupo ainda não viu. É a mudança que mais aumenta a sensação de variedade.

**b) Conteúdo gerado da base (infinito):**

| Jogo | Geração automática |
|---|---|
| Intruso | 4 jogadores conhecidos que passaram pelo clube X + 1 de fama parecida que nunca jogou lá |
| Conexões | 4 grupos de 4 jogadores de 4 clubes diferentes, sem ninguém que caiba em dois grupos (conferido na base) |
| Quem é? | Dicas montadas da ficha: seleção, posição, década, clubes (do mais obscuro ao mais famoso) |
| Alfabeto, Sobrevivente | "Jogadores que passaram pelo Flamengo com a letra R" e listas de clube conferidas na base, sem depender da IA |

**c) Curadoria: dobrar os bancos.**

| Jogo | Hoje | Meta |
|---|---|---|
| Quiz Relâmpago | 87 | 200 |
| Chute Certo | 72 | 150 |
| Fato ou Fake | 65 | 150 |
| Emoji | 52 | 120 |
| Linha do Tempo | 110 eventos | 250 |
| Quem é? | 63 | 150 |
| Que time é esse? | 33 | 80 |
| Top 10 | 36 | 80 |
| Sobrevivente | 32 | 60 |
| Conexões | 17 | 40 |
| Intruso | 58 | 120 |
| Bandeiraço | 58 | 120 (com estrela desenhada: EUA, China, Vietnã, Chile e Gana completos) |

**d) Variações de regra:**
- número de rodadas no comando (`abrir relâmpago 15`);
- "difícil" em mais jogos;
- semana temática (Libertadores, Copa, anos 90).

## 6. Ajuda em imagem (feito)

`ajuda` manda uma imagem com todos os comandos: os 16 jogos em grupo, o 1x1, os comandos durante o jogo, as categorias e a regra de nomes. Comandos e imagem saem da mesma lista (`src/lib/game/commands.ts`), então nunca ficam diferentes. Se a imagem não sair, vai o texto.

## 7. Fases

| Fase | Entrega |
|---|---|
| **F1** | Dados à mão (página de admin, `corrigir`, CSV, valor atual, prioridade manual); jogador correto (ações 1, 2, 4, 6 e 8); sem repetição por grupo |
| **F2** | Modos Carreira, Ponte, Grade 3x3 e Pênaltis |
| **F3** | Conteúdo gerado da base (Intruso, Conexões e Quem é? automáticos) + curadoria dobrada |
| **F4** | Maior ou Menor, Leilão, Elenco Campeão, Quem sou eu (números), variações de regra |

## 8. Entregue em 18/11 (tarde)

### Correções urgentes

| Problema | Causa | Correção |
|---|---|---|
| **Mensagens vazias num grupo** | As reações (✅ ❌) iam sem o autor da mensagem na chave. Em grupo com ids @lid, o WhatsApp mostra isso como bolha vazia | A reação leva o autor exatamente como veio no webhook. Texto vazio nunca é enviado. Chave de emergência: `WHATSAPP_REACTIONS=0` na Vercel desliga as reações sem mexer no jogo |
| **"Às vezes não puxou os gols do Rogério Ceni"** | (1) Quando a IA respondia "não sei", o vazio ficava gravado para sempre. (2) Quando a IA demorava ou dava erro (6 estouros e um 502 em 24 h), a jogada ficava sem número. (3) Ficha duplicada: a da IA tinha os gols e a do Wikidata, que era a escolhida, não | (1) "Não sei" não é mais gravado: a IA é consultada de novo (com pausa de 10 min). (2) Se o modelo principal falhar, tenta o rápido (`sabiazinho-4`); se ainda assim falhar, usa a soma do Wikidata (clubes + seleção) só naquela jogada. (3) Fichas da mesma pessoa (mesmo nome e nascimento) são juntadas automaticamente, sem perder números. E agora dá para corrigir à mão: `corrigir Rogério Ceni gols 131` |
| **Carga de jogadores parada desde 17/11, 18h26** | A carga gastou a cota diária grátis do QStash (1.000 mensagens). Com isso, a cadeia quebrou e os prazos das rodadas também ficaram sem agendamento por 4 h (as rodadas fechavam só na mensagem seguinte) | A carga usa no máximo 350 mensagens por dia (`IMPORT_DAILY_CALLS`) e faz mais trabalho por mensagem (36 s). O resto da cota fica para os jogos. Passou do limite, o próximo lote fica para 00:05 UTC. Um cron diário da Vercel (00:17 UTC) retoma a carga se ela parar. A página de saúde mostra `lotesHoje`, `proximoLote` e `problemaNaCadeia` |

### F1: dados à mão, jogador correto e sem repetição

- **Prioridade dos números:** manual > Wikidata > IA. A carga do Wikidata nunca apaga um número manual nem um nome famoso aceito.
- **No grupo:**
  - `ficha Rogério Ceni` (qualquer pessoa) mostra clubes, seleção, posição e os números, com ✍️ fonte e data nos manuais;
  - `corrigir Rogério Ceni gols 131` e `corrigir Neymar valor atual 25 fonte Transfermarkt` (só admin);
  - `corrigir Neymar gols apagar` volta para o número automático;
  - `nome famoso Gabigol = Gabriel Barbosa` (só admin).
- **Página do admin:** `/admin/jogadores` (pede a ADMIN_KEY). Busca a ficha, corrige um número, cadastra nome famoso e aceita lote colado (`jogador; dado; valor; data; fonte`).
- **API de lote:** `POST /api/admin/players/manual` com `{"csv": "..."}`.
- **Valor de mercado atual:** novo dado, com o tema 18, **Vitrine Atual** (aposentado vale zero).
- **Jogador correto:**
  - preferência pelo Brasil entre homônimos de fama parecida;
  - junção de duplicados;
  - IA com segunda tentativa no modelo rápido.
- **Sem repetição por grupo** (tabela `group_seen`): em todos os jogos de conteúdo (quiz, emoji, relâmpago, quem é, que time é esse, bandeiraço, intruso, chute certo, sobrevivente, conexões, linha do tempo, fato ou fake, top 10) e nos novos, o sorteio começa pelo que o grupo ainda não viu e depois passa ao que ele viu há mais tempo.

### F2: modos gerados da base

| Comando | Jogo |
|---|---|
| `abrir carreira` | Trajetória de clubes; dicas a cada 25 s (posição e seleção, ano de nascimento, iniciais); 100/70/50/30 pontos; 5 rodadas |
| `abrir ponte` | 4 clubes tirados da carreira de um jogador real (sempre há resposta de 4). Passou pelos 4: 10 pontos, por 3: 6, por 2: 3, por 1: 1. **1 palpite por pessoa por rodada** (nome não encontrado ou já citado não gasta o palpite); o bot reage com 1️⃣ a 4️⃣; ninguém repete; a rodada acaba quando todos responderem ou em 90 s; 4 rodadas |
| `desafio grade` | Jogo da velha 1 x 1: linhas = clubes, colunas = seleções; só entram casas com resposta na base. `A2 Neymar`; errou, perde a vez; 3 em linha vence |
| `desafio pênaltis` | 1 x 1: 5 cobranças para cada, com regra (posição + clube ou seleção); gol ou defesa; termina antes se não der mais para alcançar; morte súbita |

Nesses jogos, entre homônimos com nome válido, o bot fica com quem cumpre a regra da jogada (o benefício da dúvida é de quem joga). A ajuda em imagem já lista os jogos novos.

### Pendências

- A carga de jogadores precisa ser retomada uma vez (ou espera o cron das 00:17 UTC).
- O conjunto de teste com 150 nomes reais (ação 8) depende da base completa; hoje os testes cobrem as regras com fichas de exemplo.
