# Repertório: o que já tem e como crescer

Este documento lista o conteúdo dos jogos, as regras de curadoria e o plano para o acervo crescer sem perder qualidade. Contagens de 16/11/2026, geradas a partir do código (`src/lib/game/teams.ts` e `src/lib/party/content/*`).

Documentos relacionados: [`MODO-GRUPO.md`](MODO-GRUPO.md) · [`TOP10.md`](TOP10.md) · [`PLATAFORMA.md`](PLATAFORMA.md) · [`ANIMES.md`](ANIMES.md) · [`CONHECIMENTOS-GERAIS.md`](CONHECIMENTOS-GERAIS.md)

---

## 1. Inventário atual

| Conteúdo | Total | Por categoria | Onde é usado |
|---|---|---|---|
| Clubes | **168** | nível 1: 32 · nível 2: 57 · nível 3: 79 | Restrições do 1x1, Escalação em Grupo, Melhor Time, Alfabeto |
| Seleções | **51** | nível 1: 13 · nível 2: 17 · nível 3: 21 | idem |
| Temas do 1x1 | **17** | gols, assistências, valor, idade, títulos... | Duelo e Escalação em Grupo |
| Listas Top 10 | **32** | futebol 13 · geral 13 · política 6 | Top 10 |
| Grupos do Intruso | **42** | futebol 28 · política 9 · geral 5 | Intruso |
| Fichas do Quem é? | **49** | futebol 34 · história 15 | Quem é? |
| Escalações históricas | **33** | futebol | Que time é esse? |
| Cartas de emoji | **36** | futebol 18 · geral 11 · anime 7 | Emoji |
| Perguntas relâmpago | **39** | futebol 14 · política 10 · geral 8 · história 7 | Quiz Relâmpago |
| Perguntas numéricas | **50** | futebol 23 · política 12 · história 9 · geral 6 | Chute Certo |

**Jogadores não têm lista fechada.** Em todo jogo em que o participante digita um nome (1x1, Escalação, Melhor Time, Alfabeto), a IA (Maritaca, `sabia-4`) confere se o jogador existe, a posição, a nacionalidade, os clubes e o número do tema. A resposta fica em cache por 30 dias. Por isso o acervo de jogadores é, na prática, o conhecimento do modelo, e o que fica no código são os **clubes e seleções** usados para sortear restrições.

### 1.1 Níveis dos clubes

| Nível | O que é | Exemplos | Quando aparece |
|---|---|---|---|
| 1 | Gigantes que todo mundo conhece | Flamengo, Corinthians, Real Madrid, Barcelona, Bayern, Boca | Sorteio normal |
| 2 | Clubes grandes ou tradicionais | Bahia, Sport, Coritiba, Sevilla, Porto, Ajax, Celtic, River Plate | Twist *difícil* (sorteia níveis 1 e 2) |
| 3 | Clubes médios, de outros mercados ou de nicho | Ceará, Chapecoense, Juventude, Udinese, Galatasaray, Al-Hilal, LA Galaxy, Kashima | Twist *difícil* |

Com *difícil* a restrição pode cair num clube como Kashima Antlers ou Celtic. Aí o grupo precisa lembrar de um brasileiro que passou por lá, que é o tipo de pergunta que mais gera discussão.

### 1.2 Categorias

| Categoria | Comando | Observação |
|---|---|---|
| futebol | padrão nos jogos de futebol | — |
| geral | `geral` | conhecimentos gerais, geografia, ciência |
| história | `história` | Brasil Colônia, Império, Era Vargas, guerras |
| anime | `anime` | por enquanto só no Emoji (7 cartas) |
| política | `política` | **só entra quando pedida** (ver §3) |

Se o grupo pedir uma categoria com menos de 3 itens naquele jogo (ex.: `abrir chute certo anime`), o jogo usa a mistura padrão, que nunca inclui política.

---

## 2. Regras de curadoria

1. **Resposta estável.** Só entra o que não muda na próxima rodada do campeonato. Dados que mudam (artilharia em curso, valor de mercado atual) ficam com a IA, que consulta na hora.
2. **Data no título.** Listas que podem mudar levam o recorte: "Maiores campeões da Champions (até 2026)". Assim a lista continua correta mesmo depois de um novo título.
3. **Fonte verificável.** Cada lista tem que bater com uma fonte pública (Wikipédia, CBF, UEFA, FIFA, TSE, IBGE, Câmara, Senado). Em caso de divergência entre fontes, a pergunta sai.
4. **Nada de número contestado.** Ficaram de fora: gols de Pelé (o total varia conforme a contagem), tamanho exato das bancadas da Câmara (muda a cada janela partidária), rankings militares abaixo do 5º lugar.
5. **Apelidos e grafias.** Cada resposta aceita apelidos e grafias comuns (`Ronaldinho`/`Ronaldinho Gaúcho`, `Al Hilal`/`Al-Hilal`), com tolerância a 1–2 letras erradas.
6. **Difícil, mas justo.** A pergunta tem que ter resposta para quem acompanha o assunto. Evitamos perguntas que só alguém com o almanaque na mão acertaria.
7. **Sem marcas e obras protegidas.** Nada de escudos, hinos, aberturas de anime ou fotos de jogadores. As imagens do bot usam só texto, cores e formas.

