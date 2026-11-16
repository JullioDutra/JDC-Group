# Top 10: planejamento

O bot mostra um ranking escondido ("Marcas de carro mais vendidas no Brasil em 2025") e os jogadores tentam adivinhar o que está nele. Cada acerto **revela a posição** ("✅ Ana acertou: 7º lugar — Jeep"). Vence quem acertar mais posições.

**Status:** jogável no Modo em Grupo, com 12 listas iniciais (`src/lib/party/top10-lists.ts`).

## 1. Regras

| Regra | Detalhe |
|---|---|
| Entrar | `top 10` (ou `top 10 futebol` / `top 10 geral`) abre a sala; quem quiser jogar manda `entrar`; o anfitrião manda `começar` |
| Jogadores | 2 a 10 |
| Vez | **Ninguém manda dois palpites seguidos**: depois de responder, a pessoa espera **outro jogador** responder. Quem tenta antes recebe um aviso, uma única vez |
| Palpite repetido | Já revelado: o bot lembra a posição e não conta. Errado e já tentado por alguém: não conta. Assim ninguém copia |
| Acerto | Revela a posição e dá 1 ponto. Com empates na lista, aparece "3º lugar (empate)" |
| Erro | Reação ❌ na mensagem, sem texto, para não poluir o grupo |
| Tempo | 4 minutos (fechados pelo QStash). Acabou o tempo ou a lista, o bot mostra o quadro completo |
| Vencedor | Mais acertos. Desempate: quem chegou primeiro àquele número de acertos |
| Entrada tardia | Até a 2ª posição revelada (parâmetro `joinUntil`) |
| Erros de digitação | Aceitos em nomes longos ("Minas Gerias" vale Minas Gerais); em nomes curtos, não |
| Apelidos | Cada item tem apelidos ("VW", "GM", "SP", "BH", "R9") |

### Mensagens (sem poluição)

```
Bot (imagem do quadro): Top 10: Marcas de carro mais vendidas no Brasil em 2025
                        Mandem palpites. Cada acerto revela a posição.
                        Ninguém responde duas vezes seguidas: espere outra pessoa. Tempo: 4 min.
Ana:  Renault        → ✅ Ana acertou: 6º lugar — Renault (131.724)
Ana:  Fiat           → Ana, espere outra pessoa responder antes do próximo palpite.
Bia:  Ferrari        → (reação ❌)
Caio: VW             → ✅ Caio acertou: 2º lugar — Volkswagen (436.297)
...
(na metade da lista, o quadro é reenviado; no fim, o quadro completo + classificação)
```

## 2. Temas

**Regra de curadoria:** toda lista tem **fonte** e **data de corte no título** ("até 2022", "em 2025", "Censo 2022"). Assim a resposta nunca fica errada com o tempo. Listas sobre algo que ainda muda (artilheiro em atividade, Copa de 2026) só entram depois de conferidas na fonte.

### No ar (12)

| Categoria | Lista | Fonte |
|---|---|---|
| Geral | Marcas de carro mais vendidas no Brasil em 2025 | Fenabrave |
| Geral | Estados mais populosos (Censo 2022) | IBGE |
| Geral | Capitais mais populosas (Censo 2022) | IBGE |
| Geral | Maiores estados em área | IBGE |
| Geral | Maiores países em área | ONU |
| Geral | Montanhas mais altas do mundo | Altitudes oficiais |
| Geral | Planetas, do maior para o menor | NASA |
| Geral | Oceanos, do maior para o menor | NOAA |
| Futebol | Seleções com mais títulos de Copa (até 2022) | FIFA |
| Futebol | Clubes com mais Champions (até 2024/25) | UEFA |
| Futebol | Artilheiros da história das Copas (até 2022) | FIFA |
| Futebol | Jogadores com mais Bolas de Ouro (até 2025) | France Football |

### Próximos (curadoria: conferir números e data antes de entrar)

| Categoria | Ideia de lista | Fonte a usar |
|---|---|---|
| Futebol | Maiores artilheiros da história do Brasileirão (pontos corridos, até 2025) | CBF / levantamentos oficiais |
| Futebol | Clubes brasileiros com mais títulos de Libertadores (até 2025) | CONMEBOL |
| Futebol | Maiores estádios do Brasil por capacidade | CBF (Cadastro Nacional de Estádios) |
| Futebol | Transferências mais caras da história (até 2025) | Transfermarkt |
| Futebol | Maiores artilheiros da Seleção Brasileira (data de corte) | CBF |
| Futebol | Clubes com mais títulos do Brasileirão (unificado, até 2025) | CBF |
| Futebol | Times com mais seguidores no Instagram (mês/ano de corte) | perfis oficiais |
| Geral | Países mais populosos (ano de referência) | ONU, World Population Prospects |
| Geral | Cidades brasileiras mais visitadas por turistas estrangeiros (ano) | Ministério do Turismo |
| Geral | Nomes mais comuns no Brasil (Censo 2022) | IBGE, Nomes no Brasil |
| Geral | Sobrenomes mais comuns no Brasil | IBGE |
| Geral | Maiores rios do Brasil em extensão | ANA / IBGE |
| Geral | Animais terrestres mais rápidos | literatura científica |
| Geral | Filmes de maior bilheteria da história (data de corte) | Box Office Mojo (lista curada) |
| Geral | Músicas mais tocadas no Brasil no ano X | Spotify Wrapped / Crowley |
| Geral | Apps mais baixados no Brasil no ano X | rankings oficiais das lojas |
| Geral | Marcas de celular mais vendidas no Brasil no ano X | IDC / Counterpoint |
| Animes | Personagens mais favoritados na AniList (data de corte) | AniList (dado real, via API) |
| Animes | Animes com mais episódios | AniList |
| Animes | Animes mais bem avaliados na AniList (data de corte) | AniList |
| Animes | Maiores recompensas de One Piece (até o capítulo X) | mangá, lista curada |

Meta de lançamento: **30 listas** (12 no ar + 18 curadas). Nenhuma lista se repete no mesmo grupo por 60 dias (tabela `group_seen`, fase G4).

## 3. Variações

| Variação | Como funciona |
|---|---|
| **Top 10 Relâmpago** | 90 s em vez de 4 min; acerto vale 2 pontos nos primeiros 30 s |
| **Top 10 Valendo Posição** | Acertar o 1º lugar vale 10 pontos, o 10º vale 1. Premia quem conhece o topo |
| **Top 10 Duplo** | Duas listas parecidas lado a lado ("mais populosos" e "maiores em área"): o palpite vale para a lista em que estiver |
| **Top 10 x1** | Versão 1 x 1, alternando a vez. Usa o mesmo motor, com 2 jogadores |
| **Pergunta da Galera** | Os jogadores sugerem listas com `sugerir top 10 <tema>`; o admin aprova numa página de curadoria |

## 4. Imagem

Quadro com as posições (número em círculo). A linha acertada ganha a borda e a etiqueta na cor de quem acertou. No fim, as posições não acertadas aparecem em cinza, e a fonte vai no rodapé. Exemplos: `samples/9-top10.png` e `samples/9b-top10-final.png` (`npm run render:samples`).

## 5. Fontes desta fase

- Marcas 2025: [Vrum – as 20 marcas que mais venderam em 2025](https://www.vrum.com.br/aceleradas/2026/01/7332166-as-20-marcas-de-carros-que-mais-venderam-no-brasil-em-2025.html), [Mundo do Automóvel para PCD](https://mundodoautomovelparapcd.com.br/quais-marcas-de-carros-mais-venderam-e-menos-venderam-em-2025-no-brasil/) (dados Fenabrave, automóveis + comerciais leves).
