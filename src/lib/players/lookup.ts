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

/**
 * Falta o número do tema? Vale o manual, depois o que está gravado. Um "não
 * sei" antigo da IA (null) não conta como dado: pergunta de novo (antes ele
 * ficava gravado para sempre e o jogador nunca mais tinha o número).
 */
function needsStat(r: PlayerRecord, stat: StatKey): boolean {
  if (r.manual?.stats?.[stat]) return false;
  if (stat === 'heightCm' && r.heightCm != null) return false;
  if (stat === 'debutYear' && r.debutYear != null) return false;
  return typeof r.stats[stat] !== 'number';
}

/** Número do jogador: manual (admin) > base (Wikidata/IA). */
export function statOf(r: PlayerRecord, k: StatKey): number | null {
  const manual = r.manual?.stats?.[k];
  if (manual && Number.isFinite(manual.value)) return manual.value;
  return typeof r.stats[k] === 'number' ? (r.stats[k] as number) : null;
}

/** Data da conferência manual mais recente (para mostrar no placar). */
function manualDate(r: PlayerRecord): string | undefined {
  const dates = Object.values(r.manual?.stats ?? {}).map((e) => e?.at).filter((d): d is string => !!d);
  return dates.sort().at(-1);
}

export function toProfile(r: PlayerRecord): PlayerProfile {
  const n = (k: StatKey) => statOf(r, k);
  const manualHeight = r.manual?.stats?.heightCm?.value;
  const manualDebut = r.manual?.stats?.debutYear?.value;
  return {
    exists: true,
    id: r.id,
    name: r.name,
    aliases: r.aliases,
    positions: r.positions,
    nationality: r.nationality,
    birthDate: r.birthDate,
    clubs: r.clubs,
    heightCm: manualHeight ?? r.heightCm ?? n('heightCm'),
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
    debutYear: manualDebut ?? r.debutYear ?? n('debutYear'),
    marketValueEurM: n('marketValueEurM'),
    manualAt: manualDate(r),
  };
}

const sameBirth = (a: PlayerRecord, b: PlayerRecord) => !!a.birthDate && a.birthDate === b.birthDate;

/** As duas fichas são da mesma pessoa? Mesmo nascimento e um nome de uma bate com o da outra. */
export function isSamePerson(a: PlayerRecord, b: PlayerRecord): boolean {
  if (a.id === b.id || !sameBirth(a, b)) return false;
  const namesA = [a.name, ...a.aliases].map(normalize);
  const namesB = [b.name, ...b.aliases].map(normalize);
  return namesA.some((x) => namesB.includes(x));
}

/**
 * Junta fichas duplicadas da mesma pessoa (a que a IA criou antes e a que o
 * Wikidata trouxe depois): fica a do Wikidata (ou a mais famosa), com os
 * números das duas (os dela primeiro) e as correções manuais das duas.
 * Era um dos motivos de "às vezes não puxou os gols": a ficha escolhida não
 * tinha o número, que estava na outra.
 */
export async function mergeDuplicates(store: Store, record: PlayerRecord, pool: PlayerRecord[]): Promise<PlayerRecord> {
  const dups = pool.filter((r) => isSamePerson(record, r));
  if (dups.length === 0) return record;
  const all = [record, ...dups];
  const keep = all.find((r) => r.source === 'wikidata' && !r.id.startsWith('ai:')) ?? all.sort((a, b) => b.sitelinks - a.sitelinks)[0];
  const others = all.filter((r) => r.id !== keep.id);
  const merged: PlayerRecord = { ...keep, stats: { ...keep.stats }, aliases: [...keep.aliases], clubs: [...keep.clubs] };
  for (const o of others) {
    for (const k of STAT_KEYS) if (typeof merged.stats[k] !== 'number' && typeof o.stats[k] === 'number') merged.stats[k] = o.stats[k];
    for (const a of [o.name, ...o.aliases]) if (!merged.aliases.some((x) => normalize(x) === normalize(a)) && normalize(a) !== normalize(merged.name)) merged.aliases.push(a);
    if (!merged.positions.length) merged.positions = o.positions;
    if (!merged.clubs.length) merged.clubs = [...o.clubs];
    merged.nationality ??= o.nationality;
    merged.heightCm ??= o.heightCm;
    merged.debutYear ??= o.debutYear;
  }
  merged.aliases = merged.aliases.slice(0, 8);
  await store.upsertPlayers([merged]);
  for (const o of others) {
    for (const [k, e] of Object.entries(o.manual?.stats ?? {})) {
      if (e && !keep.manual?.stats?.[k as StatKey]) await store.setManualStat(merged.id, k as StatKey, e);
    }
    for (const a of o.manual?.aliases ?? []) await store.addManualAlias(merged.id, a);
  }
  await store.deletePlayers(others.map((o) => o.id));
  return (await store.getPlayer(merged.id)) ?? merged;
}

