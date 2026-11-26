import { getTeam, playedForClub, type Team } from '../game/teams';
import { normalize } from '../game/text';
import { POSITION_LABEL, type MetricKey, type PlayerProfile } from '../game/types';
import type { Store } from '../store/types';
import { withTransfermarkt } from '../transfermarkt';
import { queryKeys, queryTokens } from './keys';
import { nameMatchesQuery, rankCandidates } from './rank';
import type { Career, PlayerSources, WikiInfo } from './sources';
import { STAT_KEYS, type LookupContext, type PlayerRecord, type StatKey } from './types';
import { isNationalTeamLabel } from './wikidata';

export type { PlayerSources } from './sources';

/** Fonte de pesquisa quando o jogador não está na base (a IA). */
export type IdentifySource = (query: string, hint?: string) => Promise<PlayerProfile | null>;
export type StatSource = (player: PlayerRecord, stat: StatKey) => Promise<number | null>;
export type PlayerLookup = (query: string, ctx?: LookupContext) => Promise<PlayerProfile | null>;

/** Troque quando mudar o formato das chaves de "não achei". */
const NEG_VERSION = 'v3';

/** "goleiro que jogou no Atlético-MG": contexto em texto para a IA. */
/**
 * O que a IA recebe sobre a jogada: SÓ a posição. Clube e seleção da rodada
 * ficam de fora: com "que jogou no Boca", a IA tendia a concordar e devolver o
 * Boca na lista de clubes (foi assim que o Otamendi passou no Boca).
 */
