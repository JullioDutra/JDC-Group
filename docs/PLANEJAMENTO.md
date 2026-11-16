# Duelo de Craques — Planejamento

Jogo de conhecimentos de futebol, 1 x 1, jogado dentro de grupos de WhatsApp.
Este documento cobre pesquisa, design do jogo, imagens, arquitetura, infraestrutura e roadmap.

## 1. Pesquisa: o que já existe

| Jogo | Mecânica | O que aproveitamos |
|---|---|---|
| **Tiki-Taka-Toe / Football Tic-Tac-Toe / Immaculate Grid** | Grade 3x3; cada célula cruza dois critérios (clube x nacionalidade) e o jogador nomeia alguém que atenda aos dois | Restrição por clube/seleção sorteada: obriga a lembrar de elencos, não só de craques óbvios |
| **7a0** (viral na Copa de 2026) | Um dado sorteia uma seleção histórica e você escolhe um atleta daquele elenco até fechar 11 | Sorteio de time por rodada + montar uma escalação por posição |
| **Who Are Ya / Football Bingo** | Adivinhar o jogador misterioso; preencher cartela | Candidatos a modos futuros (ver roadmap) |
| **Higher or Lower / quizzes Sporcle e JetPunk** | Comparar estatísticas; listar o máximo em tempo limitado | Temas baseados em um número comparável (gols, altura, valor) e limite de tempo por jogada |

Conclusão: nenhum deles roda *dentro* do grupo, com dois amigos se enfrentando ao vivo e a plateia assistindo. Esse é o diferencial. O formato "draft por posição + soma de um número" é simples de explicar em uma imagem e gera resenha a cada revelação.

