import { firstName } from '../game/text';
import type { IncomingMessage, LeilaoParty, Outgoing, PartyPlayer, Position } from '../game/types';
import { POSITION_LABEL } from '../game/types';
import type { PlayerRecord } from '../players/types';
import { BASE_LOADING, careerPath } from './basegames';
import { featuresOf } from './gridCriteria';
import { PARTY_CONFIG, PartyDeps, Save, award, freshFirst, pendingResults, react, schedule, shuffle, text, warnOnce } from './common';

/**
 * Leilão de Craques: um jogo de mercado, bem diferente dos de pergunta.
 * Cada um começa com 100 moedas e precisa montar um time de 4. O bot leiloa
 * craques da base, um por vez (30 s por lote): o lance é só mandar o número.
 * Quem der o maior lance leva. O "overall" de cada craque (de 70 a 99, pela
 * fama dele no mundo) fica escondido até o fim: aí soma-se o time, com +10
 * para quem fechar GOL, DEF, MEI e ATA. Vence a maior soma; no empate, quem
 * gastou menos.
 */
export const LEILAO_BUDGET = 100;
export const LEILAO_SQUAD = 4;
export const LEILAO_BONUS = 10;
const POSITIONS: Position[] = ['GOL', 'DEF', 'MEI', 'ATA'];

export const LEILAO_RULES = [
  `Cada um tem ${LEILAO_BUDGET} moedas para montar um time de ${LEILAO_SQUAD} craques.`,
  `O bot leiloa um craque por vez (${PARTY_CONFIG.leilao.seconds}s). Para dar lance, mande só o número: *15*. Tem que cobrir o lance anterior.`,
  'Só craques conhecidos das grandes ligas: metade estrelas, metade bons jogadores. O overall (70 a 99) fica escondido até o fim.',
  `No fim soma o overall do time; quem tiver GOL, DEF, MEI e ATA ganha +${LEILAO_BONUS}. Empate: vence quem gastou menos.`,
  'Guarde moedas: cada vaga que falta precisa de pelo menos 1 moeda.',
];

/**
 * Quem entra no leilão: jogador conhecido (artigo em 30+ Wikipédias), que
 * passou por um clube das 5 grandes ligas da Europa ou do Brasileirão, e da
 * era recente (estreia a partir de 1995) ou lenda (100+ Wikipédias).
 */
export const LEILAO_MIN_FAME = 30;
/** A partir daqui é "estrela"; cada posição tem metade de estrelas. */
export const LEILAO_STAR_FAME = 90;
const MAIN_LEAGUES = ['premier', 'laliga', 'seriea', 'bundesliga', 'ligue1', 'brasileirao'];

export function leilaoEligible(r: PlayerRecord): boolean {
  if (r.sitelinks < LEILAO_MIN_FAME || !r.positions.length) return false;
  const year = r.debutYear ?? (r.birthDate ? Number(r.birthDate.slice(0, 4)) + 19 : null);
  const recent = year !== null ? year >= 1995 : r.sitelinks >= 60;
  if (!recent && r.sitelinks < 100) return false;
  const leagues = featuresOf(r).leagues;
  return MAIN_LEAGUES.some((l) => leagues.has(l));
}

/** Overall de 70 a 99 pela fama (Wikipédias com artigo): 30 = 70, ~90 = 85, 250+ = 99. */
export function overallOf(sitelinks: number): number {
  const lo = Math.log1p(LEILAO_MIN_FAME);
  const v = 70 + 29 * ((Math.log1p(Math.max(0, sitelinks)) - lo) / (Math.log(251) - lo));
  return Math.max(70, Math.min(99, Math.round(v)));
}

export function newLeilao(): Pick<LeilaoParty, 'game' | 'round' | 'totalRounds' | 'lots' | 'budget' | 'squads' | 'bid'> {
  return { game: 'leilao', round: -1, totalRounds: 0, lots: [], budget: {}, squads: {}, bid: null };
}

const posLabel = (ps: Position[]) => ps.map((p) => POSITION_LABEL[p]).join('/');

