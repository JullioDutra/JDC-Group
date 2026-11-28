# Migração do bot para a VPS

O bot sai da Vercel (pausada por limite de CPU até ~27/12/2026) e passa a rodar num container na VPS, ao lado da Evolution.

**Regras:**
- Nada aqui reinicia a Evolution, o bot de finanças ou o Cadrius.
- Todo comando `docker compose` deste guia roda dentro de `deploy/vps`, num projeto próprio (`duelo-de-craques`).

**O que muda e o que fica:**
- **Muda:** o bot roda no container `duelo-bot`, e um proxy na frente dá HTTPS a ele.
- **Fica igual:** o banco (Neon), o QStash (prazos das rodadas), a Maritaca e a Evolution.
- **Webhook:** só a instância do JOGO na Evolution troca de endereço.

## 0. Antes de começar

- **Subdomínio:** crie no DNS um registro **A** apontando para o IP da VPS (ex.: `duelo.seudominio.com.br`). Pode levar alguns minutos para valer; confira com `ping duelo.seudominio.com.br`.
- **Máquina:** o build usa uns 1,5 GB de RAM por alguns minutos. Com menos que isso livre, avise que eu ajusto.

## 1. Ver o que já roda na VPS

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
sudo ss -tlnp | grep -E ':(80|443|3010)\s'
```

- **Quem usa as portas 80 e 443** (Nginx, Caddy, Traefik, nginx-proxy-manager ou nada) decide o passo 4.
- **Se a porta 3010 já estiver em uso,** escolha outra para o `BOT_PORT` no passo 3.

## 2. Baixar o código

O repositório é privado. Use uma **chave de deploy** (só leitura, só deste repositório):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/duelo_deploy -N '' -C 'vps-duelo'
cat ~/.ssh/duelo_deploy.pub
```

1. Copie a linha que aparecer.
2. No GitHub, abra o repositório e vá em **Settings → Deploy keys → Add deploy key**.
3. Cole a linha e deixe **sem** "Allow write access".

Depois:

```bash
sudo mkdir -p /opt/duelo-de-craques && sudo chown "$USER" /opt/duelo-de-craques
GIT_SSH_COMMAND='ssh -i ~/.ssh/duelo_deploy -o IdentitiesOnly=yes' \
  git clone -b claude/whatsapp-football-game-6ogbgn git@github.com:JullioDutra/JDC-Group.git /opt/duelo-de-craques
cd /opt/duelo-de-craques
git config core.sshCommand 'ssh -i ~/.ssh/duelo_deploy -o IdentitiesOnly=yes'
```

## 3. Variáveis (`.env`)

```bash
cd /opt/duelo-de-craques/deploy/vps
cp .env.exemplo .env
chmod 600 .env
nano .env
```

**De onde vêm os valores:** são os mesmos da Vercel.

- **Pelo painel:** abra o projeto e vá em **Settings → Environment Variables**. Clique no olho de cada variável e copie.
- **Pela CLI** (no seu computador ou na VPS):

  ```bash
  npx vercel@latest login
  npx vercel@latest link --project duelo-de-craques
  npx vercel@latest env pull vercel.env --environment=production
  ```

  Depois copie os valores de `vercel.env` para o `.env` e apague o `vercel.env`. Variável marcada como "Sensitive" vem vazia na CLI; essas você copia do painel.

**Novas na VPS:**
- `DOMAIN=duelo.seudominio.com.br` (sem `https://`)
- `PUBLIC_APP_URL=https://duelo.seudominio.com.br`. É por ele que o QStash chama os prazos das rodadas.
- `BOT_PORT=3010`, ou outra porta livre (passo 1).
- `BOT_BIND=127.0.0.1`. Use `172.17.0.1` se o proxy que já existe roda em container (passo 5).

## 4. Subir o bot

```bash
cd /opt/duelo-de-craques/deploy/vps
docker compose up -d --build bot
docker compose logs -f bot        # Ctrl+C para sair; deve aparecer "Ready"
curl -s http://127.0.0.1:3010/api/health ; echo
```

