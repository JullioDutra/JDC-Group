import { firstName, isChatter, normalize } from '../game/text';
import type { IncomingMessage, Outgoing, PartyPlayer, Top100Party } from '../game/types';
import { coherenceScore } from '../players/keys';
import { PARTY_CONFIG, PartyDeps, Save, award, editDistance, normalizeAnswer, pendingResults, react, schedule, text } from './common';
import { dayKey, getTop100, listOfDay, type Top100List } from './content/top100';

/**
 * Top 100 do Dia: uma lista de 100 por dia, a mesma para todos os grupos, e
 * cada grupo joga uma vez por dia. Durante 8 minutos, todo mundo manda nomes:
 * cada acerto vale a posição do item (o 1º vale 1; o 100º vale 100: quanto
 * mais fundo na lista, mais pontos). Errar gasta 1 de 10 vidas.
 */
export const TOP100_LIVES = 10;

export const TOP100_RULES = [
  'Uma lista de 100 por dia, a mesma para todos os grupos. Cada grupo joga uma vez por dia.',
  'Mandem nomes à vontade: cada acerto vale a posição do item (o 87º vale 87 pontos).',
  `Errar gasta 1 vida (cada um tem ${TOP100_LIVES}). Nome já revelado não gasta.`,
  `São ${Math.round(PARTY_CONFIG.top100.seconds / 60)} minutos. Vence quem somar mais pontos.`,
];

export function newTop100(now: Date): Pick<Top100Party, 'game' | 'listId' | 'day' | 'found' | 'lives' | 'misses' | 'round'> {
  const list = listOfDay(now);
  return { game: 'top100', listId: list.id, day: dayKey(now), found: list.items.map(() => null), lives: {}, misses: [], round: 0 };
}

/** Marca do grupo para "já jogou hoje" (histórico sem repetição). */
export const playedTodayKey = (day: string) => `dia:${day}`;

export function startTop100(state: Top100Party, deps: PartyDeps): Outgoing[] {
  const list = getTop100(state.listId)!;
  state.status = 'PLAYING';
  for (const p of state.players) state.lives[p.jid] = TOP100_LIVES;
  return [
    {
      type: 'image',
      image: { kind: 'top100Board', state: structuredClone(state), final: false },
      caption:
        `💯 *Top 100 do Dia* (${state.day.split('-').reverse().join('/')})\n*${list.title}*\n\n` +
        `Mandem nomes! Cada acerto vale a posição (o 87º vale 87). ${TOP100_LIVES} vidas cada. ${Math.round(PARTY_CONFIG.top100.seconds / 60)} minutos.`,
    },
    schedule(state, PARTY_CONFIG.top100.seconds, deps.now.getTime(), 't100'),
  ];
}

/**
 * Índices dos itens que o palpite acerta: nome ou apelido exato; erro de
 * digitação pequeno em nomes longos; em listas de pessoas, o sobrenome.
 */
export function matchTop100(list: Top100List, raw: string): number[] {
  const g = normalizeAnswer(raw);
  if (!g) return [];
  // O palpite perde o artigo inicial ("a banda" vira "banda"); a resposta também precisa da forma sem artigo.
  const forms = list.items.map((it) => [it.name, ...(it.aliases ?? [])].flatMap((f) => [normalize(f), normalizeAnswer(f)]));
  const exact = forms.map((fs, i) => (fs.includes(g) ? i : -1)).filter((i) => i >= 0);
  if (exact.length) return exact;
  const tol = g.length >= 9 ? 2 : g.length >= 5 ? 1 : 0;
  if (tol) {
    const near = forms.map((fs, i) => (fs.some((f) => f.length >= 5 && editDistance(f, g) <= tol) ? i : -1)).filter((i) => i >= 0);
    if (near.length) return near;
  }
  if (list.kind === 'pessoas') {
    return list.items.map((it, i) => (coherenceScore(raw, [it.name, ...(it.aliases ?? [])]) > 0 ? i : -1)).filter((i) => i >= 0);
  }
  return [];
}

