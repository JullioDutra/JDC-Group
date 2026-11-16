# Evolution API: usar o número do RPG sem afetar o bot pessoal

> **Roteiro de comandos da virada:** [`VIRADA-VPS.md`](VIRADA-VPS.md). Como o QR pode ser lido de novo, o caminho recomendado agora é criar uma instância nova `jogos` e aposentar a do RPG. Este documento explica o isolamento e a alternativa de reaproveitar a instância do RPG sem reler o QR.

Situação: um servidor Evolution API com **dois números conectados**:

| Número | Hoje | Depois |
|---|---|---|
| Bot pessoal | Instância própria, com o seu webhook | **Não muda nada** |
| Número do RPG | Instância própria, falando com o backend do RPG | Passa a ser o número da **plataforma de jogos** (futebol, animes, conhecimentos gerais) |

A troca é feita **sem escanear QR code de novo** e sem tocar no bot pessoal: na Evolution, cada número é uma *instância* com sessão, webhook, configurações e token próprios. Trocar o webhook de uma instância não mexe em nenhuma outra.

> Os formatos de requisição abaixo foram conferidos nos tipos do SDK oficial da Evolution v2 (`evolution-api-sdk`): rotas `webhook/set`, `webhook/find`, `settings/set`, `settings/find`, `instance/connectionState`, `instance/fetchInstances`, header `apikey` aceitando "chave global ou token da instância". Confira a versão do seu servidor antes da virada.

## 1. Como os dois bots ficam isolados

```
                    Servidor Evolution
             ┌──────────────────────────────────┐
WhatsApp ───►│ instância "pessoal" ── webhook ──┼──► seu bot pessoal   (intocado)
             │                                  │
WhatsApp ───►│ instância "<rpg>"   ── webhook ──┼──► hoje: backend do RPG
             │                                  │    depois: Vercel /api/webhook?token=…
             └──────────────────────────────────┘
                    ▲
                    │ REST com o TOKEN DA INSTÂNCIA "<rpg>" (não a chave global)
               Vercel (jogos)
```

Seis travas, da mais importante para a menos:

1. **Webhook por instância.** O jogo só altera o webhook da instância `EVOLUTION_INSTANCE`. A rota `/api/admin/evolution-setup` exige que você digite o nome da instância de novo (`confirmInstance`), então não tem como apontar o bot pessoal por engano.
2. **Token da instância, não a chave global.** Em `EVOLUTION_API_KEY` vai o token da instância do RPG. Com ele, a Vercel só consegue operar aquele número. Mesmo se a chave vazar, o bot pessoal está fora de alcance.
3. **Filtro por instância no código.** Se o servidor tiver webhook global ligado, o jogo descarta qualquer evento cujo campo `instance` não seja o do jogo.
4. **Só grupos ativados.** O número herda os grupos do RPG, mas o jogo fica mudo em todos até alguém mandar `ativar jogos`.
5. **Só o admin ativa.** Só os números em `ADMIN_NUMBERS` ligam o jogo em um grupo (e precisam estar no grupo para mandar o comando). Sem a variável, ninguém ativa.
6. **Mensagens do próprio número são ignoradas** (`fromMe`), então o bot nunca responde a si mesmo.

### Cuidado com o webhook global

Se o `.env` do servidor Evolution tiver o webhook global ligado (variáveis `WEBHOOK_GLOBAL_*`; confira o nome exato na sua versão), **todas** as instâncias mandam eventos para a URL global. Nesse caso:
- o jogo já se protege (trava 3);
- mas o **bot pessoal** também passaria a receber as mensagens do número de jogos. Se ele depende do global, ele precisa filtrar pelo campo `instance`, ou migre ele para webhook por instância. **Recomendado:** global desligado e cada instância com o seu webhook.

### Cuidado com integrações internas da Evolution

A Evolution também tem integrações que respondem sozinhas (Typebot, Chatwoot, OpenAI, Dify, Flowise, EvolutionBot, n8n). Se o RPG usa alguma delas na instância, **desligue-a nessa instância** no Manager da Evolution (`https://SEU-SERVIDOR/manager`). Senão, ela continua respondendo junto com o jogo.

## 2. Antes da virada (pode ser feito já, sem afetar o RPG)

Use a **chave global** só nestes comandos de leitura, no seu terminal:

```bash
EVO=https://SEU-SERVIDOR-EVOLUTION
GLOBAL=chave-global-do-servidor

# 1. Nomes das instâncias (descubra qual é a do RPG e qual é a pessoal)
curl -s "$EVO/instance/fetchInstances" -H "apikey: $GLOBAL"

# 2. Guarde o webhook e as configurações atuais do RPG (servem de rollback)
curl -s "$EVO/webhook/find/NOME_DO_RPG"  -H "apikey: $GLOBAL" > rpg-webhook-backup.json
curl -s "$EVO/settings/find/NOME_DO_RPG" -H "apikey: $GLOBAL" > rpg-settings-backup.json
```

