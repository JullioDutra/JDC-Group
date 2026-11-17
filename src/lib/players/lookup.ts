import { getTeam } from '../game/teams';
import { normalize } from '../game/text';
import { POSITION_LABEL, type MetricKey, type PlayerProfile } from '../game/types';
import type { Store } from '../store/types';
import { queryKeys, queryTokens } from './keys';
import { nameMatchesQuery, rankCandidates } from './rank';
import { STAT_KEYS, type LookupContext, type PlayerRecord, type StatKey } from './types';

/** Fonte de pesquisa quando o jogador não está na base (a IA). */
export type IdentifySource = (query: string, hint?: string) => Promise<PlayerProfile | null>;
export type StatSource = (player: PlayerRecord, stat: StatKey) => Promise<number | null>;
export type PlayerLookup = (query: string, ctx?: LookupContext) => Promise<PlayerProfile | null>;

/** Troque quando mudar o formato das chaves de "não achei". */
const NEG_VERSION = 'v3';

/** "goleiro que jogou no Atlético-MG": contexto em texto para a IA. */
export function describeContext(ctx: LookupContext | undefined): string | undefined {
  if (!ctx) return undefined;
  const pos = ctx.position ? POSITION_LABEL[ctx.position] : 'jogador';
  const team = getTeam(ctx.teamId);
  if (team && ctx.kind === 'club') return `${pos} que jogou no ${team.name}`;
  if (team && (ctx.kind === 'country' || ctx.kind === 'nation')) return `${pos} da seleção ${team.name === 'Brasil' ? 'brasileira' : `de ${team.name}`}`;
  return ctx.position ? pos : undefined;
}

const contextKey = (ctx?: LookupContext) => `${ctx?.position ?? ''}|${ctx?.kind ?? ''}|${ctx?.teamId ?? ''}`;

const isStatKey = (m: MetricKey | undefined): m is StatKey => !!m && (STAT_KEYS as string[]).includes(m);

/** O número do tema ainda não foi perguntado para este jogador? */
function needsStat(r: PlayerRecord, stat: StatKey): boolean {
  if (stat === 'heightCm' && r.heightCm != null) return false;
  if (stat === 'debutYear' && r.debutYear != null) return false;
  return !(stat in r.stats);
}

export function toProfile(r: PlayerRecord): PlayerProfile {
  const n = (k: StatKey) => (typeof r.stats[k] === 'number' ? (r.stats[k] as number) : null);
  return {
    exists: true,
    id: r.id,
    name: r.name,
    aliases: r.aliases,
    positions: r.positions,
    nationality: r.nationality,
    birthDate: r.birthDate,
    clubs: r.clubs,
    heightCm: r.heightCm ?? n('heightCm'),
    careerGoals: n('careerGoals'),
    careerAssists: n('careerAssists'),
    peakValueEurM: n('peakValueEurM'),
    intlCaps: n('intlCaps'),
    intlGoals: n('intlGoals'),
    worldCupGoals: n('worldCupGoals'),
    uclGoals: n('uclGoals'),
    titles: n('titles'),
    careerApps: n('careerApps'),
    brasileiraoGoals: n('brasileiraoGoals'),
    libertadoresGoals: n('libertadoresGoals'),
    worldCupsPlayed: n('worldCupsPlayed'),
    debutYear: r.debutYear ?? n('debutYear'),
  };
}

/** Números que vieram na ficha da IA (ignora vazios). */
function statsFrom(p: PlayerProfile): PlayerRecord['stats'] {
  const out: PlayerRecord['stats'] = {};
  for (const k of STAT_KEYS) {
    const v = (p as unknown as Record<string, unknown>)[k];
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
  }
  return out;
}

/**
 * Guarda na base o jogador que a IA achou. Se ele já existir (mesmo nome e
 * nascimento), completa a ficha existente em vez de duplicar.
 */