export function top100Answer(state: Top100Party, player: PartyPlayer, msg: IncomingMessage, deps: PartyDeps, save: Save): Promise<Outgoing[]> | Outgoing[] {
  const raw = msg.text.trim();
  if (raw.length < 2 || raw.length > 60 || /[?\n]/.test(raw)) return [];
  const list = getTop100(state.listId)!;
  const hits = matchTop100(list, raw);
  // Título longo de música parece conversa (mais de 6 palavras): se bate com a lista, vale.
  if (!hits.length && isChatter(raw)) return [];
  if (!(player.jid in state.lives)) state.lives[player.jid] = TOP100_LIVES;
  if (state.lives[player.jid] <= 0) return [];
  const who = firstName(player.name);
  const open = hits.filter((i) => !state.found[i]);
  if (hits.length && !open.length) {
    const i = hits[0];
    return [text(`*${list.items[i].name}* já foi (${list.items[i].rank}º, de ${firstName(state.found[i]!.name)}).`)];
  }
  if (open.length > 1) {
    const names = open.slice(0, 3).map((i) => list.items[i].name).join(', ');
    return [text(`*${who}*, tem mais de um com esse nome (${names}...). Seja mais específico.`)];
  }
  if (open.length === 1) {
    const i = open[0];
    const item = list.items[i];
    state.found[i] = { jid: player.jid, name: player.name };
    award(player, item.rank, deps.now.getTime());
    player.missed = 0;
    const out: Outgoing[] = [text(`✅ *${who}*: ${item.rank}º · *${item.name}*${item.detail ? ` (${item.detail})` : ''} (+${item.rank})`)];
    if (state.found.every(Boolean)) return save([...out, ...finishTop100(state, 'Lista completa!')]);
    const count = state.found.filter(Boolean).length;
    if (count % 25 === 0) out.push({ type: 'image', image: { kind: 'top100Board', state: structuredClone(state), final: false }, caption: `${count} de 100 achados.` });
    return save(out);
  }
  // Errou. Palpite errado repetido não gasta vida.
  const key = normalize(raw);
  if (state.misses.includes(key)) return [];
  state.misses.push(key);
  state.lives[player.jid] -= 1;
  const left = state.lives[player.jid];
  if (left > 0) return save([react(msg, '❌')]);
  const allOut = state.players.every((p) => (state.lives[p.jid] ?? TOP100_LIVES) <= 0);
  const out: Outgoing[] = [react(msg, '❌'), text(`*${who}* ficou sem vidas.`)];
  return save(allOut ? [...out, ...finishTop100(state, 'Todos ficaram sem vidas.')] : out);
}

export function finishTop100(state: Top100Party, reason: string): Outgoing[] {
  state.status = 'FINISHED';
  state.deadline = null;
  state.timerToken = null;
  const list = getTop100(state.listId)!;
  const ranked = [...state.players].sort((a, b) => b.score - a.score || a.lastHitAt - b.lastHitAt);
  const best = ranked[0];
  const tied = ranked.filter((p) => p.score === best.score);
  const found = state.found.filter(Boolean).length;
  const headline =
    !best || best.score === 0
      ? 'Ninguém pontuou hoje.'
      : tied.length > 1
        ? `🏆 Empate: ${tied.map((p) => `*${p.name}*`).join(' e ')}, com ${best.score} pontos.`
        : `🏆 *${best.name}* venceu o Top 100 de hoje com ${best.score} pontos.`;
  pendingResults.set(
    state,
    ranked.map((p) => ({ player: { jid: p.jid, name: p.name }, result: best.score > 0 && p.score === best.score ? (tied.length > 1 ? 'draw' : 'win') : 'loss' })),
  );
  const lines = ranked.map((p, i) => `${i + 1}º ${p.name} — ${p.score}`);
  return [
    {
      type: 'image',
      image: { kind: 'top100Board', state: structuredClone(state), final: true },
      caption: [reason, `O grupo achou ${found} de 100.`, headline, lines.join('\n'), `Fonte: ${list.source}.`, 'Amanhã tem outra lista: mande *top 100*.'].join('\n\n'),
    },
  ];
}

export function top100Timeout(state: Top100Party): Outgoing[] {
  return finishTop100(state, 'Tempo esgotado.');
}
