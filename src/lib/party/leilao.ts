import { firstName } from '../game/text';
import type { IncomingMessage, LeilaoParty, Outgoing, PartyPlayer, Position } from '../game/types';
import { POSITION_LABEL } from '../game/types';
import type { PlayerRecord } from '../players/types';
import { BASE_LOADING, careerPath } from './basegames';
import { featuresOf } from './gridCriteria';
import { PARTY_CONFIG, PartyDeps, Save, award, freshFirst, pendingResults, react, schedule, shuffle, text, warnOnce } from './common';
import { safeFirstName } from '../images/glyphs';

/**
 * Leilão de Craques: um jogo de mercado, bem diferente dos de pergunta.
 * Cada um começa com 100 moedas e monta um time de 4: um goleiro, um
 * time de 6: 1 goleiro, 2 defensores, 2 meias e 1 atacante. O bot leiloa craques
 * conhecidos das grandes ligas, um por vez (30 s por lote): o lance é só
 * mandar o número. Quem der o maior lance leva.
 *
 * Dois modos:
 * - *overall* (padrão): cada craque tem um overall de 70 a 99 (pela fama),
 *   escondido até o fim; vence a maior soma (empate: quem gastou menos);
 * - *votação*: no fim, o grupo vota no melhor time (ninguém vota no próprio).
 */
export const LEILAO_BUDGET = 100;
export const LEILAO_SQUAD = 6;
export const LEILAO_VOTE_SECONDS = 60;
const POSITIONS: Position[] = ['GOL', 'DEF', 'MEI', 'ATA'];
/** Quantos de cada posição o time tem: 1 GOL, 2 DEF, 2 MEI, 1 ATA. */
export const LEILAO_SLOTS: Record<Position, number> = { GOL: 1, DEF: 2, MEI: 2, ATA: 1 };
const PLURAL: Record<Position, string> = { GOL: 'goleiros', DEF: 'defensores', MEI: 'meias', ATA: 'atacantes' };
const TEAM_SHAPE = '1 GOL, 2 DEF, 2 MEI e 1 ATA';

export type LeilaoMode = 'overall' | 'votacao';

export const LEILAO_RULES = [
  `Cada um tem ${LEILAO_BUDGET} moedas para montar um time de ${LEILAO_SQUAD}: 1 goleiro, 2 defensores, 2 meias e 1 atacante.`,
  `O bot leiloa um craque por vez (${PARTY_CONFIG.leilao.seconds}s). Para dar lance, mande só o número: *15*. Tem que cobrir o lance anterior.`,
  'Posição completa (ex.: já tem 2 defensores)? Não pode dar lance em outro dela.',
  'Modo *overall*: cada craque tem um overall (70 a 99) escondido; vence a maior soma. Modo *votação*: no fim o grupo vota no melhor time.',
  'Guarde moedas: cada vaga que falta precisa de pelo menos 1 moeda.',
];

/** "abrir leilão votação" / "votação" no lobby. */
export function leilaoModeOf(raw: string): LeilaoMode | null {
  const w = raw.trim();
  if (['votacao', 'voto', 'votos', 'grupo', 'votacao do grupo'].includes(w)) return 'votacao';
  if (['overall', 'over', 'pontos', 'normal'].includes(w)) return 'overall';
  return null;
}

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

export function newLeilao(mode: LeilaoMode = 'overall'): Pick<LeilaoParty, 'game' | 'mode' | 'phase' | 'round' | 'totalRounds' | 'lots' | 'budget' | 'squads' | 'bid' | 'votes'> {
  return { game: 'leilao', mode, phase: 'auction', round: -1, totalRounds: 0, lots: [], budget: {}, squads: {}, bid: null, votes: {} };
}

const posLabel = (ps: Position[]) => ps.map((p) => POSITION_LABEL[p]).join('/');
/** A posição que o craque ocupa no time: a principal dele. */
const slotOf = (lot: { positions: Position[] }): Position => lot.positions[0];
const modeOf = (state: LeilaoParty): LeilaoMode => state.mode ?? 'overall';