async function saveFromAi(store: Store, profile: PlayerProfile, nearby: PlayerRecord[]): Promise<PlayerRecord> {
  const name = normalize(profile.name);
  const pool = nearby.length ? nearby : await store.findPlayers([name], 20);
  const same = pool.find(
    (r) =>
      [r.name, ...r.aliases].some((a) => normalize(a) === name) &&
      (!r.birthDate || !profile.birthDate || r.birthDate === profile.birthDate),
  );
  const fromAi = statsFrom(profile);
  let record: PlayerRecord;
  if (same) {
    const clubs = [...same.clubs];
    for (const c of profile.clubs) if (!clubs.some((x) => normalize(x) === normalize(c))) clubs.push(c);
    record = {
      ...same,
      positions: same.positions.length ? same.positions : profile.positions,
      nationality: same.nationality ?? profile.nationality,
      birthDate: same.birthDate ?? profile.birthDate,
      heightCm: same.heightCm ?? profile.heightCm,
      debutYear: same.debutYear ?? profile.debutYear,
      clubs,
      aliases: [...new Set([...same.aliases, ...(profile.aliases ?? [])])].slice(0, 15),
      stats: { ...fromAi, ...same.stats },
    };
  } else {
    record = {
      id: `ai:${name}:${profile.birthDate ?? ''}`,
      name: profile.name,
      aliases: (profile.aliases ?? []).filter((a) => normalize(a) !== name).slice(0, 10),
      positions: profile.positions,
      nationality: profile.nationality,
      birthDate: profile.birthDate,
      heightCm: profile.heightCm,
      clubs: profile.clubs,
      debutYear: profile.debutYear,
      sitelinks: 0,
      stats: fromAi,
      source: 'ai',
    };
  }
  await store.upsertPlayers([record]);
  return record;
}

/**
 * Busca de jogador:
 * 1. Base própria (Wikidata + o que a IA já pesquisou): nome, apelido,
 *    sobrenome ou erro de digitação, com o contexto da jogada (posição +
 *    clube/seleção) desempatando homônimos e a fama no empate.
 * 2. Não achou quem cumpra o contexto: a IA pesquisa (com o contexto). Só vale
 *    se o nome devolvido bater com o digitado; aí entra na base.
 * 3. Falta o número do tema: pergunta focada só nele, que fica gravada.
 */
export function createPlayerLookup(store: Store, identify: IdentifySource, stats?: StatSource): PlayerLookup {
  return async (query, ctx) => {
    const started = Date.now();
    const q = normalize(query);
    if (!q) return null;
    const desc = describeContext(ctx);
    const log = (outcome: string, playerId?: string) =>
      store.logLookup({ query, context: desc, outcome, playerId, ms: Date.now() - started }).catch(() => undefined);

    let candidates = await store.findPlayers(queryKeys(q), 80);
    let ranked = rankCandidates(candidates, q, ctx);
    // Nome com mais de uma palavra: procura também por partes ("pedro guilherme").
    const tokens = queryTokens(q);
    if (!ranked.some((r) => r.fits) && tokens.length > 1) {
      candidates = [...candidates, ...(await store.findPlayers(tokens, 120))];
      ranked = rankCandidates(candidates, q, ctx);
    }
    if (ranked.length === 0) {
      candidates = await store.fuzzyPlayers(q, 20);
      ranked = rankCandidates(candidates, q, ctx);
    }
    let record: PlayerRecord | null = ranked.find((r) => r.fits)?.record ?? null;
    let outcome = 'base';

    if (!record) {
      const negKey = `${NEG_VERSION}:neg:${q}#${contextKey(ctx)}`;
      const negative = await store.getCachedProfile(negKey);
      if (negative === undefined) {
        const profile = await identify(query, desc);
        if (profile && nameMatchesQuery(query, [profile.name, ...(profile.aliases ?? [])])) {
          record = await saveFromAi(store, profile, candidates);
          outcome = 'ia';
        } else {
          await store.putCachedProfile(negKey, null);
          outcome = profile ? 'ia-nome-diferente' : 'ia-nao-achou';
        }
      } else {
        outcome = 'nao-achou-recente';
      }
      // Ninguém cumpre o contexto: devolve o mais provável, e o jogo explica o motivo.
      if (!record && ranked[0]) {
        record = ranked[0].record;
        outcome = 'base-fora-do-contexto';
      }
      if (!record) {
        void log(outcome);
        return null;
      }
    }

    // Ficha do Wikidata sem posição: a IA completa (uma vez só).
    if (record.positions.length === 0) {
      try {
        const extra = await identify(record.name, record.birthDate ? `nascido em ${record.birthDate}` : desc);
        if (extra && nameMatchesQuery(record.name, [extra.name, ...(extra.aliases ?? [])]) && extra.positions.length) {
          record = { ...record, positions: extra.positions };
          await store.upsertPlayers([record]);
        }
      } catch (error) {
        console.error('completar posição falhou', error);
      }
    }

    const stat = isStatKey(ctx?.metric) ? ctx!.metric as StatKey : null;
    if (stat && stats && needsStat(record, stat)) {
      try {
        const value = await stats(record, stat);
        record.stats[stat] = value;
        await store.setPlayerStat(record.id, stat, value);
        outcome += '+dado';
      } catch (error) {
        console.error('dado do tema falhou', error);
      }
    }

    void log(outcome, record.id);
    return toProfile(record);
  };
}
