# Sabichão: planejamento dos jogos de conhecimentos gerais

Duelos 1 x 1 no grupo sobre geografia, Brasil, natureza, cinema e cultura geral. Mesma experiência dos outros jogos: imagem de abertura com regras, texto rápido a cada lance, imagem ao fechar cada rodada.

**Princípio:** sempre que existir uma fonte oficial do número (IBGE, REST Countries), usamos ela, e não a IA. A IA entra para entender o que a pessoa digitou ("Sampa", "Rio") e para validar palavras no Stop.

## 1. Pesquisa: o que já faz sucesso

| Jogo | Onde | O que aproveitamos |
|---|---|---|
| **Adedonha / Stop** | Brincadeira clássica no Brasil; apps como StopotS e Stop 2 têm até 1 x 1 online | Modo **Stop**: o jogo de grupo mais conhecido do país |
| **Quem sou eu?** | Versão por texto comum em grupos de WhatsApp | Modo **Dicas** |
| **Maior ou Menor / Higher or Lower** | Sites e apps de comparação | Modo **Maior ou Menor** |
| **Quizzes de lista** (Sporcle, JetPunk) | "Cite os 10 maiores…" | Modo **Lista (Top 10)** |
| **Jogos de draft e soma** | O próprio Duelo de Craques | Modos de **Escalação** com países, cidades, animais e filmes |