Troque `3010` se mudou o `BOT_PORT`, e `127.0.0.1` se mudou o `BOT_BIND`. A resposta deve trazer `"whatsapp":"open"` e `"banco":"ok"`.

## 5. HTTPS (proxy)

Escolha conforme o passo 1.

**A) Nada nas portas 80/443:** use o Caddy deste compose. Ele tira o certificado sozinho.

```bash
cd /opt/duelo-de-craques/deploy/vps
docker compose --profile proxy up -d caddy
```

**B) Já existe um Caddy:** acrescente ao Caddyfile dele e recarregue o Caddy (não a Evolution).

```
duelo.seudominio.com.br {
	reverse_proxy 127.0.0.1:3010
}
```

Se esse Caddy roda em container (sem `network_mode: host`):
1. Ponha `BOT_BIND=172.17.0.1` no `.env`.
2. Rode de novo `docker compose up -d bot`.
3. No bloco acima, use `172.17.0.1:3010` no lugar de `127.0.0.1:3010`.

**C) Já existe um Nginx no host:**

```nginx
server {
    server_name duelo.seudominio.com.br;
    client_max_body_size 10m;
    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
    }
}
```

```bash
sudo nano /etc/nginx/sites-available/duelo
sudo ln -s /etc/nginx/sites-available/duelo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d duelo.seudominio.com.br
```

**D) Traefik ou nginx-proxy-manager:** mande a saída do passo 1 que eu escrevo a configuração certa.

**Teste (de qualquer lugar):**

```bash
curl -s https://duelo.seudominio.com.br/api/health ; echo
```

## 6. Apontar o WhatsApp para a VPS

Este comando troca o webhook **só da instância do jogo**: a rota recusa se o nome não bater com `EVOLUTION_INSTANCE`.

```bash
cd /opt/duelo-de-craques/deploy/vps
ADMIN_KEY=$(grep -E '^ADMIN_KEY=' .env | cut -d= -f2-)
INSTANCIA=$(grep -E '^EVOLUTION_INSTANCE=' .env | cut -d= -f2-)
curl -s -X POST https://duelo.seudominio.com.br/api/admin/evolution-setup \
  -H "Authorization: Bearer $ADMIN_KEY" -H 'content-type: application/json' \
  -d "{\"confirmInstance\":\"$INSTANCIA\"}" ; echo
```

A resposta deve trazer `"ok":true` e o webhook novo. Depois mande **ajuda** num grupo ativo: o bot responde com a imagem dos comandos.

## 7. Cron diário da carga de jogadores

Era o `crons` do `vercel.json`. Abra o crontab:

```bash
crontab -e
```

E acrescente a linha:

```
17 0 * * * /opt/duelo-de-craques/deploy/vps/cron-carga.sh >> /tmp/duelo-cron.log 2>&1
```

Teste uma vez na mão:

```bash
/opt/duelo-de-craques/deploy/vps/cron-carga.sh
```

## 8. Depois de funcionando

- **Atualizar** quando houver versão nova no GitHub:

  ```bash
  /opt/duelo-de-craques/deploy/vps/atualizar.sh
  ```

- **Ver os logs:**

  ```bash
  docker logs -f --tail 100 duelo-bot
  ```

- **Vercel:** ela volta sozinha por volta de 27/12. Para não rodarem duas cópias (o cron diário de lá também retomaria a carga), pause o projeto lá: **Settings → General → Pause Project**. Se preferir, peça que eu pause.

## Se algo der errado

- **Bot não sobe:** `docker compose logs bot` mostra o motivo, em geral uma variável faltando no `.env`.
- **Health responde, mas o grupo não:**
  - confira o passo 6 (webhook);
  - confira se o `WEBHOOK_SECRET` do `.env` é o mesmo da Vercel.
- **Rodada não fecha sozinha:** o QStash não está alcançando o bot. Confira o `PUBLIC_APP_URL` (com `https://`) e o passo 5.
- **Voltar para a Vercel:** é só refazer o passo 6 com o endereço da Vercel. O código continua igual para as duas.
