# Plataforma de jogos no WhatsApp: planejamento

Um único número (o antigo do RPG) com vários jogos de conhecimento, todos no mesmo formato: **duelo 1 x 1 dentro do grupo, a plateia assistindo, imagem a cada lance**. O futebol (Duelo de Craques) já está pronto. Este documento define como animes e conhecimentos gerais entram sem que um jogo afete o outro.

Documentos relacionados:
- [`PLANEJAMENTO.md`](PLANEJAMENTO.md): futebol (pronto)
- [`ANIMES.md`](ANIMES.md): Duelo Otaku
- [`CONHECIMENTOS-GERAIS.md`](CONHECIMENTOS-GERAIS.md): Sabichão
- [`EVOLUTION.md`](EVOLUTION.md): virada do número do RPG sem afetar o bot pessoal

## 1. Nome e marca

O número precisa de um nome guarda-chuva, e cada jogo mantém o seu:

| Camada | Proposta | Alternativas |
|---|---|---|
| Plataforma (nome/foto do número) | **Arena da Resenha** | Resenha Games · JDC Arena · Duelo! |
| Futebol | Duelo de Craques (verde-estádio) | — |
| Animes | **Duelo Otaku** (roxo/magenta) | Arena Otaku · Shōnen Duel |
| Conhecimentos gerais | **Sabichão** (azul/amarelo) | Quem Sabe Mais · Duelo de Gênios |

*Decisão sua:* o nome da plataforma. O código não depende dele.

## 2. Experiência no grupo

```
iniciar jogo ─► IMAGEM "Desafio lançado" (marca da plataforma)
aceitar      ─► IMAGEM "Escolha o jogo":  ⚽ Futebol · 🎌 Animes · 🧠 Conhecimentos gerais
1 / 2 / 3    ─► IMAGEM "Escolha o modo" daquele jogo (temas + mecânicas)
<modo>       ─► IMAGEM de abertura com as regras resumidas
partida      ─► texto rápido a cada lance; imagem ao fechar cada rodada; imagem final
```

Atalhos, para quem já sabe o que quer:
- `iniciar futebol`, `iniciar anime`, `iniciar quiz` pulam o menu de jogos.
- `ativar grupo futebol` define um **jogo padrão do grupo**: num grupo só de futebol, o menu de jogos nem aparece.
- `ranking` mostra o ranking geral do grupo; `ranking futebol` / `ranking anime` / `ranking quiz`, o de cada jogo.

As regras de convivência no grupo são as mesmas para todos os jogos:
- uma partida por grupo de cada vez;
- só o dono ativa/desativa (`OWNER_NUMBERS`);
- conversa paralela é ignorada; só a mensagem de quem está na vez vai para a IA;
- W.O. em desistência; partida parada por 20 min se encerra sozinha;
- `tempo` cobra quem estourou o relógio.

## 3. Famílias de mecânica (o que se reaproveita)

Toda partida usa uma de seis mecânicas. Um jogo é só **mecânica + catálogo + fonte de dados + tema visual**:

| Mecânica | Como funciona | ⚽ Futebol | 🎌 Animes | 🧠 Geral |
|---|---|---|---|---|
| **Escalação** (pronta) | Cada um preenche N vagas por categoria; soma um número do tema | Duelo de Craques (17 temas) | Esquadrão | Volta ao Mundo, Brasil de Ponta a Ponta, Zoológico, Bilheteria |
| **Grade** | Jogo da velha 3x3; cada casa cruza dois critérios | Clube x Seleção | Obra x Atributo | País x Característica |
| **Dicas** | Item misterioso revelado aos poucos; acertar cedo vale mais | Quem Sou Eu / Caminho do Craque | Quem é esse personagem? / Emoji-Anime | Quem Sou Eu / Bandeiraço |
| **Lista** | Bot sorteia um Top 10; alternando, cada um chuta itens | Top 10 artilheiros… | Top 10 mais amados… | Top 10 países mais populosos… |
| **Maior ou Menor** | Dois itens, qual tem mais? Errou, perde vida | Gols, valor | Favoritos, nota | População, área |
| **Stop** | Letra sorteada + categorias; IA valida as palavras | Jogador, clube, estádio… | Personagem, anime, golpe… | Adedonha clássica |

Ordem de construção das mecânicas, pensando em reuso: Escalação (pronta) → Dicas → Stop → Lista → Maior ou Menor → Grade.

## 4. Arquitetura multi-jogo

### Módulos

