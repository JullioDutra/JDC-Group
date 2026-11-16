# Modo em Grupo: planejamento completo

O 1 x 1 (Duelo de Craques) põe dois jogadores frente a frente. O **Modo em Grupo** abre uma *sala*: todo mundo do grupo que mandar `entrar` passa a jogar, cada um responde, e a rodada avança quando **todos os inscritos responderem** (ou quando o tempo acabar). Ele existe nos três jogos da plataforma: ⚽ futebol, 🎌 animes e 🧠 conhecimentos gerais.

Documentos relacionados: [`PLATAFORMA.md`](PLATAFORMA.md) · [`PLANEJAMENTO.md`](PLANEJAMENTO.md) · [`ANIMES.md`](ANIMES.md) · [`CONHECIMENTOS-GERAIS.md`](CONHECIMENTOS-GERAIS.md) · [`EVOLUTION.md`](EVOLUTION.md)

---

## 1. Pesquisa

### 1.1 Projeto Trivia (referência principal)

O Projeto Trivia publica quizzes, Top 10, desafios e drafts sobre Champions, Brasileirão, FIFA e craques, além de anime, filmes e séries. Tem um perfil só de futebol (@projetotriviafutebol) e um principal (@oprojetotrivia). Formatos que aparecem com frequência e como cada um vira modo de grupo:

| Formato do Projeto Trivia | Exemplo | Vira no grupo |
|---|---|---|
| **Jogo das Conexões** | "Atletas lendários do Brasil vs Mundo", conexões sobre Neymar | **Conexões** (§4.4) |
| **Um X para cada letra** | "Um goleiro para cada letra do alfabeto", "Times com a letra A" | **Alfabeto** (§4.5) |
| **Draft 5x5** | "Draft 5x5 – jogadores com a letra F" | **Draft da Resenha** (§4.10) |
| **Top N** | "Top 15 melhores goleiros do mundo" | **Top 10 coletivo** (§4.6) |
| **Perguntei para 100 pessoas** | "Qual o melhor goleiro brasileiro de todos os tempos?" | **Pesquisa da Galera** (§4.9) |
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
| **HQ Trivia** | Eliminação: errou, está fora; **vida extra** usada uma vez | Adotado no modo **Sobrevivente** (§4.11) |
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
  respostas           ─► o bot reage ✅ em cada resposta recebida; "5/8 responderam" só no fim
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
| `entrar` / `entrar no jogo` | qualquer membro | entra na sala (aceito até a 3ª rodada, começando com 0) |
| `sair` | jogador | sai da sala |
| `começar` | anfitrião | fecha as inscrições |
| `placar` | qualquer um | placar parcial |
| `encerrar` | anfitrião ou admin | fecha a sala e conta os pontos até ali |

### 2.3 Quem pode responder

- **Só quem mandou `entrar`.** Mensagens de quem está fora da sala são ignoradas, como no 1 x 1.
- **Uma resposta por pergunta** nos modos "todos respondem": vale a primeira mensagem que parece uma resposta. Isso evita chute em metralhadora.
- **Nos modos de corrida e de lista**, cada um pode tentar várias vezes, com penalidade se errar (descrito em cada modo).

### 2.4 "Todos responderam" sem travar o jogo

O pedido é avançar quando todos responderem. Três proteções impedem que um jogador ausente trave a sala:

1. **Tempo por pergunta** (20 a 45 s, conforme o modo). Esgotado, a rodada fecha mesmo sem todos.
2. **Ausência**: quem fica 2 rodadas seguidas sem responder vira "ausente" e sai da conta de "todos". Volta assim que responder.
3. **Anfitrião/admin** pode mandar `pular`.

Sobre o relógio: a função da Vercel só roda quando chega uma mensagem, então ela não "acorda sozinha" quando o tempo acaba. Duas soluções, usadas juntas:
- **Verificação preguiçosa**: qualquer mensagem no grupo depois do prazo fecha a rodada atrasada.
- **Agendador externo** (recomendado: Upstash QStash, plano grátis): ao abrir uma pergunta, agendamos uma chamada a `/api/tick` para o segundo exato do prazo. O cron da Vercel não serve, porque no plano Hobby ele roda só uma vez por dia.

