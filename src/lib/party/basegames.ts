import { CLUBS, NATIONS, isFromNation, playedForClub, type Team } from '../game/teams';
import { normalize } from '../game/text';
import type { BaseCard, PlayerProfile } from '../game/types';
import type { LookupContext, PlayerRecord } from '../players/types';
import { queryKeys, queryTokens } from '../players/keys';
import { brazilLinked, rankCandidates } from '../players/rank';
import type { PartyDeps } from './common';
import { freshFirst } from './common';

/**
 * Peças dos jogos gerados da base de jogadores (Carreira, Ponte, Grade 3x3,
 * Pênaltis): o conteúdo sai da base (77 mil+ jogadores) e não acaba.
 */

const SUFFIXES = /\b(futebol clube|football club|futbol club|fussball club|associacao|sport club|esporte clube|clube|club|fc|cf|sc|ac|afc|cfc|s\.a\.d\.|sad)\b/gi;

/** Nome curto do clube: o nome do jogo se for um time conhecido; senão, o rótulo sem "Futebol Clube" e afins. */
export function clubLabel(raw: string): string {
  const team = CLUBS.find((t) => playedForClub(t, [raw]));
  if (team) return team.name;
  const cleaned = raw.replace(SUFFIXES, ' ').replace(/\s+/g, ' ').trim();
  return cleaned.length >= 3 ? cleaned : raw;
}

const isNationalTeam = (raw: string) => /sele[cç][aã]o|national|seleccion|nazionale|equipe de france|sub-\d+|u-?\d{2}\b/i.test(raw);

/** Trajetória em ordem, sem seleções e sem repetir o mesmo clube em sequência. */
export function careerPath(record: PlayerRecord): string[] {
  const out: string[] = [];
  for (const raw of record.clubs) {
    if (isNationalTeam(raw)) continue;
    const label = clubLabel(raw);
    if (out.at(-1) !== label) out.push(label);
  }
  return out;
}

/** Clubes conhecidos (lista do jogo) pelos quais o jogador passou, na ordem da carreira. */
export function knownClubs(record: { clubs: string[] }, maxTier: 1 | 2 | 3 = 2): Team[] {
  const out: Team[] = [];
  for (const raw of record.clubs) {
    const team = CLUBS.find((t) => t.tier <= maxTier && playedForClub(t, [raw]));
    if (team && !out.includes(team)) out.push(team);
  }
  return out;
}

export function nationOf(record: { nationality: string | null }, maxTier: 1 | 2 | 3 = 3): Team | undefined {
  return NATIONS.find((t) => t.tier <= maxTier && isFromNation(t, record.nationality));
}

export function cardOf(record: PlayerRecord): BaseCard {
  return { id: record.id, name: record.name, names: [record.name, ...record.aliases].slice(0, 8) };
}

function profileToRecord(p: PlayerProfile): PlayerRecord {
  return {
    id: p.id ?? `tmp:${normalize(p.name)}`,
    name: p.name,
    aliases: [...(p.fullName ? [p.fullName] : []), ...(p.aliases ?? [])],
    positions: p.positions,
    nationality: p.nationality,
    birthDate: p.birthDate,
    heightCm: p.heightCm,
    clubs: p.clubs,
    debutYear: null,
    sitelinks: 0,
    stats: {},
    source: 'ai',
  };
}

/**
 * Acha o jogador digitado. Entre os homônimos da base com nome coerente (a
 * mesma regra de nomes do jogo), fica o que mais cumpre a regra da jogada
 * (`score`); no empate, o mais famoso. Ninguém cumpre: faz a busca completa
 * (que pode pesquisar na IA) com o contexto e compara.
 */
export async function findForRule(
  deps: PartyDeps,
  typed: string,
  score: (r: PlayerRecord) => number,
  ctx?: LookupContext,
): Promise<{ record: PlayerRecord; score: number } | null> {
  const q = normalize(typed);
  if (!q) return null;
  let candidates = await deps.store.findPlayers(queryKeys(q), 80);
  const tokens = queryTokens(q);
  if (tokens.length > 1) candidates = [...candidates, ...(await deps.store.findPlayers(tokens, 80))];
  let best: { record: PlayerRecord; score: number } | null = null;
  for (const r of rankCandidates(candidates, q)) {
    const s = score(r.record);
    if (!best || s > best.score) best = { record: r.record, score: s };
  }
  if (best && best.score > 0) return best;
  const profile = await deps.lookup(typed, ctx);
  if (profile) {
    const record = profileToRecord(profile);
    const s = score(record);
    if (!best || s > best.score) best = { record, score: s };
  }
  return best;
}

/**
 * Sorteio de jogadores conhecidos da base para gerar rodadas: o que o grupo
 * ainda não viu vem primeiro, com mais ou menos 60% de ligados ao Brasil.
 */
export function pickFresh<T extends { record: PlayerRecord }>(items: T[], count: number, deps: PartyDeps): T[] {
  const byId = new Map(items.map((i) => [i.record.id, i]));
  const order = freshFirst([...byId.keys()], deps.rng, deps.seen).map((id) => byId.get(id)!);
  const seen = new Set(deps.seen ?? []);
  const fresh = order.filter((i) => !seen.has(i.record.id));
  const pool = fresh.length >= count ? fresh : order;
  const br = pool.filter((i) => brazilLinked(i.record));
  const rest = pool.filter((i) => !brazilLinked(i.record));
  const wantBr = Math.min(br.length, Math.ceil(count * 0.6));
  const picked = [...br.slice(0, wantBr), ...rest.slice(0, count - wantBr)];
  for (const i of pool) if (picked.length < count && !picked.includes(i)) picked.push(i);
  return picked;
}

export const BASE_LOADING = 'A base de jogadores ainda não tem gente conhecida suficiente para este jogo. Tente outro jogo por enquanto.';
