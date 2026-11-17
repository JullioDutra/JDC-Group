# Base de jogadores: fim do "não encontrado" e do jogador trocado

Problemas relatados em 17/11/2026, nos primeiros jogos de verdade:
1. Muito "não encontrei" e "não tenho um dado confiável de gols".
2. A pessoa digita um jogador e o bot entende outro.

Decisão: o jogo passa a ter uma **base própria de jogadores**. A IA só pesquisa quem não estiver nela, e o que ela achar entra na base. A confirmação no chat ("é esse?") ficou de fora, a pedido.

## 1. Diagnóstico (por que acontecia)

| # | Causa | Efeito |
|---|---|---|
| 1 | Uma única pergunta à IA pedia a identidade **e** 17 números de uma vez, com a ordem "se não souber, use null" | Muitos campos vazios → "sem dado confiável" |
| 2 | O prompt dizia "na dúvida, prefira dizer que não existe" | Jogador real menos famoso, apelido ou grafia diferente → "não encontrei" |
| 3 | O app aceitava qualquer jogador que a IA devolvesse | "Digitei X e veio Y" |
| 4 | O cache guardava a resposta por 30 dias, pelo texto digitado | Um erro se repetia por um mês, em todos os grupos |
| 5 | Nenhum registro das buscas | Não dava para medir nem achar os nomes problemáticos |

## 2. Pesquisa: de onde vêm os dados

**Wikidata** (base aberta da Wikipédia, gratuita, sem chave), consultada pelo serviço SPARQL `query.wikidata.org`:
- **Futebolista:** ocupação `Q937857`. **Fama:** número de Wikipédias com artigo (sitelinks), que serve para desempatar homônimos.
- **Ficha:** nome em português e inglês, apelidos (`altLabel`), nascimento (`P569`), altura (`P2048`, normalizada em metros), posição (`P413`), seleção (`P1532`, ou cidadania `P27` quando falta).
- **Passagens por times** (`P54`): início (`P580`), fim (`P582`), jogos (`P1350`) e gols (`P1351`) em cada uma. Seleção principal é `Q6979593`. A mesma classe marca as seleções de base (sub-20, sub-21, olímpica), que o importador descarta pelo nome, assim como times B, reservas e juniores.
- **Limites do serviço:** 60 s por consulta e cota de tempo por cliente. É obrigatório um User-Agent que identifique o app (o importador usa `DueloDeCraquesBot/1.0`). Consultas pesadas devolvem erro 500 de timeout. Por isso a carga vai em janelas de datas de nascimento, páginas de 400 jogadores e detalhes em lotes de 200, e divide a janela ao meio quando estoura o tempo.

Fontes: [limites do WDQS e política de User-Agent](https://www.wikidata.org/wiki/Wikidata:Data_access), [qualificadores no Wikidata](https://www.wikidata.org/wiki/Help:Qualifiers), [exemplo de consulta de futebolistas com P54/P1350/P1351](https://kiwix.lema.org/stackoverflow.com_en_all_2023-11/questions/60057572/retrieve-wikidata-related-data-entities-from-wikipedia), [lista de propriedades](https://www.wikidata.org/wiki/Wikidata:Database_reports/List_of_properties/all).

**O que vem de onde:**

| Dado | Fonte |
|---|---|
| Identidade, apelidos, posição, seleção, nascimento (idade), altura, clubes, ano de estreia, nº de clubes | Wikidata |
| Jogos e gols pela seleção principal | Wikidata (soma das passagens), quando houver |
| Gols e jogos na carreira, assistências, valor de mercado, títulos, gols em Copa/Champions/Libertadores/Brasileirão, Copas disputadas | IA, numa **pergunta focada** (um número por vez, com a soma do Wikidata como referência), e fica gravado |

## 3. Como a busca funciona agora

```
nome digitado + contexto da rodada (posição, clube/seleção, número do tema)
        │
        ▼
1. BASE (tabela players): chave exata (nome, apelido, sobrenome, primeiro+último)
   → partes do nome ("pedro guilherme") → semelhança (erro de digitação, pg_trgm)
   → ordena: cumpre o contexto > nome mais parecido > mais famoso
        │ achou quem cumpre o contexto? ── sim ──► usa
        ▼ não
2. IA pesquisa com o contexto ("goleiro que jogou no Atlético-MG")
   → só vale se o nome devolvido bater com o digitado (senão: "não achei")
   → entra na base (completa a ficha se a pessoa já existia)
   → "não achei" fica guardado só 10 min
        │ IA também não achou?
        ▼
3. Devolve o mais provável da base, e o jogo explica ("não tem passagem pelo X")
        │
        ▼
4. Falta o número do tema? Pergunta focada só nele → grava na base
```

Toda busca é registrada (`lookup_log`) com o resultado: `base`, `ia`, `ia-nome-diferente`, `ia-nao-achou`, `base-fora-do-contexto`, `nao-achou-recente`, com `+dado` quando completou o número do tema.

## 4. Operação

Na VPS (as chaves estão em `~/jogos/segredos`):

```bash
source ~/jogos/segredos
APP=https://duelo-de-craques-peach.vercel.app
```

**Começar a carga** (uma vez; ela continua sozinha em lotes, pelo QStash):
```bash
curl -s -X POST "$APP/api/admin/players/import" -H "Authorization: Bearer $ADMIN_KEY" -H 'content-type: application/json' \
  -d '{"action":"start","fromYear":1925,"untilYear":2010,"minSitelinks":5}' | jq '{ok, chained, players, cursor: .state.cursor, erro: .state.lastError}'
```

**Acompanhar:**
```bash
curl -s -X POST "$APP/api/admin/players/import" -H "Authorization: Bearer $ADMIN_KEY" -H 'content-type: application/json' \
  -d '{"action":"status"}' | jq '{players, cursor: .state.cursor, imported: .state.imported, erros: .state.errors, erro: .state.lastError, done: .state.done}'
```

**Se a cadeia parar** (6 erros seguidos ou cota do QStash): `-d '{"action":"step"}'` retoma de onde parou. **Parar:** `-d '{"action":"stop"}'`.

**Testar uma busca** (sem gastar IA; com `&ia=1` faz a busca completa):
```bash
curl -s "$APP/api/admin/players?q=victor&pos=GOL&club=atletico-mg" -H "Authorization: Bearer $ADMIN_KEY" | jq
```

**Números no status:** `GET /api/admin/status` mostra `players.base` (quantos na base), `players.carga` (andamento) e `players.buscas24h` (resultados das buscas das últimas 24 h).

## 5. Metas e próximos passos

**Metas:**
- ≥ 95% de identidade correta;
- ≤ 3% de "não encontrado" para jogadores reais;
- ≤ 5% de "sem dado".

Os números vêm de `buscas24h`.

**Próximos passos:**
- Depois da primeira semana, olhar no `lookup_log` os nomes que mais falham e ajustar: mais apelidos, faixa de fama, prompt.
- Se a cota diária do QStash apertar durante a carga, ela retoma no dia seguinte com `{"action":"step"}`.
- Opcional: correção manual pelo admin (`corrigir X = Y`) para casos pontuais.
