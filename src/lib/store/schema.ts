/** Migração idempotente: pode rodar quantas vezes for preciso. */
export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS awards_groups (
    group_jid text PRIMARY KEY,
    active boolean NOT NULL DEFAULT false,
    updated_by text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS awards_nominations (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    group_jid text NOT NULL REFERENCES awards_groups(group_jid),
    category integer CHECK (category BETWEEN 1 AND 22),
    fingerprint text NOT NULL,
    command_message_id text NOT NULL,
    payload jsonb NOT NULL,
    UNIQUE (group_jid, fingerprint),
    UNIQUE (group_jid, command_message_id)
  )`,
  `CREATE INDEX IF NOT EXISTS awards_nominations_group_id ON awards_nominations (group_jid, id)`,
  `CREATE TABLE IF NOT EXISTS wa_groups (
    jid          text PRIMARY KEY,
    name         text,
    active       boolean NOT NULL DEFAULT false,
    activated_by text,
    updated_at   timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS matches (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    group_jid  text NOT NULL,
    status     text NOT NULL,
    mode_id    text,
    version    integer NOT NULL DEFAULT 1,
    state      jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  // Garante no banco: no máximo uma partida aberta por grupo.
  `CREATE UNIQUE INDEX IF NOT EXISTS matches_one_open_per_group
     ON matches (group_jid) WHERE status NOT IN ('FINISHED', 'CANCELLED')`,
  `CREATE INDEX IF NOT EXISTS matches_group_created ON matches (group_jid, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS processed_messages (
    id         text PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS player_cache (
    key        text PRIMARY KEY,
    profile    jsonb,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS group_stats (
    group_jid  text NOT NULL,
    player_jid text NOT NULL,
    name       text NOT NULL,
    games      integer NOT NULL DEFAULT 0,
    wins       integer NOT NULL DEFAULT 0,
    draws      integer NOT NULL DEFAULT 0,
    losses     integer NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (group_jid, player_jid)
  )`,
  // Base de jogadores: carga do Wikidata + o que a IA pesquisou.
  `CREATE TABLE IF NOT EXISTS players (
    id          text PRIMARY KEY,
    name        text NOT NULL,
    name_norm   text NOT NULL,
    keys        text[] NOT NULL,
    aliases     text[] NOT NULL DEFAULT '{}',
    positions   text[] NOT NULL DEFAULT '{}',
    nationality text,
    birth_date  date,
    height_cm   integer,
    clubs       text[] NOT NULL DEFAULT '{}',
    debut_year  integer,
    sitelinks   integer NOT NULL DEFAULT 0,
    stats       jsonb NOT NULL DEFAULT '{}',
    anchors     jsonb,
    source      text NOT NULL,
    updated_at  timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS players_keys ON players USING gin (keys)`,
  `CREATE TABLE IF NOT EXISTS import_state (
    id         text PRIMARY KEY,
    state      jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS lookup_log (
    id         bigserial PRIMARY KEY,
    query      text NOT NULL,
    context    text,
    outcome    text NOT NULL,
    player_id  text,
    ms         integer,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS lookup_log_created ON lookup_log (created_at DESC)`,
  // Correções do admin (prioridade sobre Wikidata e IA) e as chaves dos nomes
  // famosos aceitos, que a carga do Wikidata não apaga.
  `ALTER TABLE players ADD COLUMN IF NOT EXISTS manual jsonb NOT NULL DEFAULT '{}'`,
  `ALTER TABLE players ADD COLUMN IF NOT EXISTS manual_keys text[] NOT NULL DEFAULT '{}'`,
  `CREATE INDEX IF NOT EXISTS players_sitelinks ON players (sitelinks DESC)`,
  // O que cada grupo já viu em cada jogo (sorteio prioriza o que é novo).
  `CREATE TABLE IF NOT EXISTS group_seen (
    group_jid text NOT NULL,
    kind      text NOT NULL,
    item      text NOT NULL,
    seen_at   timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (group_jid, kind, item)
  )`,
  // Temporadas do ranking: a aberta tem ended_at nulo; a fechada guarda o ranking final.
  `CREATE TABLE IF NOT EXISTS group_seasons (
    group_jid  text NOT NULL,
    season     integer NOT NULL,
    started_at timestamptz NOT NULL DEFAULT now(),
    ended_at   timestamptz,
    ranking    jsonb,
    PRIMARY KEY (group_jid, season)
  )`,
];

