import { firstName, looksLikePlayerName, normalize } from '../game/text';
import type { ContentCategory, CravadaGuessView, CravadaParty, IncomingMessage, Outgoing, PartyPlayer } from '../game/types';
import { PARTY_CONFIG, PartyDeps, Save, activePlayers, award, finishByScore, freshFirst, pauseBeforeNext, react, schedule, scoreImage, shuffle, text, warnOnce } from './common';
import { CRAVADA_BIG, askableRanks, getCravadaList, listsOfCategory, type CravadaList } from './content/cravada';
import { matchTop100 } from './top100';

/**
 * Cravada (em grupo): o bot dá um ranking ("Os maiores artilheiros das
 * Copas") e uma posição ("quem é o 35º?"). Cada um manda 1 nome, escondido
 * até o fim da rodada. Cravou a posição: 100. Errou, mas o nome está na
 * lista: quanto mais perto, mais pontos (mínimo 5). Fora da lista: 0. Na
 * revelação, a posição de cada palpite.
 */
export const CRAVADA_EXACT = 100;
/** Teto de quem chega perto (1 posição de diferença vale um pouco menos que isso). */
export const CRAVADA_NEAR = 80;
/** Quem acerta um nome da lista, mesmo longe, leva pelo menos isso. */
export const CRAVADA_MIN = 5;

/**
 * Pontos pela distância (em posições) numa lista de `size` itens: cai pela
 * metade a cada ~8% da lista. Lista de 100: 1 de diferença = 74, 5 = 53,
 * 10 = 35, 20 = 15. Lista de 10: 1 = 49, 3 = 18.
 */
export function cravadaPoints(distance: number, size: number): number {
  if (distance === 0) return CRAVADA_EXACT;
  const tau = Math.max(2, size * 0.12);
  return Math.max(CRAVADA_MIN, Math.round(CRAVADA_NEAR * Math.exp(-distance / tau)));
}

export const CRAVADA_RULES = [
  'O bot dá um ranking e pede uma posição: "quem é o 35º?". Mande 1 nome (vale o primeiro, sem troca).',
  `Cravou a posição: ${CRAVADA_EXACT}. Errou, mas o nome está na lista: quanto mais perto, mais pontos (mínimo ${CRAVADA_MIN}). Fora da lista: 0.`,
  'Os palpites ficam escondidos até o fim da rodada. Aí o bot mostra em que posição está o nome de cada um.',
  'Tema: *abrir cravada artilheiros*, *premier*, *bola de ouro*, *geral*... (*temas da cravada*). Vence quem somar mais.',
];

export function newCravada(
  category: ContentCategory | null = null,
  theme: string | null = null,
  themeLists: string[] = [],
): Pick<CravadaParty, 'game' | 'category' | 'theme' | 'themeLists' | 'round' | 'totalRounds' | 'rounds' | 'guesses' | 'arrival' | 'closed'> {
  return { game: 'cravada', category, theme, themeLists, round: -1, totalRounds: PARTY_CONFIG.cravada.rounds!, rounds: [], guesses: {}, arrival: [], closed: false };
}

/** `n` listas: as grandes primeiro (até n-1 delas, se houver pequena), as que o grupo não viu antes. */
function pickLists(pool: CravadaList[], n: number, deps: PartyDeps): CravadaList[] {
  const order = (ls: CravadaList[]) => freshFirst(ls.map((l) => l.id), deps.rng, deps.seen).map((id) => ls.find((l) => l.id === id)!);
  const big = order(pool.filter((l) => l.items.length >= CRAVADA_BIG));
  const small = order(pool.filter((l) => l.items.length < CRAVADA_BIG));
  const nBig = Math.min(big.length, small.length ? n - 1 : n);
  const out = [...big.slice(0, nBig), ...small.slice(0, n - nBig)];
  if (out.length < n) out.push(...big.slice(nBig, nBig + n - out.length));
  return out;
}

/** Posições para k rodadas na mesma lista: uma em cada faixa da lista, para não ficarem juntas. */
function spreadRanks(list: CravadaList, k: number, rng: () => number): number[] {
  const ranks = askableRanks(list);
  if (!ranks.length) return [];
  const out: number[] = [];
  for (let j = 0; j < k; j++) {
    const lo = Math.floor((j * ranks.length) / k);
    const hi = Math.max(lo + 1, Math.floor(((j + 1) * ranks.length) / k));
    out.push(ranks[lo + Math.floor(rng() * (hi - lo))]);
  }
  return shuffle(out, rng);
}