### 2.5 O problema da cola, e como resolver

No WhatsApp, tudo que alguém escreve no grupo **todo mundo vê**. Em "todos respondem" com resposta aberta, quem responde por último copia quem respondeu primeiro. Por isso cada modo usa **um destes três formatos**:

| Formato | Como | Quando usar |
|---|---|---|
| **Corrida** | O primeiro a acertar leva mais pontos; copiar não adianta, porque quem copia já chegou atrasado | Dicas, Emoji, Bandeiraço |
| **Reivindicação** | Cada resposta certa só pode ser dada **uma vez**; quem falou primeiro fica com ela | Top 10, Alfabeto, Conexões |
| **Resposta no privado** | Cada um responde **no privado do bot**; no grupo aparece só "✅ 6/8 responderam", e a revelação mostra todos | Que time é esse?, Chute Certo, Intruso, Quiz, Stop |

A **resposta no privado** é o que viabiliza o "todos respondem e depois avança" sem cola:
- O bot só aceita mensagem no privado de quem **está numa sala aberta**. Fora disso, o privado continua ignorado.
- Isso não afeta o bot pessoal: ele é outra instância da Evolution.
- Cuidado técnico: o mesmo contato pode aparecer como `@lid` no grupo e como telefone no privado. A sala guarda os dois identificadores quando disponíveis, e o `entrar` registra o telefone (ver [`EVOLUTION.md`](EVOLUTION.md)).
- **Enquetes nativas do WhatsApp foram descartadas**: os votos chegam criptografados em `messages.update` e há relatos de votos de grupo que não chegam ao webhook.

### 2.6 Pontuação (padrão para todos os modos)

| Item | Pontos |
|---|---|
| Acerto | 100 |
| Bônus de velocidade (ordem entre os que acertaram) | 1º +50 · 2º +30 · 3º +15 · demais +5 |
| Sequência de 3 acertos seguidos | +50, uma vez a cada sequência (teto, como no Kahoot) |
| Chute Certo (§4.7) | 100 para o mais próximo, 60 para o 2º, 30 para o 3º; acerto exato +50 |
| Erro em modo de corrida | −20 (desestimula chute aleatório) |
| Ranking do grupo | 1º da sala 5 pts, 2º 3, 3º 2, participação 1. Ranking por jogo e geral |

---

## 3. Imagens do Modo em Grupo

Mesmo formato (1080x1350) e a identidade do jogo escolhido (verde-estádio, roxo-mangá ou azul-caderno).

| Tela | Conteúdo |
|---|---|
| **Sala aberta** | Nome do modo, regras em 3 linhas, "MANDE ENTRAR", tempo restante, contador de inscritos |
| **Lista de jogadores** | Até 30 nomes em colunas, cada um com uma cor; "VALENDO!" |
| **Pergunta** | "PERGUNTA 4/10", categoria, o conteúdo (escalação, dicas, emojis, bandeira, lista com lacunas), tempo e formato da resposta ("responda no PRIVADO" ou "no GRUPO") |
| **Revelação** | Resposta certa em destaque; lista de quem acertou, por ordem, com pontos ganhos; quem errou ou não respondeu, em cinza |
| **Placar parcial** | Top 5 com barras; quem subiu ou caiu desde o último placar |
| **Pódio** | Top 3 em degraus, mais "mais rápido", "maior sequência" e "chute mais preciso" |

---

## 4. Catálogo de modos

Cada modo mostra: mecânica, formato da resposta, dados e em quais jogos aparece (⚽ 🎌 🧠).

### 4.1 Quem é? (dicas progressivas) · ⚽ 🎌 🧠 · corrida

O bot revela até 5 dicas, uma a cada 8 s. ⚽ nacionalidade → posição → clubes → títulos → número da camisa. 🎌 obra → papel → aparência → habilidade → ano de estreia. 🧠 personalidade, lugar ou objeto. O primeiro a acertar leva **pontos conforme a dica**: 1ª 150, 2ª 120, 3ª 90, 4ª 60, 5ª 30; erro −20. Dados: cache das fichas (futebol), AniList (anime) e lista curada (geral).

