import { getTeam, playedForClub } from '../game/teams';
import { firstName, looksLikePlayerName, normalize } from '../game/text';
import type { IncomingMessage, Outgoing, PartyPlayer, PonteParty } from '../game/types';
import type { PlayerRecord } from '../players/types';
import { BASE_LOADING, findForRule, knownClubs, pickFresh } from './basegames';
import { PARTY_CONFIG, PartyDeps, Save, activePlayers, award, finishByScore, pauseBeforeNext, react, schedule, scoreImage, shuffle, text } from './common';

/**
 * Ponte: 4 clubes por rodada. Cada um cita jogadores que passaram por eles:
 * passou pelos 4 vale o máximo, por 3 vale menos, e assim por diante. Cada
 * um tem 1 palpite por rodada (pedido de 18/11) e ninguém repete
 * jogador. Os 4 clubes saem da carreira de um jogador real, então sempre há
 * pelo menos uma resposta de 4.
 */
export const PONTE_POINTS: Record<number, number> = { 4: 10, 3: 6, 2: 3, 1: 1 };
const HITS_EMOJI = ['', '1️⃣', '2️⃣', '3️⃣', '4️⃣'];

export const PONTE_RULES = [
  'Cada rodada tem 4 clubes. Cite jogadores que passaram por eles.',
  `Passou pelos 4: ${PONTE_POINTS[4]} pontos · por 3: ${PONTE_POINTS[3]} · por 2: ${PONTE_POINTS[2]} · por 1: ${PONTE_POINTS[1]}.`,
  '1 palpite por pessoa em cada rodada: o primeiro jogador que você mandar é o que vale. Ninguém repete jogador.',
  'Nome não encontrado ou já citado por outro não gasta o palpite: manda outro.',
  'O bot reage com o número de clubes (1️⃣ a 4️⃣).',
];

export function newPonte(): Pick<PonteParty, 'game' | 'round' | 'totalRounds' | 'rounds' | 'best' | 'used'> {
  return { game: 'ponte', round: -1, totalRounds: PARTY_CONFIG.ponte.rounds!, rounds: [], best: {}, used: [] };
}

export async function startPonte(state: PonteParty, deps: PartyDeps): Promise<Outgoing[]> {
  const sample = await deps.store.samplePlayers({ minSitelinks: 25, minClubs: 4, limit: 250 });
  const usable = sample.map((record) => ({ record, teams: knownClubs(record) })).filter((x) => x.teams.length >= 4);
  const picked = pickFresh(usable, state.totalRounds * 2, deps);
  const rounds: PonteParty['rounds'] = [];
  const usedSets = new Set<string>();
  for (const { record, teams } of picked) {
    const clubs = shuffle(teams, deps.rng).slice(0, 4).map((t) => t.id);
    const key = [...clubs].sort().join('|');
    if (usedSets.has(key)) continue;
    usedSets.add(key);
    rounds.push({ clubs, example: record.name, exampleId: record.id });
    if (rounds.length === state.totalRounds) break;
  }
  if (rounds.length < 2) {
    state.status = 'CANCELLED';
    return [text(BASE_LOADING)];
  }
  state.rounds = rounds;
  state.totalRounds = rounds.length;
  state.status = 'PLAYING';
  state.round = -1;
  return [text(`*Ponte* valendo! ${state.players.length} jogadores, ${state.totalRounds} rodadas.`), ...openPonteRound(state, deps)];
}

const clubNames = (ids: string[]) => ids.map((id) => getTeam(id)?.name ?? id);

export function openPonteRound(state: PonteParty, deps: PartyDeps): Outgoing[] {
  state.round += 1;
  state.best = {};
  state.used = [];
  state.warned = [];
  const r = state.rounds[state.round];
  return [
    text(
      `*Rodada ${state.round + 1}/${state.totalRounds} · Ponte*\n\n🔗 ${clubNames(r.clubs).map((n) => `*${n}*`).join(' · ')}\n\n` +
        `Cite quem passou por esses clubes: 4 clubes = ${PONTE_POINTS[4]} pts, 3 = ${PONTE_POINTS[3]}, 2 = ${PONTE_POINTS[2]}, 1 = ${PONTE_POINTS[1]}. ` +
        `*1 palpite por pessoa.* ${PARTY_CONFIG.ponte.seconds}s.`,
    ),
    schedule(state, PARTY_CONFIG.ponte.seconds, deps.now.getTime(), 'pt'),
  ];
}

export function ponteHits(record: Pick<PlayerRecord, 'clubs'>, clubs: string[]): number {
  return clubs.filter((id) => {
    const team = getTeam(id);
    return team ? playedForClub(team, record.clubs) : false;
  }).length;
}

export async function ponteAnswer(state: PonteParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> {
  if (player.jid in state.best) return []; // já usou o palpite da rodada
  const raw = msg.text.trim();
  if (!looksLikePlayerName(raw)) return [];
  const who = firstName(player.name);
  const clubs = state.rounds[state.round].clubs;
  let found;
  try {
    found = await findForRule(deps, raw, (r) => ponteHits(r, clubs), { kind: 'club', teamId: clubs[0] });
  } catch (error) {
    console.error('lookup failed', error);
    return [text(`*${who}*, a consulta falhou. Manda de novo.`)];
  }
  if (!found) return [text(`❌ *${who}*: não achei "${raw}". Vale nome conhecido ou completo.`)];
  const key = normalize(found.record.name);
  if (state.used.includes(key)) return [text(`*${found.record.name}* já foi citado nesta rodada.`)];
  state.used.push(key);
  player.missed = 0;
  // O palpite vale, acertando ou não: fica registrado e não dá para trocar.
  state.best[player.jid] = { name: found.record.name, hits: found.score };
  const out: Outgoing[] = found.score === 0
    ? [text(`❌ *${who}*: ${found.record.name} não passou por nenhum dos 4.`)]
    : [react(msg, HITS_EMOJI[found.score])];
  const everyone = activePlayers(state).every((p) => p.jid in state.best);
  if (everyone) return save([...out, ...closePonteRound(state, deps, 'Todos responderam.')]);
  return save(out);
}

export function closePonteRound(state: PonteParty, deps: PartyDeps, reason: string): Outgoing[] {
  const nowMs = deps.now.getTime();
  const r = state.rounds[state.round];
  const lines: string[] = [];
  for (const p of state.players) {
    const best = state.best[p.jid];
    if (!best) {
      if (p.missed < 99) p.missed += 1;
      continue;
    }
    const points = PONTE_POINTS[best.hits] ?? 0;
    award(p, points, nowMs);
    lines.push(`${firstName(p.name)}: ${best.name} (${best.hits} de 4) +${points}`);
  }
  state.deadline = null;
  state.timerToken = null;
  const body = [
    `${reason} Fim da rodada ${state.round + 1}.`,
    lines.length ? lines.join('\n') : 'Ninguém pontuou.',
    `Um que passou pelos 4: *${r.example}*.`,
  ].join('\n\n');
  if (state.round >= state.totalRounds - 1) return finishByScore(state, body, 'abrir ponte');
  return [text(body), scoreImage(state, false), ...pauseBeforeNext(state, deps)];
}
