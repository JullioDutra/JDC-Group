# Virada na VPS: RPG sai, jogo de futebol entra (bot pessoal intocado)

Roteiro de comandos, na ordem, para rodar na VPS onde está a Evolution API.

| Número | Hoje | Depois |
|---|---|---|
| Pessoal | instância própria + seu bot pessoal | **igual. Nenhum comando abaixo escreve nele** |
| Número do RPG | instância do RPG + backend do RPG | instância nova **`jogos`**, com o QR lido de novo, falando com a Vercel |

**Por que instância nova em vez de reaproveitar a do RPG:** ela nasce limpa, sem webhook, Typebot/Chatwoot/OpenAI ou configurações herdadas do RPG, com nome certo e token novo. O preço é ler o QR de novo, o que você já disse que pode fazer.

## O seu servidor (levantado em 16/11/2026)

| Item | O que é | Na virada |
|---|---|---|
| `~/evolution` → containers `evolution-api-1`, `evolution-postgres-1`, `evolution-redis-1` | **A Evolution v2.3.7 do bot pessoal e do RPG**, porta 8080, HTTP (`http://191.252.221.133:8080`) | Só criamos/desconectamos instâncias pela API. **Nada de `docker compose down/restart` aqui** |
| Webhook global | Não aparece no `.env` (fica desligado por padrão) | O bot pessoal não recebe eventos do número do jogo. Anexo A não se aplica |
| `~/rpg-dark` | Código do RPG (o app roda na Vercel) | Nada a fazer na VPS; o webhook dele deixa de ser chamado quando o número sai da instância |
| Container `rpg-relogio` (porta 8787) | Relógio do RPG | **Parar e tirar do início automático** (pode estar mandando mensagens pelo número) |
| Containers `cadrius-*` e `cadrius_traefik` | **Outro projeto (Cadrius)**, com Evolution própria | **Não mexer** |
| `ligar-webhook.sh` | Script do Finanças G&J (bot pessoal) | **Não usar** para o jogo: ele aponta para o app de finanças |
| "System restart required" | Atualização do Ubuntu pendente | Não reiniciar a VPS durante a virada; deixar para um horário tranquilo (os containers voltam sozinhos, mas o bot pessoal fica fora por alguns minutos) |

Valores para os comandos abaixo: `EVO=http://localhost:8080`, `C=evolution-api-1`, pasta `~/evolution`. Na Vercel: `EVOLUTION_API_URL=http://191.252.221.133:8080`.

**Regras de ouro**
1. **Não reinicie o container/processo da Evolution.** Nada aqui precisa disso, e um restart derrubaria o bot pessoal por alguns segundos.
2. Todo comando que **escreve** usa o nome `$RPG` ou `$JOGOS`. O nome `$PESSOAL` só aparece em comandos de **leitura** (`find`, `connectionState`).
3. Antes e depois, tiramos uma "foto" do bot pessoal e comparamos. Se a diferença vier vazia, nada mudou nele.

> Rotas conferidas na Evolution API v2 (`instance/fetchInstances`, `instance/create`, `instance/connect`, `instance/logout`, `instance/delete`, `instance/connectionState`, `webhook/find|set`, `settings/find|set`). O passo 1 mostra a versão do seu servidor; se for v1, me avise antes de seguir.

---

## Passo 0 · No seu computador: gerar os segredos (5 min)

```bash
openssl rand -hex 24   # -> ADMIN_KEY       (acesso às rotas de admin e ao /jogar)
openssl rand -hex 24   # -> WEBHOOK_SECRET  (vai na URL do webhook)
openssl rand -hex 24   # -> JOGOS_TOKEN     (token da instância nova na Evolution)
```

Guarde os três num gerenciador de senhas. Não mande no chat.

## Passo 1 · VPS: reconhecimento (só leitura)

```bash
ssh usuario@IP-DA-VPS

# Onde a Evolution roda?
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}'
pm2 list 2>/dev/null
systemctl list-units --type=service --no-pager | grep -iE 'evolution|rpg|bot|node'
```

### Se a Evolution está em Docker (o mais comum)

