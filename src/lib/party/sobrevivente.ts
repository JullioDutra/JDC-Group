import { firstName, isChatter } from '../game/text';
import type { ContentCategory, IncomingMessage, Outgoing, PartyPlayer, SobreviventeParty } from '../game/types';
import { PARTY_CONFIG, PartyDeps, Save, answerMatches, award, normalizeAnswer, pendingResults, react, schedule, shuffle, text, freshFirst } from './common';
import { getSurvivorList, survivorPool } from './content/sobrevivente';

/**
 * Sobrevivente: uma categoria fechada por volta. Na ordem da sala, cada um diz
 * um item novo. Errou, repetiu ou estourou o tempo: perde uma vida (são 2).
 * O último de pé vence.
 */
export const SURVIVOR_LIVES = 2;
export const SURVIVOR_POINTS = 10;

export function newSobrevivente(
  category: ContentCategory | null = null,
): Pick<SobreviventeParty, 'game' | 'category' | 'order' | 'round' | 'totalRounds' | 'turn' | 'lives' | 'used' | 'played' | 'answers' | 'out'> {
  return {
    game: 'sobrevivente', category, order: [], round: -1, totalRounds: PARTY_CONFIG.sobrevivente.rounds!,
    turn: 0, lives: {}, used: [], played: [], answers: {}, out: [],
  };
}

export const SOBREVIVENTE_RULES = [
  'Uma categoria por volta ("capitais da América do Sul"). Na ordem da sala, cada um diz 1 item novo.',
  `Errou, repetiu ou estourou o tempo (${PARTY_CONFIG.sobrevivente.seconds}s): perde 1 vida. Cada um tem ${SURVIVOR_LIVES}.`,
  'Só vale a mensagem de quem está na vez. O último de pé vence.',
];

const alive = (state: SobreviventeParty, p: PartyPlayer) => (state.lives[p.jid] ?? 0) > 0 && p.missed < 99;
const livesLabel = (n: number) => `${n} vida${n === 1 ? '' : 's'}`;

export function startSobrevivente(state: SobreviventeParty, deps: PartyDeps): Outgoing[] {
  // Listas novas para o grupo primeiro; dentro da partida, da mais fácil para a mais difícil.
  const pool = freshFirst(survivorPool(state.category).map((l) => l.id), deps.rng, deps.seen);
  state.order = pool.slice(0, state.totalRounds).sort((a, b) => getSurvivorList(a)!.level - getSurvivorList(b)!.level);
  state.totalRounds = state.order.length;
  state.status = 'PLAYING';
  state.round = 0;
  state.turn = 0;
  state.used = [];
  state.played = [];
  for (const p of state.players) {
    state.lives[p.jid] = SURVIVOR_LIVES;
    state.answers[p.jid] = 0;
  }
  const order = state.players.map((p, i) => `${i + 1}. ${firstName(p.name)}`).join('\n');
  return [
    text(`*Sobrevivente* valendo! Ordem da sala:\n${order}\n\nCada um tem ${SURVIVOR_LIVES} vidas.`),
    text(lapHeader(state)),
    ...turnPrompt(state, deps),
  ];
}

function lapHeader(state: SobreviventeParty): string {
  const list = getSurvivorList(state.order[state.round])!;
  return `*Volta ${state.round + 1}/${state.totalRounds}* · ${list.title}`;
}

function turnPrompt(state: SobreviventeParty, deps: PartyDeps): Outgoing[] {
  const p = state.players[state.turn];
  return [
    text(`Vez de *${firstName(p.name)}* (${livesLabel(state.lives[p.jid])}). ${PARTY_CONFIG.sobrevivente.seconds}s.`),
    schedule(state, PARTY_CONFIG.sobrevivente.seconds, deps.now.getTime(), 'sv'),
  ];
}

export function sobreviventeAnswer(state: SobreviventeParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  if (state.players[state.turn]?.jid !== player.jid) return [];
  const raw = msg.text.trim();
  if (raw.length < 1 || raw.length > 50 || /[?\n]/.test(raw) || isChatter(raw)) return [];
  const list = getSurvivorList(state.order[state.round])!;
  const guess = normalizeAnswer(raw);
  const index = list.items.findIndex((forms) => answerMatches(forms, guess));
  player.missed = 0;
  if (index !== -1 && !state.used.includes(index)) {
    state.used.push(index);
    state.answers[player.jid] += 1;
    award(player, SURVIVOR_POINTS, deps.now.getTime());
    return save([react(msg, '✅'), ...advance(state, deps)]);
  }
  const why = index === -1 ? `"${raw}" não está na lista` : `*${list.items[index][0]}* já foi dito`;
  return save(loseLife(state, player, why, deps));
}

