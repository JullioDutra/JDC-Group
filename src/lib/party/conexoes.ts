import { firstName, normalize } from '../game/text';
import type { ConexoesParty, ContentCategory, IncomingMessage, Outgoing, PartyPlayer } from '../game/types';
import { PARTY_CONFIG, PartyDeps, Save, activePlayers, award, finishByScore, react, schedule, scoreImage, shuffle, text, warnOnce, pauseBeforeNext, freshFirst } from './common';
import { CONEXOES, getConexoes } from './content/conexoes';

/**
 * Conexões ("Jogo das Conexões" do Projeto Trivia): 16 nomes, 4 grupos de 4.
 * Cada um manda 4 números. Grupo achado sai do tabuleiro e vale pontos
 * (quanto mais difícil, mais). Cada um tem 3 erros por rodada.
 */
export const CONEXOES_POINTS = [100, 150, 200, 250];
export const CONEXOES_ERRORS = 3;

export function newConexoes(
  category: ContentCategory | null = null,
): Pick<ConexoesParty, 'game' | 'category' | 'round' | 'totalRounds' | 'order' | 'tiles' | 'solved' | 'errors' | 'tried' | 'lastJid'> {
  return { game: 'conexoes', category, round: -1, totalRounds: PARTY_CONFIG.conexoes.rounds!, order: [], tiles: [], solved: [], errors: {}, tried: [], lastJid: null };
}

export const CONEXOES_RULES = [
  '16 nomes escondem 4 grupos de 4. Mande 4 números do mesmo grupo: *2 7 11 14*.',
  `Grupo certo vale de ${CONEXOES_POINTS[0]} a ${CONEXOES_POINTS[3]} (o mais difícil vale mais) e sai do tabuleiro.`,
  `Cada um tem ${CONEXOES_ERRORS} erros por rodada. Combinação já tentada não conta.`,
];

export function startConexoes(state: ConexoesParty, deps: PartyDeps): Outgoing[] {
  const pool = CONEXOES.filter((p) => (state.category ? p.category === state.category : p.category !== 'politica'));
  state.order = freshFirst(pool.map((p) => p.id), deps.rng, deps.seen).slice(0, state.totalRounds);
  state.totalRounds = state.order.length;
  state.status = 'PLAYING';
  state.round = -1;
  return [text(`*Conexões* valendo! ${state.players.length} jogadores, ${state.totalRounds} tabuleiros.`), ...openConexoesRound(state, deps)];
}

export function openConexoesRound(state: ConexoesParty, deps: PartyDeps): Outgoing[] {
  state.round += 1;
  const puzzle = getConexoes(state.order[state.round])!;
  state.tiles = shuffle(puzzle.groups.flatMap((g) => g.items), deps.rng);
  state.solved = [];
  state.errors = {};
  state.tried = [];
  state.lastJid = null;
  state.warned = [];
  const secs = PARTY_CONFIG.conexoes.seconds;
  return [
    {
      type: 'image',
      image: { kind: 'conexoesBoard', state: structuredClone(state), reveal: false },
      caption:
        `*Rodada ${state.round + 1}/${state.totalRounds}* · Conexões\n` +
        `Ache os 4 grupos. Mande 4 números: *1 5 9 13*. ${CONEXOES_ERRORS} erros por pessoa. Tempo: ${Math.round(secs / 60)} min.`,
    },
    schedule(state, secs, deps.now.getTime(), 'cx'),
  ];
}

/** "1 5 9 13", "1,5,9,13", "1-5-9-13" → 4 números distintos de 1 a 16. */
export function parseFour(raw: string): number[] | null {
  const t = raw.trim();
  if (!/^\d{1,2}([\s,.;-]+\d{1,2}){3}$/.test(t)) return null;
  const nums = t.split(/[\s,.;-]+/).map(Number);
  if (new Set(nums).size !== 4 || nums.some((n) => n < 1 || n > 16)) return null;
  return nums;
}

function groupOf(state: ConexoesParty, tile: string): number {
  const puzzle = getConexoes(state.order[state.round])!;
  return puzzle.groups.findIndex((g) => g.items.includes(tile));
}