```
src/lib/platform/
  router.ts        comandos comuns (ativar, ranking, ajuda, cancelar) + escolhe o jogo
  registry.ts      lista de GameModules ligados (variável ENABLED_GAMES)
  mechanics/
    draft.ts       motor de Escalação (o engine.ts atual, generalizado)
    clues.ts       motor de Dicas
    stop.ts        motor de Stop
    ...
src/games/
  futebol/   modes.ts · teams.ts · lookup.ts (Maritaca) · theme.ts
  animes/    modes.ts · works.ts  · lookup.ts (AniList + Maritaca) · theme.ts
  geral/     modes.ts · data/*.json · lookup.ts (IBGE/REST Countries/curado) · theme.ts
```

Contrato de um jogo (resumo):

```ts
interface GameModule {
  id: 'futebol' | 'animes' | 'geral';
  name: string;                 // "Duelo de Craques"
  theme: ImageTheme;            // cores, fontes, ícone, fundo
  modes: ModeDef[];             // temas, cada um com a sua mecânica
  slots(mode): SlotDef[];       // vagas (GOL/DEF… · Protagonista/Vilão… · Ásia/Europa…)
  lookup(text): Promise<Entity | null>;      // nome digitado -> entidade canônica
  validate(entity, slot, restriction): Verdict;
  metric(entity, mode): number | null;
}
```

O motor atual de futebol já é quase isso: separar o que é "futebol" (posições, clubes, prompt) do que é "escalação" (vez, rodadas, soma, imagens) é a primeira tarefa da fase 2.

### Banco (mudanças)

| Tabela | Mudança |
|---|---|
| `matches` | `+ game_id`, `+ mechanic`. Continua **uma partida aberta por grupo** (qualquer jogo) |
| `player_cache` → `entity_cache` | chave `game_id:versão:nome`. Cada jogo tem o seu cache, sem colisão ("Ronaldo" do futebol ≠ "Ronaldo" de outro jogo) |
| `group_stats` | `+ game_id` na chave; o ranking geral soma os jogos |
| `wa_groups` | `+ default_game`, `+ enabled_games` |

### Como um jogo não afeta o outro

1. **Módulos independentes.** Catálogo, prompt, cache e fonte de dados de cada jogo ficam na pasta dele. Mudar o futebol não toca em animes.
2. **Falha isolada.** O router chama o módulo dentro de `try/catch`: se a AniList cair, só a partida de anime responde "VAR caiu, tente de novo". Futebol e quiz seguem normais.
3. **Liga/desliga por variável.** `ENABLED_GAMES=futebol,animes` na Vercel. Um jogo novo entra desligado, é testado no simulador `/jogar` e só depois é ligado, sem redeploy de código.
4. **Por grupo.** `enabled_games` permite, por exemplo, só futebol no grupo da pelada e só animes no grupo otaku.
5. **Testes por jogo.** Cada módulo tem a sua suíte; o CI roda todas antes do deploy.
6. **Versão de cache por jogo.** Mudar a ficha de um jogo invalida só o cache dele.

### Custos e limites

| Item | Futebol | Animes | Geral |
|---|---|---|---|
| Fonte dos números | Maritaca (cache 30 dias) | AniList (grátis, 90 req/min, hoje degradado a 30/min) + cache | IBGE / REST Countries (grátis) + listas curadas |
| IA | 1 chamada por jogador novo | Só para apelidos e papéis (vilão/mentor) | Validar palavras do Stop, gerar dicas |
| Imagens | Vercel (Satori) | idem | idem |

## 5. Fases

| Fase | Entrega | Depende de |
|---|---|---|
| **1. Agora** | Futebol pronto (17 temas, extras cego/relâmpago) · virada do número do RPG ([`EVOLUTION.md`](EVOLUTION.md)) | Fim do RPG, Neon, chave Maritaca |
| **2. Plataforma** | Router + `GameModule`; futebol migrado sem mudar nada para o jogador; menu "Escolha o jogo"; ranking por jogo | Fase 1 |
| **3. Duelo Otaku** | Esquadrão (Escalação) com 10 temas via AniList | Fase 2 |
| **4. Sabichão** | Volta ao Mundo e Brasil de Ponta a Ponta (dados oficiais) + Stop | Fase 2 |
| **5. Mecânicas extras** | Dicas → Lista → Maior ou Menor → Grade, nos três jogos | Fases 3 e 4 |
| **6. Social** | 2x2, Copa do Grupo (mata-mata), temporadas mensais | — |

## 6. Decisões em aberto (suas)

1. **Nome da plataforma** (seção 1).
2. **Menu de jogo sempre ou jogo padrão por grupo?** Sugestão: os dois. Menu por padrão e `ativar grupo <jogo>` para fixar.
3. **Ranking geral** somando todos os jogos, ou só por jogo? Sugestão: por jogo, com um "Rei da Resenha" mensal geral.
4. **TMDB** (Bilheteria) proíbe uso comercial sem contrato. Se a plataforma for monetizada, esse modo fica de fora ou usa dados curados (ver [`CONHECIMENTOS-GERAIS.md`](CONHECIMENTOS-GERAIS.md)).
