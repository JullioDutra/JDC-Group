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