```bash
C=nome-do-container-da-evolution          # da lista acima (imagem atendai/evolution-api ou evoapicloud/evolution-api)
docker port $C                            # porta publicada, normalmente 8080

# Configurações que importam. Não imprime a chave global.
docker exec $C printenv | grep -E '^(SERVER_URL|WEBHOOK_GLOBAL_|CHATWOOT_ENABLED|TYPEBOT_ENABLED|OPENAI_ENABLED|DIFY_ENABLED|DEL_INSTANCE)' | sort

# Chave global numa variável, sem mostrar na tela
GLOBAL=$(docker exec $C printenv AUTHENTICATION_API_KEY)
```

### Se a Evolution roda com pm2/systemd (sem Docker)

```bash
cd /caminho/da/evolution-api
grep -E '^(SERVER_URL|WEBHOOK_GLOBAL_|CHATWOOT_ENABLED|TYPEBOT_ENABLED|OPENAI_ENABLED|DIFY_ENABLED|DEL_INSTANCE|SERVER_PORT)' .env
GLOBAL=$(grep '^AUTHENTICATION_API_KEY=' .env | cut -d= -f2-)
```

### Variáveis da sessão de terminal

```bash
sudo apt-get install -y jq                # se não tiver
EVO=http://localhost:8080                 # porta do passo anterior
curl -s $EVO/ | jq                        # mostra a versão; precisa ser 2.x

# Lista as instâncias: nome, estado e número
curl -s "$EVO/instance/fetchInstances" -H "apikey: $GLOBAL" \
  | jq -r '.[] | [(.name // .instance.instanceName), (.connectionStatus // .instance.status), (.ownerJid // .instance.owner)] | @tsv'

PESSOAL=nome-da-instancia-pessoal
RPG=nome-da-instancia-do-rpg
JOGOS=jogos
```

**O que olhar aqui:**

| Item | Se estiver assim | Faça |
|---|---|---|
| `WEBHOOK_GLOBAL_ENABLED=true` | todas as instâncias mandam eventos para a URL global, inclusive a nova | ver **Anexo A** antes de seguir |
| `CHATWOOT/TYPEBOT/OPENAI/DIFY_ENABLED=true` | só importa se estiverem ligados **na instância** | a instância nova nasce sem eles, então nada a fazer |
| `DEL_INSTANCE` com número | a Evolution apaga sozinha instâncias desconectadas depois de X minutos | ok: só a do RPG vai ficar desconectada |
| `SERVER_URL` | é o endereço público da Evolution | precisa ser **HTTPS e acessível da internet** (a Vercel chama ele). Teste no Passo 2 |

## Passo 2 · VPS: foto do bot pessoal e backup do RPG (só leitura)

```bash
mkdir -p ~/virada && chmod 700 ~/virada && cd ~/virada

# Foto do pessoal ANTES
curl -s "$EVO/webhook/find/$PESSOAL"            -H "apikey: $GLOBAL" | jq -S . > pessoal-webhook-antes.json
curl -s "$EVO/settings/find/$PESSOAL"           -H "apikey: $GLOBAL" | jq -S . > pessoal-settings-antes.json
curl -s "$EVO/instance/connectionState/$PESSOAL" -H "apikey: $GLOBAL"            # esperado: "state":"open"

# Backup do RPG (para rollback)
curl -s "$EVO/webhook/find/$RPG"  -H "apikey: $GLOBAL" | jq -S . > rpg-webhook.json
curl -s "$EVO/settings/find/$RPG" -H "apikey: $GLOBAL" | jq -S . > rpg-settings.json
jq -r '.url' rpg-webhook.json        # para onde o RPG recebe mensagens (usado no Passo 4)

# Backup das variáveis da Evolution (Docker)
docker inspect $C --format '{{range .Config.Env}}{{println .}}{{end}}' > evolution-env.txt && chmod 600 evolution-env.txt
```

Teste se a Evolution é acessível de fora (a Vercel precisa disso):

```bash
curl -sI https://SEU-DOMINIO-DA-EVOLUTION/ | head -1   # esperado: HTTP/2 200 (ou 401/404, mas com resposta)
```

Se não responder por HTTPS, o jogo não consegue enviar mensagens. Me avise que eu monto a configuração do Nginx/Caddy.