export async function startLeilao(state: LeilaoParty, deps: PartyDeps): Promise<Outgoing[]> {
  // Duas amostras: estrelas (raras) e o resto dos conhecidos.
  const [stars, known] = await Promise.all([
    deps.store.samplePlayers({ minSitelinks: LEILAO_STAR_FAME, minClubs: 2, limit: 400 }),
    deps.store.samplePlayers({ minSitelinks: LEILAO_MIN_FAME, minClubs: 2, limit: 1200 }),
  ]);
  const byId = new Map<string, PlayerRecord>([...stars, ...known].filter(leilaoEligible).map((r) => [r.id, r]));
  const fresh = freshFirst([...byId.keys()], deps.rng, deps.seen).map((id) => byId.get(id)!);
  // Craques de sobra em cada posição (todo mundo consegue fechar o time): metade estrelas, metade bons jogadores.
  const lots: LeilaoParty['lots'] = [];
  for (const pos of POSITIONS) {
    const perPosition = state.players.length * LEILAO_SLOTS[pos] + 1;
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
  state.phase = 'auction';
  state.round = -1;
  const how =
    modeOf(state) === 'votacao'
      ? 'No fim, o grupo vota no melhor time.'
      : 'O overall de cada craque fica escondido até o fim: vence a maior soma.';
  return [
    text(
      `🔨 *Leilão de Craques* valendo! ${state.players.length} técnicos, ${LEILAO_BUDGET} moedas cada.\n` +
        `Cada time: ${TEAM_SHAPE}. Lance = mande só o número. ${how}`,
    ),
    ...openLot(state, deps),
  ];
}

const full = (state: LeilaoParty, jid: string) => (state.squads[jid]?.length ?? 0) >= LEILAO_SQUAD;
/** Já tem jogador nessa posição? */
const slotCount = (state: LeilaoParty, jid: string, slot: Position) => (state.squads[jid] ?? []).filter((s) => (s.slot ?? slotOf(s)) === slot).length;
/** A posição já está completa no time (1 GOL, 2 DEF, 2 MEI, 1 ATA)? */
const hasSlot = (state: LeilaoParty, jid: string, slot: Position) => slotCount(state, jid, slot) >= LEILAO_SLOTS[slot];
/** Ainda pode comprar esse craque (time não está cheio e a posição está vaga)? */
const canBuy = (state: LeilaoParty, jid: string, slot: Position) => !full(state, jid) && !hasSlot(state, jid, slot);

/** Maior lance possível: o saldo menos 1 moeda para cada outra vaga que ainda falta. */
export function maxBid(state: LeilaoParty, jid: string): number {
  const left = LEILAO_SQUAD - (state.squads[jid]?.length ?? 0);
  return Math.max(0, (state.budget[jid] ?? 0) - (left - 1));
}

function openLot(state: LeilaoParty, deps: PartyDeps): Outgoing[] {
  state.bid = null;
  state.warned = [];
  const active = state.players.filter((p) => p.missed < 99);
  // Pula o lote que ninguém pode comprar (todo mundo já tem a posição).
  const skipped: string[] = [];
  do {
    state.round += 1;
    if (state.round >= state.lots.length || active.every((p) => full(state, p.jid))) {
      return endAuction(state, state.round >= state.lots.length ? 'Acabaram os lotes.' : 'Todos os times estão completos.', deps);
    }
    const lot = state.lots[state.round];
    if (active.some((p) => canBuy(state, p.jid, slotOf(lot)))) break;
    skipped.push(lot.name);
  } while (true);
  const lot = state.lots[state.round];
  const slot = POSITION_LABEL[slotOf(lot)].toLocaleUpperCase('pt-BR');
  const also = lot.positions.length > 1 ? `também ${posLabel(lot.positions.slice(1))}` : '';
  const who = [lot.nationality, also].filter(Boolean).join(' · ');
  const need = active.filter((p) => canBuy(state, p.jid, slotOf(lot))).map((p) => firstName(p.name));
  const skipLine = skipped.length ? `(Ninguém precisa mais de ${skipped.length > 1 ? 'alguns lotes' : skipped[0]}: pulando.)\n` : '';
  return [
    text(
      skipLine +
        `🔨 *Lote ${state.round + 1}/${state.totalRounds}* · *${slot}* · *${lot.name}*${who ? ` (${who})` : ''}\n` +
        (lot.path.length ? `Clubes: ${lot.path.join(' → ')}\n` : '') +
        `Podem dar lance: ${need.join(', ')}. Lance mínimo 1. ${PARTY_CONFIG.leilao.seconds}s.`,
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
  if (state.phase === 'voting') return leilaoVote(state, msg, save);
  const value = parseBid(msg.text);
  if (value === null || value < 1) return [];
  const who = firstName(player.name);
  const lot = state.lots[state.round];
  if (!lot) return [];
  if (full(state, player.jid)) return warnOnce(state, player.jid, `*${who}*, seu time já está completo.`, save);
  if (hasSlot(state, player.jid, slotOf(lot))) {
    const slot = slotOf(lot);
    const have = LEILAO_SLOTS[slot] === 1 ? POSITION_LABEL[slot] : `${LEILAO_SLOTS[slot]} ${PLURAL[slot]}`;
    return warnOnce(state, player.jid, `*${who}*, você já tem ${have}: o time é ${TEAM_SHAPE}.`, save);
  }
  const limit = maxBid(state, player.jid);
  if (value > limit) return warnOnce(state, player.jid, `*${who}*, seu lance máximo agora é ${limit} (guarde 1 moeda para cada vaga que falta).`, save);
  if (state.bid && value <= state.bid.value) return [];
  state.bid = { jid: player.jid, name: player.name, value };
  player.missed = 0;
  return save([react(msg, '💰')]);
}

/** Fim do tempo do lote: vende para o maior lance (ou ninguém quis) e abre o próximo. */
export function closeLot(state: LeilaoParty, deps: PartyDeps, reason = ''): Outgoing[] {
  if (state.phase === 'voting') return closeLeilaoVoting(state, reason || 'Fim da votação.', deps.now.getTime());
  const lot = state.lots[state.round];
  let line: string;
  if (state.bid) {
    const buyer = state.bid;
    state.budget[buyer.jid] -= buyer.value;
    state.squads[buyer.jid].push({ name: lot.name, positions: lot.positions, slot: slotOf(lot), overall: lot.overall, price: buyer.value });
    line = `✅ Vendido! *${lot.name}* para *${firstName(buyer.name)}* por ${buyer.value} (sobram ${state.budget[buyer.jid]}).`;
  } else {
    line = `Ninguém deu lance em *${lot.name}*.`;
  }
  state.deadline = null;
  state.timerToken = null;
  return [text([reason, line].filter(Boolean).join(' ')), ...openLot(state, deps)];
}

/** Acabou o leilão: no modo overall, resultado; no modo votação, abre a votação. */
function endAuction(state: LeilaoParty, reason: string, deps: PartyDeps): Outgoing[] {
  if (modeOf(state) === 'votacao') return openLeilaoVoting(state, reason, deps.now.getTime());
  return finishLeilao(state, reason, deps.now.getTime());
}

export function openLeilaoVoting(state: LeilaoParty, reason: string, nowMs: number): Outgoing[] {
  state.phase = 'voting';
  state.votes = {};
  state.bid = null;
  state.warned = [];
  return [
    {
      ...leilaoBoard(state, false),
      caption:
        `${reason}\n\n🗳️ *Votação!* Qualquer pessoa do grupo manda o número do melhor time (1 a ${state.players.length}). ` +
        `Quem jogou não vota no próprio. ${LEILAO_VOTE_SECONDS}s.`,
    } as Outgoing,
    schedule(state, LEILAO_VOTE_SECONDS, nowMs, 'lv'),
  ];
}

/** Voto: qualquer pessoa do grupo, 1 por pessoa, ninguém vota no próprio time. */
export function leilaoVote(state: LeilaoParty, msg: IncomingMessage, save: Save): Promise<Outgoing[]> | Outgoing[] {
  const n = Number(msg.text.trim());
  if (!Number.isInteger(n) || n < 1 || n > state.players.length) return [];
  state.votes ??= {};
  if (msg.senderJid in state.votes) return [];
  const own = state.players.findIndex((p) => p.jid === msg.senderJid);
  if (own === n - 1) return warnOnce(state, msg.senderJid, `*${firstName(msg.senderName)}*, não vale votar no próprio time.`, save);
  state.votes[msg.senderJid] = n - 1;
  return save([react(msg, '✅')]);
}

function voteCounts(state: LeilaoParty): number[] {
  const counts = state.players.map(() => 0);
  for (const v of Object.values(state.votes ?? {})) counts[v] += 1;
  return counts;
}

export function closeLeilaoVoting(state: LeilaoParty, reason: string, nowMs = Date.now()): Outgoing[] {
  state.status = 'FINISHED';
  state.deadline = null;
  state.timerToken = null;
  const counts = voteCounts(state);
  state.players.forEach((p, i) => {
    p.score = 0;
    award(p, counts[i], nowMs);
  });
  const top = Math.max(0, ...counts);
  const winners = top === 0 ? [] : state.players.filter((_, i) => counts[i] === top);
  const plural = (n: number) => `${n} voto${n === 1 ? '' : 's'}`;
  const headline =
    winners.length === 0
      ? 'Ninguém votou: empate geral.'
      : winners.length > 1
        ? `🏆 Empate na votação: ${winners.map((p) => `*${p.name}*`).join(' e ')} (${plural(top)}).`
        : `🏆 *${winners[0].name}* montou o melhor time (${plural(top)}).`;
  pendingResults.set(
    state,
    state.players.map((p) => ({
      player: { jid: p.jid, name: p.name },
      result: winners.length === 0 ? 'draw' : winners.includes(p) ? (winners.length > 1 ? 'draw' : 'win') : 'loss',
    })),
  );
  const lines = state.players.map((p, i) => `${i + 1}. ${p.name} — ${plural(counts[i])}`);
  return [
    {
      ...leilaoBoard(state, true),
      caption: [reason, headline, lines.join('\n'), 'Mande *abrir leilão votação* para jogar de novo.'].filter(Boolean).join('\n\n'),
    } as Outgoing,
  ];
}

/** Ordem do time na imagem: GOL, DEF, MEI, ATA. */
const bySlot = (squad: LeilaoParty['squads'][string]) =>
  [...squad].sort((a, b) => POSITIONS.indexOf(a.slot ?? slotOf(a)) - POSITIONS.indexOf(b.slot ?? slotOf(b)));

export function teamScore(squad: LeilaoParty['squads'][string]): { total: number } {
  return { total: squad.reduce((a, s) => a + s.overall, 0) };
}

export function leilaoRows(state: LeilaoParty, final: boolean) {
  const vote = modeOf(state) === 'votacao';
  const counts = vote ? voteCounts(state) : [];
  const revealOverall = final && !vote;
  return state.players.map((p, i) => {
    const squad = bySlot(state.squads[p.jid] ?? []);
    const lines = POSITIONS.flatMap((pos) => {
      const here = squad.filter((x) => (x.slot ?? slotOf(x)) === pos);
      return Array.from({ length: LEILAO_SLOTS[pos] }, (_, k) => {
        const s = here[k];
        // No resultado do overall vale o overall (o preço já não importa e a linha cabe em letra maior).
        return s ? `${pos} ${s.name} · ${revealOverall ? `overall ${s.overall}` : `${s.price} moedas`}` : `${pos} — vaga —`;
      });
    });
    lines.push(`Moedas: ${state.budget[p.jid] ?? 0}`);
    const head = vote
      ? `${i + 1}. ${safeFirstName(p.name)}${final ? ` · ${counts[i]} voto${counts[i] === 1 ? '' : 's'}` : ''}`
      : `${safeFirstName(p.name)}${revealOverall ? ` · ${teamScore(squad).total}` : ''}`;
    return { head, lines };
  });
}

export function leilaoBoard(state: LeilaoParty, final: boolean): Outgoing {
  const vote = modeOf(state) === 'votacao';
  const subtitle = state.phase === 'voting' || (vote && final)
    ? final ? 'Votos do grupo' : 'Votação aberta: mande o número do melhor time'
    : final
      ? 'Overall revelado'
      : `Lote ${Math.max(1, state.round + 1)} de ${state.totalRounds} · ${vote ? 'no fim, votação' : 'overall escondido'}`;
  return {
    type: 'image',
    image: { kind: 'textBoard', game: 'leilao', title: final ? 'Resultado do leilão' : 'Os times', subtitle, rows: leilaoRows(state, final) },
  };
}

/** "encerrar": no modo votação, o leilão vai direto para a votação (ou a fecha). */
export function endLeilao(state: LeilaoParty, reason: string, nowMs = Date.now()): Outgoing[] {
  if (state.phase === 'voting') return closeLeilaoVoting(state, reason, nowMs);
  if (modeOf(state) === 'votacao' && state.status === 'PLAYING') return openLeilaoVoting(state, reason, nowMs);
  return finishLeilao(state, reason, nowMs);
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
  const lines = scored.map((s, i) => `${i + 1}º ${s.p.name} — ${s.total} · sobrou ${s.left}`);
  return [{ ...leilaoBoard(state, true), caption: [reason, headline, lines.join('\n'), 'Mande *abrir leilão* para jogar de novo.'].filter(Boolean).join('\n\n') } as Outgoing];
}
