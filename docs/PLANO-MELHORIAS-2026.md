# Plano de melhorias do Duelo de Craques

18/11/2026. Junta o que foi entregue hoje, o diagnóstico com os números reais de uso e o plano das próximas fases.

> **Atualização de 19/11/2026:** feitos os dois P0:
> - **1 x 1:** prazo automático por jogada; 3 estouros seguidos = W.O.
> - **Intruso:** 1 palpite por pessoa.
>
> Também entraram mais dados de 2026 (seção 6) e um modo novo, o **Leilão de Craques** (seção 7).

## 1. Onde estamos

Números da página de saúde (`/api/health`, campo `partidas`), em 18/11, 15h UTC. É o primeiro levantamento com dados reais.

| Indicador | Valor |
|---|---|
| Partidas desde 16/11 (21h, horário de Brasília) | **205** |
| Terminaram com resultado | 175 (85%) |
| Canceladas ou abandonadas | 28 |
| Últimas 24 h | 158 |
| Grupos que jogaram | 3 |
| Jogadores na base | 77.252 (carga parada desde 17/11; ver 4.1) |

### Uso por jogo

| Jogo | Partidas | Terminadas | Leitura |
|---|---|---|---|
| Escalação em Grupo | 66 | 58 (88%) | O carro-chefe |
| 1 x 1 (iniciar jogo) | 33 | 20 (61%) | **O que mais fica pela metade** |
| Top 10 | 31 | 29 (94%) | Muito jogado: precisava de mais listas (feito: 36 → 78) |
| Ponte | 12 | 12 | Fez sucesso logo no primeiro dia |
| Alfabeto | 12 | 11 | Bom |
| Chute Certo | 9 | 9 | Bom |
| Melhor Time | 6 | 5 | Ok |
| Bandeiraço | 5 | 5 | Ok |
| Grade 3x3, Draft, Relâmpago | 4 cada | todas | Ok |
| Linha do Tempo, Quem é?, Intruso | 3 cada | 3, 2 e **0** | **Intruso: nenhuma terminou** |
| Emoji, Fato ou Fake, Que time é esse?, Conexões, Pênaltis | 2 cada | 1 a 2 | Pouco jogados |

**O que os números dizem:**
1. Os jogos de **lista/ranking** (Top 10, Escalação, Ponte) são os preferidos. Vale investir neles primeiro.
2. O **1 x 1** perde 4 de cada 10 partidas no meio. Ele não tem prazo automático: o relógio só é cobrado quando alguém manda "tempo".
3. O **Intruso** não terminou nenhuma das 3 partidas. As regras (marcar com X, um de cada vez) são as mais complicadas do repertório.
4. Vários jogos foram jogados só 2 vezes. As pessoas não sabem que eles existem: falta divulgação dentro do próprio grupo.

## 2. Entregue hoje

### 2.1 Conteúdo

| Jogo | Antes | Agora | O que entrou |
|---|---|---|---|
| **Top 10** | 36 listas | **78** | Copa 2026 (artilheiros da história e da edição, técnicos, capitães, sedes, estádios das finais), 5 grandes ligas até 2025/26, Copa do Brasil, Libertadores (brasileiros), Champions (artilheiros, técnicos, jogadores com 6 títulos), Mundial de Clubes, Bola de Ouro até 2026, artilheiros da Seleção; geral: Paris 2024, medalhistas brasileiros, tênis, F1, NBA, IBGE 2025, Nordeste, América do Sul, África, EUA, megacidades, desertos, luas, planetas anões, estrelas, ossos, elementos, signos, Bíblia, Harry Potter, Marvel; política: presidentes eleitos desde 1989 |
| Quiz Relâmpago | 87 | **112** | Copa 2026, Champions 2025/26, ligas europeias, Brasileirão 2025, Mundial de Clubes, finais de 2026, eleição de 2026 |
| Fato ou Fake | 65 | **81** | Mitos e verdades de 2025-2026 |
| Chute Certo | 72 | **88** | Números da Copa 2026, títulos atualizados, Paris 2024, IBGE 2025 |
| Linha do Tempo | 110 | **120** | Eventos de 2017 a 2026 |
| Quem é? | 63 | **66** | Lamine Yamal, Harry Kane, Rodri |
| Intruso | 58 | **61** | Campeões de 2025/26 |

### 2.2 Dados de 2026 (pesquisa feita em 18/11)