O token da instância do RPG aparece no Manager da Evolution (campo token/apikey da instância) e na resposta de `fetchInstances`.

Na Vercel (projeto `duelo-de-craques`), configure:

| Variável | Valor |
|---|---|
| `EVOLUTION_API_URL` | `https://SEU-SERVIDOR-EVOLUTION` (público, HTTPS) |
| `EVOLUTION_API_KEY` | **token da instância do RPG** |
| `EVOLUTION_INSTANCE` | nome exato da instância do RPG |
| `ADMIN_NUMBERS` | seu número com DDI, ex.: `5511999998888` |
| `MARITACA_API_KEY` | sua chave |
| `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY` | do painel do Upstash (QStash): fecham as rodadas do Modo em Grupo na hora |
| `PUBLIC_APP_URL` | `https://duelo-de-craques-peach.vercel.app` |
| `DATABASE_URL` | vem da integração Neon |

Depois do redeploy, confira sem mexer em nada:

```bash
APP=https://duelo-de-craques-peach.vercel.app
curl -s "$APP/api/admin/status" -H "Authorization: Bearer $ADMIN_KEY"
```

Esperado nesse momento: `database: ok`, `connection: open` e `webhook.pointsToThisApp: false`, porque o webhook ainda aponta para o RPG. **O RPG segue funcionando normalmente.** O jogo pode ser testado à vontade pelo simulador `/jogar`.

## 3. Dia da virada (quando o RPG acabar)

| # | Passo | Comando / onde |
|---|---|---|
| 1 | (Opcional) O RPG manda uma mensagem de despedida nos grupos | backend do RPG |
| 2 | Desligar o backend do RPG | seu servidor |
| 3 | Desligar integrações internas que o RPG usava nessa instância, se houver | Manager da Evolution |
| 4 | Apontar o webhook do número para o jogo e liberar grupos | comando abaixo |
| 5 | Conferir | `GET /api/admin/status` → `pointsToThisApp: true` |
| 6 | Em um grupo de teste: `ativar jogos` (do seu número) → `iniciar jogo` | WhatsApp |

```bash
curl -s -X POST "$APP/api/admin/evolution-setup" \
  -H "Authorization: Bearer $ADMIN_KEY" -H "content-type: application/json" \
  -d '{"confirmInstance": "NOME_DO_RPG"}'
```

Esse comando faz, **só na instância do RPG**:
- `POST webhook/set/NOME_DO_RPG` com `{ enabled: true, url: <app>/api/webhook?token=…, byEvents: false, base64: false, events: ["MESSAGES_UPSERT"] }`;
- lê as configurações e, se `groupsIgnore` estiver ligado, desliga só esse item, mantendo os demais (rejeitar chamadas, ficar online etc.).

O bot pessoal não é tocado em nenhum momento.

### Rollback (voltar para o RPG)

```bash
# Reaponte o webhook usando os valores salvos em rpg-webhook-backup.json
curl -s -X POST "$EVO/webhook/set/NOME_DO_RPG" -H "apikey: $GLOBAL" -H "content-type: application/json" \
  -d '{"webhook": {"enabled": true, "url": "URL_ANTIGA_DO_RPG", "byEvents": false, "base64": false, "events": ["MESSAGES_UPSERT"]}}'
```

## 4. Depois da virada

- **Nome e foto do número:** troque para a marca da plataforma de jogos. São as rotas `chat/updateProfileName/NOME_DO_RPG` e `chat/updateProfilePicture/NOME_DO_RPG` ou o Manager.
- **Grupos antigos do RPG:** o bot fica mudo neles. Saia dos que não vão jogar (`group/leaveGroup`) para reduzir eventos inúteis.
- **Nome da instância:** continua o do RPG, e isso é só cosmético. Para renomear seria preciso criar outra instância e escanear o QR de novo com o mesmo chip, trocando depois `EVOLUTION_INSTANCE` e o token. Só vale se o nome incomodar.
- **Risco de banimento:** é uso não oficial do WhatsApp. Ajuda que o número já é "aquecido" (meses de uso no RPG). Evite disparar mensagens para quem não pediu. O jogo só fala em grupos ativados e só responde a comandos, o que já é o padrão mais seguro.
- **Reações:** o Modo em Grupo confirma respostas com reação (✅/❌) via `message/sendReaction`, o que gera menos mensagens no grupo.
- **Carga no servidor:** a Evolution só repassa texto e imagens (~300 KB cada). As imagens são geradas na Vercel, não no seu servidor.

## 5. Checklist

- [ ] Instâncias identificadas (pessoal × RPG)
- [ ] Backup do webhook e das configurações do RPG
- [ ] Webhook global do servidor: desligado (ou o bot pessoal filtra por `instance`)
- [ ] Variáveis na Vercel com o **token da instância**, não a chave global
- [ ] Neon conectado + `POST /api/admin/migrate`
- [ ] `GET /api/admin/status` OK antes da virada
- [ ] Dia D: RPG desligado → integrações internas desligadas → `evolution-setup` → status → teste no grupo