## Passo 3 · Vercel: configurar o app ANTES de mexer no número

O RPG continua funcionando durante este passo.

Em **Vercel → duelo-de-craques → Settings → Environment Variables** (ambiente *Production*):

| Variável | Valor |
|---|---|
| `WHATSAPP_PROVIDER` | `evolution` |
| `EVOLUTION_API_URL` | `https://SEU-DOMINIO-DA-EVOLUTION` (sem `/` no fim) |
| `EVOLUTION_INSTANCE` | `jogos` |
| `EVOLUTION_API_KEY` | o **JOGOS_TOKEN** do Passo 0 (nunca a chave global) |
| `WEBHOOK_SECRET` | do Passo 0 |
| `ADMIN_KEY` | do Passo 0 |
| `ADMIN_NUMBERS` | seu número com DDI, só dígitos: `55DDDNUMERO` (pode ter mais de um, separados por vírgula) |
| `MARITACA_API_KEY` | sua chave da Maritaca |
| `MARITACA_MODEL` | `sabia-4` |
| `QSTASH_URL`, `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY` | painel do Upstash → QStash |
| `PUBLIC_APP_URL` | `https://duelo-de-craques-peach.vercel.app` |
| `DATABASE_URL` | criada pela integração Neon (Storage → Neon, região São Paulo) |

Depois: **Deployments → último deploy → Redeploy**. Em seguida, no seu computador:

```bash
APP=https://duelo-de-craques-peach.vercel.app
ADMIN_KEY=...   # do Passo 0

# As tabelas são criadas sozinhas no primeiro uso do banco. Se quiser forçar:
curl -s -X POST "$APP/api/admin/migrate" -H "Authorization: Bearer $ADMIN_KEY"
curl -s "$APP/api/admin/status"          -H "Authorization: Bearer $ADMIN_KEY" | jq
```

Esperado agora: `database: ok`, IA `maritaca` e `whatsapp.error` (a instância `jogos` ainda não existe, então isso é normal).

## Passo 4 · VPS: desligar o RPG

### 4.1 Parar o backend do RPG

Descubra onde ele roda pela URL do webhook (Passo 2):

```bash
jq -r '.url' ~/virada/rpg-webhook.json       # ex.: http://localhost:3005/webhook  ->  porta 3005
sudo ss -ltnp | grep ':3005'                  # mostra o processo dono da porta
```

Pare **só ele** e tire do início automático, conforme o caso:

```bash
# Docker
docker stop NOME_DO_CONTAINER_RPG && docker update --restart=no NOME_DO_CONTAINER_RPG
# docker compose (na pasta do RPG; não use na pasta da Evolution!)
cd /caminho/do/rpg && docker compose stop
# pm2
pm2 stop NOME_RPG && pm2 delete NOME_RPG && pm2 save
# systemd
sudo systemctl disable --now NOME_RPG.service
```

> Se o RPG estiver no **mesmo docker-compose da Evolution**, use `docker stop` só no serviço do RPG, nunca `docker compose down`.

Se o RPG for um fluxo dentro da própria Evolution (Typebot, n8n, EvolutionBot), não há processo para parar: o passo 4.2 resolve.

### 4.2 Desconectar o número da instância do RPG

```bash
curl -s -X DELETE "$EVO/instance/logout/$RPG" -H "apikey: $GLOBAL"
curl -s "$EVO/instance/connectionState/$RPG"     -H "apikey: $GLOBAL"   # esperado: "close"
curl -s "$EVO/instance/connectionState/$PESSOAL" -H "apikey: $GLOBAL"   # esperado: "open"
```

No celular do número do jogo, em **WhatsApp → Dispositivos conectados**, o aparelho da Evolution deve ter sumido. Se ainda estiver lá, desconecte por ali.

Não apague a instância do RPG agora: ela serve de rollback (Passo 8).

## Passo 5 · VPS: criar a instância `jogos`

