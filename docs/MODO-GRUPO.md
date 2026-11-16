# Modo em Grupo: planejamento completo

O 1 x 1 (Duelo de Craques) põe dois jogadores frente a frente. O **Modo em Grupo** abre uma *sala* de até 10–15 pessoas: quem mandar `entrar` passa a jogar, **cada um dá uma resposta por rodada**, **nenhuma resposta pode se repetir na partida**, e a rodada avança quando **todos os inscritos responderem** (ou quando o tempo acabar). Ele existe nos três jogos da plataforma: ⚽ futebol, 🎌 animes e 🧠 conhecimentos gerais.

Documentos relacionados: [`PLATAFORMA.md`](PLATAFORMA.md) · [`PLANEJAMENTO.md`](PLANEJAMENTO.md) · [`ANIMES.md`](ANIMES.md) · [`CONHECIMENTOS-GERAIS.md`](CONHECIMENTOS-GERAIS.md) · [`EVOLUTION.md`](EVOLUTION.md)

---

## 1. Pesquisa

### 1.1 Projeto Trivia (referência principal)

O Projeto Trivia publica quizzes, Top 10, desafios e drafts sobre Champions, Brasileirão, FIFA e craques, além de anime, filmes e séries. Tem um perfil só de futebol (@projetotriviafutebol) e um principal (@oprojetotrivia). Formatos que aparecem com frequência e como cada um vira modo de grupo:

| Formato do Projeto Trivia | Exemplo | Vira no grupo |
|---|---|---|
| **Jogo das Conexões** | "Atletas lendários do Brasil vs Mundo", conexões sobre Neymar | **Conexões** (§4.4) |
| **Um X para cada letra** | "Um goleiro para cada letra do alfabeto", "Times com a letra A" | **Alfabeto** (§4.5) |
| **Draft 5x5** | "Draft 5x5 – jogadores com a letra F" | **Draft da Resenha** (§4.9) |
| **Top N** | "Top 15 melhores goleiros do mundo" | **Top 10 coletivo** (§4.6) |
| **Perguntei para 100 pessoas** | "Qual o melhor goleiro brasileiro de todos os tempos?" | Retirado (conflita com respostas únicas, ver §4) |
| **Qual é a nota?** | adivinhar a nota/número | **Chute Certo** (§4.7) |
| **Quem não pertence à lista?** | 4–5 nomes, um intruso | **Intruso** (§4.8) |