Fontes: [Canaltech – brincadeiras para WhatsApp](https://canaltech.com.br/redes-sociais/conheca-brincadeiras-para-whatsapp-que-irao-agitar-suas-notificacoes/), [Como jogar Adedonha no WhatsApp](https://www.auditorioibirapuera.com.br/como-jogar-adedonha-no-whatsapp/), [Stop 2 – Adedonha Online](https://apps.apple.com/BR/app/id1581869942), [StopotS](https://apps.apple.com/BR/app/id1451540497), [JivoChat – 30 brincadeiras](https://www.jivochat.com.br/blog/comunicacao/brincadeiras-para-whatsapp.html).

## 2. Modos de Escalação (mesma dinâmica do futebol)

### 2.1 Volta ao Mundo (países)

Seis vagas: **África, Américas, Ásia, Europa, Oceania e Coringa.** Você manda `Nigéria` e o bot responde com o número oficial do tema (ex.: população).

| Tema | Dado | Vence |
|---|---|---|
| Gigantes do Mapa | área (km²) | maior |
| Formigueiro | população | maior |
| Nanicos | área | **menor** |
| Lotação Esgotada | densidade (hab/km², calculada) | maior |
| Medalhistas | ouros olímpicos (lista curada) | maior |

Dados: **REST Countries v3.1** (grátis, sem chave; `population`, `area`, `region`, `continents`; o `/all` exige `?fields=`). Medalhas vêm de uma lista curada, atualizada a cada Olimpíada.

### 2.2 Brasil de Ponta a Ponta (cidades)

Seis vagas: **Norte, Nordeste, Centro-Oeste, Sudeste, Sul e Coringa.**

| Tema | Dado | Vence |
|---|---|---|
| Metrópoles | população | maior |
| Cidadezinhas | população | **menor** (achar a menor cidade que você conhece!) |
| Lá Longe | distância até Brasília (calculada pelas coordenadas) | maior |
| Mar à Vista | distância até o litoral | menor |
| Gigantes do Interior | área do município | maior |

Dados: **IBGE**. A lista de municípios (com UF e região) vem da API de Localidades (`servicodados.ibge.gov.br/api/v1/localidades`). A população vem das estimativas anuais (SIDRA, agregado 6579). Os dados são baixados uma vez por ano para um JSON do repositório: são ~5.570 municípios, a resposta é instantânea e não depende de API fora do ar. A IA só resolve o que foi digitado ("Sampa" = São Paulo; "Santa Maria" pergunta o estado).

### 2.3 Zoológico (animais)

Seis vagas: **mamífero, ave, réptil, peixe, inseto/aracnídeo e Coringa.**

| Tema | Dado | Vence |
|---|---|---|
| Pesos Pesados | peso médio adulto | maior |
| Velocistas | velocidade máxima | maior |
| Matusaléns | expectativa de vida | maior |
| Miniaturas | tamanho | **menor** |

Dados: lista curada de ~400 animais (JSON revisado) e, fora dela, a Maritaca com faixas de plausibilidade, como no futebol.

### 2.4 Bilheteria (filmes)

Seis vagas: **ação, animação, comédia, terror, drama/romance e Coringa.** Temas: bilheteria mundial, duração, ano (Clássicos = menor), nota do público.

Dados: o **TMDB** tem tudo, mas os termos proíbem uso comercial sem contrato. Se a plataforma não for monetizada, usamos TMDB com atribuição. Se for, usamos lista curada (~500 filmes). *Decisão sua.*

## 3. Outras mecânicas

### 3.1 Stop (Adedonha) 1 x 1 · o carro-chefe

```
iniciar quiz → aceitar → "stop"
Bot: 🔤 Letra *M* · Categorias: Nome · Cidade · Animal · Fruta · Objeto · Marca
Ana: Maria, Manaus, Macaco, Manga, Martelo, Mercedes
Bia: STOP  (ou manda as 6 respostas primeiro)
→ o outro tem 20 s para terminar
Bot: IMAGEM da tabela lado a lado, ✓ / ✗ em cada resposta
```

- **Pontos**: resposta válida e diferente da do adversário = 10; igual = 5; inválida ou vazia = 0. Três letras por partida, sorteadas entre as "justas" (sem K, W, X, Y).
- **Validação**: a Maritaca recebe as 12 respostas de uma vez e devolve válido/inválido para cada uma. Uma chamada por rodada.
- **Contestação**: `contestar 3` reabre a validação de uma resposta com uma segunda opinião da IA (uma por partida).
- **Variações por jogo**: Stop Futebol (jogador, clube, estádio, seleção, técnico, apelido) e Stop Otaku (personagem, anime, técnica, vilão, estúdio, protagonista).

### 3.2 Quem Sou Eu? (Dicas)

Pessoa, lugar ou coisa misteriosa, com 5 dicas progressivas. Os dois podem chutar a qualquer momento; acertar na dica 1 vale 5 pontos, na 5 vale 1, e chute errado custa 1. Melhor de 5. As dicas são geradas pela IA a partir de uma lista curada de respostas, sempre revisada.

### 3.3 Bandeiraço (Dicas, visual)

O bot manda a **imagem de uma bandeira** (desenhada a partir de SVG de domínio público) e o primeiro a escrever o país pontua. Fases de dificuldade: Américas → Europa → mundo inteiro. Melhor de 10.

### 3.4 Top 10 (Lista)

"Os 10 países mais populosos", "as 10 maiores capitais do Brasil", "os 10 filmes com maior bilheteria". Alternando, cada um chuta um item: acerto vale a posição invertida (1º = 10 pts), e três erros eliminam. A imagem vai revelando a lista.

### 3.5 Maior ou Menor

"Brasil tem X milhões de habitantes. A Nigéria tem mais ou menos?" Vez alternada e 3 vidas cada. Dados oficiais (REST Countries / IBGE), com resposta na hora.

### 3.6 Linha do Tempo

Cada um tem uma linha do tempo começando com um evento. Na sua vez, o bot sorteia um evento ("Chegada do homem à Lua") e você responde em que posição ele entra (`antes 1`, `entre 1 e 2`…). Acertou, o evento fica; o primeiro a montar 6 eventos vence. Os eventos e anos vêm de uma lista curada (~300).

## 4. Imagens

Identidade do Sabichão: azul-noite `#0B1530` com grade de caderno quadriculado, amarelo-marca-texto `#FFD23F` como destaque, jogadores em verde-água e coral, título na fonte Anton e texto em Barlow (as mesmas do futebol, reaproveitadas).

| Tela | Conteúdo |
|---|---|
| Escalação (Volta ao Mundo) | **Mapa-múndi estilizado** com os 6 países de cada jogador marcados por continente e o número de cada um |
| Escalação (Brasil) | **Mapa do Brasil por regiões**, com a cidade de cada jogador em cada região |
| Stop | Tabela 2 colunas x 6 categorias, ✓/✗ coloridos e pontos por linha |
| Top 10 | Lista de 10 linhas sendo revelada, com a cor de quem acertou cada uma |
| Bandeiraço | Bandeira grande + "Que país é esse?" |

## 5. Ordem sugerida

1. **Stop**: o mais conhecido no Brasil; usa só a IA (já integrada) e serve a futebol e animes também.
2. **Brasil de Ponta a Ponta**: dados oficiais, cara de Brasil, reaproveita o motor de Escalação.
3. **Volta ao Mundo**.
4. **Maior ou Menor** e **Top 10** (aproveitam os dados de 2 e 3).
5. Bandeiraço, Quem Sou Eu, Linha do Tempo, Zoológico, Bilheteria.

Fontes de dados: [IBGE – API de Localidades](https://servicodados.ibge.gov.br/api/docs/localidades), [IBGE – estimativas de população](https://www.ibge.gov.br/en/statistics/social/population/18448-estimates-of-resident-population-for-municipalities-and-federation-units.html?lang=en-GB), [REST Countries – fontes](https://restcountries.com/docs/data-sources), [TMDB – termos de uso da API](https://themoviedb.org:443/api-terms-of-use).