```bash
JOGOS_TOKEN=...          # do Passo 0
APP=https://duelo-de-craques-peach.vercel.app
WEBHOOK_SECRET=...       # do Passo 0

curl -s -X POST "$EVO/instance/create" -H "apikey: $GLOBAL" -H "content-type: application/json" -d "{
  \"instanceName\": \"$JOGOS\",
  \"token\": \"$JOGOS_TOKEN\",
  \"integration\": \"WHATSAPP-BAILEYS\",
  \"qrcode\": true,
  \"groupsIgnore\": false,
  \"rejectCall\": true,
  \"msgCall\": \"Este número é de jogos e não atende ligações.\",
  \"alwaysOnline\": false,
  \"readMessages\": false,
  \"readStatus\": false,
  \"syncFullHistory\": false,
  \"webhook\": {
    \"url\": \"$APP/api/webhook?token=$WEBHOOK_SECRET\",
    \"byEvents\": false,
    \"base64\": false,
    \"events\": [\"MESSAGES_UPSERT\"]
  }
}" | jq '{instance: .instance.instanceName, status: .instance.status}'
```

Se a sua versão recusar o bloco `webhook`, apague essas linhas, crie sem ele e siga: o Passo 7 configura o webhook.

## Passo 6 · Ler o número de novo

**Opção A, pelo Manager (mais fácil):** abra `https://SEU-DOMINIO-DA-EVOLUTION/manager`, entre com a chave global, clique na instância **jogos** → *Connect* → leia o QR no celular do número (WhatsApp → Dispositivos conectados → Conectar dispositivo).

**Opção B, por código de pareamento (sem QR):**

```bash
curl -s "$EVO/instance/connect/$JOGOS?number=55DDDNUMERODOJOGO" -H "apikey: $GLOBAL" | jq -r '.pairingCode'
```

No celular: Dispositivos conectados → Conectar dispositivo → *Conectar com número de telefone* → digite o código.

Confira:

```bash
curl -s "$EVO/instance/connectionState/$JOGOS"   -H "apikey: $GLOBAL"   # "open"
curl -s "$EVO/instance/connectionState/$PESSOAL" -H "apikey: $GLOBAL"   # continua "open"
```

## Passo 7 · Ligar o jogo e conferir

No seu computador:

```bash
# Garante webhook + leitura de grupos SÓ na instância "jogos" (precisa confirmar o nome)
curl -s -X POST "$APP/api/admin/evolution-setup" \
  -H "Authorization: Bearer $ADMIN_KEY" -H "content-type: application/json" \
  -d '{"confirmInstance": "jogos"}' | jq

curl -s "$APP/api/admin/status" -H "Authorization: Bearer $ADMIN_KEY" | jq
```

Esperado: `connection: "open"`, `webhook.pointsToThisApp: true`, `events: ["MESSAGES_UPSERT"]`, `scheduler` com QStash e `admins: 1 número(s)`.

**Teste no WhatsApp** (num grupo de teste em que você e o número do jogo estejam):
1. Do seu número: `ativar grupo`. O bot confirma.
2. `iniciar jogo` → alguém manda `aceitar` → escolham o tema → joguem uma rodada.
3. `abrir quem é` → `entrar` → `começar`. Confira se a rodada fecha sozinha quando o tempo acaba (QStash).
4. Mande uma mensagem num grupo **não** ativado: o bot deve ficar calado.

### Conferir que o bot pessoal não mudou (VPS)

```bash
cd ~/virada
curl -s "$EVO/webhook/find/$PESSOAL"  -H "apikey: $GLOBAL" | jq -S . > pessoal-webhook-depois.json
curl -s "$EVO/settings/find/$PESSOAL" -H "apikey: $GLOBAL" | jq -S . > pessoal-settings-depois.json
diff pessoal-webhook-antes.json  pessoal-webhook-depois.json  && echo "webhook pessoal: igual"
diff pessoal-settings-antes.json pessoal-settings-depois.json && echo "settings pessoal: igual"
```

Mande também uma mensagem de teste para o bot pessoal e veja se ele responde como sempre.

## Passo 8 · Rollback (se algo der errado)

O RPG volta em 2 minutos:

```bash
curl -s -X DELETE "$EVO/instance/logout/$JOGOS" -H "apikey: $GLOBAL"     # solta o número
curl -s "$EVO/instance/connect/$RPG" -H "apikey: $GLOBAL"                # depois leia o QR na instância do RPG pelo Manager
# religue o backend do RPG (docker start / pm2 start / systemctl enable --now)
```