| Fato | Dado | Fonte |
|---|---|---|
| Copa do Mundo 2026 | **Espanha** 1 x 0 Argentina na prorrogação (Ferran Torres, 106'), 19/07, MetLife Stadium. 3º: Inglaterra | [Wikipédia](https://pt.wikipedia.org/wiki/Final_da_Copa_do_Mundo_FIFA_de_2026) |
| Prêmios da Copa | Melhor jogador: Rodri; artilheiro: Mbappé (10); goleiro: Unai Simón; jovem: Cubarsí | [CNN Brasil](https://www.cnnbrasil.com.br/esportes/futebol/copa-do-mundo/premiacao-da-copa-do-mundo-de-2026-acompanhe-os-vencedores/) |
| Recordes | Mbappé 22 gols em Copas (Messi 21); 308 gols em 104 jogos; Cristiano Ronaldo marcou em 6 Copas | [CNN Brasil](https://www.cnnbrasil.com.br/esportes/futebol/copa-do-mundo/artilharia-publico-e-mais-veja-recordes-quebrados-na-copa-do-mundo-de-26/) |
| Brasil na Copa | Eliminado nas oitavas: Noruega 2 x 1 (2 gols de Haaland). Ancelotti segue no cargo | [CBF](https://www.cbf.com.br/selecao-brasileira/noticias/selecao-masculina/a/ancelotti-lamenta-eliminacao-do-brasil-na-copa-do-mundo) |
| Champions 2025/26 | **PSG** 1 x 1 Arsenal (4 x 3 nos pênaltis), 30/05, Budapeste. Artilheiro: Mbappé (15) | [Wikipédia](https://pt.wikipedia.org/wiki/Liga_dos_Campe%C3%B5es_da_UEFA_de_2025%E2%80%9326) |
| Ligas 2025/26 | Arsenal, Barcelona, Inter (21º), Bayern (35º), PSG (14º). Liga Europa: Aston Villa. Conference: Crystal Palace | [Olympics.com](https://www.olympics.com/pt/noticias/futebol-europeu-temporada-2025-2026-lista-campeoes) |
| Bola de Ouro 2026 | **Harry Kane** (2º Mbappé, 3º Yamal). Feminina: Alexia Putellas. Kopa: Yamal | [CNN Brasil](https://www.cnnbrasil.com.br/esportes/futebol/futebol-internacional/bola-de-ouro-2026-acompanhe-os-vencedores-e-toda-a-premiacao/) |
| Brasileirão 2025 | Flamengo campeão; artilheiro Kaio Jorge (21) | [Gazeta Esportiva](https://www.gazetaesportiva.com/campeonatos/brasileiro-serie-a/artilharia-brasileirao-2025/) |
| Libertadores 2026 | Final **Palmeiras x Estudiantes**, 28/11, Centenário (Montevidéu) | [CONMEBOL](https://www.conmebol.com/noticias/venta-de-entradas-para-hinchas-de-los-clubes-finalistas-de-la-conmebol-libertadores-2026/) |
| Copa do Brasil 2026 | Final **Palmeiras x Grêmio**, jogo único, 06/12, Mané Garrincha | [GC+](https://gcmais.com.br/noticias/2026/11/09/final-da-copa-do-brasil-2026-veja-data-local-e-times-classificados) |
| Eleição 2026 | Lula reeleito com 51,79% contra Flávio Bolsonaro, 25/10 (Flávio contestou o resultado) | [TSE](https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/presidente-do-tse-anuncia-reeleicao-de-lula-e-faz-balanco-do-2o-turno-das-eleicoes-2026) |
| IBGE 2025 | Brasil com 213,4 milhões; São Paulo (cidade) com 11,9 milhões | [IBGE](https://agenciadenoticias.ibge.gov.br/pt/agencia-noticias/44305-populacao-estimada-do-pais-chega-a-213-4-milhoes-de-habitantes-em-2025.html?lang=pt-BR) |

**Ficou de fora, de propósito, por falta de fonte firme:**
- Brasileirão 2026, ainda em disputa;
- valores de mercado (as fontes divergem entre si);
- transferências de 2026 (valores conflitantes);
- jogos de cada um em Copas.

### 2.3 Grade 3x3 mais difícil

- **Linhas:** clubes (agora também os de nível 2: Napoli, Roma, Sevilla, Valencia, Marseille, Lyon, Sporting, Celtic...) ou uma **liga** (Premier League, LaLiga, Serie A, Bundesliga, Ligue 1, Brasileirão, Liga Portuguesa, Campeonato Argentino).
- **Colunas:** sempre uma **seleção** e um **título**. A terceira coluna é outra seleção, outro título ou uma liga.
- **Títulos:**
  - Campeão do Mundo: elencos campeões de 1958 a 2026, 309 nomes;
  - Bola de Ouro: os 48 vencedores, de 1956 a 2026;
  - Campeão da Champions: 441 nomes, por clube;
  - Campeão da Libertadores: 276 nomes, por clube.
- **Sem confusão de homônimos:** o nome vale junto com a seleção ou com o clube do título ("Ronaldo" do Brasil é campeão do mundo; Cristiano Ronaldo, não).
- **Fora da lista:** a IA confere com uma pergunta de sim ou não. A resposta fica guardada, e na dúvida não vale.
- **Toda casa tem resposta:** a grade é montada com a amostra da base mais os campeões das listas, e cada casa precisa de pelo menos 2 jogadores que a cumpram.

## 3. Melhorias por jogo

| # | Jogo | Problema ou oportunidade | Proposta | Prioridade |
|---|---|---|---|---|
| 1 | **1 x 1** | 39% não terminam | Prazo automático por jogada (QStash, como nas salas): aviso aos 60 s; aos 90 s, a vez passa com o pior valor do tema. 3 vezes sem jogar: derrota por W.O. | **P0** |
| 2 | **Intruso** | 0 de 3 terminadas | Regra nova e simples: cada um dá **1 palpite** (a letra do intruso); quem acertar pontua, e o mais rápido ganha bônus. A regra antiga vira "intruso clássico" | **P0** |
| 3 | Top 10 | O mais jogado em grupo | Dica automática aos 2 min (iniciais de uma posição escondida); "top 10 difícil" (listas sem os 3 primeiros); listas temáticas por clube ("os 10 maiores artilheiros do Flamengo") | P1 |
| 4 | Ponte | Fez sucesso | Modo "ponte relâmpago" (3 clubes, 45 s); bônus de +2 para quem achar um nome que ninguém mais achou | P1 |
| 5 | Grade | Agora é mais difícil | Opção `desafio grade fácil` (só clubes e seleções); permitir "roubar" uma casa do adversário com um jogador mais famoso; mostrar no fim um exemplo de resposta para cada casa vazia | P1 |
| 6 | Escalação | O carro-chefe | Mostrar o número de cada um ao vivo (hoje só no fim, no modo cego); tema "Vitrine Atual" no sorteio | P2 |
| 7 | Carreira, Pênaltis | Novos, pouco conhecidos | Divulgar (ver 4.3) | P1 |
| 8 | Emoji, Conexões, Fato ou Fake | Pouco jogados | Entram no "desafio do dia" (ver 4.3) | P2 |

## 4. Plano por fases

### 4.1 Fase A: esta semana (estabilidade)

| Ação | Por quê | Como medir |
|---|---|---|
| Retomar a carga de jogadores (um comando, ou o cron das 00:17 UTC) | A base parou em 77 mil. Com ela andando, os nomes mais novos saem da base e não da IA | `jogadoresNaBase` subindo; `lotesHoje` ≤ 350 |
| Acompanhar as mensagens vazias | A correção das reações já está no ar | Ninguém relatando mais. Se voltar: `WHATSAPP_REACTIONS=0` |
| Prazo automático no 1 x 1 | Ver 3.1 | 1 x 1 terminadas ≥ 85% |
| Intruso com regra nova | Ver 3.2 | Intruso terminadas ≥ 80% |
| **Atualizar conteúdo nas datas** | O que muda logo | Ver 4.5 |

### 4.2 Fase B: próximas 2 semanas (conteúdo que não acaba)

1. **Intruso gerado da base:** 4 jogadores conhecidos que passaram pelo clube X + 1 de fama parecida que nunca jogou lá.
2. **Conexões geradas:** 4 grupos de 4 jogadores de 4 clubes diferentes, conferidos para ninguém caber em dois grupos.
3. **Quem é? gerado:** dicas montadas da ficha, do mais vago ao mais claro (seleção, posição, década, clubes).
4. **Top 10 por clube, gerado da base:** "os 10 jogadores mais famosos que passaram pelo Vasco" (ordem pela fama na Wikipédia). Faz o Top 10 durar indefinidamente.
5. **Curadoria dobrada nos menores bancos:**

| Jogo | Hoje | Meta |
|---|---|---|
| Conexões | 17 | 40 |
| Sobrevivente | 32 | 60 |
| Emoji | 52 | 100 |
| Que time é esse? | 33 | 60 |

### 4.3 Fase C: engajamento (3 a 4 semanas)

| Ideia | Como funciona |
|---|---|
| **Desafio do dia** | Todo dia, em hora sorteada, o bot posta um desafio rápido (1 pergunta de Relâmpago, Fato ou Fake ou Chute Certo). Valem as respostas dos primeiros 10 minutos. Isso divulga os jogos pouco usados |
| **Ranking semanal em imagem** | Domingo à noite: os 5 que mais venceram na semana, o "craque da semana" e o jogo mais jogado |
| **Temporadas** | Ranking zera a cada mês, com o campeão do mês registrado ("Hall da Fama") |
| **Conquistas** | Selos: "10 vitórias na Grade", "Pênalti perfeito (5/5)", "Cravou o Chute Certo". Comando `perfil` mostra os selos |
| **Sugestão de jogo** | Ao fim de uma partida: "Gostou? Experimente *abrir carreira*" (gira pelos jogos menos jogados no grupo) |

### 4.4 Fase D: modos novos (mês seguinte)

| Modo | Formato | Observação |
|---|---|---|
| Maior ou Menor | Grupo, eliminação | Dois jogadores: quem tem mais gols, jogos ou valor? Usa os números da base (manual primeiro) |
| Leilão | Grupo (4 a 8) | Orçamento de 300 mi €; precisa do valor de mercado atual (tema Vitrine Atual) |
| Elenco Campeão | Grupo, várias certas | "Cite jogadores do Brasil de 2002". Já temos 309 nomes de elencos campeões do mundo nas listas da Grade |
| Quem sou eu? (números) | Corrida | Dicas só com números: nascimento, altura, nº de clubes, gols pela seleção |
| Bolão de jogos reais | Grupo | Palpites para as finais da semana (Libertadores 28/11, Copa do Brasil 06/12), com pontos no ranking. Depende de digitar o resultado à mão (admin) |

### 4.5 Calendário de atualização do conteúdo

| Quando | O que atualizar |
|---|---|
| **28/11/2026** | Campeão da Libertadores (Palmeiras x Estudiantes): Relâmpago, lista "Clubes com mais Libertadores" e Fato ou Fake |
| **06/12/2026** | Campeão da Copa do Brasil (Palmeiras x Grêmio): lista "Maiores campeões da Copa do Brasil" (hoje até 2024; falta conferir 2025) |
| **Dezembro de 2026** | Campeão e artilheiro do Brasileirão 2026 (Flamengo e Palmeiras disputavam; Viveros, Pedro e Gabigol na artilharia) |
| Janeiro e agosto | Janela de transferências: clubes atuais dos craques e valores de mercado (`corrigir ... valor atual`) |
| Maio e junho | Campeões europeus e da Champions |
| Setembro e outubro | Bola de Ouro |
| A cada 6 meses | Revisar as listas com "até 20XX" no título |

### 4.6 Qualidade e operação

- **Conjunto de 150 nomes reais** (Victor, Marcos, Fred, Juninho...) rodado a cada mudança, depois que a base completar.
- **Alerta** quando a página de saúde mostrar WhatsApp fora, `problemaNaCadeia` preenchido ou mais de 5% de buscas "ia-nao-achou" numa hora.
- **Painel** na página `/admin/jogadores` com as partidas por dia e por jogo (os mesmos números da saúde, em gráfico).

## 5. Metas para dezembro

| Indicador | Hoje | Meta |
|---|---|---|
| Partidas terminadas | 85% | ≥ 92% |
| 1 x 1 terminadas | 61% | ≥ 85% |
| Jogos com pelo menos 10 partidas | 5 de 22 | 12 de 22 |
| Buscas resolvidas na base | 43% | ≥ 90% (depende da carga) |
| Listas do Top 10 | 78 | 120 (com as geradas por clube, sem limite) |

## 6. Mais dados de 2026 (19/11)

| Área | O que entrou |
|---|---|
| Futebol brasileiro | Copa do Brasil 2025 (Corinthians tetra sobre o Vasco); Copa Intercontinental 2025 (PSG nos pênaltis sobre o Flamengo); estaduais de 2026 (Palmeiras, Flamengo, Cruzeiro, Grêmio); final da Sul-Americana 2026 (Atlético-MG x Boca, 21/11) |
| Copa e Bola de Ouro | Os 4 primeiros da Copa de 2026 e o pódio da Bola de Ouro 2026 no Top 10 |
| Outros esportes | Grand Slams de 2026 (Alcaraz, Sinner, Zverev, Rybakina); Super Bowl LX (Seahawks 29 x 13); NBA 2026 (Knicks, MVP Brunson); F1 2026 (Kimi Antonelli); ouro inédito do Brasil no inverno (Lucas Pinheiro Braathen, slalom gigante) |
| Cultura | Oscar 2026 ("Uma Batalha Após a Outra"; Michael B. Jordan; "Guerreiras do K-pop"; "Valor Sentimental"); BBB 26 (Ana Paula Renault); Carnaval do Rio 2026 (Viradouro, por 0,1 ponto) |

| Jogo | Novos itens |
|---|---|
| Quiz Relâmpago | +23 |
| Fato ou Fake | +11 |
| Chute Certo | +9 |
| Linha do Tempo | +6 |
| Top 10 | +2 listas; Copa do Brasil atualizada até 2025 |

**Fontes:**
- [Olympics.com, tênis 2026](https://www.olympics.com/pt/noticias/tenis-campeoes-cada-torneio-atp-wta-temporada-2026)
- [COB, Braathen](https://www.cob.org.br/comunicacao/noticias/lucas-pinheiro-braathen-e-ouro-para-o-brasil-em-milao-cortina-2026)
- [CBS, Super Bowl](https://www.cbssports.com/nfl/news/super-bowl-results-winners-mvps-history-full-list/)
- [NBA.com, Finals MVP](https://www.nba.com/news/jalen-brunson-wins-bill-russell-trophy-as-2026-nba-finals-mvp)
- [CNN Brasil, Oscar 2026](https://www.cnnbrasil.com.br/pop/cinema/oscar-2026-confira-a-lista-completa-de-vencedores/)
- [Exame, BBB 26](https://exame.com/pop/quem-ganhou-o-big-brother-brasil-26-vencedora-faturou-maior-premio-da-historia-do-programa/)
- [CNN Brasil, Carnaval 2026](https://www.cnnbrasil.com.br/entretenimento/carnaval/carnaval-2026-unidos-do-viradouro-e-campea-do-grupo-especial-do-rj/)
- [CNN Brasil, Copa do Brasil 2025](https://www.cnnbrasil.com.br/esportes/futebol/copa-do-brasil/tetracampeao-corinthians-supera-o-vasco-e-leva-o-titulo-da-copa-do-brasil/)
- [Olympics.com, Intercontinental](https://www.olympics.com/en/news/2025-fifa-intercontinental-cup-psg-beat-flamengo)
- [CNN Brasil, estaduais](https://www.cnnbrasil.com.br/esportes/futebol/campeonatos-estaduais-conhecem-seus-campeoes-veja-resumo-das-finais/)
- [F1Mania, F1 2026](https://www.f1mania.net/f1/confira-a-classificacao-do-campeonato-da-f1-2026-apos-o-gp-do-brasil/)
- [Gazeta Esportiva, Sul-Americana](https://www.gazetaesportiva.com/campeonatos/copa-sulamericana/atletico-mg-x-boca-juniors-final-copa-sul-americana-2026/)

**Ficou de fora por falta de confirmação:** a campeã de Wimbledon feminino e o resultado da final da Sul-Americana (21/11). Ela entra no calendário de atualização junto com a Libertadores (28/11) e a Copa do Brasil (06/12).

## 7. Modo novo: Leilão de Craques (`abrir leilão`)

Um jogo de mercado, diferente de todos os de pergunta.

- **Moedas e time:** cada um (2 a 8 pessoas) começa com 100 moedas e monta um time de 4.
- **Lotes:** o bot leiloa craques da base, um por vez, com 30 s por lote. Os lotes têm N + 1 craques de cada posição (N = número de pessoas), então todo mundo consegue fechar o time.
- **Lance:** mande só o número ("15"). Ele precisa cobrir o anterior, e você guarda 1 moeda para cada vaga que ainda falta. O bot reage com 💰.
- **Venda:** no fim do tempo, quem deu o maior lance leva o craque. O anfitrião pode bater o martelo antes com *pular*.
- **Overall escondido:** cada craque tem um overall de 60 a 99, que mede a fama dele no mundo (número de Wikipédias com artigo). O número fica escondido até o fim: o jogo é saber quem vale mais.
- **Resultado:** soma do overall + 10 para quem tiver GOL, DEF, MEI e ATA. No empate, vence quem gastou menos.

## 8. Modo novo: Anagrama (`abrir anagrama`)

Jogo em grupo: quem desembaralha mais palavras vence.

- **Conteúdo:** 267 palavras em 13 temas. Futebol: clube brasileiro, clube do exterior, craque brasileiro, craque do mundo, seleção e coisas do futebol. Geral: capital, estado, cidade brasileira, animal, fruta ou comida, profissão e artista brasileiro.
- **Escolha do tema:** `abrir anagrama` mistura tudo; `abrir anagrama futebol` e `abrir anagrama geral` filtram. As palavras já vistas no grupo ficam para depois.
- **Rodadas:** 12 rodadas de 40 s. As letras vêm em maiúscula e sem acento, com o tema e o número de letras. Nomes de duas palavras são embaralhados palavra por palavra.
- **Pontos:** 100 para quem acerta na primeira metade do tempo e 60 depois. Com 20 s, sai a dica com a primeira letra.
- **Palpites:** 3 por pessoa em cada rodada. Mensagem com tamanho bem diferente da resposta é tratada como conversa e não gasta palpite.

## 9. Modo novo: Top 100 do Dia (`top 100`)

O desafio diário: uma lista de 100 itens, a mesma para todos os grupos, e cada grupo só pode jogar uma vez por dia.

- **Pontos = posição:** quem acerta o 63º ganha 63 pontos. O fundo da lista vale mais porque é mais difícil.
- **Vidas:** 10 palpites errados por pessoa. Um erro que alguém já tinha dito não gasta vida.
- **Tempo:** 8 minutos. Quem mandar um palpite com o jogo rolando já entra.
- **Imagem:** grade 10 x 10 que vai sendo pintada com a cor de quem acertou. Sai no início, a cada 25 acertos e no fim, com a lista completa.
- **Troca da lista:** à meia-noite de Brasília. Se o grupo tentar jogar de novo no mesmo dia, o bot avisa que amanhã tem lista nova.
- **Listas (uma por dia, em rodízio):**
  1. *O Maior Brasileiro de Todos os Tempos* (votação do SBT, 2012). Chico Xavier vale 1 ponto; os outros 11 finalistas valem 2 (a ordem deles não foi divulgada). Dedé é o 63º e Ivete Sangalo a 43ª.
  2. *Os 100 municípios mais populosos* (Censo 2022 do IBGE).
  3. *Os 100 maiores países em área* (ONU).
  4. *Os 100 primeiros elementos da tabela periódica.*
  5. *Os 100 primeiros Pokémon da Pokédex.*
- **Próximas listas:** países por população, artilheiros da história do Brasileirão, clubes com mais títulos e músicas mais tocadas do ano.

**Acesso à Wikipédia:** as listas vêm de páginas da Wikipédia. O ambiente desta sessão é o "JDC-Group" e libera só `pt.wikipedia.org` e `en.wikipedia.org`. A API limita as chamadas, então os downloads são lentos e com pausa. Os dados são gravados no código (`top100-wiki.ts`); o bot não consulta a Wikipédia enquanto roda.

## 10. Mais dados de 2026, rodada 3 (19/11)

| Jogo | Novos itens |
|---|---|
| Quiz Relâmpago | +13 (campanha do Brasil na Copa de 2026, semifinais, estreantes Cabo Verde, Uzbequistão e Jordânia, The Best 2025, artilheiro da Libertadores 2025) |
| Fato ou Fake | +6 |
| Chute Certo | +5 |
| Top 10 | "Top 10 da Bola de Ouro de 2026" (Kane, Mbappé, Yamal, Rodri, Messi, Kvaratskhelia, Dembélé, Haaland, Olise, Fabián Ruiz), no lugar do pódio; "Adversários do Brasil na Copa de 2026" (Marrocos, Haiti, Escócia, Japão, Noruega) |

**Fontes:**
- [Metrópoles, Bola de Ouro 2026](https://www.metropoles.com/esportes/kane-mbappe-e-yamal-confira-a-classificacao-final-da-bola-de-ouro-2026)
- [Band, Bola de Ouro 2026](https://www.band.com.br/esportes/futebol/bola-de-ouro-2026-veja-os-rankings-masculino-e-feminino)
- [FIFA, The Best 2025](https://www.fifa.com/pt/the-best-fifa-football-awards/2025/articles/the-best-fifa-2025-todos-vencedores-dembele-bonmati-luis-enrique-wiegman)
- [Olympics.com, Brasil na Copa 2026](https://www.olympics.com/pt/noticias/copa-do-mundo-2026-brasil-locais-datas-jogos-cruzamentos-selecao-brasil)
- [Lance, jogos da Copa 2026](https://www.lance.com.br/lancepedia/copa-do-mundo-de-2026-jogos-resultados.html)
- [Gazeta Esportiva, semifinais](https://www.gazetaesportiva.com/campeonatos/copa-do-mundo/saiba-classificados-e-confrontos-das-semifinais-da-copa-do-mundo/)
- [Metrópoles, seleções estreantes](https://www.metropoles.com/esportes/confira-as-cinco-selecoes-estreantes-nesta-copa-do-mundo-de-2026)
- [Goal, artilheiros da Libertadores 2025](https://www.goal.com/br/listas/artilheiros-copa-libertadores-2025/blt623e9e4058612fc8)
- [CBF, eliminação do Brasil](https://www.cbf.com.br/selecao-brasileira/noticias/selecao-masculina/a/ancelotti-lamenta-eliminacao-do-brasil-na-copa-do-mundo)
- Wikipédia: "O Maior Brasileiro de Todos os Tempos", "Lista de municípios do Brasil por população" e "Lista de Estados por área territorial".

## 11. Planejamento de adições, rodada 4 (19/11)

> **Regra fixa:** toda rodada de conteúdo começa por esta seção. Primeiro o inventário, as metas e as fontes; depois a adição; no fim, o quadro "planejado x entregue". Dado que ainda pode mudar (campeonato em andamento, final que não aconteceu) fica de fora até ser confirmado.

### 11.1 Inventário e metas

| Jogo | Hoje | Meta | Foco |
|---|---|---|---|
| Top 100 do Dia | 5 listas | 15 | futebol (Brasileirão, seleções), música brasileira, mundo |
| Conexões | 17 | 29 | é o jogo com menos conteúdo |
| Emoji | 52 | 72 | clubes, filmes, novelas, músicas |
| Intruso | 61 | 73 | 2026 e clássicos |
| Quem é | 66 | 78 | craques em atividade e ídolos |
| Sobrevivente | 32 | 40 | listas longas (muitos acertos possíveis) |
| Anagrama | 267 | 340 | temas novos: país, esporte, marca, novela/filme |
| Quiz Relâmpago | 148 | +15 | dados de 2026 |
| Fato ou Fake | 98 | +10 | dados de 2026 |
| Chute Certo | 102 | +6 | dados de 2026 |
| Linha do Tempo | 126 | +10 | dados de 2026 |
| Top 10 | 81 listas | +3 | dados de 2026 |
| Que time é esse | 33 | próxima rodada | exige escalação conferida jogador a jogador |
| Bandeiraço | 58 | próxima rodada | cada bandeira é desenhada no código |

### 11.2 Top 100: listas planejadas

| Lista | Fonte | Tipo |
|---|---|---|
| Maiores artilheiros da história do Brasileirão | Wikipédia (pt) | pessoas |
| Jogadores com mais jogos por seleções | Wikipédia (en) | pessoas |
| Maiores artilheiros de seleções | Wikipédia (en) | pessoas |
| Os 100 maiores artistas da música brasileira | Rolling Stone Brasil (2008), via Wikipédia | pessoas |
| As 100 maiores vozes da música brasileira | Rolling Stone Brasil (2012), via Wikipédia | pessoas |
| As 100 maiores músicas brasileiras | Rolling Stone Brasil (2009), via Wikipédia | coisas |
| Os 100 maiores discos da música brasileira | Rolling Stone Brasil (2007), via Wikipédia | coisas |
| Os 100 países mais populosos | Wikipédia (pt) | coisas |
| Quadro de medalhas olímpicas de todos os tempos | COI, via Wikipédia (en) | coisas |
| As 100 maiores economias (PIB) | FMI, via Wikipédia (en) | coisas |

O rodízio alterna futebol, música e geral, para dois dias seguidos não caírem no mesmo assunto. A ordem fica em `ROTATION` (`src/lib/party/content/top100.ts`) e começa em 19/11/2026.

### 11.3 Dados de 2026 conferidos (entram nesta rodada)

- **Futebol:**
  - Supercopa do Brasil: Corinthians 2 x 0 Flamengo, em Brasília (1º/2).
  - Recopa: Lanús sobre o Flamengo, na prorrogação no Maracanã.
  - Copa do Nordeste: Vitória penta, com gol de Renato Kayzer no fim.
  - Brasileirão Feminino: São Paulo campeão sobre o Corinthians, com recorde de 49.405 pessoas no MorumBIS e fim do hexa corintiano.
  - Série B 2026: Novorizontino campeão (título inédito), Juventude com o acesso direto e mata-mata do 3º ao 6º.
  - Libertadores: Palmeiras eliminou LDU e Fluminense nos pênaltis e chegou à 8ª final.
  - Mercado: Enzo Fernández do Chelsea para o Manchester City no último dia da janela, igualando o recorde britânico.
  - Seleção: Ancelotti anunciou o fim do ciclo de Neymar.
- **Outros esportes:** Wimbledon feminino, com Linda Noskova sobre Muchová.
- **Cultura e ciência:**
  - Grammy: álbum do ano de Bad Bunny ("DeBÍ TiRAR MáS FOTOS"), gravação do ano "Luther" e Caetano e Bethânia premiados.
  - Eurovision: Bulgária, com Dara e "Bangaranga", em Viena.
  - Artemis II: Wiseman, Glover, Koch e Hansen; volta em 10/4.
  - Nobel da Paz: Navi Pillay. Nobel de Medicina: optogenética.

**Fica de fora por enquanto (ainda pode mudar):**
- Brasileirão 2026: líder e artilheiro (Viveros 21 x Pedro 20 em 7/11).
- Finais da Sul-Americana (21/11), da Libertadores (28/11) e da Copa do Brasil.
- Mata-mata da Série B.
- Título da MotoGP.
- Nobel de Literatura: só uma fonte.

**Fontes:**
- [Band, Supercopa](https://www.band.com.br/esportes/corinthians-e-bicampeao-da-supercopa-do-brasil-confira-todos-os-campeoes-202602011834)
- [Band, Recopa](https://www.band.com.br/esportes/lanus-bate-flamengo-na-prorrogacao-e-e-campeao-da-recopa-sul-americana-202602270009)
- [Bahia Notícias, Copa do Nordeste](https://www.bahianoticias.com.br/esportes/vitoria/31181-e-campeao-vitoria-supera-o-fortaleza-e-volta-a-vencer-a-copa-do-nordeste-apos-16-anos)
- [NetVasco, Renato Kayzer](https://www.netvasco.com.br/n/386404/cria-renato-kayzer-faz-o-gol-do-titulo-do-vitoria-e-termina-a-copa-do-nordeste-como-artilheiro)
- [Correio 24 Horas, Brasileirão Feminino](https://www.correio24horas.com.br/esportes/sao-paulo-e-campeao-do-brasileirao-feminino-com-recorde-de-publico-e-premio-historico-de-r-2-milhoes-1026)
- [O Povo, Série B 2026](https://www.opovo.com.br/esportes/2026/11/15/novorizontino-conquista-a-serie-b-e-sobe-junto-com-o-juventude.html)
- [O Liberal, Palmeiras na final](https://www.oliberal.com/esportes/palmeiras-sofre-em-casa-mas-vence-fluminense-nos-penaltis-para-ir-a-final-da-libertadores-1.1185369)
- [Al Jazeera, Enzo Fernández](https://www.aljazeera.com/sports/2026/9/1/fernandez-transfers-to-man-city-from-chelsea-in-joint-british-record-fee)
- [Band, fim do ciclo de Neymar](https://www.band.com.br/esportes/ancelotti-confirma-fim-do-ciclo-de-neymar-na-selecao-e-admite-erros-na-copa-ideia-e-renovar-202607292012)
- [Band, Wimbledon](https://www.band.com.br/esportes/noskova-vence-final-100-tcheca-e-se-torna-aos-21-a-mais-jovem-campea-de-wimbledon-em-15-anos)
- [IstoÉ, Grammy 2026](https://istoe.com.br/grammy-2026-bad-bunny-e-o-grande-vencedor-da-noite-veja-lista-de-premiados)
- [NPR, Eurovision 2026](https://www.npr.org/2026/05/16/nx-s1-5824393/eurovision-winner-dara-bangaranga-bulgaria-vienna-austria)
- [Olhar Digital, Artemis II](https://olhardigital.com.br/2026/04/10/ciencia-e-espaco/artemis-2-pousa-com-sucesso-apos-missao-historica-a-lua/)
- [Al Jazeera, Nobel da Paz](https://www.aljazeera.com/news/2026/10/9/2026-nobel-peace-prize-awarded-to-navi-pillay)
- [Folha PE, Nobel de Medicina](https://www.folhape.com.br/noticias/nobel-de-medicina-de-2026-premia-avancos-na-optogenetica/516650/)

### 11.4 Planejado x entregue

| Jogo | Meta | Entregue | Observação |
|---|---|---|---|
| Top 100 do Dia | 15 listas | 12 (+7) | artistas, vozes e músicas (Rolling Stone), países por população, medalhas olímpicas, PIB de 2026 (FMI) e estádios do Brasil |
| Conexões | 29 | 29 (+12) | Copa 2026, técnicos, apelidos e cores de clubes, estádios europeus, línguas, TV, música, Disney, heróis, cozinha, esportes |
| Emoji | 72 | 78 (+26) | clubes, craques, filmes, novelas, música |
| Intruso | 73 | 73 (+12) | 2026 (semifinais, estreantes, Supercopa, Copa do Nordeste, Artemis II, Nobel) e clássicos |
| Quem é | 78 | 78 (+12) | Vini Jr., Roberto Carlos, Rivaldo, Marcelo, Thiago Silva, Alisson, Arrascaeta, Modrić, Suárez, Dembélé, Ancelotti, Guardiola |
| Sobrevivente | 40 | 40 (+8) | campeões brasileiros e da Copa do Brasil, Bola de Ouro desde 2000, convocados de 1994 e 2002, estados dos EUA, horóscopo chinês, planetas anões |
| Anagrama | 340 | 351 (+84) | temas novos: país, esporte, estádio brasileiro, técnico, novela |
| Quiz Relâmpago | +15 | +15 (163) | dados de 2026 da seção 11.3 |
| Fato ou Fake | +10 | +11 (109) | dados de 2026 |
| Chute Certo | +6 | +6 (108) | dados de 2026 |
| Linha do Tempo | +10 | +11 (137) | Artemis II e eventos de anos variados (o jogo exige 3 anos de distância entre os eventos de uma rodada) |
| Top 10 | +3 | 0 | adiado: as listas de 2026 que achei não tinham os 10 nomes confirmados |

**Top 100, o que ficou de fora e por quê:**
- *Classificação geral do Brasileirão* e *artilheiros da Seleção*: não achei a página com esse título, e a busca da Wikipédia ficou bloqueada pelo limite de chamadas. Fica para a próxima rodada.
- *Mais jogos por seleções*: a lista tem quase só nomes pouco conhecidos aqui (o único brasileiro no top 100 é o Cafu).
- *Mais gols por seleções*: só 87 jogadores têm 50 gols ou mais, menos de 100.
- *Artilheiros do Brasileirão*: a tabela da Wikipédia só traz quem tem 100 gols ou mais (18 nomes).
- *Maiores discos da música brasileira*: há discos com o mesmo nome (dois chamados "Cartola"), e o jogo não teria como saber qual é qual.

**Bugs achados e corrigidos nesta rodada:**
- Resposta que começa com artigo ("O Rei Leão", "A Banda") não era aceita em nenhum jogo, porque o palpite perdia o artigo e a resposta não. Agora as duas formas valem.
- No Top 100, título com mais de 6 palavras ("Pra Não Dizer Que Não Falei das Flores") era tratado como conversa. Agora vale se bater com a lista; isso também vale para entrar no jogo no meio.

## 12. Rodada 5: correções pedidas (19/11)

### 12.1 Pedido e diagnóstico

| Pedido | O que o código fazia | O que muda |
|---|---|---|
| Leilão só com jogadores conhecidos, das principais ligas, misturando craques e jogadores medianos | Sorteava qualquer jogador da base com artigo em 12 ou mais Wikipédias. Entravam nomes obscuros e de ligas pequenas. | Só entra quem jogou nas 5 grandes ligas da Europa ou no Brasileirão, com artigo em 30+ Wikipédias e estreia a partir de 1995 (ou lenda com 100+). Cada posição mistura metade de craques (90+ Wikipédias) e metade de bons jogadores. O overall vai de 70 a 99. |
| Anagrama: escolher o tema; só nomes conhecidos | Só dava para filtrar por "futebol" ou "geral", e havia palavras pouco conhecidas | `abrir anagrama <tema>` com 19 temas (clubes, craques, seleções, capitais, animais, filmes…). Palavras obscuras saem e entram nomes conhecidos. |
| Top 10 e outros: só repetir quando acabarem os temas | **Top 10:** não repetia a mesma lista, mas listas diferentes têm o mesmo tema (três de artilheiros de Copa, cinco de títulos de ligas europeias). **Stop, Alfabeto, Melhor Time, Draft e Escalação (tema sorteado):** sorteavam sem olhar o histórico do grupo. | **Top 10:** listas agrupadas por tema; o sorteio só volta a um tema depois de passar por todos. **Os outros cinco:** passam a usar o histórico do grupo (letras, clubes, seleções, temas). |

### 12.2 Anagrama: temas e palavras

- Todas as palavras precisam ser nomes que qualquer pessoa do grupo reconhece.
- Saem clubes pequenos (Náutico, Paysandu, Remo, Criciúma, Figueirense, Mirassol), estádios regionais (Arruda, Barradão, Couto Pereira, Serra Dourada, Mangueirão, Independência), capitais confusas (Camberra, Ottawa), novelas antigas (Tieta, Roque Santeiro, Explode Coração) e esportes pouco jogados aqui (badminton, canoagem).
- Entram clubes e craques de hoje, capitais conhecidas, filmes e mais artistas.
- Cada tema fica com pelo menos 16 palavras: dá para jogar 12 rodadas sem repetir.

### 12.3 Planejado x entregue

| Item | Entregue |
|---|---|
| Leilão | Filtro de jogadores conhecidos das grandes ligas, cada posição meio estrelas, meio bons jogadores, overall de 70 a 99. Testes cobrem o filtro: liga pequena, jogador antigo e pouco famoso e menos de 30 Wikipédias ficam de fora; lenda entra. |
| Anagrama | 19 temas escolhíveis (`abrir anagrama capitais`, `abrir anagrama clubes de fora`…) e o comando `temas do anagrama`. Tema que não existe responde com a lista. 413 palavras, todas conhecidas, com no mínimo 16 por tema. A sala e a ajuda mostram o tema. |
| Top 10 | As 81 listas viraram 30 temas. O tema só volta depois de todos; depois disso, primeiro os temas que ainda têm lista nova. Teste com todas as listas de futebol: nenhuma lista repete antes de acabar. |
| Stop, Alfabeto, Draft, Melhor Time, Escalação | Sorteio pelo histórico do grupo: letras, clubes, seleções e tema sorteado. |
| 1x1 (`iniciar aleatório` e "aleatório" no menu) | O tema sorteado também segue o histórico do grupo. |
| Jogos que já usavam o histórico | Seguem iguais: Relâmpago, Emoji, Quem é, Que time é esse, Bandeiraço, Intruso, Chute Certo, Sobrevivente, Conexões, Linha do Tempo, Fato ou Fake, Carreira, Ponte, Leilão e Anagrama. |

## 13. Leilão: um por posição e dois modos (19/11)

**Pedido:** no Leilão, cada um só pode ter um jogador por posição, e deve haver dois modos: um pelo overall (como já era) e outro com votação do melhor time.

**Como ficou:**
- **Um por posição:** cada time é 1 GOL, 1 DEF, 1 MEI e 1 ATA. O craque ocupa a posição principal dele. Quem já tem aquela posição não pode dar lance (o bot avisa uma vez). Lote que ninguém mais precisa é pulado sozinho, e cada lote mostra quem ainda pode dar lance. O bônus de time completo saiu, porque agora todo time é completo por regra.
- **Modo overall (padrão):** `abrir leilão`. O overall de cada craque (70 a 99) fica escondido até o fim; vence a maior soma e, no empate, quem gastou menos.
- **Modo votação:** `abrir leilão votação`, ou *votação* no lobby (o anfitrião também pode mandar *overall*). Quando o leilão acaba, abre uma votação de 60 s:
  - qualquer pessoa do grupo manda o número do melhor time;
  - quem jogou não vota no próprio time;
  - é um voto por pessoa;
  - o anfitrião pode encerrar com *pular*.
  
  Vence quem tiver mais votos; empate fica empatado. Nesse modo o overall não aparece.
- **Sala e regras:** mostram o modo escolhido e a regra de um por posição.

**Planejado x entregue:** tudo entregue. Testes novos: lance recusado na posição já ocupada, times sem posição repetida e a votação completa (voto no próprio time recusado, voto de quem não jogou aceito, um voto por pessoa, vencedor certo).

## 14. Comandos do admin: Top 100 e virada de temporada (19/11)

**Pedido:** o admin precisa de comandos para resetar o Top 100 e para fazer a virada de temporada, com uma imagem caprichada dos melhores do período.

**Como ficou (só quem está em ADMIN_NUMBERS):**
- **`resetar top 100`** (aceita também `resetar o 100`, `liberar top 100` e `reabrir top 100`): libera mais uma partida do Top 100 hoje. A partida extra vem com uma lista que o grupo ainda não jogou. Se houver um Top 100 rolando, o bot pede *encerrar* antes.
- **`virada de temporada`** (aceita também `fim de temporada`, `fechar temporada` e `nova temporada`):
  - manda a imagem "Fim da Temporada N": pódio com os 3 primeiros (ouro, prata e bronze, com "CAMPEÃO"), a tabela até o 10º, partidas por jogo (quando sobra espaço) e 4 destaques (mais vitórias, mais partidas, melhor aproveitamento e jogo mais jogado);
  - guarda o ranking final no histórico (tabela `group_seasons`), zera o ranking e abre a Temporada N+1.
- **Para todos:**
  - `campeões` mostra o campeão de cada temporada encerrada e desde quando vale a atual;
  - `ranking` passa a mostrar "Temporada N · desde dd/mm".
- A 1ª temporada de cada grupo conta desde a primeira partida dele, então o placar atual vira a Temporada 1.

**Planejado x entregue:** tudo entregue. Testes novos:
- reset só pelo admin, com lista diferente;
- virada só pelo admin: campeão, destaques, ranking zerado, histórico em *campeões* e ranking da temporada nova.

A imagem foi conferida com 2, 5 e 10+ jogadores.

## 15. Admin: bloquear o "próxima" de algumas pessoas (19/11)

**Pedido:** o admin pode tirar de algumas pessoas o poder de usar o *próxima*.

**Como ficou (só quem está em ADMIN_NUMBERS):**
- **Bloquear:** `bloquear próxima @pessoa` (também valem *tirar* e *proibir*). Para apontar a pessoa, o admin pode:
  - marcar com @;
  - responder a uma mensagem dela com o comando;
  - digitar o número. Use o número se a marcação não funcionar, porque o WhatsApp às vezes manda o @ com outro id.
- **Liberar:** `liberar próxima @pessoa` (do mesmo jeito).
- **Ver a lista:** `bloqueados` mostra quem está sem *próxima*, com o nome do ranking ou o número.
- **Na partida:** o *próxima* de quem está bloqueado não vale, nem para adiantar a pausa nem para pular a rodada. O bot avisa uma vez por rodada ("o admin tirou o seu próxima"). Os outros jogadores seguem normais.
- **Onde fica guardado:** no histórico do grupo (`group_seen`, tipo `admin:sem-proxima`), com os dígitos do id, porque são eles que batem entre o número e o @lid.
- O bot agora lê as marcações (@) e o autor da mensagem respondida (`contextInfo` da Evolution).

**Planejado x entregue:** tudo entregue. Testes novos:
- leitura do @ e da resposta no webhook;
- só o admin bloqueia;
- bloqueio por @, por resposta e por número;
- *próxima* bloqueado na partida (avisa uma vez) e o de outra pessoa funcionando;
- liberar e listar.

## 16. Correções: times futuros nas imagens e Leilão com 2 DEF e 2 MEI (19/11)

**Pedido:**
1. Nos jogos de soma de valores, a imagem mostrava o time das próximas rodadas: na rodada 3 já aparecia que a 4 era Atlético-MG. O time só pode aparecer quando a rodada abre.
2. No Leilão, trocar para 2 defensores e 2 meias.

**Causa e correção:**
- **Escalação em Grupo:** a tabela mostrava no cabeçalho o clube ou seleção de todas as 6 rodadas desde o início. Agora mostra só das rodadas já abertas; as próximas ficam em branco. No fim da partida aparece tudo.
- **1x1:** o campinho também mostrava os times de todas as rodadas ao lado das posições. Mesma correção.
- **Leilão:** o time agora é de 6: 1 GOL, 2 DEF, 2 MEI e 1 ATA. Tem lotes de sobra em cada posição (jogadores x vagas + 1). Quem já completou a posição não dá lance (ex.: "você já tem 2 defensores"). O lance máximo guarda 1 moeda para cada vaga que falta. A imagem mostra as 6 vagas por time e cabe até com 8 técnicos.

**Planejado x entregue:** tudo entregue. Testes novos:
- a imagem da rodada 3 não mostra o time da 4, nem na Escalação em Grupo nem no 1x1;
- o Leilão recusa lance em posição completa;
- os times respeitam 1/2/2/1.

## 17. Proposta: três modos novos "bem diferentes" (19/11)

> Só planejamento: nada construído ainda. Os três fogem do formato pergunta e resposta que quase todos os jogos atuais usam. Um é de **blefe e dedução**, outro **dura dias e usa jogos de verdade**, o terceiro é de **gestão e simulação**.

### 17.1 Impostor do Futebol (dedução social)

**A ideia:** todo mundo recebe no privado o mesmo craque secreto, menos um: o impostor, que só sabe o tema. Cada um dá uma dica de uma palavra no grupo, e o grupo vota em quem está blefando.

**Como se joga (4 a 10 pessoas):**
1. `abrir impostor` → *entrar* → *começar*.
2. O bot manda no privado de cada um: "🤫 Seu craque: *Ronaldinho*". Para o sorteado: "😈 Você é o IMPOSTOR. Tema: *craque brasileiro*. Não deixe perceberem."
3. **Rodada de dicas** (a ordem é sorteada; 40 s por vez): cada um manda UMA palavra no grupo ("drible", "Barcelona", "sorriso"…). Palavra repetida ou o nome do craque não valem (o bot apaga a vez e avisa).
4. São 2 voltas de dicas. Depois vem a **votação** (45 s): cada um manda o número de quem acha que é o impostor.
5. **Desfecho:**
   - Se o impostor foi o mais votado, ele ainda tem 20 s para **adivinhar o craque**. Se acertar, rouba a vitória.
   - Se não foi pego, ele vence sozinho.

**Pontos (entram no ranking):**
- grupo pega o impostor: +2 para cada um que votou certo;
- impostor escapa: +5 para ele;
- impostor pego, mas acerta o craque: +4 para ele.

**Temas:** craque brasileiro, craque do mundo, clube, seleção, estádio, técnico. Os nomes vêm das listas do Anagrama, que já são só de conhecidos.

**Por que é diferente:** é o primeiro jogo de blefe; quem fala bem ganha, não só quem sabe mais. Os vídeos de "impostor" fazem sucesso justamente por isso.

**O que construir:**
- **Mensagem no privado:** o bot hoje só fala em grupo. Dá para enviar para o número da pessoa, mas quando o WhatsApp só informa o @lid, o envio pode falhar.
  - Plano B: o bot avisa no grupo "quem não recebeu, mande *oi* para o bot no privado".
  - Isso exige aceitar mensagem privada só para esse fim (hoje o webhook ignora tudo fora de grupo).
- **Partida:** fluxo de vez (como o Sobrevivente), votação (como o Draft) e o palpite final do impostor.
- **Imagem:** resultado com o craque revelado e quem votou em quem.

**Riscos:**
- Mandar mensagem para quem não salvou o número do bot é aceito, mas em grande volume o WhatsApp pode desconfiar. Aqui são no máximo 10 mensagens por partida.
- O bot pessoal de finanças não é tocado (instância separada).

**Tamanho:** médio (2 a 3 dias de trabalho).

### 17.2 Bolão do Grupo (palpites em jogos de verdade)

**A ideia:** o admin cadastra os jogos da rodada real (Brasileirão, Libertadores, Copa do Brasil, Champions). O grupo manda os placares até o apito inicial, e o bot pontua quando o admin lança o resultado. Dura a semana toda, não só uma partida.

**Como se joga:**
1. **Admin cadastra:** `bolão jogo Flamengo x Palmeiras dom 16h` (dá para mandar vários de uma vez, um por linha). O bot responde com a imagem "Bolão da Rodada": jogos numerados, data e hora.
2. **Palpites:** qualquer um manda `1: 2x1` ou `Fla 2x1 Pal`, e dá para mandar vários numa mensagem só. O bot reage ✅. Dá para mudar até o horário do jogo; depois fecha sozinho. O bot avisa 30 min antes ("faltam 30 min para fechar Fla x Pal").
3. **Resultado:** o admin manda `resultado 1 2x1`. O bot manda a imagem do jogo, com quem cravou, quem acertou o vencedor e o placar.
4. **Comandos de consulta:**
   - `bolão`: jogos abertos e quantos palpites cada um tem (os palpites dos outros só aparecem quando fecha, para ninguém copiar);
   - `ranking bolão`: tabela própria do bolão;
   - a virada de temporada também fecha a do bolão.

**Pontos:** placar exato 10; vencedor ou empate certo 5; acertou os gols de um dos times +1. O palpite dos outros só aparece quando o jogo fecha, então ninguém copia.

**Por que é diferente:**
- Usa futebol de verdade e dá assunto para a semana inteira ("vai, Mengão, salva meu bolão").
- Cria motivo para voltar ao grupo todo dia, mesmo sem ninguém abrir sala.

**O que construir:**
- **Tabelas novas:** `bolao_jogos` (grupo, número, times, horário, resultado) e `bolao_palpites`.
- **Interpretar o texto:** datas como "dom 16h" e "21/11 21h30", e palpites como "2x1", "2 x 1" e "Fla 2x1 Pal" (os apelidos de clube já existem no código).
- **Prazos:** aviso de 30 min e fechamento no horário, pelo agendador (QStash, dentro da cota diária).
- **Imagens:** jogos da rodada, resultado do jogo e ranking do bolão.

**Decisão do dono:** o resultado é sempre lançado pelo admin. Não há fonte automática de placares liberada aqui, e a regra é não raspar sites.

**Tamanho:** médio a grande (3 a 4 dias).

### 17.3 Técnico por um Dia (simulação de partida com decisões)

**A ideia:** cada um monta um time e o bot **simula as partidas lance a lance**, com narração e imagem do placar. No intervalo e aos 70', cada técnico decide a tática. Fecha em mata-mata até o campeão.

**Como se joga (2 a 8 técnicos):**
1. **Montagem:** `abrir técnico` → *entrar* → *começar*. Cada técnico recebe 7 craques sorteados da base (conhecidos, das grandes ligas, como no Leilão) e escolhe 5 titulares: `1 3 4 6 7`. Dois minutos.
2. **Chave:** o bot sorteia a chave (2 = final; 4 = semis; 8 = quartas). Cada partida tem 3 blocos narrados de 1 minuto real, mais ou menos:
   - **1º tempo:** 4 ou 5 lances. Por exemplo: "⚽ 23' — Vinícius Júnior arranca pela esquerda e bate cruzado: GOL do Time do Ana!" ou "🧤 31' — Alisson voa e salva".
   - **Intervalo (30 s):** cada técnico manda *atacar*, *equilibrar* ou *fechar*.
   - **2º tempo:** mais lances. Aos 70', última decisão.
   - **Empate no mata-mata:** pênaltis narrados.
3. **Como o lance é decidido:** a força vem do overall dos titulares por setor (ataque contra defesa). A tática muda as chances, num esquema de pedra, papel e tesoura:
   - atacar abre a defesa;
   - fechar segura, mas quase não cria;
   - atacar contra quem fecha dá mais posse e menos gol;
   - contra-ataque pune quem ataca demais.
   
   Craque decide, mas a zebra existe.
4. **Imagens:** escalação dos dois times antes do jogo, placar com os autores dos gols no fim de cada partida e a chave com o campeão no fim.

**Pontos:** vitória numa partida, 3; campeão, +5. Entra no ranking da temporada.

**Por que é diferente:** ninguém precisa saber resposta. É gestão: escolher o time e ler a hora de arriscar. A narração cria aquela torcida no grupo, como se fosse jogo de verdade.

**O que construir:**
- **Motor da partida:** força por setor, tática, sorteio dos lances e uma narração com 40 a 60 frases-modelo usando o nome dos jogadores do time. Opcional: a IA (Maritaca) enfeita a narração, sempre com uma frase pronta de reserva.
- **Agenda:** os blocos de narração e os prazos das decisões (várias mensagens por partida). Precisa cuidar da cota diária do QStash: 4 técnicos dão umas 3 partidas × 4 blocos ≈ 12 agendamentos.
- **Imagens:** escalação, placar e chave.
- **Teste de equilíbrio:** simular mil jogos para conferir que o time mais forte ganha uns 60 a 65% das vezes, nem sempre.

**Riscos:**
- Muitas mensagens seguidas no grupo: limitar a 3 ou 4 lances por bloco e juntar no mesmo texto.
- Partidas longas com 8 técnicos (~15 min): oferecer `abrir técnico rápido`, que simula sem pausas táticas.

**Tamanho:** grande (4 a 5 dias).

### 17.4 Comparação e ordem sugerida

| | Impostor | Bolão | Técnico por um Dia |
|---|---|---|---|
| Tipo | blefe e dedução | palpite em jogo real | gestão e simulação |
| Duração | 6 a 10 min | a semana toda | 8 a 15 min |
| Pessoas | 4 a 10 | o grupo todo | 2 a 8 |
| Precisa do admin? | não | sim (jogos e resultados) | não |
| Novidade técnica | mensagem no privado | jogos que duram dias | motor de simulação |
| Tamanho | médio | médio/grande | grande |

**Ordem sugerida:**
1. **Bolão:** mantém o grupo ativo a semana toda e combina com a temporada.
2. **Impostor:** mais barato e mais "viral".
3. **Técnico por um Dia:** o mais trabalhoso; vale fazer com calma e testar o equilíbrio.

**Reserva (se algum não agradar):** "Trunfo de Craques", uma batalha de cartas por atributo (gols, jogos, altura, valor, títulos) com os números da base, mão secreta no privado e quem ganha a rodada leva as cartas.

## 18. Impostor do Futebol: planejamento detalhado (19/11)

> Escolhido na seção 17. Aqui está o desenho completo, para construir sem surpresa: regras, cada mensagem do bot, casos difíceis, o que muda no código, testes, piloto e as decisões que faltam.

### 18.1 Resumo em uma frase

Todo mundo recebe no privado o mesmo segredo (um craque, clube, seleção…), menos o impostor, que só sabe o tema. Cada um dá uma dica de uma palavra no grupo, em 2 voltas; o grupo debate e vota. Se pegarem o impostor, ele ainda pode roubar a vitória adivinhando o segredo.

### 18.2 Quem joga e quanto dura

| Item | Valor |
|---|---|
| Pessoas | 4 a 10 (com 3 fica fácil demais) |
| Impostores | 1 (opção de 2 com 8 ou mais: `abrir impostor 2`) |
| Voltas de dicas | 2 |
| Tempo por dica | 40 s (`abrir impostor rápido`: 25 s) |
| Debate | 60 s livres (o anfitrião pode pular com *votar*) |
| Votação | 45 s, ou até todos votarem |
| Palpite do impostor | 20 s, uma tentativa |
| Duração típica | 6 a 10 min (10 pessoas, todo mundo no limite: ~17 min) |

### 18.3 O que fica secreto (conteúdo)

- **Lista própria (`content/impostor.ts`):** 150 a 200 segredos, só nomes conhecidos (mesmo critério do Anagrama), em 6 temas:
  - craque brasileiro e craque do mundo (40 cada);
  - clube brasileiro e clube do exterior (25 cada);
  - seleção (20);
  - estádio ou técnico (20).
- **Cada segredo traz:**
  - nome;
  - apelidos aceitos no palpite do impostor (ex.: "R10", "Ronaldinho Gaúcho");
  - **palavras proibidas na dica:** as partes do nome e os apelidos, para ninguém entregar.
- **Escolha do tema:** como no Anagrama (`abrir impostor clubes`, `abrir impostor craques`…). Sem tema, mistura.
- **Sem repetir:** o sorteio usa o histórico do grupo (`group_seen`, tipo `impostor`), e um segredo só volta quando os do tema acabarem.

### 18.4 Passo a passo (com as mensagens)

**1. Sala (lobby):** `abrir impostor` (ou `abrir impostor clubes`, `abrir impostor 2` para 2 impostores).
- O bot manda a imagem da sala:
  - título: "IMPOSTOR DO FUTEBOL · tema: misturado · 1 impostor";
  - regras: "Todos recebem o segredo no privado, menos o impostor. Dica de 1 palavra, 2 voltas. Depois, votação.".
- As pessoas mandam *entrar*. O bot avisa: "⚠️ O bot vai te mandar uma mensagem no privado. Se não chegar, mande *oi* para ele no privado."

**2. Cartas (15 s):** o anfitrião manda *começar*.
- O bot sorteia o impostor e o segredo e manda no privado de cada um:
  - **inocente:** "🤫 *Impostor do Futebol*: seu segredo é *Ronaldinho* (tema: craque brasileiro). Não fale o nome! Dê dicas que mostrem que você sabe, sem entregar para o impostor.";
  - **impostor:** "😈 Você é o *IMPOSTOR*. Tema: *craque brasileiro*. Ouça as dicas, finja que sabe e tente descobrir o segredo.".
- No grupo: "🃏 Cartas entregues no privado. Quem não recebeu manda *carta* aqui ou *oi* para o bot no privado. A 1ª volta começa em 15s."
- A ordem da mesa é sorteada, e **o impostor nunca é o primeiro da 1ª volta**: seria difícil demais para ele.

**3. Dicas (2 voltas):**
- **Na vez:** "🗣️ Vez de *Ana* (1/6 · volta 1). Mande 1 palavra. 40s."
- **Dica aceita:** o bot reage ✅ e já chama o próximo.
- **Dica recusada** (a pessoa continua na vez, sem perder tempo):
  - mais de uma palavra: "Só 1 palavra, *Ana*." Hífen vale ("pé-de-meia"), e números também ("10");
  - palavra proibida (parte do nome ou apelido): "Essa entrega o segredo! Mande outra.";
  - palavra já usada por alguém: "*Barcelona* já foi. Mande outra.".
- **Fim do tempo:** "⏱️ *Ana* não deu dica." Fica "—" na mesa, e isso conta como suspeito.
- **Conversa no meio:** só a mensagem de quem está na vez conta como dica. As outras são ignoradas, então a resenha fica liberada.
- **Fim de cada volta:** o bot manda a **imagem da mesa** (cada um com a sua dica: Ana "drible", Bia "Barcelona", Caio "sorriso"…).

**4. Debate (60 s):** "💬 Debate! 60s para acusar e se defender. Anfitrião: *votar* encerra antes."

**5. Votação (45 s):** "🗳️ Votem em quem é o impostor: mande o número (1 a 6). Não vale votar em si mesmo."
- O bot mostra a lista numerada com a dica de cada um.
- Votam só os jogadores, um voto cada (dá para trocar até fechar). O bot reage ✅ e não mostra o voto antes do fim.
- **Empate no topo:** segundo turno de 30 s só entre os empatados (eles não votam). Se empatar de novo, o impostor escapa.

**6. Desfecho:**
- **Votaram num inocente:** "😱 *Bia* era INOCENTE! O impostor era *Caio*. Ele vence a rodada! O segredo era *Ronaldinho*."
- **Pegaram o impostor:** "🎯 Pegaram o impostor: *Caio*! Última chance: Caio, mande o segredo em 20s."
  - se acertar (nome ou apelido, tolerando erro de digitação): "😈 Caio acertou *Ronaldinho* e rouba a vitória!";
  - se errar ou estourar o tempo: "✅ Vitória do grupo! O segredo era *Ronaldinho*."
- No fim vem a **imagem do resultado**:
  - o segredo revelado em destaque e o impostor marcado;
  - as dicas das 2 voltas;
  - quem votou em quem (com setas ou uma lista "Ana → Caio");
  - os pontos.

### 18.5 Pontos e ranking

| Situação | Pontos |
|---|---|
| Inocente que votou no impostor (grupo venceu) | +2 |
| Inocente, grupo venceu, mas votou errado | +1 |
| Impostor escapou da votação | +5 |
| Impostor pego, mas acertou o segredo | +4 |
| Cada inocente, quando o impostor vence | 0 |

**Ranking da temporada:** vitória para o lado vencedor (o impostor sozinho, ou todos os inocentes) e derrota para o outro.

**Com 2 impostores:**
- eles sabem quem é o parceiro (vem na mensagem do privado);
- o grupo vota em 2 nomes;
- é preciso pegar os dois para vencer;
- se pegarem os dois, qualquer um deles pode chutar o segredo.

### 18.6 Casos difíceis (e o que o bot faz)

- **Mensagem no privado que não chega** (o WhatsApp às vezes só informa o @lid):
  - o bot tenta primeiro o número (@s.whatsapp.net), depois o @lid;
  - se os dois falharem, avisa no grupo "Não consegui te mandar a carta, *Ana*: mande *oi* para o bot no privado";
  - a 1ª volta só começa quando todos receberam, ou depois de 45 s (com quem recebeu).
- **"carta" no grupo:** o bot reenvia a carta no privado de quem pediu. Nunca mostra no grupo.
- **Alguém sai (*sair*) no meio:**
  - inocente: sai da ordem e o jogo segue (mínimo de 3; abaixo disso, cancela);
  - impostor: "🏃 O impostor fugiu! Era *Caio*." Vitória do grupo e segredo revelado.
- **Impostor fala o segredo por acaso** (adivinhou) na dica: a dica é recusada como as outras. A regra é igual para todos, então isso não denuncia ninguém.
- **Inocente fala o nome sem querer:** dica recusada antes de aparecer na mesa. Não dá para apagar a mensagem do grupo; o bot só recusa e pede outra. O risco existe, e o próprio grupo cobra.
- **Ninguém vota:** o impostor escapa.
- **Partida esquecida:** a regra que já existe encerra salas paradas.

### 18.7 Mensagens no privado: como funciona e limites

- **Envio:** o motor ganha um tipo novo de saída, `{ type: 'dm', to, text }`. O `dispatch` envia pela Evolution para o número da pessoa (`sendText` já aceita qualquer número).
- **Recebimento:** o webhook hoje ignora tudo que não é grupo. Ele passa a aceitar mensagem privada **só** para o Impostor:
  - se a pessoa está numa partida aberta do Impostor e manda *oi*, *carta* ou *segredo*, o bot reenvia a carta;
  - qualquer outra mensagem privada continua ignorada, sem resposta. O bot não vira chat.
- **Segurança:**
  - é a instância do jogo (`EVOLUTION_INSTANCE`);
  - o bot pessoal de finanças (instância `financas`) não é tocado;
  - o filtro de instância que já existe continua.
- **Volume:** no máximo 10 mensagens privadas por partida, mais reenvios, longe de qualquer limite do WhatsApp.
- **Privacidade:** o segredo nunca vai para o grupo antes do fim, nem para os logs.

### 18.8 O que muda no código (mapa)

| Arquivo | Mudança |
|---|---|
| `src/lib/party/content/impostor.ts` (novo) | segredos por tema, com apelidos e palavras proibidas |
| `src/lib/party/impostor.ts` (novo) | módulo: sala, cartas, vez, validação da dica, debate, votação, segundo turno, palpite, pontos |
| `src/lib/party/modules.ts` | registra o módulo (`rules`, `create`, `start`, `answer`, `timeout`, `skip`, `finish`, `board`, `seenItems`) |
| `src/lib/game/types.ts` | `ImpostorParty` (tema, segredo, impostores, ordem, vez, volta, fase, dicas, votos, segundo turno, quem recebeu a carta) e a saída `dm` |
| `src/lib/dispatch.ts` | envia `dm` para o número (falha não para o jogo; avisa no grupo) |
| `src/lib/whatsapp/evolution.ts` | aceita mensagem privada (com marca `isPrivate`) |
| `src/lib/game/engine.ts` | rota da mensagem privada: acha a partida do Impostor da pessoa e reenvia a carta; ignora o resto |
| `src/lib/store/*` | busca da partida aberta do Impostor de uma pessoa (pelo id, entre as salas abertas) |
| `src/lib/images/*` | imagens da mesa (dicas) e do resultado (segredo, votos, pontos) |
| `src/lib/party/engine.ts` | comando `abrir impostor [tema] [2] [rápido]`; *carta* e *votar* |
| `src/lib/game/commands.ts` + ajuda | "ABRIR IMPOSTOR · blefe: ache o impostor" (a imagem da ajuda passa a ter 22 jogos) |

**Agendamentos (QStash):** um por vez de dica, mais cartas, debate, votação e palpite. Dá ~17 por partida com 6 pessoas, dentro da cota diária (350), que é dividida com a carga da base. A dica que chega antes do prazo cancela o agendamento pelo token, como já é feito.

### 18.9 Testes (antes de publicar)

1. **Sorteio:** impostor nunca é o 1º da volta 1; o segredo respeita o tema e o histórico do grupo.
2. **Cartas:** cada inocente recebe o segredo e o impostor só o tema; com 2 impostores, cada um sabe o parceiro; o segredo não aparece em nenhuma mensagem do grupo antes do fim (o teste varre todas as saídas).
3. **Dicas:**
   - mais de uma palavra, palavra proibida e palavra repetida são recusadas, e a pessoa segue na vez;
   - dica de quem não está na vez é ignorada;
   - fim do tempo marca "—".
4. **Votação:** voto em si mesmo recusado; um voto por pessoa (troca permitida); empate leva ao segundo turno; novo empate deixa o impostor escapar.
5. **Desfechos:** impostor escapa (+5); pego e acerta (+4, rouba); pego e erra (grupo +2 / +1); impostor sai no meio; inocente sai e fica abaixo de 3.
6. **Privado:**
   - o webhook lê mensagem privada;
   - *oi* no privado de quem está na partida reenvia a carta;
   - *oi* de quem não está é ignorado;
   - qualquer outra mensagem privada é ignorada;
   - falha no envio avisa no grupo.
7. **Imagens:** mesa e resultado com 4 e 10 jogadores (sem estourar a altura).
8. **Partida inteira simulada:** 6 pessoas, ponta a ponta, com o relógio de mentira.

### 18.10 Piloto e publicação

- **Fase 1 (núcleo, ~1,5 dia):** conteúdo, módulo, regras, pontos, testes 1 a 5 e 8.
- **Fase 2 (privado, ~1 dia):** saída `dm`, webhook privado, *carta*/*oi*, testes 6.
- **Fase 3 (imagens e ajuda, ~0,5 dia):** mesa, resultado, ajuda, sala, testes 7.
- **Piloto:** uma partida no grupo do admin antes de anunciar. É ali que se confirma, ao vivo, que a mensagem privada chega a quem só tem @lid.
- **Métricas (pelo `/api/health`, por jogo):** partidas terminadas contra canceladas, quantos pediram *carta* de novo e quanto o impostor vence. O alvo é entre 35% e 50%: se passar de 60%, aumentam as voltas ou o tempo de debate; se ficar abaixo de 25%, entra o modo disfarce, que é mais difícil para o grupo.

### 18.11 Ideias para depois (fase 2 do jogo)

- **Modo disfarce:** o impostor recebe um segredo parecido (ex.: todos "Neymar", ele "Vinícius Júnior") e **não sabe** que é o impostor. É mais difícil e mais engraçado.
- **Tema do grupo:** o admin cadastra segredos próprios (apelidos de gente do grupo, times da várzea), com `impostor adicionar <tema>: <nome>`.
- **Dica em áudio:** fora de escopo; o bot só lê texto.

### 18.12 Decisões para o dono (com a recomendação)

1. **Quem vota:** só quem joga (recomendado) ou o grupo todo?
2. **Empate na votação:** segundo turno entre os empatados (recomendado) ou o impostor escapa direto?
3. **Debate de 60 s antes do voto:** sim (recomendado), com *votar* para pular.
4. **2 impostores com 8 ou mais:** como opção `abrir impostor 2` (recomendado) ou automático?
5. **Palpite final do impostor:** no grupo, à vista de todos (recomendado, dá tensão), ou no privado?
6. **Conta para o ranking da temporada:** sim (recomendado).

### 18.13 Decisões do dono (19/11) e ajustes no desenho

| # | Decisão | Efeito no desenho |
|---|---|---|
| 1 | Só quem joga vota | igual à 18.4 |
| 2 | Empate: segundo turno | igual à 18.4 (novo empate: o impostor escapa) |
| 3 | Debate de **30 s** | era 60 s; o anfitrião ainda pode pular com *votar* |
| 4 | **Sempre 1 impostor** | sai a opção `abrir impostor 2` e as regras de 2 impostores |
| 5 | Palpite final no grupo | igual à 18.4 |
| 6 | Conta para o ranking da temporada | igual à 18.5 |

### 18.14 Planejado x entregue

| Item | Entregue |
|---|---|
| Conteúdo | 169 segredos em 7 temas (craque brasileiro, craque do mundo, clube brasileiro, clube do exterior, seleção, técnico, estádio). Vêm das listas do Anagrama, que são só de nomes conhecidos. Cada um tem as palavras proibidas e os apelidos aceitos. |
| Sala | `abrir impostor [tema] [rápido]`, `temas do impostor`; 4 a 10 pessoas; ninguém entra depois de começar. A sala mostra o tema. |
| Cartas | No privado de cada um (inocente: o segredo; impostor: só o tema). *carta* no grupo reenvia no privado. O impostor nunca abre a 1ª volta. |
| Dicas | 2 voltas, 40 s por vez (25 s no rápido). Recusa mais de 1 palavra, pedaço do nome ou apelido e dica repetida; a pessoa segue na vez. Mensagem fora da vez é ignorada. Fim do tempo marca "—". Imagem da mesa no fim de cada volta. |
| Debate | 30 s; *votar* do anfitrião abre a votação antes. |
| Votação | Só quem joga; não vale em si mesmo; dá para trocar o voto. Fecha quando todos votam ou no fim do tempo. Empate vai para o 2º turno, em que os empatados não votam. Novo empate: o impostor escapa. |
| Palpite | No grupo, 20 s, uma tentativa; aceita nome ou apelido com erro pequeno de digitação. |
| Pontos | Impostor escapa +5; rouba acertando +4; grupo vence: +2 para quem votou certo, +1 para os outros. Vitória ou derrota no ranking da temporada. |
| Casos difíceis | Impostor sai: vitória do grupo. Ficam menos de 3: cancela. Ninguém vota: o impostor escapa. *encerrar* revela o impostor e não conta vitória. |
| Privado | Saída `dm` no envio; se falhar, o grupo recebe "não consegui te mandar a carta, mande *oi* para o bot no privado". O webhook aceita mensagem privada, mas o motor só responde a *oi*/*carta* de quem está numa partida aberta. O resto é ignorado e nada mexe em grupo. |
| Imagens | Mesa (dicas) e resultado (segredo no título, impostor em destaque, dicas, votos e pontos). Conferidas com 4 e 10 jogadores. O texto da imagem não leva emoji, que dependeria de baixar o desenho da internet. |
| Ajuda | "ABRIR IMPOSTOR · blefe: achem o impostor" (a ajuda tem 22 jogos de grupo e cabe). |
| Testes | 6 testes novos: conteúdo; partida inteira (cartas, segredo nunca no grupo antes do fim, dicas recusadas, votação, palpite errado e ranking); 2º turno com novo empate; voto em inocente e roubo pelo palpite; fuga do impostor; privado (reenvio, ignora o resto e quem não joga) e o webhook. |

**Bug achado no caminho:** a comparação de pessoa pelo "número" usava só os dígitos do id. Em id sem números, qualquer pessoa "batia". Agora compara o id inteiro e só usa os dígitos quando há pelo menos 6. Vale para o privado do Impostor e para o bloqueio do *próxima*.

**Falta (só ao vivo):** confirmar no piloto que a carta chega a quem o WhatsApp só identifica pelo @lid.

## 19. Rodada 7: revisão das imagens e mais conteúdo no Impostor (19/11)

> Pedido: "Faça uma revisão de como ficaram as imagens, verifique possíveis erros. Adicione mais conteúdo nesse modo (Impostor)."

### 19.1 Revisão das imagens: como foi feita

- **Todas as telas geradas:** 37 imagens, uma para cada tipo e situação.
  - Casos difíceis: 10 a 20 jogadores, nomes longos ("João Pedro de Oliveira Santos"), letras de fora do português (Modrić, Čech, Szczęsny, Çalhanoğlu) e nomes do WhatsApp com emoji ("Júllio 🔥", "🦁🦁").
  - O roteiro ficou no projeto: `npm run render:stress` (os PNGs vão para `samples/stress`).
- **Fontes conferidas letra a letra:** as fontes das imagens (Anton e Barlow) só desenham o alfabeto latino, os acentos do português, espanhol e francês e algumas pontuações.

### 19.2 Revisão das imagens: o que estava errado

| # | Problema | Onde | Efeito |
|---|---|---|---|
| 1 | Emoji no nome do jogador | todas as imagens com nomes | o gerador tenta baixar o emoji da internet; se falha, **a imagem não sai** (e sempre demora mais) |
| 2 | Letra fora da fonte (ć, č, ł, ę, ğ) | nomes de craques (Modrić, Čech na escalação do Chelsea 2012) e de jogadores | a letra sai em outra fonte, torta, depois de um download |
| 3 | Ranking com 8 a 10 linhas | `ranking` | a tabela sobe por cima do título "RANKING" |
| 4 | Nome longo no título do card | Draft (votos), Stop (pontos), Impostor (IMPOSTOR) | o que vem depois do nome some ("3 votos") |
| 5 | Linhas longas do Leilão | resultado do Leilão | o overall de cada craque saía cortado ("overal…") |
| 6 | Asteriscos do WhatsApp | sala do Leilão | "\*overall\*" aparecia com os asteriscos na imagem |
| 7 | Nome só de emoji | Intruso, Escalação, Impostor, Leilão | ficava vazio ("Zé, , Bia") |
| 8 | Bolinha da posição | placar com 20 jogadores (Top 100) | maior que a linha |
| 9 | "1 acertos" | resultado do Sobrevivente | plural errado |

### 19.3 Inventário do Impostor (antes)

| Tema | Segredos |
|---|---|
| craque brasileiro | 30 |
| craque do mundo | 28 |
| clube brasileiro | 25 |
| clube do exterior | 26 |
| seleção | 26 |
| técnico | 18 |
| estádio (Brasil) | 16 |
| **Total** | **169**, todos de futebol |

### 19.4 Metas de conteúdo

- **Temas de futebol que já existem:** todos com pelo menos 24 segredos. Os nomes a mais entram só no Impostor; o Anagrama não muda.
- **4 temas novos de futebol:**
  - estádio do mundo (Camp Nou, Anfield, La Bombonera…);
  - competição (Libertadores, Champions, Copa do Brasil…);
  - lance do futebol (bicicleta, chapéu, caneta, paradinha…);
  - Copa do Mundo, por edição (Copa de 1970, Copa de 2002…).
- **Temas gerais, só quando pedidos:** `abrir impostor geral` mistura os gerais, e `abrir impostor filmes` (ou países, animais…) escolhe um tema. Usa os 11 temas gerais do Anagrama mais um tema novo: **lugar** (praia, hospital, aeroporto…), o clássico do jogo.
- **Sem tema continua só futebol.** `temas do impostor` mostra os de futebol e os gerais separados.
- **Alvo:** cerca de 350 segredos de futebol e 250 gerais.

### 19.5 Fontes e critério

- **Mesmo critério do Anagrama:** só nome que um grupo brasileiro comum reconhece. Craque recente só entra se já for muito conhecido.
- **Copa do Mundo:** sede e campeão de cada edição são fatos históricos (FIFA). Entram as 15 edições mais lembradas no Brasil, de 1950 a 2022.
- **Nada que muda:** nenhum segredo diz em que clube alguém joga hoje nem quem é o técnico atual.

### 19.6 O que fica de fora

- **Copa de 2026:** não conferi a fonte nesta rodada (regra do projeto).
- **Apelidos de clube** (Tricolor, Timão, Galo): ambíguos, vários clubes têm o mesmo.
- **"Coisa do futebol" do Anagrama** (goleiro, chuteira): genérico demais para o impostor blefar. Entra o tema "lance do futebol", mais concreto.
- **Modo disfarce e tema do grupo:** continuam como ideias para depois (18.11).

### 19.7 Planejado x entregue

| Item | Planejado | Entregue |
|---|---|---|
| Emoji e letra de fora nas imagens | sem download na hora da imagem | **Filtro de glifos** (`images/glyphs.ts`) em todo texto da imagem, nos dados e na árvore pronta. Letra de fora vira a sem acento (ć → c, ł → l, ğ → g), emoji sai, e nome só de emoji vira "?". O texto do WhatsApp continua com emoji. |
| Ranking com 8 a 10 linhas | caber sem encostar no título | linhas de 66 px e título menor quando passa de 7 |
| Títulos dos cards (Draft, Stop, Impostor) | o fim não some | nome cortado antes do sufixo (votos, pontos, IMPOSTOR) e letra do título que encolhe antes de cortar |
| Linhas dos quadros de texto | sem cortar informação | tamanho da letra pela altura **e** pela linha mais longa; o corte depende do tamanho da letra |
| Leilão | overall visível | linha curta: "DEF Trent Alexander-Arnold · overall 87" (no resultado) ou "· 19 moedas" (durante) |
| Sala do Leilão | sem asteriscos | corrigido |
| Placar com 20 | bolinha cabe na linha | bolinha no tamanho da linha |
| Sobrevivente | "1 acerto" | corrigido |
| Impostor: temas que já existiam | 24+ cada | craque brasileiro 59, craque do mundo 58, clube do exterior 46, seleção 41, clube brasileiro 37, técnico 30, estádio 25 |
| Impostor: temas novos de futebol | 4 | estádio do mundo (20), competição (18), lance do futebol (24), edição da Copa (15, de 1950 a 2022) |
| Impostor: temas gerais | só quando pedidos | 12 temas, 248 segredos: os 11 gerais do Anagrama e **lugar** (24). Pedido com `abrir impostor geral` (mistura) ou pelo tema (`filmes`, `lugares`...). |
| Total | ~350 futebol + ~250 gerais | **373 de futebol + 248 gerais = 621** (eram 169) |
| Sem tema | só futebol | igual; `abrir impostor futebol` também |
| Lista de temas | futebol e gerais separados | `temas do impostor` mostra as duas listas. A legenda da sala diz o tema e lembra dos outros. |
| Palavra proibida | ano da Copa entrega | ano inteiro ou de 2 dígitos ("70") não vale como dica |
| Testes | conteúdo, temas, imagens | 5 testes novos: filtro de glifos, nada fora da fonte, imagem com emoji sem rede, cards sem corte, conteúdo e temas do Impostor. **130 passando**; o build passa. |

**Ficou de fora, como planejado:** Copa de 2026, apelidos de clube e "coisa do futebol".

## 20. Impostor: temas à escolha, grupo só de Impostor e muito mais conteúdo (19/11)

> Pedido: "como ficou hoje para iniciar o Impostor com outros temas? Tem como deixar um tema só para futebol, e a pessoa consegue escolher o tema que colocar na frente. Fazer também um comando para ativar apenas o Impostor num grupo quando o grupo não for de tema de futebol. Adicione mais temas e traga o máximo de conteúdo possível. Tire o diabinho de emoji do Impostor também."

### 20.1 Como está hoje (antes desta rodada)

- `abrir impostor`: mistura os temas de futebol.
- `abrir impostor <tema>`: um tema só (ex.: `filmes`, `lugares`, `craques`).
- `abrir impostor geral`: mistura os temas gerais.
- Para usar o bot, o grupo precisa de `ativar jogos`, que liga **todos** os jogos (o bot é de futebol).
- O nome do jogo é "Impostor do Futebol" e as mensagens usam o 😈.

### 20.2 O que muda

| # | Pedido | Como fica |
|---|---|---|
| 1 | Tema só de futebol | `abrir impostor futebol` (ou `abrir impostor do futebol`) mistura só os temas de futebol, em qualquer grupo. |
| 2 | Escolher o tema na frente do comando | `abrir impostor <tema>`, em qualquer um dos ~45 temas. Tema não encontrado: o bot responde com a lista. Misturas: `futebol`, `geral` (tudo que não é futebol) e `tudo`. |
| 3 | Grupo só de Impostor | Comando do admin `ativar impostor` (também `ativar só impostor`). Ativa o bot no grupo só com o Impostor. **Sem tema, o padrão desse grupo é `geral`.** Os outros jogos respondem "neste grupo só o Impostor está ativo". `ajuda` mostra só os comandos do Impostor. `ativar jogos` volta a liberar tudo; `desativar jogos` desliga. |
| 4 | Sem o diabinho | O 😈 sai de todas as mensagens: 🕵️ no título do jogo, 🎭 na carta do impostor. |
| 5 | Nome do jogo | "Impostor do Futebol" vira **"Impostor"**, porque agora serve para grupo que não é de futebol. O tema aparece na sala, na carta e na imagem. |
| 6 | Mais temas e conteúdo | Ver 20.3. |

**Onde guarda o modo do grupo:** no armazenamento por grupo que o bloqueio do *próxima* já usa (`group_seen`, tipo `admin:modo`). Não precisa mexer no banco.

### 20.3 Conteúdo: metas

| Bloco | Antes | Meta |
|---|---|---|
| Temas de futebol | 11 temas, 373 segredos | **16 temas, ~550**: mais nomes em craques (BR e mundo) e 5 temas novos: goleiro, craque argentino, gringo do Brasileirão, gíria do futebol, narrador e comentarista |
| Temas gerais que já existem (12) | 248 | **~650**: país, capital, cidade, animal, comida, profissão, artista, esporte, novela, filme e lugar com 45 a 65 nomes cada; estado brasileiro com os 27 |
| Temas gerais novos | — | **~26 temas, ~850**: desenho, herói e vilão, série, personagem de filme, ator de Hollywood, ator brasileiro, apresentador de TV, comediante, cantor internacional, banda brasileira, banda internacional, atleta brasileiro, atleta do mundo, ponto turístico, objeto da casa, transporte, marca, carro, comida brasileira, bebida, corpo humano, roupa e acessório, instrumento musical, brincadeira, festa e data, app e rede social, videogame |
| Anime e história | — | 1 tema cada: personagem de anime e personagem histórico |
| **Total** | **621** | **~2.000 segredos em ~45 temas** |

- **`temas do impostor`:** mostra os temas com acento e separados (futebol, gerais, anime e história), além de como misturar.

### 20.4 Critério e fontes

- **Só nome conhecido:** que um grupo brasileiro comum reconhece (mesmo critério do Anagrama). Na dúvida, fica de fora.
- **Nada de 2026 sem fonte**, e nada que muda: nenhum segredo diz clube atual, cargo atual nem resultado recente.
- **Sem política atual nem religião:** o histórico só tem figuras do passado; o "político" fica de fora.
- **Nome que se repete em 2 temas pode** (Hulk craque e Hulk herói): são segredos diferentes, com ids diferentes.

### 20.5 O que fica de fora

- Futebol feminino como tema: poucos nomes que todo grupo conhece. Fica para quando houver lista conferida.
- Influenciadores e youtubers: mudam rápido e geram discussão.
- Tema do grupo (o admin cadastra os próprios segredos) e modo disfarce: continuam para a fase 2 (18.11).
- Imagens próprias para grupos que não são de futebol: as imagens continuam com a marca Duelo de Craques.

### 20.6 Testes

- Modo do grupo:
  - `ativar impostor` só pelo admin;
  - outro jogo é recusado;
  - `abrir impostor` sem tema sai com tema geral;
  - `abrir impostor futebol` sai com tema de futebol;
  - `ativar jogos` libera tudo.
- Temas e conteúdo:
  - todo tema com 15 ou mais segredos;
  - chaves de tema sem repetição;
  - ids únicos;
  - `futebol`, `geral` e `tudo` misturam certo.
- Sem 😈 em nenhuma mensagem do Impostor.

### 20.7 Planejado x entregue

| Item | Planejado | Entregue |
|---|---|---|
| Tema só de futebol | `abrir impostor futebol` | `abrir impostor futebol` e `abrir impostor do futebol` misturam só os de futebol, em qualquer grupo |
| Tema na frente do comando | qualquer tema | 57 temas. Vale o nome com ou sem acento e o que aparece na lista (ex.: "festas e datas"). Tema desconhecido: o bot responde com a lista. Misturas: `futebol`, `geral` (tudo que não é futebol, com anime e história) e `tudo`. |
| Grupo só de Impostor | `ativar impostor` (admin) | `ativar impostor` / `ativar só o impostor` / `ativar apenas impostor`, só o admin. Sem tema, o padrão é `geral`. `ajuda`, `regras` e `temas` mostram só o Impostor. Abrir outro jogo responde "neste grupo só o Impostor está ativo". `ativar jogos` libera tudo; `desativar jogos` desliga e lembra como voltar. |
| Diabinho | sair o 😈 | sai de todas as mensagens: 🕵️ no título, 🎭 na carta do impostor e no resultado |
| Nome do jogo | "Impostor" | "Impostor" na sala, nas mensagens e nas imagens |
| Futebol | 16 temas, ~550 | **16 temas, 599 segredos.** Craques 94, craques do mundo 98. Temas novos: goleiros 34, argentinos 34, gringos do Brasileirão 26, gírias 32, narradores 25. |
| Gerais que já existiam | ~650 | **12 temas, 741 segredos**: entre 51 e 70 cada; os estados agora são os 27 |
| Gerais novos | ~26 temas, ~850 | **27 temas, 906 segredos** (desenhos, heróis e vilões, séries, personagens de filme, atores, apresentadores, comediantes, cantores, bandas, atletas, pontos turísticos, objetos, transportes, marcas, carros, comidas brasileiras, bebidas, corpo humano, roupas, instrumentos, brincadeiras, festas e datas, apps, videogames) |
| Anime e história | 1 tema cada | animes 41 e história 39 |
| **Total** | ~2.000 em ~45 temas | **2.326 segredos em 57 temas** (eram 621) |
| Lista de temas | com acento, por bloco | `temas do impostor`: futebol, gerais, anime e história, as misturas e o padrão do grupo |
| Palavra proibida | — | o nome inteiro sempre conta, mesmo curto ("U2", "Ka") |
| Testes | modo do grupo e conteúdo | 2 testes novos: temas, misturas, rótulos que funcionam como comando e mensagens sem 😈; grupo só de Impostor de ponta a ponta. **132 passando**; o build passa. |

**Ficou de fora, como planejado:** futebol feminino, influenciadores, tema do grupo e imagens sem a marca Duelo de Craques.

## 21. Correção: Anagrama só aceita a palavra exata (19/11)

- **Problema:** o Anagrama usava a mesma conferência dos quizzes, que tolera erro de digitação e aceita apelido. Por isso "Rodrigo" valia por "Rodrygo" e "bparaiba" por "Paraíba".
- **Agora:** só vale a palavra 100% certa, com as mesmas letras na mesma ordem.
  - Não importam acento, maiúscula, espaço, hífen nem o artigo do começo ("rei do gado" vale por "O Rei do Gado").
  - Letra trocada, letra a mais e apelido ("inter", "vini jr") não valem.
- **Os outros jogos não mudam:** quizzes e o palpite do Impostor continuam tolerando erro pequeno de digitação.
- **Regras:** as do Anagrama ganharam a linha "Só vale a palavra certinha (acento não precisa)".
- **Teste:** os dois casos do grupo, mais espaço/hífen/artigo e uma rodada de ponta a ponta. São 133 testes passando.

## 22. Spoiler do time da rodada e mais conteúdo nos modos (19/11)

> Pedido: "Sobre aquele tema do spoiler, ainda aparece na rodada atual. Tem que aparecer só depois de passar a rodada. Adicione mais conteúdo nos modos."

### 22.1 Spoiler

- **Causa:** no fim de cada rodada, o bot avança para a próxima **antes** de montar a imagem. A imagem de "Fim da rodada 3" saía com o time da rodada 4, que acabava de virar a "atual". Acontecia na Escalação em Grupo e no 1x1.
- **Regra nova:** nas imagens, o time de uma rodada só aparece depois que ela termina. No fim da partida, aparecem todos.
- **A rodada da vez continua no texto:** "Rodada 4/6 · MEIA · clube: Atlético-MG".

### 22.2 Inventário (antes)

Partidas que cada modo aguenta sem repetir, contando só futebol, que é o padrão:

| Modo | Conteúdo | Por partida | Partidas |
|---|---|---|---|
| Linha do Tempo | 29 fatos de futebol | 24 | **~1** |
| Sobrevivente | 16 listas de futebol (40 no total) | até 8 | **~2** |
| Emoji | 29 cartas de futebol (78 no total) | 8 | **~3** |
| Que time é esse? | 33 escalações | 6 | **~5** |
| Conexões | 11 tabuleiros de futebol (29 no total) | 2 | **~5** |
| Stop | 10 categorias | 5 por rodada | repete muito |
| Quem é, Fato ou Fake, Relâmpago, Chute, Intruso, Top 10 e Anagrama | 6 a 9 partidas ou mais | — | ficam para outra rodada |

### 22.3 Metas

| Modo | Meta |
|---|---|
| Linha do Tempo | +40 fatos de futebol (fundação dos clubes, Mundiais e Libertadores de clubes brasileiros, Bolas de Ouro, transferências) |
| Sobrevivente | +12 listas de futebol (clubes de Neymar, CR7, Messi, Ronaldinho, Kaká e Romário; titulares das finais de 1970, 1994 e 2002; os 12 grandes; brasileiros campeões da Libertadores; campeãs da Copa feminina) e +10 gerais |
| Emoji | +30 cartas de futebol (craques, clubes, torneios e lances) |
| Que time é esse? | +15 escalações (França 98, Real Madrid 2002 e 2018, Internacional 2006, Grêmio 2017, Palmeiras 99, Corinthians 2000, Atlético-MG 2013, Brasil 2014, Barcelona 2006, Inglaterra 66, São Paulo 92, Botafogo 2024, Fluminense 2023, PSG 2025) |
| Conexões | +4 tabuleiros de futebol e +2 gerais |
| Stop | +8 categorias (marca, objeto, parte do corpo, filme ou série, carro, bebida, esporte, cantor ou banda), com as listas do Impostor como base |

### 22.4 Fontes e critério

- **Só fato histórico fechado, que não muda:** finais, fundações, prêmios já entregues.
- **Escalações:** só as que eu tenho certeza, como já era a regra do arquivo ("escalação conferida").
- **Listas do Sobrevivente:** precisam ser completas (errar tira vida). Por isso só entram conjuntos fechados, com data de corte no título ("até 2025").
- **Dados de 2025 e 2026:** só os que o projeto já tem com fonte (Flamengo campeão da Libertadores de 2025, PSG campeão da Champions). Nada novo de 2026.

### 22.5 O que fica de fora

- Quem é, Fato ou Fake, Relâmpago e Chute: já aguentam de 6 a 10 partidas; ficam para a próxima rodada.
- Bandeiras novas: cada uma precisa ser desenhada à mão em formas, e o modo já tem 58.
- Escalações e clubes de jogadores ainda em atividade em 2026: podem ter mudado.

### 22.6 Planejado x entregue

| Item | Planejado | Entregue |
|---|---|---|
| Spoiler | time só depois da rodada | **Escalação em Grupo e 1x1:** a imagem mostra só os times das rodadas que já terminaram (no fim, todos). A rodada da vez vai só no texto. O teste agora checa o "fim da rodada 3" (o time da 4 não aparece) e o começo da partida (nenhum time). |
| Linha do Tempo | +40 de futebol | **+42**: 71 fatos de futebol (eram 29); 179 no total |
| Sobrevivente | +12 de futebol, +10 gerais | **+12 de futebol, +10 gerais e +1 de anime**: 28 de futebol (eram 16); 63 no total |
| Emoji | +30 de futebol | **+38**: 67 cartas de futebol (eram 29); 116 no total |
| Que time é esse? | +15 | **+16**: 49 escalações. Palmeiras 1999 ficou de fora (sem certeza dos 11); entraram Itália 1982 e Manchester City 2023 |
| Conexões | +4 de futebol, +2 gerais | igual: 15 de futebol (eram 11); 35 no total |
| Stop | +8 categorias | igual: 18 categorias. Marca, objeto, parte do corpo, filme ou série, carro, bebida, esporte e cantor ou banda; as listas vêm dos temas do Impostor e o que faltar vai para a IA |
| Testes | conteúdo e imagens | 3 testes novos: quantidades e ids únicos; 11 titulares por escalação; 16 nomes diferentes por tabuleiro; listas sem item repetido; letras cobertas nas categorias novas do Stop. **136 passando**; o build passa. |