---

## 3. Política e temas polêmicos

Política rende muita resenha e também muita briga. Por isso:

- **Opt-in.** Política só aparece quando alguém digita a categoria: `top 10 política`, `abrir intruso política`, `abrir relâmpago política`, `abrir chute certo política`. A mistura padrão nunca sorteia política.
- **Fato, não opinião.** As perguntas tratam de datas, números oficiais, cargos, leis e resultados eleitorais (TSE). Nada de "qual foi o pior presidente".
- **Os dois lados.** Quando a pergunta envolve figuras atuais, o conjunto cobre espectros diferentes (ex.: votos de Lula e de Bolsonaro no 2º turno de 2022).
- **Admin pode desligar.** Planejado: `desativar política`, que bloqueia a categoria no grupo.

Temas polêmicos já incluídos: ditadura militar, AI-5, impeachments, Diretas Já, Plano Real, eleição de 2022, presidentes que não terminaram o mandato, STF, ONU.

---

## 4. Plano de expansão

Meta para os próximos ciclos: dobrar cada acervo, com pelo menos 30% de conteúdo difícil.

### 4.1 Futebol

| Jogo | Hoje | Meta | O que entra |
|---|---|---|---|
| Clubes | 168 | 230 | Série B completa, clubes do Nordeste e Norte (Remo, Paysandu, CRB, Sampaio Corrêa), MLS, Arábia, Japão, México e o restante da Libertadores |
| Seleções | 51 | 70 | Seleções da Copa 2026 que ainda faltam e seleções africanas e asiáticas |
| Top 10 | 13 | 40 | Artilheiros por clube grande (Flamengo, Corinthians, Palmeiras, São Paulo, Grêmio, Inter, Atlético, Cruzeiro), mais jogos pela Seleção, maiores vendas do futebol brasileiro, campeões da Libertadores, artilheiros de Copa por país |
| Intruso | 28 | 60 | "Nunca jogou no Brasil", "Não foi campeão da Libertadores", "Não ganhou a Bola de Ouro", "Não jogou com Messi no Barça", "Não foi treinado por Guardiola" |
| Quem é? | 34 | 80 | Jogadores de 1970–2000, goleiros, técnicos, ídolos regionais (Dario, Dadá Maravilha, Evair, Alex) |
| Que time é esse? | 33 | 60 | Finais de Libertadores, Copa do Brasil, campeões brasileiros de 1987 a 2010, times que surpreenderam (Santo André 2004, Paulista 2005, São Caetano 2000) |
| Relâmpago | 14 | 50 | Regras, recordes, finais, técnicos, transferências |
| Chute Certo | 23 | 60 | Públicos recordes, anos de títulos, placares históricos, valores de transferências |

### 4.2 História e Geral

| Jogo | Hoje | Meta | O que entra |
|---|---|---|---|
| Quem é? (história) | 15 | 50 | Personagens do Brasil Império, abolicionistas, cientistas, inventores, papas, líderes mundiais |
| Relâmpago (geral + história) | 15 | 60 | Capitais, rios, bandeiras descritas em texto, invenções, guerras |
| Chute Certo (geral + história) | 15 | 50 | Distâncias, populações (IBGE), alturas, datas de tratados e batalhas |
| Top 10 (geral) | 13 | 30 | Maiores países em área, maiores cidades, estados mais populosos, maiores PIBs |
| Intruso (geral) | 5 | 30 | "Não faz fronteira com o Brasil", "Não é capital", "Não é planeta gasoso" |

### 4.3 Política

| Jogo | Hoje | Meta | O que entra |
|---|---|---|---|
| Top 10 | 6 | 15 | Presidentes por tempo de mandato, estados com mais eleitores (TSE), países com mais deputados |
| Intruso | 9 | 25 | "Não foi presidente", "Não foi ministro do STF", "Não foi governador de SP" |
| Relâmpago | 10 | 40 | Constituições, leis, cargos, eleições, instituições |
| Chute Certo | 12 | 30 | Datas de eleições e leis, número de cadeiras, votos oficiais |

### 4.4 Anime

Hoje só o Emoji tem anime (7 cartas). O plano completo está em [`ANIMES.md`](ANIMES.md). Primeiro passo: 30 cartas de emoji, 30 fichas de Quem é? (personagens), 15 Intrusos ("não é do Naruto") e 10 Top 10 (maiores mangás em vendas, animes mais longos).

---

## 5. Como acrescentar conteúdo

1. Escolha o arquivo: `top10-lists.ts`, `content/intruso.ts`, `content/whois.ts`, `content/lineups.ts`, `content/cards.ts` ou `content/chute.ts`.
2. Dê um `id` único e informe a `category`.
3. Rode `npm test`. O teste `repertório` confere ids repetidos, itens repetidos em Top 10, ordem das posições e se as escalações têm 11 nomes.
4. Para clubes, use `c(id, nome, nível, apelidos)` em `teams.ts`. Se o nome conflitar com outro clube (ex.: Atlético), preencha `not` para evitar confusão.

Ideia para depois: uma rota de admin que gera rascunhos com a IA (`sabia-4`) a partir de um tema. A IA só sugere; a revisão é humana antes de entrar no acervo.