O webhook do RPG continua salvo na instância dele. Para conferir: `diff <(curl -s "$EVO/webhook/find/$RPG" -H "apikey: $GLOBAL" | jq -S .) ~/virada/rpg-webhook.json`.

## Passo 9 · Limpeza (depois de uns dias rodando bem)

```bash
# Apagar a instância antiga do RPG
curl -s -X DELETE "$EVO/instance/delete/$RPG" -H "apikey: $GLOBAL"

# Nome e recado do perfil do número
curl -s -X POST "$EVO/chat/updateProfileName/$JOGOS"   -H "apikey: $GLOBAL" -H "content-type: application/json" -d '{"name": "Duelo de Craques"}'
curl -s -X POST "$EVO/chat/updateProfileStatus/$JOGOS" -H "apikey: $GLOBAL" -H "content-type: application/json" -d '{"status": "Jogos de futebol e quiz para grupos. Mande ajuda no grupo."}'

# Grupos herdados do RPG: liste e saia dos que não vão jogar
curl -s "$EVO/group/fetchAllGroups/$JOGOS?getParticipants=false" -H "apikey: $GLOBAL" | jq -r '.[] | [.id, .subject] | @tsv'
curl -s -X DELETE "$EVO/group/leaveGroup/$JOGOS?groupJid=ID_DO_GRUPO@g.us" -H "apikey: $GLOBAL"

# Pare o backend do RPG de vez (se não for mais usar)
# docker rm NOME_DO_CONTAINER_RPG   |   pm2 já foi removido   |   sudo systemctl disable NOME_RPG

# Apague os backups quando não precisar mais (contêm configurações)
# rm -rf ~/virada
```

---

## Anexo A · Webhook global ligado (`WEBHOOK_GLOBAL_ENABLED=true`)

Com o global ligado, **toda** instância manda eventos para a URL global, inclusive a `jogos`. O jogo já se protege: descarta eventos de outras instâncias. O risco é o contrário: **o bot pessoal passar a receber as mensagens dos grupos de jogo**, se ele for quem escuta a URL global.

Descubra quem escuta a URL global:

```bash
docker exec $C printenv WEBHOOK_GLOBAL_URL
jq -r '.url' ~/virada/pessoal-webhook-antes.json     # webhook da instância pessoal
```

| Situação | O que fazer |
|---|---|
| A URL global é do **RPG** ou de ninguém | ignore: com o RPG parado, os eventos vão para o vazio. Para limpar, desligue o global num momento tranquilo (exige restart da Evolution, então combine com o bot pessoal parado por 1 minuto) |
| A URL global é do **bot pessoal** e ele **já filtra** pelo campo `instance` | nada a fazer |
| A URL global é do **bot pessoal** e ele **não filtra** | antes do Passo 5, configure webhook **por instância** no pessoal com a mesma URL (`webhook/set/$PESSOAL`), confira que ele funciona e só então desligue o global. Me mande o resultado do Passo 1 que eu escrevo os comandos exatos |

## Anexo B · Checklist

- [ ] Passo 0: ADMIN_KEY, WEBHOOK_SECRET e JOGOS_TOKEN gerados e guardados
- [ ] Passo 1: versão 2.x, nomes `PESSOAL` e `RPG` identificados, webhook global verificado
- [ ] Passo 2: foto do pessoal e backup do RPG em `~/virada`; Evolution acessível por HTTPS
- [ ] Passo 3: variáveis na Vercel, redeploy, `migrate`, `status` com banco ok
- [ ] Passo 4: backend do RPG parado (sem autostart), logout da instância do RPG, pessoal `open`
- [ ] Passo 5: instância `jogos` criada com o JOGOS_TOKEN
- [ ] Passo 6: QR lido, `jogos` = `open`, pessoal = `open`
- [ ] Passo 7: `evolution-setup` ok, `status` ok, teste no grupo, `diff` do pessoal vazio
- [ ] Passo 9 (dias depois): apagar instância do RPG, nome e recado do perfil, sair de grupos antigos
