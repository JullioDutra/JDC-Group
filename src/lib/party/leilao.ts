import { firstName } from '../game/text';
import type { IncomingMessage, LeilaoParty, Outgoing, PartyPlayer, Position } from '../game/types';
import { POSITION_LABEL } from '../game/types';
import type { PlayerRecord } from '../players/types';
import { BASE_LOADING, careerPath } from './basegames';
import { PARTY_CONFIG, PartyDeps, Save, award, freshFirst, pendingResults, react, schedule, shuffle, text, warnOnce } from './common';

/**
 * Leilão de Craques: um jogo de mercado, bem diferente dos de pergunta.
 * Cada um começa com 100 moedas e precisa montar um time de 4. O bot leiloa
 * craques da base, um por vez (30 s por lote): o lance é só mandar o número.
 * Quem der o maior lance leva. O "overall" de cada craque (de 60 a 99, pela
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
  'O overall de cada craque (60 a 99) fica escondido e só aparece no fim.',
  `No fim soma o overall do time; quem tiver GOL, DEF, MEI e ATA ganha +${LEILAO_BONUS}. Empate: vence quem gastou menos.`,
  'Guarde moedas: cada vaga que falta precisa de pelo menos 1 moeda.',
];

/** Overall de 60 a 99 pela fama (Wikipédias com artigo): Messi ~99, um titular de seleção ~85. */
export function overallOf(sitelinks: number): number {
  const v = 60 + 39 * Math.min(1, Math.log1p(Math.max(0, sitelinks)) / Math.log(251));
  return Math.max(60, Math.min(99, Math.round(v)));
}

export function newLeilao(): Pick<LeilaoParty, 'game' | 'round' | 'totalRounds' | 'lots' | 'budget' | 'squads' | 'bid'> {
  return { game: 'leilao', round: -1, totalRounds: 0, lots: [], budget: {}, squads: {}, bid: null };
}

const posLabel = (ps: Position[]) => ps.map((p) => POSITION_LABEL[p]).join('/');

export async function startLeilao(state: LeilaoParty, deps: PartyDeps): Promise<Outgoing[]> {
  const sample = await deps.store.samplePlayers({ minSitelinks: 12, minClubs: 1, limit: 600 });
  const byId = new Map<string, PlayerRecord>(sample.filter((r) => r.positions.length).map((r) => [r.id, r]));
  const fresh = freshFirst([...byId.keys()], deps.rng, deps.seen).map((id) => byId.get(id)!);
  // N + 1 craques de cada posição: todo mundo consegue fechar o time.
  const perPosition = state.players.length + 1;
  const lots: LeilaoParty['lots'] = [];
  for (const pos of POSITIONS) {
    for (const r of fresh.filter((x) => x.positions[0] === pos).slice(0, perPosition)) {
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