### 4.2 Que time é esse? (escalação histórica) · ⚽ 🎌 · privado

Pedido seu. O bot mostra uma **escalação em campinho**, só com os nomes:

```
Taffarel
Jorginho · Aldair · Márcio Santos · Branco
Mauro Silva · Dunga · Mazinho · Zinho
Bebeto · Romário
```

Cada um responde no privado **time + ano** (`Brasil 94`). Pontos: time certo 100, ano exato +60, ±1 ano +30, mais velocidade. Variantes:
- **Por nacionalidades**: em vez dos nomes, as bandeiras de cada posição (formato do FourFourTwo).
- **Meia escalação**: só 6 nomes; quem acerta com menos informação ganha mais.
- **🎌 Que grupo é esse?**: nomes dos membros → a organização (Akatsuki, Bando do Chapéu de Palha, Time 7, Hashiras, Cavaleiros de Ouro, Espada Kamui…).

Dados: **lista curada** de ~150 times marcantes, cada um com escalação, ano, competição e apelidos aceitos. Exemplos: seleções de 70, 82, 94, 2002, 2014 e 2022; Barça 2009/2011; Real 2017; Milan 1989/2007; Liverpool 2005/2019; Manchester United 1999; Bayern 2013/2020; Ajax 1995; Flamengo 1981/2019; Santos 1962/2011; São Paulo 1992/2005; Palmeiras 1999/2021; Grêmio 1983/2017; Inter 2006; Corinthians 2012; Atlético-MG 2013; Cruzeiro 2003; Vasco 1998. Para finais europeias também existe o **StatsBomb Open Data** (escalações de todas as finais de Champions de 2003/04 a 2018/19 e Copas), mas só para uso **não comercial**.

### 4.3 Emoji · 🎌 ⚽ 🧠 · corrida

`🍥🦊👊` → Naruto · `⚡👓🧙` → Harry Potter · `👑🦁⚽🇸🇪` → Ibrahimović. Primeiro a acertar: 100 + velocidade. Com 15 s sem acerto, sai uma dica escrita (vale 60). Dados: lista curada (~200 por jogo).

### 4.4 Conexões · ⚽ 🎌 🧠 · reivindicação

Inspirado no "Jogo das Conexões" do Projeto Trivia e no Football Connections. O bot mostra **16 nomes numerados**, e os jogadores mandam **4 números** que formam um grupo (`3 7 11 14`). O primeiro a achar cada grupo leva 150 e o bot revela a ligação ("jogaram no Barça e no PSG"). Erro tira 20. Quatro grupos por partida, do fácil ao difícil, com cores como no original. Dados: lista curada; a IA ajuda a montar rascunhos que você revisa.

### 4.5 Alfabeto · ⚽ 🎌 🧠 · reivindicação

Do "um goleiro para cada letra" do Projeto Trivia. O bot sorteia **categoria + letra** ("goleiros com a letra C") e dá 45 s. Todo mundo manda nomes no grupo; **cada nome válido só vale para quem mandou primeiro** (+50), e repetido não conta. A IA valida em lote (uma chamada no fim, usando o cache). Variante **Alfabeto completo**: a sala inteira tenta cobrir A–Z de uma categoria em 3 minutos, cooperando contra o relógio, e cada letra rende pontos para quem a preencheu.

### 4.6 Top 10 coletivo · ⚽ 🎌 🧠 · reivindicação

"Os 10 maiores artilheiros da história da Champions", "os 10 personagens mais favoritados de One Piece", "os 10 países mais populosos". Imagem com 10 lacunas; quem acerta reivindica a posição (1º lugar da lista = 100 pts … 10º = 10 pts). 90 s ou até completar. A imagem é reenviada a cada 3 acertos, para não poluir. Dados: listas curadas (futebol) e AniList/REST Countries/IBGE (dados reais).

### 4.7 Chute Certo · ⚽ 🎌 🧠 · privado

