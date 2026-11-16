# Virada pronta: comandos com os nomes reais do servidor

Levantado em 16/11/2026. Evolution v2.3.7 em `~/evolution` (container `evolution-api-1`, porta 8080).

| Instância | Número | Papel | Na virada |
|---|---|---|---|
| `financas` | 55 62 9325-9733 | Bot pessoal (Finanças G&J) | **Só leitura.** Nenhum comando escreve nela |
| `rpg-yotsuhoshi` | 55 62 9238-9582 | RPG | Desconectada (logout) e apagada dias depois |
| `jogos` (nova) | 55 62 9238-9582 | Duelo de Craques | Criada com webhook para a Vercel |

Já configurado na Vercel: `EVOLUTION_API_URL=http://191.252.221.133:8080`, `EVOLUTION_INSTANCE=jogos`, `DATABASE_URL` (Neon), `MARITACA_API_KEY`, `ADMIN_NUMBERS`.

Antes de cada bloco na VPS, carregue as variáveis (a chave não aparece na tela):

```bash
cd ~/evolution && GLOBAL=$(grep '^AUTHENTICATION_API_KEY=' .env | cut -d= -f2) && EVO=http://localhost:8080
```

## A. Gerar os segredos do jogo (VPS)

```bash
mkdir -p ~/jogos && chmod 700 ~/jogos
[ -f ~/jogos/segredos ] || printf 'JOGOS_TOKEN=%s\nWEBHOOK_SECRET=%s\nADMIN_KEY=%s\n' "$(openssl rand -hex 24)" "$(openssl rand -hex 24)" "$(openssl rand -hex 24)" > ~/jogos/segredos
chmod 600 ~/jogos/segredos && cat ~/jogos/segredos
```

Na Vercel (projeto duelo-de-craques → Settings → Environment Variables), Production + Preview, como **Sensitive**:
- `EVOLUTION_API_KEY` (nova) = valor de `JOGOS_TOKEN`
- `WEBHOOK_SECRET` (editar) = valor de `WEBHOOK_SECRET`
- `ADMIN_KEY` (editar) = valor de `ADMIN_KEY`
- `QSTASH_URL`, `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY` (do console da Upstash)

Depois: Deployments → último → **Redeploy**. Só siga para o bloco D com o redeploy pronto.

## B. Backup e foto do bot pessoal (VPS, só leitura)

```bash
mkdir -p ~/virada && chmod 700 ~/virada
for i in financas rpg-yotsuhoshi; do
  curl -s "$EVO/webhook/find/$i"  -H "apikey: $GLOBAL" | jq -S . > ~/virada/$i-webhook.json
  curl -s "$EVO/settings/find/$i" -H "apikey: $GLOBAL" | jq -S . > ~/virada/$i-settings.json
done
chmod 600 ~/virada/* && ls -l ~/virada
```

## C. Desligar o RPG (VPS)

```bash
docker stop rpg-relogio && docker update --restart=no rpg-relogio
curl -s -X DELETE "$EVO/instance/logout/rpg-yotsuhoshi" -H "apikey: $GLOBAL"; echo
for i in rpg-yotsuhoshi financas; do echo -n "$i: "; curl -s "$EVO/instance/connectionState/$i" -H "apikey: $GLOBAL" | jq -r '.instance.state'; done
```

Esperado: `rpg-yotsuhoshi: close` e `financas: open`.

## D. Criar a instância `jogos` (VPS)

```bash
source ~/jogos/segredos
APP=https://duelo-de-craques-peach.vercel.app
curl -s -X POST "$EVO/instance/create" -H "apikey: $GLOBAL" -H "content-type: application/json" -d "{
  \"instanceName\": \"jogos\", \"token\": \"$JOGOS_TOKEN\", \"integration\": \"WHATSAPP-BAILEYS\", \"qrcode\": true,
  \"groupsIgnore\": false, \"rejectCall\": true, \"msgCall\": \"Este número é de jogos e não atende ligações.\",
  \"alwaysOnline\": false, \"readMessages\": false, \"readStatus\": false, \"syncFullHistory\": false,
  \"webhook\": {\"url\": \"$APP/api/webhook?token=$WEBHOOK_SECRET\", \"byEvents\": false, \"base64\": false, \"events\": [\"MESSAGES_UPSERT\"]}
}" | jq '{instancia: .instance.instanceName, status: .instance.status}'
curl -s "$EVO/webhook/find/jogos" -H "apikey: $GLOBAL" | jq -c '{enabled, url: ((.url // "") | sub("token=[^&]*"; "token=***")), events}'
```

Se o webhook vier vazio, ligue-o à parte:

```bash
curl -s -X POST "$EVO/webhook/set/jogos" -H "apikey: $GLOBAL" -H "content-type: application/json" \
  -d "{\"webhook\": {\"enabled\": true, \"url\": \"$APP/api/webhook?token=$WEBHOOK_SECRET\", \"byEvents\": false, \"base64\": false, \"events\": [\"MESSAGES_UPSERT\"]}}" | jq -c '{enabled, events}'
```

## E. Ler o número de novo

Código de pareamento (sem QR):

```bash
curl -s "$EVO/instance/connect/jogos?number=556292389582" -H "apikey: $GLOBAL" | jq -r '.pairingCode // "sem código: use o QR do Manager"'
```

No celular do número do jogo: WhatsApp → Aparelhos conectados → Conectar aparelho → **Conectar com número de telefone** → digite o código. O código vale cerca de 1 minuto; se expirar, rode de novo.

Alternativa com QR: `http://191.252.221.133:8080/manager` → instância `jogos` → Connect.

## F. Conferir

```bash
source ~/jogos/segredos
for i in jogos financas; do echo -n "$i: "; curl -s "$EVO/instance/connectionState/$i" -H "apikey: $GLOBAL" | jq -r '.instance.state'; done
diff <(curl -s "$EVO/webhook/find/financas"  -H "apikey: $GLOBAL" | jq -S .) ~/virada/financas-webhook.json  && echo "financas: webhook igual"
diff <(curl -s "$EVO/settings/find/financas" -H "apikey: $GLOBAL" | jq -S .) ~/virada/financas-settings.json && echo "financas: settings igual"
curl -s https://duelo-de-craques-peach.vercel.app/api/admin/status -H "Authorization: Bearer $ADMIN_KEY" | jq
```

Esperado: `jogos: open`, `financas: open`, as duas linhas "igual" e, no status, `database: ok`, IA `maritaca`, `scheduler` com QStash, `connection: open` e `pointsToThisApp: true`.

## G. Testar no WhatsApp

Num grupo de teste com você e o número do jogo:
1. `ativar jogos` (do seu número, 62 9325-9733) → o bot confirma.
2. `ajuda` → lista de comandos.
3. `abrir fato ou fake` → peça para alguém mandar `entrar` → `começar`.
4. Mande uma mensagem para o seu bot pessoal e veja se ele responde como sempre.

## Voltar atrás (se precisar)

```bash
curl -s -X DELETE "$EVO/instance/logout/jogos" -H "apikey: $GLOBAL"
curl -s "$EVO/instance/connect/rpg-yotsuhoshi?number=556292389582" -H "apikey: $GLOBAL" | jq -r '.pairingCode'
docker update --restart=unless-stopped rpg-relogio && docker start rpg-relogio
```

## Dias depois

```bash
curl -s -X DELETE "$EVO/instance/delete/rpg-yotsuhoshi" -H "apikey: $GLOBAL"
curl -s -X POST "$EVO/chat/updateProfileName/jogos" -H "apikey: $GLOBAL" -H "content-type: application/json" -d '{"name": "Duelo de Craques"}'
```
