/** Migração idempotente: pode rodar quantas vezes for preciso. */
export const SCHEMA_STATEMENTS: string[] = [
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
];