/** Rodadas da partida: listas (pelo tema, pela categoria ou a mistura) e a posição de cada uma. */
export function planRounds(state: CravadaParty, deps: PartyDeps): Array<{ listId: string; rank: number }> {
  const n = state.totalRounds;
  let lists: CravadaList[];
  if (state.themeLists.length) {
    const pool = state.themeLists.map((id) => getCravadaList(id)).filter((l): l is CravadaList => Boolean(l));
    lists = pool.length >= n ? pickLists(pool, n, deps) : Array.from({ length: n }, (_, i) => pool[i % pool.length]);
  } else if (state.category) {
    lists = pickLists(listsOfCategory(state.category), n, deps);
  } else {
    // Mistura: 4 rodadas de futebol (3 listas grandes e 1 do Top 10) e 1 de conhecimentos gerais.
    const fut = pickLists(listsOfCategory('futebol'), n - 1, deps);
    const ger = pickLists(listsOfCategory('geral'), 1, deps);
    lists = shuffle([...fut, ...ger], deps.rng);
  }
  const ranksOf = new Map<string, number[]>();
  for (const l of new Set(lists)) ranksOf.set(l.id, spreadRanks(l, lists.filter((x) => x === l).length, deps.rng));
  return lists.map((l) => ({ listId: l.id, rank: ranksOf.get(l.id)!.shift()! })).filter((r) => r.rank > 0);
}

export function startCravada(state: CravadaParty, deps: PartyDeps): Outgoing[] {
  state.rounds = planRounds(state, deps);
  state.totalRounds = state.rounds.length;
  state.status = 'PLAYING';
  state.round = -1;
  const tema = state.theme ? ` Tema: *${state.theme}*.` : '';
  return openCravadaRound(state, deps, `🎯 *Cravada* valendo! ${state.players.length} jogadores, ${state.totalRounds} rodadas.${tema}\n`);
}

const current = (state: CravadaParty) => {
  const r = state.rounds[state.round];
  return { list: getCravadaList(r.listId)!, rank: r.rank };
};

/** Abre a rodada: a imagem da pergunta ("Qual é o 35º?"), com a pergunta também na legenda. */
export function openCravadaRound(state: CravadaParty, deps: PartyDeps, head = ''): Outgoing[] {
  state.round += 1;
  state.guesses = {};
  state.arrival = [];
  state.closed = false;
  state.warned = [];
  const { list, rank } = current(state);
  const seconds = PARTY_CONFIG.cravada.seconds;
  return [
    {
      type: 'image',
      image: { kind: 'cravadaRound', listId: list.id, rank, round: state.round + 1, total: state.totalRounds, seconds },
      caption:
        `${head}🎯 *Rodada ${state.round + 1}/${state.totalRounds}* · *${list.title}*\n` +
        `Qual é o *${rank}º*? Mande 1 palpite (vale o primeiro, sem troca). ${seconds}s.`,
    },
    schedule(state, seconds, deps.now.getTime(), 'cv'),
  ];
}

/** O que a imagem da pergunta mostra além da legenda (plano B quando a imagem não sai). */
export function cravadaRoundText(spec: { listId: string; rank: number }): string {
  const list = getCravadaList(spec.listId);
  if (!list) return '';
  const tie = list.items.filter((i) => i.rank === spec.rank).length > 1 ? ' É um empate: qualquer um dos empatados crava.' : '';
  return `Lista com ${list.items.length} nomes.${tie}`;
}

/**
 * Item da lista que o palpite acerta (-1 = fora da lista; null = ambíguo).
 * O mesmo nome duas vezes na lista (o Neymar nas transferências): vale a
 * posição mais perto da pedida.
 */
export function cravadaMatch(list: CravadaList, raw: string, target: number): number | null {
  const hits = matchTop100(list, raw);
  if (!hits.length) return -1;
  if (hits.length === 1) return hits[0];
  if (new Set(hits.map((i) => normalize(list.items[i].name))).size > 1) return null;
  return [...hits].sort((a, b) => Math.abs(list.items[a].rank - target) - Math.abs(list.items[b].rank - target))[0];
}

export function cravadaAnswer(state: CravadaParty, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  if (state.closed || state.round < 0) return [];
  const raw = msg.text.trim();
  if (raw.length < 2 || raw.length > 60 || /[?\n]/.test(raw)) return [];
  const { list, rank } = current(state);
  const index = cravadaMatch(list, raw, rank);
  // Fora da lista só conta como palpite o que parece um nome (conversa não gasta).
  if (index === -1 && !looksLikePlayerName(raw)) return [];
  const who = firstName(player.name);
  if (player.jid in state.guesses) return warnOnce(state, player.jid, `*${who}*, vale só o primeiro palpite da rodada.`, save);
  if (index === null) {
    return [text(`*${who}*, tem mais de um com esse nome na lista. Mande o nome completo (não gastou o palpite).`)];
  }
  state.guesses[player.jid] = { text: raw, index };
  state.arrival.push(player.jid);
  player.missed = 0;
  const waiting = activePlayers(state).filter((p) => !(p.jid in state.guesses));
  if (waiting.length) return save([react(msg, '📌')]);
  return save([react(msg, '📌'), ...closeCravadaRound(state, deps, 'Todos palpitaram.')]);
}