Fontes: [RenderFoot – Football Tic-Tac-Toe](https://www.renderfoot.com/pt/games/tic-tac-toe/classic), [Tiki Taka Toe (App Store)](https://apps.apple.com/ba/app/tiki-taka-toe/id6476237985), [O Povo – 7a0](https://www.opovo.com.br/esportes/futebol/copa-do-mundo/2026/06/08/amp/7-a-0-veja-o-que-e-o-jogo-da-copa-do-mundo-que-tem-viralizado.html), [Diário do Nordeste – 7a0](https://diariodonordeste.verdesmares.com.br/jogada/jogo-7-a-0-vira-febre-ao-permitir-escalar-selecao-para-a-copa-do-mundo-1.3768805), [Football Genius](https://footballgenius.pages.dev/blog/how-football-trivia-makes-you-smarter).

## 2. Design do jogo

### Fluxo de uma partida

```
ativar grupo ─► (bot passa a ler o grupo)
iniciar jogo ─► IMAGEM "Desafio lançado"            estado: LOBBY
aceitar      ─► IMAGEM "Escolha o tema"             estado: MODE_SELECT   (1º a aceitar entra)
<nº do tema> ─► IMAGEM "Bola rolando" + regras      estado: PLAYING       (só o anfitrião escolhe)
6 rodadas    ─► texto a cada escolha; IMAGEM do campinho ao fechar cada rodada
fim          ─► IMAGEM do campinho final + vencedor estado: FINISHED      (ranking atualizado)
```

- **Formação**: goleiro, 2 defensores, 2 meias, 1 atacante — 6 rodadas, 6 escolhas por jogador.
- **Ordem estrita**: os dois escolhem o goleiro; só então abre a rodada dos defensores, e assim por diante. Quem manda nome fora da vez recebe um aviso (uma vez por vez) e a jogada não vale.
- **Só os dois jogam**: mensagens de quem está fora da partida nunca escalam; comandos de consulta (`placar`, `regras`, `ranking`) continuam abertos a todos.
- **Vez**: um de cada vez. Quem abre a rodada alterna (rodadas ímpares o anfitrião, pares o desafiante), porque quem escolhe por último vê o número do outro.
- **Validação pela IA** (a vez só passa se tudo for válido): o jogador existe? Atua na posição da rodada? Passou pelo clube / é da seleção sorteada? Já foi escalado nesta partida? A IA tem o dado do tema?
- **Resposta rápida**: no meio da rodada a confirmação é só texto (`✅ Rogério Ceni — 131 gols`); a imagem só é gerada quando os dois escolheram.
- **Tempo**: 90 s por jogada. Passou disso, o adversário manda `tempo` e quem atrasou fica com o pior valor possível na posição.
- **Desistência** com a bola rolando = derrota por W.O. Partida parada por 20 min é encerrada sozinha.
- **Conversa de grupo não atrapalha**: só a mensagem de quem está na vez, e só se parecer um nome (curta, sem `?`, sem "kkkk"), vai para a IA.

### Temas (17)

| # | Tema | Dado | Restrição | Vence |
|---|---|---|---|---|
| 1 | Artilheiros | gols na carreira | livre | maior soma |
| 2 | Garçons | assistências na carreira | livre | maior |
| 3 | Milionários | pico de valor de mercado (mi €) | clube sorteado por rodada | maior |
| 4 | Joias | idade | clube sorteado | **menor** |
| 5 | Gigantes | altura (cm) | livre | maior |
| 6 | Baixinhos | altura (cm) | clube sorteado | **menor** |
| 7 | Convocados | jogos pela seleção | seleção sorteada | maior |
| 8 | Matadores da Seleção | gols pela seleção | seleção sorteada | maior |
| 9 | Reis da Copa | gols em Copas | livre | maior |
| 10 | Noites de Champions | gols na Champions | livre | maior |
| 11 | Papa-Títulos | títulos oficiais | clube sorteado | maior |
| 12 | Rodados | clubes na carreira | livre | maior |
| 13 | Incansáveis | jogos na carreira | livre | maior |
| 14 | Rei do Brasileirão | gols na Série A | livre | maior |
| 15 | Libertadores | gols na Libertadores | livre | maior |
| 16 | Mundialistas | Copas disputadas | seleção sorteada | maior |
| 17 | Raiz | ano de estreia profissional | clube sorteado | **menor** (mais antigo) |

Pool de sorteio: 32 clubes (12 brasileiros, 18 europeus, Boca e River) e 13 seleções. Criar um tema novo é adicionar um objeto em `src/lib/game/modes.ts`; uma consulta à IA devolve a ficha completa, então tema novo baseado em campo já existente não custa nada a mais.

Decisão registrada: "Milionários" usa o **pico** de valor de mercado, não o valor atual — um modelo de linguagem não conhece o valor de hoje, e o pico é estável.

### Extras (combinam com qualquer tema)

O anfitrião escreve junto do número do tema:

| Extra | Exemplo | Efeito |
|---|---|---|
| **cego** | `3 cego` | Os números ficam secretos (`?` no campinho, placar `???`) e só aparecem na imagem final. Ninguém sabe se está ganhando: cada revelação vira resenha |
| **relâmpago** | `5 relâmpago` | 45 s por jogada em vez de 90 |
| ambos | `aleatório cego relâmpago` | — |

### Próximos extras planejados

| Extra | Regra | Por que é divertido |
|---|---|---|
| **Capitão** | Cada um marca 1 escolhido como capitão (`Messi c`): o número dele conta em dobro | Estratégia: guardar o capitão para a posição mais forte |
| **Mercado da Bola** | Orçamento de €300 mi somando o pico de valor; o placar é por gols. Estourou o orçamento, a escolha é recusada | Dois dados ao mesmo tempo: craque barato vale ouro |
| **Mesma camisa** | Os 6 de cada um têm que ter passado pelo mesmo clube (sorteado no início) | Força conhecimento profundo de elenco |
| **Draft roubado** | Quem escolhe primeiro na rodada "bloqueia" o nome; o outro não pode repetir nem jogador do mesmo clube | Disputa direta pelo mesmo craque |

### Comandos

`ativar grupo` e `desativar grupo` (só os números em `ADMIN_NUMBERS`, se definido), `iniciar jogo`, `iniciar aleatório` (o tema é sorteado assim que alguém aceita, sem menu), `iniciar jogo`, `iniciar aleatório` (o tema é sorteado assim que alguém aceita, sem menu), `aceitar`, `regras`, `modos`, `placar`, `ranking`, `tempo`, `cancelar`/`desistir`, `ajuda`.

## 3. Imagens

Todas em 1080x1350 (4:5, o formato que mais ocupa a tela no WhatsApp), geradas no servidor em ~0,6 s com Satori (`next/og`), sem navegador.

**Identidade**: noite de estádio. Fundo verde-escuro `#06130C` com "refletores" nos cantos, verde-limão `#C8FF3E` como cor de destaque, anfitrião em azul `#38BDF8` e desafiante em laranja `#FF8A3D` (as mesmas cores do começo ao fim, para cada um se reconhecer no campo). Títulos em Anton, texto em Barlow Condensed — tipografia de placar/transmissão esportiva.

| Imagem | Quando | Conteúdo |
|---|---|---|
| Desafio lançado | `iniciar jogo` | Nome do jogo, quem desafiou, formação, botão "ACEITAR" |
| Escolha o tema | `aceitar` / `modos` | Os 17 temas em duas colunas, com etiqueta de restrição, "maior/menor vence" e a dica dos extras |
| Bola rolando | tema escolhido | Nome do tema, selos dos extras (ÀS CEGAS, RELÂMPAGO), anfitrião x desafiante, **regras resumidas**, formação, tempo por jogada |
| Campinho | fim de cada rodada / `placar` / fim | Placar somado, campo com cada escalado, seu número (ou `?` no modo cego), clube sorteado da rodada, selo "RODADA n DE 6" ou "VITÓRIA DE …" |
| Ranking | `ranking` | Tabela do grupo (J, V, E, D, pontos) |

Exemplos: `npm run render:samples` gera todas em `./samples`. Sem emojis nem fotos de jogadores (direitos de imagem e tempo de download); nomes e números bastam.

## 4. Arquitetura

```
WhatsApp (grupo)
   │  mensagem
   ▼
Gateway (Evolution API ou Z-API) ── webhook ──► POST /api/webhook?token=…   (Vercel, Node)
                                                   │ 1. adaptador normaliza a mensagem
                                                   │ 2. deduplicação (processed_messages)
                                                   │ 3. motor do jogo (máquina de estados pura)
                                                   │      ├─ Store (Neon): grupo ativo? partida? ranking
                                                   │      └─ Lookup: cache no Neon → Maritaca
                                                   │ 4. renderiza imagens (Satori → PNG)
                                                   ▼
Gateway ◄── REST (texto / imagem base64) ──────────┘
```

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Motor | `src/lib/game/engine.ts` | Recebe uma mensagem, devolve o que enviar. Sem I/O direto: Store, IA, relógio e sorteio são injetados (testável) |
| Temas / times | `game/modes.ts`, `game/teams.ts` | Catálogo de temas, clubes, seleções e apelidos |
| IA | `src/lib/ai/` | Prompt da Maritaca, saneamento do JSON, cache |
| Banco | `src/lib/store/` | Interface `Store` com implementação Neon e memória |
| WhatsApp | `src/lib/whatsapp/` | Interface `WhatsAppProvider` (Evolution, Z-API) |
| Imagens | `src/lib/images/` | Tema visual e os 5 templates |
| Web | `src/app/` | Página inicial, simulador `/jogar`, rotas de API |

### Por que um gateway, e não a API oficial

A API oficial de grupos da Meta (2025) exige conta "Official Business Account", limita a 8 participantes e só funciona em grupos criados pela empresa — não entra no grupo da galera. Bibliotecas como Baileys mantêm um WebSocket aberto, o que não roda em função serverless. Um gateway resolve: ele mantém a sessão do número e fala com a Vercel por webhook/REST.

- **Evolution API** (open source, self-hosted em uma VPS ~R$ 30/mês) — padrão do projeto.
- **Z-API** (hospedado, pago por instância) — alternativa sem servidor para manter.

Risco: ambos usam o WhatsApp de forma não oficial; o número pode ser banido. Usar um chip dedicado, nunca o pessoal.

Fontes: [Unipile – WhatsApp Group API](https://www.unipile.com/whatsapp-group-api/), [Kapso – estado da Groups API](https://kapso.ai/blog/whatsapp-groups-api-state-2026), [360dialog – Groups](https://docs.360dialog.com/docs/messaging/groups).

### IA (Maritaca)

- Endpoint compatível com OpenAI: `POST https://chat.maritaca.ai/api/chat/completions`, modelo `sabia-4` (troque por `sabiazinho-4` em `MARITACA_MODEL` para mais velocidade e menos custo).
- **Uma chamada devolve a ficha inteira** do jogador (posições, clubes, nascimento, altura e todos os números). Assim o mesmo cache serve a todos os temas.
- **Cache no Neon por 30 dias**: a primeira consulta de um nome leva 1–2 s; as próximas, milissegundos — e o número é sempre o mesmo para todo mundo, o que mantém o jogo justo.
- O prompt manda responder `null` em vez de chutar; dado ausente pede outro jogador, sem passar a vez.
- **Limite honesto**: um modelo de linguagem erra estatísticas, principalmente de jogadores menos famosos. As imagens avisam "dados estimados por IA". Evolução natural: semear `player_cache` com uma base verificada (Transfermarkt/FBref) e deixar a IA só para os casos fora da base.

Fontes: [Maritaca – API](https://www.maritaca.ai/en/api), [Maritaca docs – Chat](https://docs.maritaca.ai/api/pt/completion), [Maritaca – Saídas estruturadas](https://docs.maritaca.ai/pt/structured-outputs).

### Banco (Neon Postgres)

| Tabela | Uso |
|---|---|
| `wa_groups` | Grupos ativados (`ativar grupo`). Grupo fora daqui é ignorado |
| `matches` | Uma linha por partida; estado em `jsonb`; índice único parcial garante **uma partida aberta por grupo**; coluna `version` faz trava otimista contra mensagens simultâneas |
| `processed_messages` | Deduplicação de webhooks reenviados |
| `player_cache` | Fichas dos jogadores vindas da IA |
| `group_stats` | Ranking por grupo |

### Segurança

- Webhook exige `?token=WEBHOOK_SECRET`; simulador e migração exigem `ADMIN_KEY`. Comparação em tempo constante; segredo não configurado nunca autoriza.
- O bot só processa grupos ativados e nunca conversas privadas. Com `ADMIN_NUMBERS`, só o dono ativa/desativa grupos (importante no número que herda os grupos do RPG).
- O webhook ignora eventos de qualquer instância da Evolution que não seja `EVOLUTION_INSTANCE`, mesmo se o servidor tiver webhook global ligado.
- Números fora de uma faixa plausível (ex.: 5.000 gols, 2,60 m) são tratados como "sem dado confiável" — protege contra erro da IA e contra quem tenta forçar números no nome.
- Chaves ficam só em variáveis de ambiente da Vercel.

## 5. Infraestrutura e deploy

1. **Vercel**: importar o repositório (Next.js, sem configuração extra).
2. **Neon**: Vercel → Storage → Create Database → Neon, região São Paulo (`aws-sa-east-1`). As funções rodam em `gru1` (`vercel.json`), perto do banco, da Maritaca e dos jogadores. A integração injeta `DATABASE_URL`.
3. **Variáveis**: ver `.env.example` (`MARITACA_API_KEY`, `WEBHOOK_SECRET`, `ADMIN_KEY`, dados do gateway).
4. **Tabelas**: `curl -X POST https://SEU-APP.vercel.app/api/admin/migrate -H "Authorization: Bearer $ADMIN_KEY"`.
5. **Gateway (Evolution)**: passo a passo da virada do número do RPG em [`EVOLUTION.md`](EVOLUTION.md). Resumo: configurar `EVOLUTION_*` na Vercel e rodar `POST /api/admin/evolution-setup`, que aponta o webhook **só da instância do jogo**. `GET /api/admin/status` confere banco, IA, conexão e webhook.
6. Adicionar o número ao grupo e mandar `ativar grupo`.

Custo estimado por partida: ~12 consultas de IA na primeira vez (menos com cache) + 8 imagens. Cabe no plano gratuito da Vercel e do Neon para dezenas de grupos.

## 6. Próximos jogos de futebol (mesmo estilo: 1x1, no grupo, imagem a cada lance)

Pesquisa de formatos que já fazem sucesso fora do WhatsApp e como cada um vira duelo no grupo:

| Jogo | Inspiração | Como funciona no grupo | Dados | Esforço |
|---|---|---|---|---|
| **Grade dos Craques** | Tiki-Taka-Toe / Immaculate Grid / Soccer Grid | Jogo da velha 3x3: linhas e colunas são clubes/seleções. Na vez, você manda `B2 Neymar`; se ele cruza os dois critérios, a casa é sua (imagem da grade com X/O). Três em linha vence; casa errada passa a vez | Mesma ficha da IA (clubes + seleção) — **reaproveita 100% do cache** | Médio |
| **Caminho do Craque** | Career Path (Footballpark, Football Genius) | Bot mostra a trajetória de clubes de um jogador misterioso, uma etapa por vez. Primeiro a acertar leva o ponto; melhor de 5 | Fichas já em cache (clubes em ordem) | Baixo |
| **Maior ou Menor** | Higher or Lower | Bot mostra "Haaland — 330 gols" e um segundo nome. Cada um responde `maior`/`menor` em segredo... no grupo é aberto, então vale a **vez alternada**: errou, perde a vida. 3 vidas cada | Cache + tema | Baixo |
| **Top 10** | Quizzes de lista (Sporcle/JetPunk), "Família" de programa de auditório | Bot sorteia uma lista ("10 maiores artilheiros da história do Brasileirão"). Alternando, cada um chuta um nome; acertou, ganha pontos pela posição (10º = 1 pt, 1º = 10 pts). Errou 3 vezes, sai | Listas curadas (JSON versionado), não IA | Médio |
| **Quem Sou Eu?** | Who Are Ya / FootballQuest | 5 dicas progressivas (nacionalidade → posição → clubes → títulos → número da camisa). Acertar na dica 1 = 5 pts, na 5 = 1 pt. Corrida: os dois podem chutar | Cache + IA gera dicas a partir da ficha | Baixo |
| **Copa do Grupo** | Mata-mata | Torneio de 4/8 pessoas do grupo, chaveamento automático, cada confronto é um Duelo de Craques; imagem do chaveamento a cada fase | Reaproveita o duelo | Médio |

Ordem sugerida: Caminho do Craque e Quem Sou Eu (rápidos, só cache) → Grade dos Craques (o mais viral) → Top 10 → Copa do Grupo.

Fontes: [Footballpark – Career Path](https://footballpark.com/football-blogs/how-to-play-guess-the-career-path), [Football Genius – regras](https://footballgenius.app/game/career/rules/), [FootballQuest](https://www.footballdream.in/footballquest/how-to-play), [RenderFoot – Soccer Grid](https://www.renderfoot.com/games/soccer-grid), [CFBTrack – Over/Under](https://cfbtrack.com/games/over-under).

## 7. Revisão técnica (nov/2026)

Revisão de tudo que foi entregue na primeira versão. Problemas encontrados e o que foi feito:

| # | Problema | Impacto | Correção |
|---|---|---|---|
| 1 | Duas mensagens ao mesmo tempo: a segunda perdia na trava otimista e era descartada em silêncio | Jogada sumia sem aviso | O motor refaz o processamento sobre o estado novo (até 3 tentativas) |
| 2 | Nenhum limite de plausibilidade nos números da IA | Erro da IA ou "Messi 5000 gols" virando placar | Faixa por dado; fora dela = "sem dado confiável" e a vez continua |
| 3 | "Não existe" ficava 30 dias em cache | Um erro pontual da IA bloqueava um jogador real por um mês | Negativo vale 1 dia; positivo, 30 |
| 4 | Webhook aceitava eventos de qualquer instância | Com webhook global ligado no servidor, mensagens do bot pessoal entrariam no jogo | Filtro por `EVOLUTION_INSTANCE` |
| 5 | Autor da mensagem só lido de `key.participant` | Em versões da v2 ele vem em `data.participant` → mensagens ignoradas | Lê os dois, e prefere `@s.whatsapp.net` ao `@lid` |
| 6 | Grupos com mensagens temporárias | Texto vem dentro de `ephemeralMessage` → bot "surdo" nesses grupos | Desembrulha a mensagem |
| 7 | Qualquer pessoa podia `ativar grupo` | No número herdado do RPG, qualquer grupo antigo poderia ligar o bot | `ADMIN_NUMBERS` |
| 8 | Se a Maritaca recusar `response_format` | Jogo travaria em "VAR caiu" | Refaz a chamada sem o parâmetro |
| 9 | "CR7", "R9" ignorados (dígito bloqueado) | Apelidos comuns não funcionavam | Aceita dígitos curtos; bloqueia só números puros e "900 gols" |
| 10 | `processed_messages` crescia para sempre | Banco enchendo | Limpeza automática de registros com mais de 3 dias |
| 11 | Cache sem versão | Fichas antigas sem os campos novos dariam "sem dado" | Chave versionada (`v2:`) |

Pontos conhecidos que ficam para depois:
- O nome do grupo não vem no webhook da Evolution; o ranking mostra "Grupo". Dá para buscar com `group/findGroupInfos` e guardar em `wa_groups`.
- Apelidos ambíguos ("Ronaldo") dependem da escolha da IA; o cache garante que a resposta seja sempre a mesma.
- Os números ainda são da IA. A base verificada (seção 8) resolve.

## 8. Roadmap

- **Plataforma de jogos no mesmo número** (futebol, animes, conhecimentos gerais): ver [`PLATAFORMA.md`](PLATAFORMA.md), [`ANIMES.md`](ANIMES.md) e [`CONHECIMENTOS-GERAIS.md`](CONHECIMENTOS-GERAIS.md).
- **2 x 2**: `MatchState.players` vira times; a vez roda entre 4 pessoas. O motor já separa "lado" de "pessoa".
- **Base de dados verificada** para os 2–3 mil jogadores mais citados (semeada no `player_cache`), IA só para o resto.
- **Menções reais** (@) e reações do bot; temporada mensal com campeão do grupo.
