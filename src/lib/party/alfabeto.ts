import { lookupHint } from '../game/validate';
import { CLUBS, NATIONS, drawTeams, getTeam, isFromNation, playedForClub } from '../game/teams';
import { firstName, looksLikePlayerName, normalize } from '../game/text';
import type { AlfabetoParty, IncomingMessage, Outgoing, PartyPlayer, PlayerProfile, Position } from '../game/types';
import { PARTY_CONFIG, PartyDeps, Save, activePlayers, pendingResults, react, schedule, text, pauseBeforeNext } from './common';
import { scoreImage } from './quiz';

/**
 * Alfabeto ("um goleiro para cada letra", do Projeto Trivia): a cada rodada
 * o bot sorteia uma categoria e uma letra. Cada um manda 1 jogador; nome já
 * usado na partida não vale. A IA confere a categoria na ficha do jogador.
 */
export const ALFABETO_ORDER_BONUS = [50, 30, 15];
const LETTERS = 'ABCDEFGHIJLMNOPRSTVZ'.split('');

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function newAlfabeto(): Pick<AlfabetoParty, 'game' | 'round' | 'totalRounds' | 'rounds' | 'answers' | 'used'> {
  return { game: 'alfabeto', round: -1, totalRounds: PARTY_CONFIG.alfabeto.rounds!, rounds: [], answers: {}, used: [] };
}

export const ALFABETO_RULES = [
  'Cada rodada tem um clube ou seleção e uma letra: "jogadores do Flamengo com a letra R".',
  '1 jogador por pessoa. Nome que alguém já usou não vale.',
  'Quem responde primeiro ganha bônus. Vence quem somar mais.',
];

/** Sorteia as rodadas: posições, seleções e clubes (só os gigantes), letras diferentes. */
function drawRounds(state: AlfabetoParty, rng: () => number) {
  const letters = shuffle(LETTERS, rng);
  const clubs = drawTeams(CLUBS, 3, rng, 1);
  const nations = drawTeams(NATIONS, 2, rng, 1);
  // Toda rodada tem um time (clube ou seleção) além da letra.
  const options: AlfabetoParty['rounds'] = [
    ...nations.slice(0, 2).map((n) => ({ kind: 'nation' as const, value: n.id, label: `jogadores da seleção ${n.name === 'Brasil' ? 'brasileira' : `de ${n.name}`}`, letter: '' })),
    ...clubs.slice(0, 3).map((c) => ({ kind: 'club' as const, value: c.id, label: `jogadores que passaram pelo ${c.name}`, letter: '' })),
  ];
  state.rounds = shuffle(options, rng)
    .slice(0, state.totalRounds)
    .map((r, i) => ({ ...r, letter: letters[i] }));
  state.totalRounds = state.rounds.length;
}

export function startAlfabeto(state: AlfabetoParty, deps: PartyDeps): Outgoing[] {
  drawRounds(state, deps.rng);
  state.status = 'PLAYING';
  state.round = -1;
  return [text(`*Alfabeto* valendo! ${state.players.length} jogadores, ${state.totalRounds} rodadas.`), ...openAlfabetoRound(state, deps)];
}

export function openAlfabetoRound(state: AlfabetoParty, deps: PartyDeps): Outgoing[] {
  state.round += 1;
  state.answers = {};
  state.warned = [];
  const r = state.rounds[state.round];
  return [
    text(
      `*Rodada ${state.round + 1}/${state.totalRounds} · Alfabeto*\n` +
        `Letra *${r.letter}*: ${r.label}.\n` +
        `1 nome por pessoa. Nome já usado não vale. Tempo: ${PARTY_CONFIG.alfabeto.seconds}s.`,
    ),
    schedule(state, PARTY_CONFIG.alfabeto.seconds, deps.now.getTime(), 'ab'),
  ];
}

function fitsCategory(r: AlfabetoParty['rounds'][number], profile: PlayerProfile): string | null {
  if (r.kind === 'pos' && !profile.positions.includes(r.value as Position)) return `não é dos ${r.label.split(' (')[0]}`;
  if (r.kind === 'nation' && !isFromNation(getTeam(r.value)!, profile.nationality)) return `não é da seleção pedida`;
  if (r.kind === 'club' && !playedForClub(getTeam(r.value)!, profile.clubs)) return `não passou pelo ${getTeam(r.value)!.name}`;
  return null;
}