/** Nomes que valem para este jogador: o nome conhecido e o nome completo (nunca apelidos). */
function acceptedNames(p: PlayerProfile): string[] {
  const names = [p.name];
  if (p.fullName && normalize(p.fullName) !== normalize(p.name)) names.push(p.fullName);
  return names;
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
      aliases: [...new Set([...same.aliases, ...acceptedNames(profile).slice(1)])].slice(0, 6),
      // Os números da ficha existente valem mais; um "não sei" antigo (null) não apaga o da IA.
      stats: { ...fromAi, ...Object.fromEntries(Object.entries(same.stats).filter(([, v]) => typeof v === 'number')) },
    };
  } else {
    record = {
      id: `ai:${name}:${profile.birthDate ?? ''}`,
      name: profile.name,
      aliases: acceptedNames(profile).slice(1),
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
 * Pergunta o número do tema à IA (que já tenta o modelo rápido se o principal
 * falhar). Só grava número de verdade. Se a IA não souber ou falhar:
 * - gols/jogos na carreira: usa a soma do Wikidata (clubes + seleção) como
 *   estimativa da jogada, sem gravar (tenta a IA de novo numa próxima vez);
 * - lembra o "não sei" por 10 min, para não travar a rodada perguntando de novo.
 */
async function fetchStat(
  store: Store,
  stats: StatSource,
  record: PlayerRecord,
  stat: StatKey,
): Promise<{ value: number | null; stored: boolean; estimate: boolean }> {
  const negKey = `stat:${record.id}:${stat}`;
  let value: number | null = null;
  if ((await store.getCachedProfile(negKey).catch(() => undefined)) === undefined) {
    try {
      value = await stats(record, stat);
    } catch (error) {
      console.error('dado do tema falhou', error);
    }
    if (value !== null) {
      await store.setPlayerStat(record.id, stat, value);
      return { value, stored: true, estimate: false };
    }
    await store.putCachedProfile(negKey, null).catch(() => undefined);
  }
  const estimate = anchorEstimate(record, stat);
  return { value: estimate, stored: false, estimate: estimate !== null };
}

/** Estimativa pelo Wikidata (somas por clube + seleção), só para gols e jogos na carreira. */
export function anchorEstimate(record: PlayerRecord, stat: StatKey): number | null {
  const intl = (k: StatKey) => (typeof record.stats[k] === 'number' ? (record.stats[k] as number) : 0);
  if (stat === 'careerGoals' && record.anchors?.clubGoals != null && (record.anchors.clubApps ?? 0) > 0) {
    return record.anchors.clubGoals + intl('intlGoals');
  }
  if (stat === 'careerApps' && record.anchors?.clubApps) return record.anchors.clubApps + intl('intlCaps');
  return null;
}

/**
 * Busca de jogador:
 * 1. Base própria (Wikidata + o que a IA já pesquisou). Só vale nome
 *    coerente: o nome conhecido, o completo, ou partes dele (sobrenome; nome
 *    + sobrenome). Nada de erro de digitação nem apelido informal. O contexto
 *    da jogada (posição + clube/seleção) desempata homônimos; no empate, a fama.
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
    let record: PlayerRecord | null = ranked.find((r) => r.fits)?.record ?? null;
    let outcome = 'base';

    if (!record) {
      const negKey = `${NEG_VERSION}:neg:${q}#${contextKey(ctx)}`;
      const negative = await store.getCachedProfile(negKey);
      if (negative === undefined) {
        const profile = await identify(query, desc);
        if (profile && nameMatchesQuery(query, acceptedNames(profile))) {
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
        if (extra && nameMatchesQuery(record.name, acceptedNames(extra)) && extra.positions.length) {
          record = { ...record, positions: extra.positions };
          await store.upsertPlayers([record]);
        }
      } catch (error) {
        console.error('completar posição falhou', error);
      }
    }

    // Mesma pessoa em duas fichas: junta antes de olhar o número.
    try {
      record = await mergeDuplicates(store, record, candidates);
    } catch (error) {
      console.error('juntar duplicadas falhou', error);
    }

    const stat = isStatKey(ctx?.metric) ? ctx!.metric as StatKey : null;
    if (stat && stats && needsStat(record, stat)) {
      const value = await fetchStat(store, stats, record, stat);
      if (value.stored) outcome += '+dado';
      else if (value.estimate) outcome += '+estimativa';
      else outcome += '+sem-dado';
      if (value.value !== null) record.stats[stat] = value.value;
    }

    void log(outcome, record.id);
    return toProfile(record);
  };
}