export async function startLeilao(state: LeilaoParty, deps: PartyDeps): Promise<Outgoing[]> {
  // Duas amostras: estrelas (raras) e o resto dos conhecidos.
  const [stars, known] = await Promise.all([
    deps.store.samplePlayers({ minSitelinks: LEILAO_STAR_FAME, minClubs: 2, limit: 400 }),
    deps.store.samplePlayers({ minSitelinks: LEILAO_MIN_FAME, minClubs: 2, limit: 1200 }),
  ]);
  const byId = new Map<string, PlayerRecord>([...stars, ...known].filter(leilaoEligible).map((r) => [r.id, r]));
  const fresh = freshFirst([...byId.keys()], deps.rng, deps.seen).map((id) => byId.get(id)!);
  // N + 1 craques de cada posição (todo mundo consegue fechar o time): metade estrelas, metade bons jogadores.
  const perPosition = state.players.length + 1;
  const lots: LeilaoParty['lots'] = [];
  for (const pos of POSITIONS) {
    const here = fresh.filter((x) => x.positions[0] === pos);
    const top = here.filter((x) => x.sitelinks >= LEILAO_STAR_FAME);
    const mid = here.filter((x) => x.sitelinks < LEILAO_STAR_FAME);
    const wantTop = Math.ceil(perPosition / 2);
    const picked = [...top.slice(0, wantTop), ...mid.slice(0, perPosition - Math.min(wantTop, top.length))];
    // Faltou de um lado: completa com o outro.
    for (const r of [...top.slice(wantTop), ...mid]) if (picked.length < perPosition && !picked.includes(r)) picked.push(r);
    for (const r of picked.slice(0, perPosition)) {
      lots.push({ id: r.id, name: r.name, positions: r.positions, nationality: r.nationality, path: careerPath(r).slice(-4), overall: overallOf(r.sitelinks) });
    }
  }
  if (lots.length < state.players.length * LEILAO_SQUAD) {
    state.status = 'CANCELLED';
    return [text(BASE_LOADING)];
  }
  state.lots = shuffle(lots, deps.rng);
  state.totalRounds = state.lots.length;
  for (const p of state.players) {
    state.budget[p.jid] = LEILAO_BUDGET;
    state.squads[p.jid] = [];
  }
  state.status = 'PLAYING';
  state.round = -1;
  return [
    text(
      `🔨 *Leilão de Craques* valendo! ${state.players.length} técnicos, ${LEILAO_BUDGET} moedas cada, times de ${LEILAO_SQUAD}.\n` +
        `Lance = mande só o número. O overall de cada craque fica escondido até o fim. Fechar GOL, DEF, MEI e ATA vale +${LEILAO_BONUS}.`,
    ),
    ...openLot(state, deps),
  ];
}

const full = (state: LeilaoParty, jid: string) => (state.squads[jid]?.length ?? 0) >= LEILAO_SQUAD;

/** Maior lance possível: o saldo menos 1 moeda para cada outra vaga que ainda falta. */
export function maxBid(state: LeilaoParty, jid: string): number {
  const left = LEILAO_SQUAD - (state.squads[jid]?.length ?? 0);
  return Math.max(0, (state.budget[jid] ?? 0) - (left - 1));
}

function openLot(state: LeilaoParty, deps: PartyDeps): Outgoing[] {
  state.round += 1;
  state.bid = null;
  state.warned = [];
  if (state.round >= state.lots.length || state.players.every((p) => full(state, p.jid) || p.missed >= 99)) {
    return finishLeilao(state, state.round >= state.lots.length ? 'Acabaram os lotes.' : 'Todos os times estão completos.', deps.now.getTime());
  }
  const lot = state.lots[state.round];
  const who = [posLabel(lot.positions), lot.nationality].filter(Boolean).join(' · ');
  return [
    text(
      `🔨 *Lote ${state.round + 1}/${state.totalRounds}* · *${lot.name}* (${who})\n` +
        (lot.path.length ? `Clubes: ${lot.path.join(' → ')}\n` : '') +
        `Lance mínimo 1. Mande o valor. ${PARTY_CONFIG.leilao.seconds}s.`,
    ),
    schedule(state, PARTY_CONFIG.leilao.seconds, deps.now.getTime(), 'lei'),
  ];
}

/** "15", "lance 15", "dou 15". */
export function parseBid(raw: string): number | null {
  const m = raw.trim().toLowerCase().match(/^(?:lance\s+|dou\s+|vai\s+)?(\d{1,3})(?:\s*moedas?)?$/);
  return m ? Number(m[1]) : null;
}

export function leilaoAnswer(state: LeilaoParty, player: PartyPlayer, msg: IncomingMessage, _deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  const value = parseBid(msg.text);
  if (value === null || value < 1) return [];
  const who = firstName(player.name);
  if (full(state, player.jid)) return warnOnce(state, player.jid, `*${who}*, seu time já está completo.`, save);
  const limit = maxBid(state, player.jid);
  if (value > limit) return warnOnce(state, player.jid, `*${who}*, seu lance máximo agora é ${limit} (guarde 1 moeda para cada vaga que falta).`, save);
  if (state.bid && value <= state.bid.value) return [];
  state.bid = { jid: player.jid, name: player.name, value };
  player.missed = 0;
  return save([react(msg, '💰')]);
}