export function conexoesAnswer(state: ConexoesParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  const nums = parseFour(msg.text);
  if (!nums) return [];
  const who = firstName(player.name);
  if ((state.errors[player.jid] ?? 0) >= CONEXOES_ERRORS) {
    return warnOnce(state, player.jid, `*${who}*, seus palpites desta rodada acabaram.`, save);
  }
  const solvedGroups = state.solved.map((s) => s.group);
  const tiles = nums.map((n) => state.tiles[n - 1]);
  if (tiles.some((t) => solvedGroups.includes(groupOf(state, t)))) {
    return [text(`*${who}*, tem número de grupo já achado aí. Use só os que sobraram.`)];
  }
  const key = nums.map((n) => normalize(state.tiles[n - 1])).sort().join('|');
  if (state.tried.includes(key)) return [text(`*${who}*, essa combinação já foi tentada.`)];
  player.missed = 0;

  const groups = tiles.map((t) => groupOf(state, t));
  if (groups.every((g) => g === groups[0])) {
    const g = groups[0];
    const puzzle = getConexoes(state.order[state.round])!;
    const points = CONEXOES_POINTS[g];
    award(player, points, deps.now.getTime());
    state.solved.push({ group: g, jid: player.jid, name: player.name });
    const out: Outgoing[] = [text(`✅ *${who}* achou: *${puzzle.groups[g].label}* (+${points})\n${puzzle.groups[g].items.join(', ')}`)];
    if (state.solved.length >= 3) return save([...out, ...closeConexoesRound(state, deps, 'Tabuleiro resolvido.')]);
    out.push({ type: 'image', image: { kind: 'conexoesBoard', state: structuredClone(state), reveal: false } });
    return save(out);
  }

  state.tried.push(key);
  state.errors[player.jid] = (state.errors[player.jid] ?? 0) + 1;
  const counts = new Map<number, number>();
  for (const g of groups) counts.set(g, (counts.get(g) ?? 0) + 1);
  const almost = Math.max(...counts.values()) === 3;
  const left = CONEXOES_ERRORS - state.errors[player.jid];
  const out: Outgoing[] = [
    almost
      ? text(`Quase, *${who}*: 3 dos 4 são do mesmo grupo. ${left === 0 ? 'Seus palpites acabaram.' : `Restam ${left} erro${left === 1 ? '' : 's'}.`}`)
      : left === 0
        ? text(`❌ *${who}*: seus palpites desta rodada acabaram.`)
        : react(msg, '❌'),
  ];
  const someoneLeft = activePlayers(state).some((p) => (state.errors[p.jid] ?? 0) < CONEXOES_ERRORS);
  if (!someoneLeft) out.push(...closeConexoesRound(state, deps, 'Acabaram os palpites.'));
  return save(out);
}

export function closeConexoesRound(state: ConexoesParty, deps: PartyDeps, reason: string): Outgoing[] {
  for (const p of state.players) {
    const tried = state.solved.some((s) => s.jid === p.jid) || (state.errors[p.jid] ?? 0) > 0;
    if (!tried && p.missed < 99) p.missed += 1;
  }
  const puzzle = getConexoes(state.order[state.round])!;
  const missing = puzzle.groups.map((_, i) => i).filter((i) => !state.solved.some((s) => s.group === i));
  for (const g of missing) state.solved.push({ group: g, jid: null, name: '' });
  const lines = puzzle.groups.map((g, i) => {
    const s = state.solved.find((x) => x.group === i);
    return `*${g.label}*: ${g.items.join(', ')}${s?.jid ? ` (${firstName(s.name)})` : ''}`;
  });
  const out: Outgoing[] = [
    {
      type: 'image',
      image: { kind: 'conexoesBoard', state: structuredClone(state), reveal: true },
      caption: `${reason}\n\n${lines.join('\n')}`,
    },
  ];
  if (state.round >= state.totalRounds - 1) return [...out, ...finishByScore(state, '', 'abrir conexões')];
  return [...out, scoreImage(state, false), ...pauseBeforeNext(state, deps)];
}