function startsWith(letter: string, ...names: string[]): boolean {
  const l = letter.toLowerCase();
  return names.some((n) => normalize(n).split(' ').some((w, i) => i === 0 && w.startsWith(l)));
}

export async function alfabetoAnswer(
  state: AlfabetoParty,
  player: PartyPlayer,
  msg: IncomingMessage,
  deps: PartyDeps,
  save: Save,
): Promise<Outgoing[]> {
  if (state.answers[player.jid] || !looksLikePlayerName(msg.text)) return [];
  const r = state.rounds[state.round];
  const who = firstName(player.name);
  const typed = msg.text.trim();
  let profile;
  try {
    profile = await deps.lookup(typed, r.kind === 'pos' ? lookupHint(r.value as Position) : lookupHint(null, { kind: r.kind, value: r.value }));
  } catch (error) {
    console.error('lookup failed', error);
    return [text(`*${who}*, a consulta falhou. Manda de novo.`)];
  }
  if (!profile) return [text(`❌ *${who}*: não achei "${typed}". Manda outro.`)];
  const key = normalize(profile.name);
  const typedKey = normalize(typed);
  if (state.used.includes(key) || state.used.includes(typedKey)) {
    return [text(`❌ *${who}*: ${profile.name} já foi usado. Manda outro.`)];
  }
  if (!startsWith(r.letter, typed, profile.name)) {
    return [text(`❌ *${who}*: ${profile.name} não começa com *${r.letter}*. Manda outro.`)];
  }
  const problem = fitsCategory(r, profile);
  if (problem) return [text(`❌ *${who}*: ${profile.name} ${problem}. Manda outro.`)];

  const order = Object.keys(state.answers).length;
  state.answers[player.jid] = { name: profile.name, key, order };
  state.used.push(key);
  if (typedKey !== key) state.used.push(typedKey);
  const points = 100 + (ALFABETO_ORDER_BONUS[order] ?? 5);
  player.score += points;
  player.hits += 1;
  player.lastHitAt = deps.now.getTime();
  player.missed = 0;

  const waiting = activePlayers(state).filter((p) => !state.answers[p.jid]);
  if (waiting.length > 0) return save([react(msg, '✅')]);
  return save([react(msg, '✅'), ...closeAlfabetoRound(state, deps, 'Todos responderam.')]);
}

export function closeAlfabetoRound(state: AlfabetoParty, deps: PartyDeps, reason: string): Outgoing[] {
  for (const p of state.players) if (!state.answers[p.jid] && p.missed < 99) p.missed += 1;
  const lines = state.players
    .filter((p) => p.missed < 99)
    .map((p) => {
      const a = state.answers[p.jid];
      return a ? `${firstName(p.name)}: ${a.name} (+${100 + (ALFABETO_ORDER_BONUS[a.order] ?? 5)})` : `${firstName(p.name)}: —`;
    });
  const summary = `${reason} Fim da rodada ${state.round + 1}.\n${lines.join('\n')}`;
  if (state.round >= state.totalRounds - 1) return finishAlfabeto(state, summary);
  const out: Outgoing[] = [text(summary)];
  if ((state.round + 1) % 3 === 0) out.push(scoreImage(state, false));
  return [...out, ...pauseBeforeNext(state, deps)];
}

export function finishAlfabeto(state: AlfabetoParty, reason = ''): Outgoing[] {
  state.status = 'FINISHED';
  state.deadline = null;
  state.timerToken = null;
  const ranked = [...state.players].sort((a, b) => b.score - a.score || a.lastHitAt - b.lastHitAt);
  const best = ranked[0];
  const tied = ranked.filter((p) => p.score === best.score);
  const headline =
    best.score === 0
      ? 'Ninguém pontuou desta vez.'
      : tied.length > 1
        ? `🏆 Empate: ${tied.map((p) => `*${p.name}*`).join(' e ')}, com ${best.score} pontos.`
        : `🏆 *${best.name}* venceu com ${best.score} pontos.`;
  pendingResults.set(
    state,
    ranked.map((p) => ({
      player: { jid: p.jid, name: p.name },
      result: best.score > 0 && p.score === best.score ? (tied.length > 1 ? 'draw' : 'win') : 'loss',
    })),
  );
  return [
    {
      ...scoreImage(state, true),
      caption: [reason, headline, ranked.map((p, i) => `${i + 1}º ${p.name} — ${p.score}`).join('\n'), 'Mande *abrir alfabeto* para jogar de novo.']
        .filter(Boolean)
        .join('\n\n'),
    } as Outgoing,
  ];
}
