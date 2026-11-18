# Plano da próxima fase

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
| **Carreira** | Grupo, corrida | O bot mostra a trajetória: "2003 Paulista → 2008 Grêmio → 2012 Atlético-MG". Quem acertar primeiro leva. Dicas extras saem com o tempo (seleção, posição, nascimento) | Gerado da base (jogadores conhecidos com 3+ clubes) |
| **Ponte** | Grupo, várias certas | Dois clubes sorteados: cite um jogador que passou pelos dois. Ninguém repete | Validado pela base |
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