export function sobreviventeTimeout(state: SobreviventeParty, deps: PartyDeps): Outgoing[] {
  const p = state.players[state.turn];
  if (p.missed < 99) p.missed += 1;
  return loseLife(state, p, 'tempo esgotado', deps);
}

function loseLife(state: SobreviventeParty, player: PartyPlayer, why: string, deps: PartyDeps): Outgoing[] {
  state.lives[player.jid] = Math.max(0, (state.lives[player.jid] ?? 0) - 1);
  const left = state.lives[player.jid];
  const who = firstName(player.name);
  if (left === 0) state.out.push(player.jid);
  const line = left === 0 ? `❌ ${who}: ${why}. Está fora.` : `❌ ${who}: ${why}. Perdeu uma vida (resta 1).`;
  return [text(line), ...advance(state, deps)];
}

/** Passa a vez: próximo vivo que ainda não jogou nesta volta; acabou a volta, troca a categoria. */
function advance(state: SobreviventeParty, deps: PartyDeps): Outgoing[] {
  const current = state.players[state.turn];
  if (!state.played.includes(current.jid)) state.played.push(current.jid);
  const living = state.players.filter((p) => alive(state, p));
  if (living.length <= 1) return finishSobrevivente(state, living.length === 1 ? '' : 'Ninguém sobrou.');

  const list = getSurvivorList(state.order[state.round])!;
  const exhausted = state.used.length >= list.items.length;
  const lapDone = exhausted || living.every((p) => state.played.includes(p.jid));
  const out: Outgoing[] = [];
  if (lapDone) {
    if (state.round >= state.totalRounds - 1) return finishSobrevivente(state, 'Acabaram as categorias.');
    if (exhausted) out.push(text(`A lista acabou: os ${list.items.length} itens foram ditos.`));
    state.round += 1;
    state.used = [];
    state.played = [];
    out.push(text(lapHeader(state)));
  }
  state.turn = nextAlive(state, state.turn);
  return [...out, ...turnPrompt(state, deps)];
}

function nextAlive(state: SobreviventeParty, from: number): number {
  const n = state.players.length;
  for (let step = 1; step <= n; step++) {
    const i = (from + step) % n;
    const p = state.players[i];
    if (alive(state, p) && !state.played.includes(p.jid)) return i;
  }
  return from;
}

export function sobreviventeStandings(state: SobreviventeParty): PartyPlayer[] {
  const outRank = (jid: string) => state.out.indexOf(jid); // -1 = vivo
  return [...state.players].sort((a, b) => {
    const ao = outRank(a.jid);
    const bo = outRank(b.jid);
    if (ao === -1 && bo === -1) return state.lives[b.jid] - state.lives[a.jid] || state.answers[b.jid] - state.answers[a.jid];
    if (ao === -1) return -1;
    if (bo === -1) return 1;
    return bo - ao; // eliminado depois fica na frente
  });
}

export function finishSobrevivente(state: SobreviventeParty, reason: string): Outgoing[] {
  state.status = 'FINISHED';
  state.deadline = null;
  state.timerToken = null;
  const ranked = sobreviventeStandings(state);
  const best = ranked[0];
  const same = (p: PartyPlayer) =>
    !state.out.includes(p.jid) && state.lives[p.jid] === state.lives[best.jid] && state.answers[p.jid] === state.answers[best.jid];
  const winners = state.out.includes(best.jid) ? [] : ranked.filter(same);
  const headline =
    winners.length === 0
      ? 'Ninguém sobreviveu.'
      : winners.length > 1
        ? `🏆 Empate entre os sobreviventes: ${winners.map((p) => `*${p.name}*`).join(' e ')}.`
        : `🏆 *${best.name}* é o último de pé!`;
  pendingResults.set(
    state,
    ranked.map((p) => ({
      player: { jid: p.jid, name: p.name },
      result: winners.includes(p) ? (winners.length > 1 ? 'draw' : 'win') : 'loss',
    })),
  );
  const rows = ranked.map((p) => {
    const outAt = state.out.includes(p.jid);
    return {
      head: p.name,
      lines: [`${state.answers[p.jid] ?? 0} acertos · ${outAt ? 'eliminado' : livesLabel(state.lives[p.jid])}`],
      highlight: winners.includes(p),
    };
  });
  return [
    {
      type: 'image',
      image: { kind: 'textBoard', game: 'sobrevivente', title: 'Resultado final', subtitle: `${state.round + 1} voltas`, rows },
      caption: [reason, headline, 'Mande *abrir sobrevivente* para jogar de novo.'].filter(Boolean).join('\n\n'),
    },
  ];
}