export function aiContext(ctx: LookupContext | undefined): string | undefined {
  return ctx?.position ? POSITION_LABEL[ctx.position] : undefined;
}

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
    clubs: r.clubs.filter((c) => !isNationalTeamLabel(c)),
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
    careerCards: n('careerCards'),
    freeKickGoals: n('freeKickGoals'),
    finalGoals: n('finalGoals'),
    penaltyGoals: n('penaltyGoals'),
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
  const tokens = (x: string) => normalize(x).split(' ').filter((t) => t.length > 1);
  const typed = tokens(profile.name);
  // Mesmo nome; ou (rodada 16) a ficha do Wikidata com o mesmo nascimento cujo
  // nome completo contém o nome conhecido ("Egídio" em "Egídio de Araújo
  // Pereira Júnior"): é o mesmo jogador, e o nome conhecido passa a valer.
  const byName = pool.find(
    (r) =>
      [r.name, ...r.aliases].some((a) => normalize(a) === name) &&
      (!r.birthDate || !profile.birthDate || r.birthDate === profile.birthDate),
  );
  const byFullName = byName
    ? undefined
    : pool.find(
        (r) =>
          /^Q\d+$/.test(r.id) && !!r.birthDate && r.birthDate === profile.birthDate && typed.length > 0 &&
          [r.name, ...r.aliases].some((a) => typed.every((t) => tokens(a).includes(t))),
      );
  const same = byName ?? byFullName;
  const fromAi = statsFrom(profile);
  let record: PlayerRecord;
  if (same) {
    // Clubes da IA nunca se somam a uma ficha que já tem clubes (eram a porta
    // dos "clubes aleatórios" do Puskás): só preenchem ficha vazia.
    const clubs = same.clubs.length ? [...same.clubs] : [...profile.clubs];
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
  if (byFullName && !record.aliases.some((a) => normalize(a) === name)) {
    await store.addManualAlias(record.id, profile.name).catch(() => undefined);
    record.aliases = [...record.aliases, profile.name];
  }
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
const isWikidataId = (id: string) => /^Q\d+$/.test(id);
const numbers = (stats: PlayerRecord['stats']) => Object.fromEntries(Object.entries(stats).filter(([, v]) => typeof v === 'number'));
const today = () => new Date().toISOString().slice(0, 10);

/** Carreira do Wikidata com cache de 30 dias (lança erro se a fonte falhar). */
async function careerOf(store: Store, sources: PlayerSources, id: string): Promise<Career | null> {
  const key = `wdcareer:v1:${id}`;
  const cached = await store.getCachedProfile(key).catch(() => undefined);
  if (cached !== undefined) return cached ? (cached as unknown as { career: Career }).career : null;
  const career = await sources.career(id);
  await store.putCachedProfile(key, career ? ({ exists: true, name: id, clubs: career.clubs, career } as unknown as PlayerProfile) : null).catch(() => undefined);
  return career;
}

/**
 * Caixa de informação da Wikipédia (clubes, posições, seleção) com cache de
 * 30 dias. null = sem página/caixa ou a fonte falhou.
 */
async function wikiInfoOf(store: Store, sources: PlayerSources, id: string, wiki: Career['wiki']): Promise<WikiInfo | null> {
  const key = `wpinfo:v1:${id}`;
  const cached = await store.getCachedProfile(key).catch(() => undefined);
  if (cached !== undefined) return cached ? (cached as unknown as { info: WikiInfo }).info : null;
  try {
    const info: WikiInfo | null = sources.wikipediaInfo
      ? await sources.wikipediaInfo(wiki)
      : await sources.wikipediaClubs(wiki).then((clubs) => (clubs ? { clubs, positions: [], national: null } : null));
    await store.putCachedProfile(key, info ? ({ exists: true, name: id, clubs: info.clubs, info } as unknown as PlayerProfile) : null).catch(() => undefined);
    return info;
  } catch (error) {
    console.error('Wikipédia falhou', id, error);
    return null;
  }
}

/** Caixa da Wikipédia de uma ficha do Wikidata (pela página dela, que o cache da carreira já tem). */
async function wikiInfoFor(store: Store, sources: PlayerSources, record: PlayerRecord): Promise<WikiInfo | null> {
  if (!isWikidataId(record.id)) return null;
  let career: Career | null = null;
  try {
    career = await careerOf(store, sources, record.id);
  } catch (error) {
    console.error('carreira do Wikidata falhou', record.id, error);
  }
  const wiki = career?.wiki;
  return wiki && (wiki.pt || wiki.en) ? wikiInfoOf(store, sources, record.id, wiki) : null;
}

/** Q-id de uma ficha que só a IA tinha ('error' = a busca falhou agora). */
/** Candidatos no Wikidata para uma ficha que só a IA tinha (melhor primeiro; 'error' = a busca falhou agora). */
async function wikidataIdsOf(store: Store, sources: PlayerSources, record: PlayerRecord): Promise<string[] | 'error'> {
  const year = record.birthDate ? Number(record.birthDate.slice(0, 4)) : null;
  const key = `wdids:v2:${normalize(record.name)}:${year ?? ''}`;
  const cached = await store.getCachedProfile(key).catch(() => undefined);
  if (cached !== undefined) return cached ? cached.name.split(',').filter(Boolean) : [];
  try {
    const ids = sources.findIds
      ? await sources.findIds([record.name, ...record.aliases], year)
      : [await sources.findId(record.name, year)].filter((x): x is string => !!x);
    await store.putCachedProfile(key, ids.length ? ({ exists: true, name: ids.join(','), clubs: [] } as unknown as PlayerProfile) : null).catch(() => undefined);
    return ids;
  } catch (error) {
    console.error('busca do Q-id falhou', record.name, error);
    return 'error';
  }
}

/** Página da Wikipédia pelo título, com cache de 30 dias ('error' = a Wikipédia não respondeu). */
async function guessWikiOf(store: Store, sources: PlayerSources, name: string): Promise<WikiInfo | null | 'error'> {
  if (!sources.guessWikipedia) return null;
  const key = `wpguess:v1:${normalize(name)}`;
  const cached = await store.getCachedProfile(key).catch(() => undefined);
  if (cached !== undefined) return cached ? (cached as unknown as { info: WikiInfo }).info : null;
  try {
    const info = await sources.guessWikipedia(name);
    await store.putCachedProfile(key, info ? ({ exists: true, name, clubs: info.clubs, info } as unknown as PlayerProfile) : null).catch(() => undefined);
    return info;
  } catch (error) {
    console.error('Wikipédia pelo título falhou', name, error);
    return 'error';
  }
}

/**
 * Ficha que só a IA tinha, numa rodada de clube (rodada 16):
 * 1. candidatos no Wikidata (por todos os nomes; ano com 1 de folga): vale o
 *    que jogou no clube da rodada; senão, o melhor. A ficha vira a do Wikidata;
 * 2. sem Wikidata: a página da Wikipédia pelo título ("Egídio (futebolista)");
 * 3. Wikidata e Wikipédia fora do ar: não bloqueia (vale o que a IA disse);
 * 4. só quem não está em lugar nenhum fica "sem fonte".
 */
async function resolveAiRecord(
  store: Store,
  record: PlayerRecord,
  team: Team,
  sources: PlayerSources,
): Promise<{ promoted: PlayerRecord } | { done: { record: PlayerRecord; how: string; unverified: boolean } }> {
  const ids = await wikidataIdsOf(store, sources, record);
  if (ids !== 'error' && ids.length) {
    let first: { id: string; career: Career } | null = null;
    for (const id of ids.slice(0, 3)) {
      let career: Career | null = null;
      try {
        career = await careerOf(store, sources, id);
      } catch (error) {
        console.error('carreira do Wikidata falhou', id, error);
      }
      if (!career) continue;
      first ??= { id, career };
      if (career.clubs.some((c) => playedForClub(team, [c]))) return { promoted: await promote(store, record, id, career) };
    }
    if (first) return { promoted: await promote(store, record, first.id, first.career) };
  }
  const page = await guessWikiOf(store, sources, record.name);
  if (page && page !== 'error') {
    if (page.clubs.some((c) => playedForClub(team, [c]))) {
      await store.addManualClub(record.id, { name: team.name, source: 'Wikipédia', at: today() }).catch((error) => console.error('gravar clube da Wikipédia falhou', error));
      return { done: { record: { ...record, clubs: [...record.clubs, team.name] }, how: 'wp-titulo', unverified: false } };
    }
    // A página existe e não tem o clube: valem os clubes dela (os da IA não contam).
    return { done: { record: { ...record, clubs: page.clubs }, how: 'wp-titulo', unverified: false } };
  }
  if (ids === 'error' || page === 'error') return { done: { record, how: 'fonte-fora', unverified: false } };
  return { done: { record, how: 'sem-fonte', unverified: true } };
}

/**
 * A ficha que só a IA tinha vira a ficha do Wikidata (ou se junta à que já
 * existe): fica com o nome que o grupo usa, os números e as correções dela,
 * mas os clubes passam a ser os da fonte.
 */
async function promote(store: Store, ai: PlayerRecord, id: string, career: Career): Promise<PlayerRecord> {
  const existing = await store.getPlayer(id);
  const names = (base: PlayerRecord, extra: Array<string | null>) =>
    [...new Set([...base.aliases, ...extra.filter((n): n is string => !!n && normalize(n) !== normalize(base.name))])].slice(0, 8);
  const target: PlayerRecord = existing
    ? { ...existing, positions: existing.positions.length ? existing.positions : ai.positions, aliases: names(existing, [ai.name, ...ai.aliases]), stats: { ...numbers(ai.stats), ...numbers(existing.stats) } }
    : { ...ai, id, source: 'wikidata', clubs: career.clubs, sitelinks: career.sitelinks, birthDate: career.birthDate ?? ai.birthDate, aliases: names(ai, [career.label]), manual: undefined };
  await store.upsertPlayers([target]);
  for (const [k, e] of Object.entries(ai.manual?.stats ?? {})) if (e && !target.manual?.stats?.[k as StatKey]) await store.setManualStat(id, k as StatKey, e);
  for (const a of ai.manual?.aliases ?? []) await store.addManualAlias(id, a);
  for (const c of ai.manual?.clubs ?? []) await store.addManualClub(id, c);
  await store.deletePlayers([ai.id]);
  return (await store.getPlayer(id)) ?? target;
}

/**
 * Clubes da ficha = os do Wikidata (+ os confirmados pelo admin/Wikipédia).
 * Ficha com clube a mais (contaminada por respostas antigas da IA) ou com a
 * seleção no meio é regravada; os jogos pela seleção entram se faltarem.
 */
async function applyCareer(store: Store, record: PlayerRecord, career: Career): Promise<PlayerRecord> {
  const confirmed = (record.manual?.clubs ?? []).map((c) => c.name);
  const stored = record.clubs.filter((c) => !confirmed.includes(c));
  const clubs = [...career.clubs, ...confirmed.filter((c) => !career.clubs.includes(c))];
  const stats = { ...record.stats };
  if (career.intlCaps && typeof stats.intlCaps !== 'number') {
    stats.intlCaps = career.intlCaps;
    stats.intlGoals = career.intlGoals ?? 0;
  }
  const sameClubs = stored.length === career.clubs.length && stored.every((c, i) => c === career.clubs[i]);
  const fixed = { ...record, clubs, stats };
  if (!sameClubs || stats.intlCaps !== record.stats.intlCaps) {
    await store.upsertPlayers([{ ...fixed, clubs: career.clubs }]).catch((error) => console.error('regravar clubes falhou', error));
  }
  return fixed;
}

/**
 * Rodada de clube: confere a passagem na fonte antes de o jogo validar.
 * 1. Ficha só da IA: procura o jogador no Wikidata e vira ficha conferida.
 *    Não achou (ou a busca falhou): `unverified` (clube da IA não prova nada).
 * 2. Wikidata (página da entidade): clubes verdadeiros, sem a seleção.
 * 3. Não tem o clube da rodada: Wikipédia (caixa de informação pt/en). Se
 *    tiver, a passagem fica gravada como confirmada pela Wikipédia.
 */
async function confirmClubs(
  store: Store,
  record: PlayerRecord,
  team: Team,
  sources: PlayerSources,
): Promise<{ record: PlayerRecord; how: string; unverified: boolean }> {
  if (!isWikidataId(record.id)) {
    const resolved = await resolveAiRecord(store, record, team, sources);
    if ('done' in resolved) return resolved.done;
    record = resolved.promoted;
  }
  let career: Career | null = null;
  try {
    career = await careerOf(store, sources, record.id);
  } catch (error) {
    console.error('carreira do Wikidata falhou', record.id, error);
  }
  if (career) record = await applyCareer(store, record, career);
  if (playedForClub(team, record.clubs)) return { record, how: career ? 'wd' : 'ficha', unverified: false };
  const wiki = career?.wiki;
  if (wiki && (wiki.pt || wiki.en)) {
    const clubs = (await wikiInfoOf(store, sources, record.id, wiki))?.clubs;
    if (clubs?.some((c) => playedForClub(team, [c]))) {
      await store.addManualClub(record.id, { name: team.name, source: 'Wikipédia', at: today() }).catch((error) => console.error('gravar clube da Wikipédia falhou', error));
      return { record: { ...record, clubs: [...record.clubs, team.name] }, how: 'wp', unverified: false };
    }
  }
  return { record, how: career ? 'wd' : 'ficha', unverified: false };
}

export function createPlayerLookup(store: Store, identify: IdentifySource, stats?: StatSource, sources?: PlayerSources): PlayerLookup {
  return async (query, ctx) => {
    const started = Date.now();
    const q = normalize(query);
    if (!q) return null;
    const desc = describeContext(ctx);
    const log = (outcome: string, playerId?: string) =>
      store.logLookup({ query, context: desc, outcome, playerId, ms: Date.now() - started }).catch(() => undefined);

    // Transfermarkt junto da ficha já na escolha (rodada 17): clube e números dele contam no ranking.
    let candidates = (await store.findPlayers(queryKeys(q), 80)).map(withTransfermarkt);
    let ranked = rankCandidates(candidates, q, ctx);
    // Nome com mais de uma palavra: procura também por partes ("pedro guilherme").
    const tokens = queryTokens(q);
    if (!ranked.some((r) => r.fits) && tokens.length > 1) {
      candidates = [...candidates, ...(await store.findPlayers(tokens, 120)).map(withTransfermarkt)];
      ranked = rankCandidates(candidates, q, ctx);
    }
    let record: PlayerRecord | null = ranked.find((r) => r.fits)?.record ?? null;
    let outcome = 'base';

    // Busca sob demanda no Wikidata: quem a carga ainda não alcançou entra na
    // base na hora, como ficha conferida (antes de perguntar à IA).
    if (!record && sources?.searchPlayers) {
      const key = `wdsearch:v1:${q}`;
      if ((await store.getCachedProfile(key).catch(() => undefined)) === undefined) {
        try {
          const found = (await sources.searchPlayers(query)).filter((r) => !candidates.some((c) => c.id === r.id));
          if (found.length) {
            await store.upsertPlayers(found);
            candidates = [...candidates, ...found];
            ranked = rankCandidates(candidates, q, ctx);
            record = ranked.find((r) => r.fits)?.record ?? null;
            if (record) outcome = 'wikidata';
          }
          await store.putCachedProfile(key, found.length ? ({ exists: true, name: q, clubs: [] } as unknown as PlayerProfile) : null).catch(() => undefined);
        } catch (error) {
          console.error('busca no Wikidata falhou', query, error);
        }
      }
    }

    if (!record) {
      const negKey = `${NEG_VERSION}:neg:${q}#${contextKey(ctx)}`;
      const negative = await store.getCachedProfile(negKey);
      if (negative === undefined) {
        const profile = await identify(query, aiContext(ctx));
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
        const extra = await identify(record.name, record.birthDate ? `nascido em ${record.birthDate}` : aiContext(ctx));
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

    record = withTransfermarkt(record);

    // Ficha só da IA fora de rodada de clube (rodada 17): se o Wikidata tem UM
    // candidato só, ela vira a ficha dele. Assim a mesma pessoa não fica com
    // duas fichas e dois números (era um dos motivos de o número mudar de uma
    // partida para outra). Com mais de um candidato, só a rodada de clube decide.
    if (sources && !isWikidataId(record.id) && ctx?.kind !== 'club') {
      const ids = await wikidataIdsOf(store, sources, record);
      if (ids !== 'error' && ids.length === 1) {
        try {
          const career = await careerOf(store, sources, ids[0]);
          if (career) {
            record = await promote(store, record, ids[0], career);
            outcome += '+wd-unico';
          }
        } catch (error) {
          console.error('juntar ficha da IA falhou', error);
        }
      }
    }

    // Rodada de clube: confere a passagem na fonte (Wikidata, depois Wikipédia) antes de o jogo validar.
    let unverified = false;
    const team = ctx?.kind === 'club' ? getTeam(ctx.teamId) : undefined;
    if (sources && team) {
      try {
        const checked = await confirmClubs(store, record, team, sources);
        record = checked.record;
        unverified = checked.unverified;
        outcome += `+${checked.how}`;
      } catch (error) {
        console.error('conferir clubes falhou', error);
      }
    }

    // Posição da rodada que o Wikidata não tem: a Wikipédia confirma (e fica gravada).
    if (sources && ctx?.position && record.positions.length && !record.positions.includes(ctx.position) && isWikidataId(record.id)) {
      const info = await wikiInfoFor(store, sources, record);
      if (info?.positions.includes(ctx.position)) {
        await store.addManualPosition(record.id, { position: ctx.position, source: 'Wikipédia', at: today() }).catch((error) => console.error('gravar posição falhou', error));
        record = { ...record, positions: [...record.positions, ctx.position] };
        outcome += '+wp-posicao';
      }
    }

    // A conferência pode ter regravado os clubes: o Transfermarkt entra de novo (não duplica).
    record = withTransfermarkt(record);

    const stat = isStatKey(ctx?.metric) ? ctx!.metric as StatKey : null;

    // Jogos e gols pela seleção: a Wikipédia (caixa em inglês, com data de atualização) vale mais que a IA.
    if (sources && (stat === 'intlCaps' || stat === 'intlGoals') && !record.manual?.stats?.[stat] && isWikidataId(record.id)) {
      const national = (await wikiInfoFor(store, sources, record))?.national;
      if (national) {
        if (record.stats.intlCaps !== national.caps || record.stats.intlGoals !== national.goals) {
          await store.setPlayerStat(record.id, 'intlCaps', national.caps).catch(() => undefined);
          await store.setPlayerStat(record.id, 'intlGoals', national.goals).catch(() => undefined);
        }
        record = { ...record, stats: { ...record.stats, intlCaps: national.caps, intlGoals: national.goals } };
        outcome += '+wp-selecao';
      }
    }
    if (stat && stats && needsStat(record, stat)) {
      const value = await fetchStat(store, stats, record, stat);
      if (value.stored) outcome += '+dado';
      else if (value.estimate) outcome += '+estimativa';
      else outcome += '+sem-dado';
      if (value.value !== null) record.stats[stat] = value.value;
    }

    void log(outcome, record.id);
    const profile = toProfile(record);
    return unverified ? { ...profile, clubsUnverified: true } : profile;
  };
}