Do "Qual é a nota?" do Projeto Trivia, no estilo "o preço certo". "Quantos gols Romário fez pelo Vasco?", "Quantos episódios tem One Piece até o arco de Wano?", "Qual a altitude de La Paz?". Todos respondem um número no privado; vence o mais próximo (100/60/30, exato +50). É ótimo para grupos grandes: ninguém sabe exato e todo mundo pontua.

### 4.8 Intruso · ⚽ 🎌 🧠 · privado

"Quem não pertence à lista?" A) Cafu B) Roberto Carlos C) Ronaldinho D) Juninho Pernambucano (intruso: Juninho Pernambucano, porque os outros três foram campeões da Copa de 2002). Cada um responde a letra no privado. Revelação com o motivo. Múltipla escolha, rápido e sem cola.

### 4.9 Pesquisa da Galera · ⚽ 🎌 🧠 · privado

Do "Perguntei para 100 pessoas" do Projeto Trivia: o bot pergunta **opinião** ("melhor goleiro brasileiro da história?") e cada um responde no privado. Pontua quem escolheu a **resposta mais popular da sala** (o "Família" do grupo: 100 / 60 / 30 conforme a posição). Não precisa de dados, é pura resenha, e as respostas viram a "tabela da galera" na imagem.

### 4.10 Draft da Resenha · ⚽ 🎌 · ordem de draft

Do "Draft 5x5" do Projeto Trivia. Até 8 jogadores, **ordem em serpente** (1→8, 8→1…), 5 escolhas cada, com regra da rodada ("só jogadores com a letra F", "só quem jogou no Brasileirão"). A IA valida cada escolha, e ninguém repete. No fim, **votação no privado**: cada um vota no melhor time, sem poder votar no próprio, e o mais votado vence. Imagem: mural com os times de cada um.

### 4.11 Sobrevivente · ⚽ 🎌 🧠 · privado + eliminação

No formato HQ Trivia: perguntas de múltipla escolha (A–D) cada vez mais difíceis. Errou ou não respondeu, está fora (pode assistir). Cada jogador tem **1 vida extra** e escolhe quando usá-la (`vida`). O último de pé vence; se todos caírem na mesma pergunta, vence quem caiu por último, com desempate por tempo.

### 4.12 Stop coletivo · 🧠 ⚽ 🎌 · privado

A Adedonha para a sala toda: uma letra e 6 categorias. Cada um manda as 6 respostas no privado em uma mensagem; o primeiro a mandar pode gritar `stop` no grupo, e os outros têm 15 s. Pontos: resposta válida e **única na sala** 10, repetida 5, inválida 0. Imagem: tabela com todas as respostas, ✓/✗ e as repetidas destacadas.

### 4.13 Bandeiraço · 🧠 · corrida

Bandeira desenhada (SVG de domínio público), e o primeiro a escrever o país leva o ponto. Fases: América do Sul → Europa → mundo inteiro.

### 4.14 Quiz Relâmpago · 🧠 ⚽ 🎌 · privado

10 perguntas de múltipla escolha (A–D), 20 s cada, pontuação Kahoot. Banco curado por categoria (história, geografia, ciência, entretenimento, Brasil, futebol, anime).

### Resumo

| Modo | ⚽ | 🎌 | 🧠 | Formato | Dados | Prioridade |
|---|---|---|---|---|---|---|
| Que time é esse? | ✅ | ✅ (grupo) | — | privado | curado | **1** |
| Quem é? (dicas) | ✅ | ✅ | ✅ | corrida | cache/AniList/curado | **1** |
| Top 10 coletivo | ✅ | ✅ | ✅ | reivindicação | curado/AniList/IBGE | **2** |
| Alfabeto | ✅ | ✅ | ✅ | reivindicação | IA (validação) | **2** |
| Chute Certo | ✅ | ✅ | ✅ | privado | curado | **2** |
| Intruso | ✅ | ✅ | ✅ | privado | curado | 3 |
| Conexões | ✅ | ✅ | ✅ | reivindicação | curado | 3 |
| Emoji | ✅ | ✅ | ✅ | corrida | curado | 3 |
| Sobrevivente | ✅ | ✅ | ✅ | privado | curado | 3 |
| Pesquisa da Galera | ✅ | ✅ | ✅ | privado | nenhum | 3 |
| Stop coletivo | ✅ | ✅ | ✅ | privado | IA | 4 |
| Draft da Resenha | ✅ | ✅ | — | ordem | IA | 4 |
| Bandeiraço | — | — | ✅ | corrida | SVG livre | 4 |
| Quiz Relâmpago | ✅ | ✅ | ✅ | privado | curado | 4 |

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
  formats/       corrida.ts · reivindicacao.ts · privado.ts · draft.ts · eliminacao.ts
  scoring.ts     tabela da §2.6