const pos = (n: number) => `${n}º`;

/** A revelação em texto (plano B da imagem): resposta, vizinhos, palpites e fonte. */
export function cravadaRevealText(spec: { listId: string; rank: number; guesses: CravadaGuessView[] }): string {
  const list = getCravadaList(spec.listId);
  if (!list) return '';
  const answers = list.items.filter((i) => i.rank === spec.rank);
  const detail = (d?: string) => (d ? ` (${d})` : '');
  const first = list.items.findIndex((i) => i.rank === spec.rank);
  const last = first + answers.length - 1;
  const around = [...list.items.slice(Math.max(0, first - 2), first), ...list.items.slice(last + 1, last + 3)].map((i) => `${pos(i.rank)} ${i.name}${detail(i.detail)}`);
  const lines = [...spec.guesses]
    .sort((a, b) => b.points - a.points)
    .map((g) => {
      if (g.index < 0) return `❌ ${firstName(g.player)}: ${g.guess} — fora da lista (0)`;
      const item = list.items[g.index];
      const d = Math.abs(item.rank - spec.rank);
      const where = d === 0 ? 'cravou!' : `${d} ${d === 1 ? 'posição' : 'posições'} de distância`;
      return `${d === 0 ? '🎯' : '✅'} ${firstName(g.player)}: ${item.name} — ${pos(item.rank)}, ${where} (+${g.points})`;
    });
  return [
    `🎯 *${pos(spec.rank)}:* ${answers.map((a) => `*${a.name}*${detail(a.detail)}`).join(', ')}`,
    around.length ? `Perto dele:\n${around.join('\n')}` : '',
    lines.length ? `*Palpites:*\n${lines.join('\n')}` : 'Ninguém palpitou.',
    `_Fonte: ${list.source}._`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** Fecha a rodada: imagem da revelação (a posição de cada palpite e os pontos) e, no fim, o placar. */
export function closeCravadaRound(state: CravadaParty, deps: PartyDeps, reason: string): Outgoing[] {
  if (state.closed) return [];
  state.closed = true;
  state.deadline = null;
  state.timerToken = null;
  for (const p of state.players) if (!(p.jid in state.guesses)) p.missed += 1;
  const { list, rank } = current(state);
  const guesses: CravadaGuessView[] = state.arrival.map((jid) => {
    const i = state.players.findIndex((x) => x.jid === jid);
    const p = state.players[i];
    const g = state.guesses[jid];
    const points = g.index < 0 ? 0 : cravadaPoints(Math.abs(list.items[g.index].rank - rank), list.items.length);
    award(p, points, deps.now.getTime());
    return { player: p.name, color: i, guess: g.text, index: g.index, points };
  });
  const answers = list.items.filter((i) => i.rank === rank).map((i) => i.name);
  const exact = guesses.filter((g) => g.index >= 0 && list.items[g.index].rank === rank).map((g) => `*${firstName(g.player)}*`);
  const best = [...guesses].sort((a, b) => b.points - a.points)[0];
  const highlight = exact.length
    ? `Cravou: ${exact.join(', ')} (+${CRAVADA_EXACT}).`
    : best && best.points > 0
      ? `Mais perto: *${firstName(best.player)}* (+${best.points}).`
      : guesses.length
        ? 'Ninguém acertou um nome da lista.'
        : 'Ninguém palpitou.';
  const reveal: Outgoing = {
    type: 'image',
    image: { kind: 'cravadaReveal', listId: list.id, rank, round: state.round + 1, total: state.totalRounds, reason, guesses },
    caption: `${reason} 🎯 *${pos(rank)}: ${answers.join(', ')}*\n${highlight}`,
  };
  if (state.round >= state.totalRounds - 1) return [reveal, ...finishByScore(state, '', 'abrir cravada')];
  const out: Outgoing[] = [reveal];
  if ((state.round + 1) % 3 === 0) out.push(scoreImage(state, false));
  return [...out, ...pauseBeforeNext(state, deps)];
}

export function cravadaTimeout(state: CravadaParty, deps: PartyDeps): Outgoing[] {
  return closeCravadaRound(state, deps, '⏱️ Tempo esgotado.');
}

export function skipCravada(state: CravadaParty, deps: PartyDeps): Outgoing[] {
  return closeCravadaRound(state, deps, 'Rodada encerrada pelo anfitrião.');
}
