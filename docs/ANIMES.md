# Duelo Otaku: planejamento do jogo de animes

Mesma dinâmica do Duelo de Craques (1 x 1 no grupo, imagem a cada rodada, IA validando), com personagens e obras de anime no lugar de jogadores e clubes.

## 1. Pesquisa: o que já existe

| Jogo | Mecânica | O que aproveitamos |
|---|---|---|
| **Narutodle / Onepiecedle** | Personagem misterioso do dia; cada palpite mostra atributos coloridos (clã, afiliação, arco…); modos de olho, jutsu, frase, cartaz de recompensa | Modo **Dicas** e o tema *Recompensa* (One Piece) |
| **Animedle / Anime Guess** | Adivinhar o anime por **emojis** e dicas progressivas | Modo **Emoji-Anime**: perfeito para WhatsApp, que é feito de emoji |
| **anidle** | Cada palpite compara gêneros, nota, ano | Atributos objetivos (ano, nota, episódios) como temas de Escalação |
| **Maldle** | Qual dos dois animes tem nota maior no MyAnimeList | Modo **Maior ou Menor** |
| **Anime Heardle** | Adivinhar pela abertura | Fica de fora: direitos autorais das músicas |

Nenhum deles é um duelo ao vivo entre amigos dentro do grupo. Esse continua sendo o diferencial.