src/games/<jogo>/party/*.ts   cada modo: como gerar a pergunta e como corrigir
content/<jogo>/*.json         pacotes curados
src/app/api/tick/route.ts     chamado pelo agendador no prazo de cada rodada
```

| Peça | Detalhe |
|---|---|
| Estado da sala | `matches.state` (jsonb), com `mechanic = 'party'`: jogadores `{jid, altJid, nome, pontos, sequência, ausências}`, rodada, pergunta, prazo, respostas e reivindicações |
| Uma sessão por grupo | Continua valendo: um 1 x 1 **ou** uma sala por grupo de cada vez |
| Privado | O adaptador da Evolution passa a entregar mensagens privadas **só** de quem está numa sala aberta (consulta por `jid` no banco); o resto do privado segue ignorado |
| Reações | `message/sendReaction` da Evolution para o ✅ de "entrei" e "respondi" (menos mensagens = menos risco de banimento) |
| Timer | QStash agenda `/api/tick?match=…&round=…` (com assinatura) + verificação preguiçosa a cada mensagem |
| Concorrência | Muitas respostas chegando juntas: a trava otimista já reprocessa (até 3 vezes). Na sala, a resposta vira um *append* atômico em `jsonb`, para não disputar a linha inteira |
| Volume | Sala de 20 pessoas × 10 perguntas: ~200 respostas, mas só ~25 mensagens do bot (pergunta + revelação + placares). As respostas recebem reações, não textos |

### Novas tabelas

| Tabela | Uso |
|---|---|
| `group_seen` | Perguntas já usadas por grupo (sem repetição por 60 dias) |
| `party_results` | Resultado de cada sala (posição e pontos de cada um), alimentando o ranking geral |
| `group_admins` *(opcional)* | Admins por grupo além dos globais de `ADMIN_NUMBERS` |

---

## 7. Fases

| Fase | Entrega |
|---|---|
| **G1** | Sala (`abrir sala`, `entrar`, `começar`, ausentes, timer), pontuação e imagens base, com dois modos: **Quem é?** (⚽, usando o cache) e **Que time é esse?** (⚽, 50 times curados) |
| **G2** | Resposta no privado; **Chute Certo**, **Intruso** e **Top 10 coletivo** (⚽) |
| **G3** | Os mesmos modos em 🎌 (AniList) e 🧠 (IBGE/REST Countries) |
| **G4** | **Alfabeto**, **Conexões**, **Emoji**, **Pesquisa da Galera** |
| **G5** | **Sobrevivente**, **Stop coletivo**, **Draft da Resenha**, **Bandeiraço**, **Quiz Relâmpago**; página de curadoria `/admin/conteudo` |

## 8. Decisões em aberto (suas)

1. **Resposta no privado**: ok o bot receber mensagens privadas dos jogadores durante uma sala? Sem isso, os modos "todos respondem" ficam sujeitos a cola.
2. **Tamanho máximo da sala**: sugestão de 30.
3. **Entrar no meio**: aceitar até a 3ª rodada (sugestão) ou só antes de começar?
4. **Agendador**: ok usar o Upstash QStash (grátis) para os tempos exatos?
5. **StatsBomb**: só vale se a plataforma não for comercial; senão, as escalações históricas ficam 100% curadas.
6. **Vídeos favoritos do Projeto Trivia**: mande 3 ou 4 links para eu detalhar mais formatos.