Fontes: [Projeto Trivia (YouTube)](https://www.youtube.com/@ProjetoTrivia), [@oprojetotrivia](https://www.tiktok.com/@oprojetotrivia), [Draft 5x5 letra F](https://www.tiktok.com/@projetotriviafutebol/video/7506496394425928965), [Um goleiro para cada letra](https://www.tiktok.com/@projetotriviafutebol/video/7569952920939089159), [Treinador para cada letra](https://www.tiktok.com/@projetotriviafutebol/video/7590361004412865799), [Times com a letra A](https://www.tiktok.com/@projetotriviafutebol/video/7632668372953533717), [Perguntei para 100 pessoas](https://www.tiktok.com/@oprojetotrivia/video/7489101558563622149), [Qual é a nota?](https://www.tiktok.com/@oprojetotrivia/video/7544115073346817336), [Top 15 goleiros](https://www.tiktok.com/@oprojetotrivia/video/7646766472701775125).

> O acesso direto ao YouTube está bloqueado nesta sessão. Os formatos acima vieram dos títulos e descrições indexados. Vale você me mandar 3 ou 4 vídeos favoritos do canal para eu detalhar os formatos.

### 1.2 Outros canais e sites

| Fonte | Formatos | Uso aqui |
|---|---|---|
| Canais de quiz de futebol no YouTube (BR) | Adivinhe o time pelo escudo, pelo hino, o jogador por clube + número + país + posição | **Quem é o craque?** (dicas) e **Que time é esse?**. Escudos e hinos ficam de fora: são marcas e obras protegidas |
| FourFourTwo / JetPunk | Escalação de jogos históricos, time pelas nacionalidades da escalação, jogador pela carreira | **Que time é esse?** (§4.2) e a variante por nacionalidades |
| The Athletic / Football Connections | 16 nomes em 4 grupos de 4 | **Conexões** |
| Soccer Grid / Football Grid | Grade 3x3 de critérios | Grade coletiva (futuro) |
| Donki – Anime e afins | Adivinhar o anime por abertura, emoji, olhos, voz | **Emoji-Anime**. Abertura, voz e imagem ficam de fora por direitos |
| Sporcle / Zikoko | Emoji, imagem pixelada, aberturas | idem |

Fontes: [Adivinhe o jogador por time + número + país + posição](https://www.youtube.com/watch?v=aOAzFGx0ABY), [Adivinhe o time pelo hino](https://www.youtube.com/watch?v=4cCvVQLHGps), [100 times pelo escudo](https://www.youtube.com/watch?v=zUzYM17ejeQ), [FourFourTwo – carreiras](https://www.fourfourtwo.com/us/features/football-quiz-can-you-guess-these-100-players-from-their-career-paths-2), [FourFourTwo – Starterz](https://www.fourfourtwo.com/us/play/type/bWwPOP), [Futbol Connections](https://f11-nuxt.pages.dev/articles/how-to-play-futbol-connections), [Soccer Connections](https://soccerblade.com/soccer-connections/), [Football Grid](https://footballgenius.pages.dev/game/grid/rules), [Donki – Anime](https://recapio.com/digest/anime-opening-quiz-random-levels-guess-the-anime-opening-by-donki-anime), [Zikoko – emoji](https://www.zikoko.com/quizzes/quiz-can-you-guess-the-anime-from-these-emojis/).

### 1.3 Mecânicas de jogos multiplayer (o que copiar)

| Jogo | Mecânica | Decisão |
|---|---|---|
| **Kahoot** | Pontos por acerto + bônus por velocidade; *streak* (sequência de acertos) dá bônus com teto, para quem está atrás seguir no jogo; modo "confiança" (aposta) | Adotado: acerto + bônus de velocidade com teto + sequência |
| **HQ Trivia** | Eliminação: errou, está fora; **vida extra** usada uma vez | Adotado no modo **Sobrevivente** (§4.10) |
| **Bots de WhatsApp (GamaGame, WASumo)** | Lista em que todos respondem ao mesmo tempo; quem acerta primeiro pontua; ranking de participação | Adotado em Top 10 e Alfabeto |
| **Telegram QuizBot** | Tempo por pergunta, acertos e tempo de cada um, ranking por quiz | Adotado no placar |

Fontes: [Kahoot – pontos](https://support.kahoot.com/hc/articles/115002303908), [Kahoot – Answer Streak](https://medium.com/inside-kahoot/experimenting-with-answer-streaks-to-help-make-learning-awesome-3b3357e42595), [HQ Trivia – regras](https://www.imore.com/hq-trivia), [HQ – vida extra](https://9to5mac.com/2018/07/03/hq-trivia-extra-life-feature/), [Marvin/GamaGame](https://www.tabnews.com.br/andremacola/marvin-whatsapp-bot-com-openai-algumas-features-a-mais-e-um-plus), [WASumo](https://wasumobot.lovable.app/en/comandos), [Telegram QuizBot](https://telegram.org/tour/quizbot/pt-br).

---

## 2. Como funciona no grupo

### 2.1 Ativação (admin)

| Regra | Como |
|---|---|
| Só admin ativa | `ativar grupo` só vale de um número em `ADMIN_NUMBERS`. **Já implementado:** em produção, sem admin configurado ninguém ativa |
| Admin precisa estar no grupo | O comando é mandado de dentro do grupo, então só ativa quem está nele |
| Vários grupos | O admin ativa quantos grupos quiser; cada grupo tem as próprias partidas e o próprio ranking |
| Admin saiu do grupo | *Planejado:* assinar o evento `GROUP_PARTICIPANTS_UPDATE` da Evolution. Se nenhum admin restar no grupo, o bot se desativa sozinho e avisa |
| Moderação | Comandos só de admin: `encerrar` (fecha qualquer partida), `pular` (pula a pergunta), `remover @fulano` (tira alguém da sala) |

### 2.2 Fluxo de uma sala

```
abrir sala            ─► IMAGEM "Sala aberta": jogo, modo, regras curtas, "mande ENTRAR"   (90 s)
entrar / sair         ─► o bot reage ✅ na mensagem (sem texto, para não poluir o grupo)
começar (anfitrião)   ─► fecha as inscrições (mínimo 2) · IMAGEM com a lista de jogadores
rodada n              ─► IMAGEM da pergunta (rodada, categoria, tempo)
  respostas           ─► 1 por jogador; ✅ (reação) se aceita, ❌ curto se repetida ou inválida
  todos responderam   ─► IMAGEM da revelação: resposta certa, quem acertou (por ordem), pontos
  ou o tempo acabou      quem não respondeu leva 0
a cada 5 rodadas      ─► IMAGEM do placar parcial (top 5)
fim                   ─► IMAGEM do pódio (top 3) + destaques; pontos vão para o ranking do grupo
```

Comandos da sala:

| Comando | Quem | Efeito |
|---|---|---|
| `abrir sala` / `jogo em grupo` | qualquer membro | abre a sala e vira anfitrião |
| `abrir sala futebol` / `anime` / `quiz` | qualquer membro | já escolhe o jogo |
| `aleatório` | anfitrião | sorteia jogo e modo |
| `entrar` / `entrar no jogo` | qualquer membro | entra na sala, até o limite do modo. Depois de começar, só até a **2ª rodada** (parâmetro `joinUntil` de cada modo); as posições perdidas contam como "sem resposta" |
| `sair` | jogador | sai da sala |
| `começar` | anfitrião | fecha as inscrições |
| `placar` | qualquer um | placar parcial |
| `encerrar` | anfitrião ou admin | fecha a sala e conta os pontos até ali |

### 2.3 Quem pode responder

- **Só quem mandou `entrar`.** Mensagens de quem está fora da sala são ignoradas, como no 1 x 1.
- **Uma resposta por jogador por rodada.** A primeira resposta válida de cada um é a que vale; depois disso, as mensagens dele são ignoradas até a próxima rodada.
- **Sala de 10 a 15 jogadores**, conforme o modo (tabela da §2.7). Com a sala cheia, `entrar` responde "sala cheia, fica para a próxima".

### 2.4 "Todos responderam" sem travar o jogo

A rodada avança assim que **todos os inscritos tiverem uma resposta aceita**. Três proteções impedem que um ausente trave a sala:

1. **Tempo por rodada** (30 a 60 s, conforme o modo). Esgotado, a rodada fecha; quem não respondeu leva 0.
2. **Ausência**: quem fica 2 rodadas seguidas sem responder vira "ausente" e sai da conta de "todos". Volta assim que responder.
3. **Anfitrião/admin** pode mandar `pular`.

Sobre o relógio (**decidido: QStash**, já implementado): a função da Vercel só roda quando chega uma mensagem, então ela não "acorda sozinha" quando o tempo acaba. Duas soluções, usadas juntas:
- **Upstash QStash**: ao abrir a rodada, o bot agenda uma chamada assinada a `/api/tick` para o segundo do prazo. Se todos responderem antes, a chamada chega com um token velho e é ignorada.
- **Verificação preguiçosa**: se o QStash falhar, qualquer mensagem no grupo depois do prazo fecha a rodada atrasada.

### 2.5 Regra anti-cola: respostas únicas (decisão tomada)

O jogo acontece **no grupo**, à vista de todos, e a cola deixa de compensar por uma regra só:

> **Uma resposta não pode se repetir na partida.** Se alguém já usou um jogador, personagem, país ou palavra, ninguém mais pode usar, nem na mesma rodada, nem em outra, nem por outro time.

Exemplo, no tema Joias (idade): Ana usa **Alexis Sánchez** pelo Arsenal. Duas rodadas depois, Bia tenta **Alexis** pelo Manchester United e o bot responde: "❌ Alexis Sánchez já foi escalado nesta partida (por Ana). Respostas repetidas não valem, nem por outro time." *(Essa regra já funciona no 1 x 1 e tem teste automático.)*

Como a regra vale em cada tipo de modo:

| Tipo de modo | Regra |
|---|---|
| **Várias respostas certas** (Escalação, Alfabeto, Top 10, Stop, Draft, Sobrevivente) | Cada resposta certa só pode ser usada **uma vez** na partida. Copiar quem respondeu antes é inútil: a resposta copiada é recusada. Repetida ou inválida **não gasta** a resposta do jogador, que tenta outra dentro do tempo |
| **Uma resposta certa** (Quem é?, Que time é esse?, Emoji, Bandeiraço) | Vira **corrida**: só o primeiro que acertar pontua. Quem repetir a resposta de outro é recusado. Aqui **cada jogador tem 1 tentativa por rodada**, e errar gasta a tentativa, para ninguém chutar em metralhadora |
| **Número** (Chute Certo) | Cada jogador escolhe um número **diferente** dos já ditos, no estilo "O Preço Certo". Quem responde depois não copia; no máximo encosta no número de alguém, o que também é estratégia |

Como o bot reconhece "mesma resposta": compara a **entidade**, não o texto. "Alexis", "Alexis Sanchez" e "alexis sánchez" viram o mesmo jogador pela ficha da IA e pelo que foi digitado. Em palavras abertas (Stop, Alfabeto), a comparação é normalizada: sem acento, sem maiúsculas, singular/plural.

Isso dispensa respostas no privado: **o jogo inteiro acontece no grupo**. A ideia de resposta no privado fica de lado.

### 2.6 Pontuação (padrão para todos os modos)

| Item | Pontos |
|---|---|
| Acerto | 100 |
| Bônus de velocidade (ordem entre os que acertaram na rodada) | 1º +50 · 2º +30 · 3º +15 · demais +5 |
| Sequência de 3 acertos seguidos | +50, uma vez a cada sequência (teto, como no Kahoot) |
| Chute Certo (§4.7) | 100 para o mais próximo, 60 para o 2º, 30 para o 3º; exato +50 |
| Corrida: errou a tentativa | 0 (a punição é perder a chance na rodada) |
| Ranking do grupo | 1º da sala 5 pts, 2º 3, 3º 2, participação 1. Ranking por jogo e geral |

### 2.7 Tamanho da sala por modo

Para não ficar pesado nem poluir o grupo: **mínimo 2, máximo entre 10 e 15**.

| Modo | Máx. | Por quê |
|---|---|---|
| Escalação em Grupo (§4.0) | **10** | 6 rodadas × 10 = 60 escolhas, cada uma consultando a IA; a imagem do placar fica legível |
| Draft da Resenha | **8** | Ordem em serpente fica longa |
| Top 10 coletivo | **10** | Só há 10 respostas por lista |
| Stop coletivo | **10** | Cada jogador manda 6 palavras por rodada |
| Conexões | **12** | 4 grupos por partida |
| Quem é? · Que time é esse? · Emoji · Bandeiraço | **15** | Corrida, 1 tentativa cada: mensagens limitadas |
| Intruso | **15** | No máximo 4 X por rodada, um de cada vez |
| Alfabeto · Chute Certo · Sobrevivente | **15** | 1 resposta por jogador por rodada |

## 3. Imagens do Modo em Grupo

Mesmo formato (1080x1350) e a identidade do jogo escolhido (verde-estádio, roxo-mangá ou azul-caderno).

| Tela | Conteúdo |
|---|---|
| **Sala aberta** | Nome do modo, regras em 3 linhas, "MANDE ENTRAR", tempo restante, contador de inscritos |
| **Lista de jogadores** | Até 15 nomes em colunas, cada um com uma cor; "VALENDO!" |
| **Pergunta** | "RODADA 4/10", categoria, o conteúdo (escalação, dicas, emojis, bandeira, lista com lacunas), tempo, e o lembrete "1 resposta por pessoa · respostas repetidas não valem" |
| **Revelação** | Resposta certa em destaque; lista de quem acertou, por ordem, com pontos ganhos; quem errou ou não respondeu, em cinza |
| **Placar parcial** | Top 5 com barras; quem subiu ou caiu desde o último placar |
| **Pódio** | Top 3 em degraus, mais "mais rápido", "maior sequência" e "chute mais preciso" |

---

## 4. Catálogo de modos

Cada modo mostra: mecânica, regra anti-cola, dados e em quais jogos aparece (⚽ 🎌 🧠). Todos seguem a §2.5: **uma resposta por jogador por rodada e nada se repete na partida**.

### 4.0 Escalação em Grupo · ⚽ 🎌 🧠 · várias respostas certas · **o modo principal · implementado (⚽)**

O Duelo de Craques para a sala toda. O tema é escolhido pelo anfitrião ou sorteado (`aleatório`): gols, idade, valor, altura etc. Em cada rodada, **todos** escalam a mesma posição:

```
Rodada 1 · GOLEIRO · (clube sorteado: Barcelona)      ← todos mandam 1 goleiro
  Ana: Ter Stegen ✅   Bia: Valdés ✅   Caio: Ter Stegen ❌ já usado por Ana → manda outro
  todos com resposta aceita → abre a rodada 2
Rodada 2 · DEFENSOR …  (2 defensores, 2 meias, 1 atacante)
Fim: soma de cada um, maior (ou menor) vence
```

- Ordem estrita igual ao 1 x 1: todos fecham o goleiro antes de abrir os defensores.
- **Nenhum jogador real se repete** entre ninguém, em nenhuma rodada, por nenhum time.
- Quanto mais gente na sala, mais disputados ficam os nomes óbvios. Quem responde rápido "reserva" o craque; quem demora precisa conhecer mais. Isso substitui o bônus de velocidade.
- Dados e validação: os mesmos do 1 x 1 (Maritaca + cache, restrição por clube/seleção, faixas de plausibilidade). 🎌 usa o Esquadrão (papéis) e 🧠 o Volta ao Mundo / Brasil de Ponta a Ponta.
- Imagem por rodada: **tabela da sala** (cada jogador numa linha, as 6 posições em colunas, número em cada casa), em vez do campinho, porque o campinho só comporta 2 times. No modo cego, os números ficam escondidos até o fim.

### 4.1 Quem é? (dicas progressivas) · ⚽ 🎌 🧠 · corrida · **implementado (⚽)**

O bot revela até 5 dicas, uma a cada 8 s. ⚽ nacionalidade → posição → clubes → títulos → número da camisa. 🎌 obra → papel → aparência → habilidade → ano de estreia. 🧠 personalidade, lugar ou objeto. **1 tentativa por jogador**; o primeiro a acertar leva **pontos conforme a dica**: 1ª 150, 2ª 120, 3ª 90, 4ª 60, 5ª 30. Dados: cache das fichas (futebol), AniList (anime) e lista curada (geral).

### 4.2 Que time é esse? (escalação histórica) · ⚽ 🎌 · corrida · **implementado (⚽)**

Pedido seu. O bot mostra uma **escalação em campinho**, só com os nomes:

```
Taffarel
Jorginho · Aldair · Márcio Santos · Branco
Mauro Silva · Dunga · Mazinho · Zinho
Bebeto · Romário
```

**1 tentativa por jogador**, no formato **time + ano** (`Brasil 94`). Pontos: o primeiro com time **e** ano exatos leva 150. Quem acertou só o time leva 60, por ordem de chegada; repetir um palpite já dito é recusado. Variantes:
- **Por nacionalidades**: as bandeiras de cada posição em vez dos nomes (formato do FourFourTwo).
- **Meia escalação**: só 6 nomes; acertar com menos informação vale mais.
- **🎌 Que grupo é esse?**: nomes dos membros → a organização (Akatsuki, Bando do Chapéu de Palha, Time 7, Hashiras, Cavaleiros de Ouro, Espada Kamui…).

Dados: **lista curada** de ~150 times marcantes, cada um com escalação, ano, competição e apelidos aceitos. Exemplos: seleções de 70, 82, 94, 2002, 2014 e 2022; Barça 2009/2011; Real 2017; Milan 1989/2007; Liverpool 2005/2019; Manchester United 1999; Bayern 2013/2020; Ajax 1995; Flamengo 1981/2019; Santos 1962/2011; São Paulo 1992/2005; Palmeiras 1999/2021; Grêmio 1983/2017; Inter 2006; Corinthians 2012; Atlético-MG 2013; Cruzeiro 2003; Vasco 1998. Para finais europeias também existe o **StatsBomb Open Data** (escalações de todas as finais de Champions de 2003/04 a 2018/19 e Copas), mas só para uso **não comercial**.

### 4.3 Emoji · 🎌 ⚽ 🧠 · corrida

`🍥🦊👊` → Naruto · `⚡👓🧙` → Harry Potter · `👑🦁⚽🇸🇪` → Ibrahimović. 1 tentativa por jogador; o primeiro a acertar leva 100 + velocidade. Com 15 s sem acerto, sai uma dica escrita, e quem ainda tem tentativa pode usar (vale 60). Dados: lista curada (~200 por jogo).

### 4.4 Conexões · ⚽ 🎌 🧠 · várias respostas certas

Inspirado no "Jogo das Conexões" do Projeto Trivia e no Football Connections. O bot mostra **16 nomes numerados**. Em cada rodada, cada jogador manda **1 grupo de 4 números** (`3 7 11 14`). Um grupo achado é **retirado do tabuleiro**, e repetir um grupo já achado é recusado. Quem achou leva 150 e o bot revela a ligação ("jogaram no Barça e no PSG"). Quatro grupos por partida, do fácil ao difícil. Dados: lista curada; a IA ajuda a montar rascunhos que você revisa.

### 4.5 Alfabeto · ⚽ 🎌 🧠 · várias respostas certas

Do "um goleiro para cada letra" do Projeto Trivia. O bot sorteia **categoria + letra** ("goleiros com a letra C"). Cada jogador manda **1 nome** por rodada; nomes já ditos são recusados, então quem demora precisa ir mais fundo. Válido e único: 100 + ordem de chegada. São 5 letras por partida. Variante **Alfabeto completo**: a sala coopera para cobrir A–Z de uma categoria em 3 minutos, uma letra por mensagem e sem repetir.

### 4.6 Top 10 · ⚽ 🎌 🧠 · várias respostas certas · **implementado**

O bot mostra um ranking escondido ("Marcas de carro mais vendidas no Brasil em 2025") e cada acerto revela a posição ("✅ Ana acertou: 7º lugar — Jeep"). **Ninguém manda dois palpites seguidos: é preciso esperar outra pessoa responder.** Palpite já revelado ou já tentado não vale. Vence quem acertar mais posições, em 4 minutos ou até a lista acabar. Regras completas, 12 listas no ar e mais de 20 temas planejados em [`TOP10.md`](TOP10.md).

### 4.7 Chute Certo · ⚽ 🎌 🧠 · número único

Do "Qual é a nota?" do Projeto Trivia, no estilo "O Preço Certo". "Quantos gols Romário fez pelo Vasco?", "Quantos episódios tem One Piece até o arco de Wano?", "Qual a altitude de La Paz?". Cada um manda **1 número, diferente de todos os já ditos**; vence o mais próximo (100/60/30, exato +50). Responder por último não é cola: é estratégia ("1 a mais que o Caio").

### 4.8 Intruso · ⚽ 🎌 🧠 · eliminação coletiva · **implementado (⚽)**

`abrir intruso`. O bot mostra **5 nomes (A a E)**: 4 têm algo em comum e 1 é o intruso.

1. Os jogadores marcam **X em quem pertence ao grupo**, mandando a letra (ou o nome). **Ninguém marca duas vezes seguidas**: é preciso esperar outra pessoa marcar.
2. A cada X, o bot mostra o quadro em texto com o nome riscado e quem marcou (`B) ~Cafu~  X (Ana)`), **sem dizer se está certo**.
3. Quando sobra **1 nome** (o palpite de intruso do grupo) ou o tempo (60 s) acaba, chega a **imagem da revelação**: cada X marcado como **certo** (verde) ou **errado** (vermelho, quando alguém riscou o intruso), o intruso destacado e a **justificativa** ("Os outros quatro foram campeões da Copa de 2002...").
4. Pontos: X em quem pertence **+50**; X no intruso **−50**; se o nome que sobrou era mesmo o intruso, todos que marcaram certo ganham **+30**.

5 rodadas; 16 conjuntos curados, cada um com motivo verificável e data de corte quando o fato pode mudar.

### 4.9 Draft da Resenha · ⚽ 🎌 · ordem de draft

Do "Draft 5x5" do Projeto Trivia. Até 8 jogadores, **ordem em serpente** (1→8, 8→1…), 5 escolhas cada, com a regra da rodada ("só jogadores com a letra F", "só quem jogou no Brasileirão"). A IA valida cada escolha, e ninguém repete. No fim, votação no grupo: cada um manda o número do time em que vota, sem poder votar no próprio, e o mais votado vence. Imagem: mural com os times de cada um.

### 4.10 Sobrevivente · ⚽ 🎌 🧠 · várias respostas certas + eliminação

Inspirado na eliminação do HQ Trivia, adaptado para respostas únicas. O bot dá uma **categoria** ("campeões da Libertadores", "personagens de Naruto", "capitais da Europa"). Na ordem da sala, cada um tem 15 s para dizer **um item novo**. Repetiu, errou ou estourou o tempo, está fora. Cada jogador tem **1 vida extra**. A categoria muda a cada volta e fica mais difícil; o último de pé vence.

### 4.11 Stop coletivo · 🧠 ⚽ 🎌 · várias respostas certas

A Adedonha para a sala toda, no grupo: uma letra e 6 categorias. Cada um manda **1 mensagem com as 6 respostas**; o primeiro a mandar pode gritar `stop`, e os outros têm 15 s. Resposta **igual à de alguém que mandou antes não vale**: copiar dá zero, então quem demora precisa pensar diferente. Válida 10 pontos, inválida ou repetida 0. Imagem: tabela com as respostas e ✓/✗.

### 4.12 Bandeiraço · 🧠 · corrida

Bandeira desenhada (SVG de domínio público), 1 tentativa por jogador, e o primeiro a acertar o país leva o ponto. Fases: América do Sul → Europa → mundo inteiro.

### 4.13 Quiz Relâmpago · 🧠 ⚽ 🎌 · corrida

10 perguntas de resposta curta (sem alternativas A–D, porque com só 4 opções e respostas únicas a regra não funciona). 1 tentativa por jogador, e só o primeiro a acertar pontua (100 + velocidade). Banco curado por categoria.

### Fora do plano

**Pesquisa da Galera** (do "Perguntei para 100 pessoas") foi retirada: a graça dela é coincidir com a maioria, o que contradiz a regra de respostas únicas.

### Resumo

| Modo | ⚽ | 🎌 | 🧠 | Regra | Máx. | Dados | Prioridade |
|---|---|---|---|---|---|---|---|
| **Escalação em Grupo** ✔ | ✅ | ✅ | ✅ | várias certas, sem repetir | 10 | IA + cache | **1 (pronto)** |
| **Que time é esse?** ✔ | ✅ | ✅ (grupo) | — | corrida, 1 tentativa | 15 | curado (24 times) | **pronto** |
| **Quem é?** ✔ | ✅ | ✅ | ✅ | corrida, 1 tentativa | 15 | curado (22 fichas) | **pronto** |
| Alfabeto | ✅ | ✅ | ✅ | várias certas, sem repetir | 15 | IA | **2** |
| **Top 10** ✔ | ✅ | ✅ | ✅ | sem repetir; ninguém responde 2× seguidas | 10 | curado/AniList/IBGE | **1 (pronto)** |
| Chute Certo | ✅ | ✅ | ✅ | número único | 15 | curado | **2** |
| Sobrevivente | ✅ | ✅ | ✅ | várias certas + eliminação | 15 | IA | 3 |
| **Intruso** ✔ | ✅ | ✅ | ✅ | eliminação coletiva, ninguém marca 2× seguidas | 15 | curado (16 conjuntos) | **pronto** |
| Conexões | ✅ | ✅ | ✅ | grupos únicos | 12 | curado | 3 |
| Emoji | ✅ | ✅ | ✅ | corrida, 1 tentativa | 15 | curado | 3 |
| Stop coletivo | ✅ | ✅ | ✅ | várias certas, sem repetir | 10 | IA | 4 |
| Draft da Resenha | ✅ | ✅ | — | serpente, sem repetir | 8 | IA | 4 |
| Bandeiraço | — | — | ✅ | corrida, 1 tentativa | 15 | SVG livre | 4 |
| Quiz Relâmpago | ✅ | ✅ | ✅ | corrida, 1 tentativa | 15 | curado | 4 |

---

## 5. Conteúdo: de onde vêm as perguntas

O grupo joga muitas rodadas por noite, e repetir pergunta mata a graça. Por isso o conteúdo tem mais peso que o código:

| Item | Plano |
|---|---|
| **Pacotes curados** | Arquivos JSON versionados no repositório (`content/futebol/times-historicos.json`, `…/conexoes.json`…), cada pergunta com resposta, apelidos aceitos, dificuldade e fonte |
| **Meta de lançamento** | ~300 perguntas por jogo nos modos de prioridade 1–2 |
| **Sem repetição** | Tabela `group_seen(group_jid, content_id, seen_at)`: uma pergunta não volta ao mesmo grupo por 60 dias |
| **IA como redatora, não como juíza** | A Maritaca gera rascunhos (dicas, conexões, intrusos) a partir de dados conhecidos; você aprova numa página `/admin/conteudo` antes de entrar no jogo |
| **Correção de respostas** | Comparação normalizada (sem acento/maiúsculas) + lista de apelidos + tolerância a erro de digitação (distância de edição ≤ 2 para nomes longos). Rápida e sem IA. A IA só entra em respostas abertas (Alfabeto, Stop, Draft) |
| **Direitos** | Nada de escudos, fotos, hinos, aberturas ou frames de anime. Só nomes, números, emojis e bandeiras (domínio público) |

---

## 6. Arquitetura

O Modo em Grupo é uma nova **mecânica** da plataforma ([`PLATAFORMA.md`](PLATAFORMA.md) §4), no mesmo esquema de módulos.

```
src/lib/platform/mechanics/party/
  session.ts     sala: inscrição, anfitrião, ausentes, ordem, pontuação, placar
  round.ts       ciclo da rodada: abrir → coletar → fechar → revelar
  formats/       escalacao.ts · corrida.ts · unicas.ts (respostas únicas) · numero-unico.ts · draft.ts · eliminacao.ts
  scoring.ts     tabela da §2.6
src/games/<jogo>/party/*.ts   cada modo: como gerar a pergunta e como corrigir
content/<jogo>/*.json         pacotes curados
src/app/api/tick/route.ts     chamado pelo agendador no prazo de cada rodada
```

| Peça | Detalhe |
|---|---|
| Estado da sala | `matches.state` (jsonb), com `mechanic = 'party'`: jogadores `{jid, altJid, nome, pontos, sequência, ausências}`, rodada, pergunta, prazo, respostas e reivindicações |
| Uma sessão por grupo | Continua valendo: um 1 x 1 **ou** uma sala por grupo de cada vez |
| Respostas usadas | `state.used`: conjunto de chaves normalizadas (entidade canônica + o que foi digitado) de tudo que já foi aceito na partida; base da regra de respostas únicas |
| Tentativas | `state.attempts[rodada][jogador]`: garante 1 resposta aceita (ou 1 tentativa, nos modos de corrida) por rodada |
| Reações | `message/sendReaction` da Evolution para o ✅ de "entrei" e "resposta aceita"; recusas (repetida/inválida) em texto curto. Menos mensagens = menos risco de banimento |
| Timer | QStash agenda `/api/tick?match=…&round=…` (com assinatura) + verificação preguiçosa a cada mensagem |
| Concorrência | Muitas respostas chegando juntas: a trava otimista já reprocessa (até 3 vezes). Na sala, a resposta vira um *append* atômico em `jsonb`, para não disputar a linha inteira |
| Volume | Sala de 15 pessoas × 10 rodadas: ~150 respostas, mas só ~25 mensagens do bot (rodada + revelação + placares). As respostas aceitas recebem reações, não textos |

### Novas tabelas

| Tabela | Uso |
|---|---|
| `group_seen` | Perguntas já usadas por grupo (sem repetição por 60 dias) |
| `party_results` | Resultado de cada sala (posição e pontos de cada um), alimentando o ranking geral |
| `group_admins` *(opcional)* | Admins por grupo além dos globais de `ADMIN_NUMBERS` |

---

## 7. Fases

| Fase | Entrega | Status |
|---|---|---|
| **G1** | Sala (`abrir sala`/`top 10`, `entrar` com limite, `começar`, `sair`, `encerrar`, `pular`), entrada até a 2ª rodada, ausentes, prazo via QStash, respostas únicas, reações ✅/❌, imagens, ranking do grupo. **Escalação em Grupo** (⚽, 17 temas) e **Top 10** (12 listas) | **Pronto** |
| **G2** | **Que time é esse?** (24 escalações históricas, 6 rodadas, time + ano) e **Quem é?** (22 craques, 8 rodadas, até 5 dicas que saem a cada 12 s) | **Pronto** |
| **G3** | **Intruso** (pronto: X em quem pertence, revelação com certo/errado e justificativa) · **Alfabeto**, **Chute Certo**, mais 18 listas de Top 10 | em andamento |
| **G4** | Os modos prontos em 🎌 (AniList) e 🧠 (IBGE/REST Countries); `group_seen` para não repetir conteúdo | — |
| **G5** | **Sobrevivente**, **Conexões**, **Emoji**, **Stop coletivo**, **Draft da Resenha**, **Bandeiraço**, **Quiz Relâmpago**; curadoria `/admin/conteudo` | — |

### Como jogar os prontos do G2

| | Que time é esse? | Quem é? |
|---|---|---|
| Abrir | `abrir que time é esse` (ou `jogar ...`) | `abrir quem é` (ou `jogar quem é o craque`) |
| Rodada | Imagem da escalação no campinho (ataque em cima, goleiro embaixo) | Texto com a dica 1; uma nova dica a cada 12 s, até 5 |
| Palpite | Time + ano: `Brasil 94`, `Barça 2011`, `seleção de 70` | Nome do craque: `Ronaldinho`, `R9` |
| Pontos | Time e ano: 150 · só o time (primeiro a acertar): 60 | 150, 120, 90, 60 ou 30, conforme a dica |
| Regras | 1 palpite por pessoa por rodada; errar gasta; palpite igual a um já dito é recusado e não gasta | idem |
| Fim da rodada | Alguém acerta tudo, todos tentaram ou 45 s | Alguém acerta, todos tentaram ou acabaram as 5 dicas |
| Placar | Imagem a cada 3 rodadas e no fim | idem |

O comando exige `abrir`/`jogar` na frente, porque "que time é esse?" e "quem é?" aparecem muito na conversa normal do grupo.

### Verificação dos próximos modos

Revisão de cada modo planejado contra o que já existe (motor de sala, QStash, respostas únicas, cache da IA, imagens):

| Modo | Viável hoje? | O que reaproveita | Ajuste encontrado na verificação |
|---|---|---|---|
| **Alfabeto** | Sim | Sala, respostas únicas, Maritaca | A validação "é goleiro e começa com C?" sai da ficha que a IA já devolve (posição + nome). Sem custo novo |
| **Chute Certo** | Sim | Sala, número único | Perguntas precisam de resposta exata e estável: banco curado, como o Top 10 (fonte + data) |
| **Intruso** | **Feito** | Sala, QStash, regra "ninguém duas vezes seguidas" do Top 10 | Virou eliminação coletiva: X em quem pertence, revelação com certo/errado e a justificativa no fim (sem a IA julgar motivo) |
| **Sobrevivente** | Sim | Sala, QStash, respostas únicas | Precisa de um prazo por jogador (15 s), não por rodada: o QStash já suporta, é só agendar a cada vez |
| **Conexões** | Sim | Motor de quiz, imagem de grade | Precisa de conteúdo curado (4 grupos × 4 nomes por partida). A IA pode rascunhar, mas a revisão é humana |
| **Emoji** | Sim, com ajuste | Motor de quiz | O gerador de imagem (Satori) baixaria emojis da internet a cada imagem. **Mudança:** os emojis vão em **texto** (o WhatsApp mostra nativo), sem imagem |
| **Stop coletivo** | Sim | Sala, Maritaca | Uma chamada de IA por rodada valida todas as palavras de uma vez. "Repetida não vale" já existe |
| **Draft da Resenha** | Sim | Sala, cache, respostas únicas | A votação final é por número no grupo e é a única exceção à regra "respostas únicas" (votos podem coincidir) |
| **Bandeiraço** | Sim | Motor de quiz | Bandeiras em SVG de domínio público dentro do projeto (sem baixar nada na hora) |
| **Quiz Relâmpago** | Sim | Motor de quiz do G2 (é o mesmo do Quem é?, com 1 dica) | Banco de perguntas curado, resposta curta |
| **Grade dos Craques** (1x1) | Sim | Cache da IA (clubes + seleção de cada jogador) | Nenhum: a ficha da IA já tem tudo para conferir "jogou no clube X e é da seleção Y" |
| **Caminho do Craque** (1x1) | — | — | **Fundido no Quem é?**: a trajetória de clubes já é uma das dicas. Não precisa de modo separado |
| **Maior ou Menor** (1x1) | Sim | Cache da IA + temas do Duelo | Nenhum |
| **Copa do Grupo** (mata-mata) | Depois | 1 x 1 inteiro | Orquestrar vários duelos seguidos é o mais complexo; fica para o fim |

Resumo da verificação: **todos os modos continuam viáveis**. Quatro mudam: **Intruso** (eliminação coletiva com X e justificativa no fim), **Emoji** (em texto, não imagem), **Caminho do Craque** (vira dica do Quem é?) e **Draft da Resenha** (votação é exceção à regra de respostas únicas).

## 8. Decisões

Tomadas:
- ✅ **Uma resposta por jogador por rodada; respostas repetidas não valem** (nem por outro time). Tudo acontece no grupo, sem resposta no privado.
- ✅ **Sala de 10 a 15 jogadores**, conforme o modo (§2.7).
- ✅ **Entrada tardia até a 2ª rodada** nos jogos com rodadas (parâmetro `joinUntil` por modo; no Top 10, até a 2ª posição revelada). No 1 x 1, só os 2 jogadores.
- ✅ **Prazos com Upstash QStash.**
- ✅ **Mensagens limpas**: emoji só em pontos fixos (✅ aceito, ❌ recusado, 🏆 vencedor, 🎲 sorteio). Confirmações viram reação na mensagem, não texto.

Em aberto:
1. **StatsBomb**: só vale se a plataforma não for comercial; senão, as escalações históricas do "Que time é esse?" ficam 100% curadas.
2. **Links do Projeto Trivia**: você vai mandar para eu detalhar mais formatos.