/** Fim do tempo do lote: vende para o maior lance (ou ninguém quis) e abre o próximo. */
export function closeLot(state: LeilaoParty, deps: PartyDeps, reason = ''): Outgoing[] {
  const lot = state.lots[state.round];
  let line: string;
  if (state.bid) {
    const buyer = state.bid;
    state.budget[buyer.jid] -= buyer.value;
    state.squads[buyer.jid].push({ name: lot.name, positions: lot.positions, overall: lot.overall, price: buyer.value });
    line = `✅ Vendido! *${lot.name}* para *${firstName(buyer.name)}* por ${buyer.value} (sobram ${state.budget[buyer.jid]}).`;
  } else {
    line = `Ninguém deu lance em *${lot.name}*.`;
  }
  state.deadline = null;
  state.timerToken = null;
  return [text([reason, line].filter(Boolean).join(' ')), ...openLot(state, deps)];
}

/** Tem GOL, DEF, MEI e ATA (cada craque cobre uma posição)? */
export function completeTeam(squad: Array<{ positions: Position[] }>): boolean {
  const used = new Set<number>();
  const assign = (k: number): boolean => {
    if (k === POSITIONS.length) return true;
    for (let i = 0; i < squad.length; i++) {
      if (used.has(i) || !squad[i].positions.includes(POSITIONS[k])) continue;
      used.add(i);
      if (assign(k + 1)) return true;
      used.delete(i);
    }
    return false;
  };
  return assign(0);
}

export function teamScore(squad: LeilaoParty['squads'][string]): { total: number; bonus: boolean } {
  const bonus = squad.length >= POSITIONS.length && completeTeam(squad);
  return { total: squad.reduce((a, s) => a + s.overall, 0) + (bonus ? LEILAO_BONUS : 0), bonus };
}

export function leilaoRows(state: LeilaoParty, reveal: boolean) {
  return state.players.map((p) => {
    const squad = state.squads[p.jid] ?? [];
    const score = teamScore(squad);
    const lines = squad.map((s) => `${posLabel(s.positions)} ${s.name}${reveal ? ` · overall ${s.overall}` : ''} · ${s.price} moedas`);
    while (lines.length < LEILAO_SQUAD) lines.push('— vaga —');
    if (reveal && score.bonus) lines.push(`Time completo: +${LEILAO_BONUS}`);
    lines.push(`Moedas: ${state.budget[p.jid] ?? 0}`);
    return { head: `${firstName(p.name)}${reveal ? ` · ${score.total}` : ''}`, lines };
  });
}

export function leilaoBoard(state: LeilaoParty, final: boolean): Outgoing {
  return {
    type: 'image',
    image: {
      kind: 'textBoard',
      game: 'leilao',
      title: final ? 'Resultado do leilão' : 'Os times',
      subtitle: final ? 'Overall revelado' : `Lote ${Math.max(1, state.round + 1)} de ${state.totalRounds} · overall escondido`,
      rows: leilaoRows(state, final),
    },
  };
}

export function finishLeilao(state: LeilaoParty, reason: string, nowMs = Date.now()): Outgoing[] {
  state.status = 'FINISHED';
  state.deadline = null;
  state.timerToken = null;
  const scored = state.players.map((p) => ({ p, ...teamScore(state.squads[p.jid] ?? []), left: state.budget[p.jid] ?? 0 }));
  scored.sort((a, b) => b.total - a.total || b.left - a.left);
  for (const s of scored) {
    s.p.score = 0;
    award(s.p, s.total, nowMs);
  }
  const best = scored[0];
  const tied = scored.filter((s) => s.total === best.total && s.left === best.left);
  const headline =
    best.total === 0
      ? 'Ninguém montou time.'
      : tied.length > 1
        ? `🏆 Empate: ${tied.map((s) => `*${s.p.name}*`).join(' e ')}, com ${best.total}.`
        : `🏆 *${best.p.name}* montou o melhor time: ${best.total} pontos.`;
  pendingResults.set(
    state,
    scored.map((s) => ({
      player: { jid: s.p.jid, name: s.p.name },
      result: best.total > 0 && s.total === best.total && s.left === best.left ? (tied.length > 1 ? 'draw' : 'win') : 'loss',
    })),
  );
  const lines = scored.map((s, i) => `${i + 1}º ${s.p.name} — ${s.total}${s.bonus ? ' (com bônus)' : ''} · sobrou ${s.left}`);
  return [{ ...leilaoBoard(state, true), caption: [reason, headline, lines.join('\n'), 'Mande *abrir leilão* para jogar de novo.'].filter(Boolean).join('\n\n') } as Outgoing];
}