Fontes: [Narutodle (como jogar)](https://axeetech.com/?p=114481), [Onepiecedle](https://holdtoreset.com/onepiecedle-answers-today-classic-devil-fruit-wanted-and-laugh/), [Animedle](https://www.producthunt.com/products/animedle/makers), [Anime Guess](https://animeguess.moe), [anidle](https://github.com/offenloa/anidle), [Maldle](https://gamescrobbler.com/es/games/maldle), [Anime Heardle](https://gamerjournalist.com/anime-heardle-answers/).

## 2. Modo principal: Esquadrão (mecânica de Escalação)

Em vez de goleiro/defensores/meias/atacante, cada um monta um **esquadrão de 6 papéis**:

| Vaga | Papel | Como é validado |
|---|---|---|
| 1 | **Protagonista** | AniList: papel `MAIN` na obra |
| 2 | **Rival** | IA (Maritaca) classifica, com cache |
| 3 | **Vilão** | IA classifica o antagonista, com cache |
| 4 | **Mestre** (mentor/sensei) | IA classifica, com cache |
| 5 | **Parceiro(a)** | AniList: `SUPPORTING` |
| 6 | **Coringa** | qualquer personagem |

Exemplo de rodada (tema *Mais Amados*, números ilustrativos): Ana manda `Luffy` e o bot responde `✅ Monkey D. Luffy — 102 mil favoritos`. Bia manda `Gojo`. Fechada a rodada, chega a imagem do painel com os dois esquadrões.

### Temas

| # | Tema | Dado (fonte) | Restrição | Vence |
|---|---|---|---|---|
| 1 | **Mais Amados** | favoritos do personagem (AniList) | livre | maior |
| 2 | **Clássicos** | ano de estreia da obra (AniList) | livre | **menor** (mais antigo) |
| 3 | **Geração Nova** | ano de estreia da obra | livre | maior |
| 4 | **Maratona** | episódios da obra principal (AniList) | livre | maior |
| 5 | **Obra-Prima** | nota média da obra (AniList, 0–100) | livre | maior |
| 6 | **Veteranos** | idade oficial do personagem (AniList) | livre | maior |
| 7 | **Pivetes** | idade oficial | livre | **menor** |
| 8 | **Universo Sorteado** | favoritos | obra sorteada a cada rodada | maior |
| 9 | **Recompensa** | recompensa em berries (lista curada) | só One Piece | maior |
| 10 | **Sessão da Tarde** | favoritos | obras que passaram na TV aberta brasileira (Manchete, Globo, SBT, Band) | maior |

Pool do *Universo Sorteado* (~25 obras, em `works.ts`, com apelidos em português): Naruto, One Piece, Dragon Ball, Bleach, Jujutsu Kaisen, Demon Slayer, Attack on Titan, Hunter x Hunter, My Hero Academia, Death Note, Fullmetal Alchemist, Chainsaw Man, Spy x Family, Haikyuu!!, Cavaleiros do Zodíaco, Yu Yu Hakusho, Pokémon, Sakura Card Captors, Fairy Tail, Tokyo Ghoul, One Punch Man, Solo Leveling, Frieren, Blue Lock, Dandadan.

Os mesmos **extras** do futebol funcionam aqui: `cego` e `relâmpago`.

### Dados: por que AniList, e não só IA

O futebol depende da IA para os números. No anime existe uma base pública, gratuita e confiável:
- **AniList GraphQL**: personagem (nome, nomes alternativos, idade, aniversário, gênero, **favoritos**) e obras com papel `MAIN`/`SUPPORTING`, ano, episódios, nota média e popularidade. Limite de 90 req/min (hoje degradado para 30/min), com cabeçalhos de limite em cada resposta.
- **Jikan** (MyAnimeList não oficial) como reserva: 3 req/s e 60 req/min.

Fluxo de um palpite:
1. O nome digitado vai para a busca de personagens da AniList.
2. Se for ambíguo ou apelido em português ("Goku criança", "Seiya", "Zoro"), a Maritaca escolhe o candidato certo entre os 5 primeiros.
3. A ficha vai para o cache do jogo de animes por 30 dias.
4. Rival, Vilão e Mestre vêm de uma pergunta à Maritaca sobre o personagem naquela obra; a resposta também vai para o cache.

Com o cache, um grupo ativo faz bem menos de 30 consultas por minuto.

Fontes: [AniList – rate limiting](https://docs.anilist.co/guide/rate-limiting), [Jikan API v4](https://docs.api.jikan.moe).

## 3. Outros modos do Duelo Otaku

| Modo | Mecânica | Como funciona | Dados |
|---|---|---|---|
| **Emoji-Anime** | Dicas | Bot manda `🍥🦊👊` e o primeiro a acertar o anime pontua; até 3 dicas extras (ano, estúdio, gênero) que valem menos; melhor de 7 | Lista curada de ~200 combinações de emoji (JSON) |
| **Quem é esse personagem?** | Dicas | 5 dicas: obra → papel → cor do cabelo → habilidade → frase-marca (curta). Acerto na dica 1 = 5 pts | Ficha AniList + IA gera as dicas |
| **Maior ou Menor** | Maior ou Menor | "Gojo — 150 mil favoritos. Sukuna tem mais ou menos?" Vez alternada, 3 vidas | AniList |
| **Top 10 Otaku** | Lista | "10 personagens mais favoritados de Naruto": alternando, cada acerto pontua pela posição | AniList (dados reais, sem IA) |
| **Grade Otaku** | Grade | Jogo da velha 3x3: linhas = obras, colunas = atributos ("usa espada", "cabelo branco", "é vilão") | IA valida o cruzamento, com cache |
| **Stop Otaku** | Stop | Letra + categorias: personagem, anime, golpe/técnica, vilão, estúdio, protagonista | IA valida as palavras |

## 4. Imagens

Mesmo formato (1080x1350) e as mesmas telas do futebol: desafio, menu, abertura com regras, painel por rodada, final e ranking. Muda a identidade:

| Elemento | Duelo de Craques | Duelo Otaku |
|---|---|---|
| Fundo | Noite de estádio, verde `#06130C` | Roxo-noite `#120A24` com retícula de mangá (pontos) e linhas de velocidade |
| Destaque | Verde-limão `#C8FF3E` | Magenta `#FF3DCB` + amarelo `#FFE14D` para o vencedor |
| Jogador 1 / 2 | Azul / laranja | Ciano `#3DE7FF` / magenta |
| Fonte de título | Anton | **Bangers** (licença livre, cara de onomatopeia de mangá) |
| Tabuleiro | Campinho 1-2-2-1 | **Página de mangá**: cada esquadrão é uma grade de 6 quadros (2x3), com o papel no topo, o nome no meio e o número num balão de fala |
| Selo de rodada | "RODADA 4 DE 6" | Balão de onomatopeia: "CAPÍTULO 4!" |
| Final | "VITÓRIA DE …" | Quadro grande "K.O.!" com o nome do vencedor |

Sem imagens de personagens (direitos autorais) e sem fotos, igual ao futebol: nomes e números já bastam.

## 5. Riscos e cuidados

- **Nomes**: grafias variam (romaji, inglês, dublagem brasileira). A AniList tem nomes alternativos, e a IA resolve apelidos.
- **Spoilers**: nenhum critério de grade pode revelar morte ou reviravolta ("morreu", "é traidor"). A lista de atributos permitidos é curada.
- **Idade "oficial"**: muitos personagens não têm idade na AniList. Nesse caso o bot diz "sem dado, escolha outro", como no futebol.
- **Limite da AniList degradado**: cache agressivo e Jikan de reserva. Se as duas caírem, só o Duelo Otaku pausa (a plataforma isola as falhas).
