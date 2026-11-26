import { handleAwards } from '../awards/commands';
import type { PlayerLookup } from '../ai';
import type { Store } from '../store/types';
import type { FactCheck, TeamJudge, WordCheck } from '../party/common';
import { freshPick } from '../party/common';
import { ConflictError } from './conflict';
import { FAST_TURN_SECONDS, GameMode, MODES, Twists, getMode, isRandomWord, ignoredLeagueNote, leagueFits, leagueLabel, metricValue, parseModeChoice, randomMode } from './modes';
import { getTeam, isFromNation } from './teams';
import { PICK_TRIES, clubVerdict, drawRestrictions, playContext } from './validate';
import { helpText } from './commands';
import { applyClubCorrection, applyCorrection, applyFamousName, findRecords, formatCard, parseClubCorrection, parseCorrection, parseFamousName } from '../players/admin';
import { firstName, formatNumber, looksLikePlayerName, normalize } from './text';
import { createParty, handlePartyMessage, handlePartyTick, isPartyStale, parsePartyStart, recordPartyIfFinished } from '../party/engine';
import { anagramThemesText } from '../party/anagrama';
import { playedTodayKey, resetTodayKey } from '../party/top100';
import { dayKey } from '../party/content/top100';
import { championsText, seasonTurnover, shortDay } from './season';
import { NEXT_BLOCK_KIND, blockedNames, sameMember, targetsOf } from './blocks';
import { IMPOSTOR_RULES, cardText, impostorThemesText } from '../party/impostor';
import { ACTIVATE_IMPOSTOR, IMPOSTOR_GROUP_HELP, isImpostorOnly, setImpostorOnly } from './groupMode';
import type { SimData } from '../sim/brasileirao';
import { SIM_COMMAND, simulatorText } from '../sim/text';
import { NEWS, NEWS_COMMAND, NEWS_SEEN_KIND, latestNewsFor, newsOutgoing } from './novidades';
import { LIGAS_COMMAND, ligasOutgoing } from './ligas';
import { SNAPSHOT_2026 } from '../sim/snapshot-2026';
import { siteUrl } from '../sim/data';
import {
  ImpostorParty,
  IncomingMessage,
  Match,
  MatchPlayer,
  MatchState,
  isParty,
  Outgoing,
  POSITION_LABEL,
  Restriction,
  SLOTS,
  Side,
} from './types';

export const GAME_NAME = 'Duelo de Craques';
export const TURN_SECONDS = 90;
const LOBBY_TTL_MS = 10 * 60_000;
const IDLE_TTL_MS = 20 * 60_000;

export interface EngineDeps {
  store: Store;
  lookup: PlayerLookup;
  now?: () => Date;
  rng?: () => number;
  /**
   * Quem pode mandar "ativar jogos"/"desativar jogos". Sem a função, qualquer
   * pessoa pode (simulador e testes). Em produção vem de ADMIN_NUMBERS.
   */
  canManageGroup?: (senderJid: string) => boolean;
  /** Juiz por IA do Melhor Time (sem ele, vale a regra de reserva). */
  judge?: TeamJudge;
  /** Stop: juiz de palavras (IA). */
  checkWords?: WordCheck;
  /** Grade: títulos fora das listas curadas (IA). */
  checkFact?: FactCheck;
  /** Produção: anuncia as novidades da versão (1 vez por grupo). Testes: desligado. */
  announce?: boolean;
  /** Simulador do Brasileirão: dados ao vivo (sem a função, a versão guardada). */
  brasileirao?: () => Promise<SimData>;
}


export function turnSeconds(state: MatchState): number {
  return state.options?.turnSeconds ?? TURN_SECONDS;
}

export function isBlind(state: MatchState): boolean {
  return Boolean(state.options?.blind) && state.status !== 'FINISHED';
}

const text = (t: string): Outgoing => ({ type: 'text', text: t });

// ---------- Pontuação ----------

export function totals(state: MatchState): [number, number] {
  const sum = (side: Side) => state.picks[side].reduce((acc, p) => acc + (p?.value ?? 0), 0);
  return [sum(0), sum(1)];
}

export function leader(state: MatchState, mode: GameMode): Side | 'draw' {
  const [a, b] = totals(state);
  if (a === b) return 'draw';
  return (mode.direction === 'high' ? a > b : a < b) ? 0 : 1;
}

function roundStarter(round: number): Side {
  return (round % 2) as Side;
}

// ---------- Textos ----------

const HELP = helpText(GAME_NAME);

const RULES = [
  `*Como se joga ${GAME_NAME}*`,
  '',
  '1. Alguém manda *iniciar jogo*. O primeiro que responder *aceitar* é o adversário.',
  '2. O anfitrião escolhe o tema (ou manda *aleatório* para sortear; com *iniciar aleatório* o sorteio é automático). Temas: gols, assistências, valor de mercado, idade... Extras: some *cego* (números escondidos até o fim), *relâmpago* (45s por jogada), *difícil* (clubes menos óbvios) ou uma liga (*brasileirão*, *premier*, *la liga*, *série a*, *bundesliga*, *ligue 1*, *argentino*: só clubes dela, misturando grandes e pequenos). Ex.: *3 cego*, *1 brasileirão*.',
  '3. São 6 rodadas, uma por posição: goleiro, 2 defensores, 2 meias e 1 atacante.',
  '4. Um de cada vez: só depois que os dois escolhem o goleiro a rodada dos defensores é liberada, e assim por diante. Na sua vez, mande só o *nome do jogador*. A IA confere se ele existe, se joga na posição e informa o número dele no tema.',
  '5. Jogador inválido não passa a vez: você tenta de novo, até 3 tentativas (nome inventado, repetido, posição ou clube errado gastam uma). Errou 3: fica com o pior valor do tema. O clube é conferido no Wikidata. Ninguém pode repetir um jogador já escalado.',
  '6. Só os dois jogadores da partida podem escalar; mensagens de quem está de fora são ignoradas até o fim do jogo.',
  '7. No fim, somam-se os números dos 6 escalados. Dependendo do tema, vence a maior ou a menor soma.',
  `8. Cada vez tem prazo (${TURN_SECONDS}s; 45s no relâmpago). Estourou: a vez passa com o pior valor do tema. ${'3'} vezes seguidas sem jogar: derrota por W.O.`,
].join('\n');

function restrictionLine(restriction: Restriction): string {
  const team = getTeam(restriction.teamId);
  if (!team) return '';
  return restriction.kind === 'club' ? `Clube da rodada: *${team.name}*\n` : `Seleção da rodada: *${team.name}*\n`;
}

function turnPrompt(state: MatchState): string {
  const slot = SLOTS[state.round];
  const player = state.players[state.turn]!;
  return (
    `*Rodada ${state.round + 1}/${SLOTS.length} · ${POSITION_LABEL[slot].toUpperCase()}*\n` +
    restrictionLine(state.restrictions[state.round]) +
    `*${player.name}*, mande o nome do seu ${POSITION_LABEL[slot]}. Você tem ${turnSeconds(state)}s.`
  );
}

// ---------- Prazo automático do 1 x 1 ----------

/** Sem estreitamento de tipo: o status muda dentro de duelTimeout. */
const isFinished = (state: MatchState) => state.status === 'FINISHED';

/** 3 vezes seguidas sem jogar = derrota por W.O. */
export const DUEL_MAX_MISSES = 3;

/** Abre o prazo da vez atual: agenda a cobrança no QStash (como nas salas). */
function scheduleTurn(state: MatchState, nowMs: number): Outgoing {
  state.seq = (state.seq ?? 0) + 1;
  state.timerToken = `duel:${state.seq}`;
  state.deadline = state.turnStartedAt + turnSeconds(state) * 1000;
  return { type: 'schedule', delaySeconds: Math.max(1, Math.round((state.deadline - nowMs) / 1000)) + 1, token: state.timerToken };
}

function clearTimer(state: MatchState): void {
  state.deadline = null;
  state.timerToken = null;
}

/**
 * Mensagens depois de uma escolha (ou de um tempo estourado). No meio da
 * rodada vai só texto; ao fechar a rodada ou a partida, vai o campinho. Abre
 * o prazo da próxima vez. Não salva: quem chama salva e grava o resultado.
 */
function duelAdvance(state: MatchState, mode: GameMode, lead: string, step: Step, nowMs: number): Outgoing[] {
  if (step === 'same-round') return [text(`${lead}\n\n${turnPrompt(state)}`), scheduleTurn(state, nowMs)];
  const image = { kind: 'pitch' as const, state: structuredClone(state) };
  if (step === 'round-done') {
    const head = isBlind(state) ? 'Placar escondido até o apito final.' : scoreLine(state, mode);
    return [{ type: 'image', image, caption: `${lead}\n${head}` }, text(turnPrompt(state)), scheduleTurn(state, nowMs)];
  }
  clearTimer(state);
  state.winner = leader(state, mode);
  image.state.winner = state.winner;
  const result =
    state.winner === 'draw' ? '*Empate.* Ninguém leva essa.' : `🏆 *${state.players[state.winner]!.name}* venceu o duelo!`;
  return [
    {
      type: 'image',
      image,
      caption: `${lead}\n${scoreLine(state, mode)}\n\n${result}\nMandem *iniciar jogo* para a revanche ou *ranking* para ver a tabela.`,
    },
  ];
}

/**
 * Tempo da vez esgotado: a vez passa com o pior valor do tema. Três vezes
 * seguidas do mesmo lado: derrota por W.O. (antes, 4 de cada 10 duelos
 * ficavam pela metade porque o relógio só era cobrado com "tempo").
 */
export function duelTimeout(state: MatchState, mode: GameMode, nowMs: number): Outgoing[] {
  const side = state.turn;
  const late = state.players[side]!;
  const misses = (state.misses ??= [0, 0]);
  misses[side] += 1;
  if (misses[side] >= DUEL_MAX_MISSES) {
    clearTimer(state);
    state.status = 'FINISHED';
    state.winner = (1 - side) as Side;
    return [
      text(`⏱️ *${late.name}* ficou ${DUEL_MAX_MISSES} vezes seguidas sem jogar. Vitória de *${state.players[state.winner]!.name}* por W.O.\nMandem *iniciar jogo* para a revanche.`),
    ];
  }
  const step = applyPick(state, side, { name: 'Tempo esgotado', key: `tempo-${state.round}-${side}`, value: mode.penalty }, nowMs);
  const warn = misses[side] === DUEL_MAX_MISSES - 1 ? ` Mais uma e é W.O.` : '';
  const lead = `⏱️ *${late.name}* estourou o tempo e ficou com o pior valor do tema nesta posição (*${formatNumber(mode.penalty)} ${mode.unit}*).${warn}`;
  return duelAdvance(state, mode, lead, step, nowMs);
}

/** Cobrança automática do prazo do 1 x 1 (chamada pelo QStash). */
async function handleDuelTick(match: Match, token: string | null, deps: EngineDeps, now: Date, force: boolean): Promise<Outgoing[]> {
  const state = match.state;
  if (state.status !== 'PLAYING') return [];
  if (!force) {
    if (!token || token !== state.timerToken) return []; // a vez já mudou
    if (state.deadline && now.getTime() < state.deadline - 1500) return [];
  }
  const mode = getMode(state.modeId);
  if (!mode) return [];
  const out = duelTimeout(state, mode, now.getTime());
  state.updatedAt = now.getTime();
  if (!(await deps.store.saveMatch(match))) throw new ConflictError();
  if (isFinished(state) && state.winner !== null) {
    await deps.store.recordResult(match.groupJid, state.players as [MatchPlayer, MatchPlayer], state.winner);
  }
  return out;
}

function twistLabel(state: MatchState): string {
  const parts = [];
  if (state.options?.blind) parts.push('às cegas');
  if (turnSeconds(state) !== TURN_SECONDS) parts.push(`relâmpago, ${turnSeconds(state)}s`);
  if (state.options?.hard) parts.push('difícil');
  if (state.options?.league) parts.push(`só ${leagueLabel(state.options.league)}`);
  return parts.length ? ` (${parts.join(', ')})` : '';
}

function scoreLine(state: MatchState, mode: GameMode): string {
  const [a, b] = totals(state);
  return `Placar: ${firstName(state.players[0].name)} *${formatNumber(a)}* x *${formatNumber(b)}* ${firstName(state.players[1]!.name)} (${mode.unit})`;
}

// ---------- Estado ----------

function newLobby(host: MatchPlayer, now: number): MatchState {
  return {
    status: 'LOBBY',
    players: [host, null],
    modeId: null,
    restrictions: [],
    picks: [SLOTS.map(() => null), SLOTS.map(() => null)],
    round: 0,
    turn: 0,
    turnStartedAt: now,
    createdAt: now,
    updatedAt: now,
    winner: null,
  };
}


/** "iniciar jogo", "iniciar", "novo jogo", com "aleatório"/"surpresa" opcional no fim. */
function parseStart(norm: string): { random: boolean } | null {
  const words = norm.split(' ');
  if (words[0] !== 'iniciar' && words[0] !== 'novo') return null;
  let rest = words.slice(1);
  if (rest[0] === 'jogo') rest = rest.slice(1);
  if (rest.length === 0) return words[0] === 'novo' && words.length === 1 ? null : { random: false };
  if (rest.length === 1 && isRandomWord(rest[0])) return { random: true };
  return null;
}

function isStale(state: MatchState, now: number): boolean {
  return now - state.updatedAt > (state.status === 'LOBBY' ? LOBBY_TTL_MS : IDLE_TTL_MS);
}

function sideOf(state: MatchState, jid: string): Side | null {
  if (state.players[0].jid === jid) return 0;
  if (state.players[1]?.jid === jid) return 1;
  return null;
}

/** Procura um escalado com qualquer um destes nomes normalizados. */
function findUsed(state: MatchState, keys: string[]): { side: Side } | null {
  for (const side of [0, 1] as const) {
    for (const p of state.picks[side]) {
      if (!p) continue;
      const names = [p.key, ...(p.aliases ?? [])];
      if (keys.some((k) => names.includes(k))) return { side };
    }
  }
  return null;
}

type Step = 'same-round' | 'round-done' | 'match-done';

/** Registra a escolha e avança vez/rodada. */
function applyPick(state: MatchState, side: Side, pick: { name: string; key: string; value: number }, now: number): Step {
  state.picks[side][state.round] = pick;
  state.turnStartedAt = now;
  const other = (1 - side) as Side;
  if (state.picks[other][state.round] === null) {
    state.turn = other;
    return 'same-round';
  }
  if (state.round === SLOTS.length - 1) {
    state.status = 'FINISHED';
    return 'match-done';
  }
  state.round += 1;
  state.turn = roundStarter(state.round);
  return 'round-done';
}

// ---------- Motor ----------

/**
 * Processa uma mensagem do grupo e devolve o que o bot deve responder.
 * Se outra mensagem mexer na partida ao mesmo tempo (dois webhooks em
 * paralelo), refaz o processamento sobre o estado novo, em vez de perder a jogada.
 */
export async function handleMessage(msg: IncomingMessage, deps: EngineDeps): Promise<Outgoing[]> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const out = await handleOnce(msg, deps);
      return deps.announce ? await withNews(msg, deps, out) : out;
    } catch (error) {
      if (!(error instanceof ConflictError)) throw error;
    }
  }
  return [];
}

/**
 * Novidades da versão: na primeira resposta do bot num grupo ativo depois de
 * uma atualização, fora de partida (não atrapalha jogo em andamento), a
 * imagem vai junto. Uma vez por versão em cada grupo.
 */
async function withNews(msg: IncomingMessage, deps: EngineDeps, out: Outgoing[]): Promise<Outgoing[]> {
  const news = NEWS[0];
  if (!news || !out.length || !msg.groupJid.endsWith('@g.us')) return out;
  try {
    if (!(await deps.store.isGroupActive(msg.groupJid))) return out;
    if (await deps.store.getActiveMatch(msg.groupJid)) return out;
    const seen = await deps.store.getSeen(msg.groupJid, NEWS_SEEN_KIND);
    if (seen.includes(news.id)) return out;
    await deps.store.markSeen(msg.groupJid, NEWS_SEEN_KIND, [news.id]);
    const card = newsOutgoing(news, await isImpostorOnly(deps.store, msg.groupJid));
    return card ? [...out, card] : out;
  } catch (error) {
    console.error('novidades falharam', error);
    return out;
  }
}

/**
 * Fim de prazo de uma rodada (chamado pelo QStash, ou pelo simulador com force).
 * Só salas têm prazo automático; no 1 x 1 o relógio é cobrado com "tempo".
 */
export async function handleTick(
  groupJid: string,
  token: string | null,
  deps: EngineDeps,
  force = false,
): Promise<Outgoing[]> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const session = await deps.store.getActiveMatch(groupJid);
      if (!session) return [];
      if (!isParty(session.state)) {
        return await handleDuelTick(session as Match, token, deps, (deps.now ?? (() => new Date()))(), force);
      }
      const out = await handlePartyTick(
        session,
        token,
        {
          store: deps.store,
          lookup: deps.lookup,
          now: (deps.now ?? (() => new Date()))(),
          rng: deps.rng ?? Math.random,
          isAdmin: () => false,
          judge: deps.judge,
          checkWords: deps.checkWords,
          checkFact: deps.checkFact,
        },
        force,
      );
      await recordPartyIfFinished(session, deps.store);
      return out;
    } catch (error) {
      if (!(error instanceof ConflictError)) throw error;
    }
  }
  return [];
}

const ACTIVATE = ['ativar jogos', 'ativar jogo', 'ativar duelo'];
const HELP_WORDS = ['ajuda', 'menu', 'comandos', 'jogos', 'ajuda jogos'];

/**
 * O grupo é só de Impostor? Só consulta o banco quando a mensagem é um comando
 * que muda nesse modo (ajuda, temas, regras, abrir outro jogo).
 */
async function impostorOnlyFor(store: EngineDeps['store'], groupJid: string, norm: string): Promise<boolean> {
  const relevant =
    HELP_WORDS.includes(norm) || ['ajuda texto', 'modos', 'temas', 'regras'].includes(norm) || /^temas (do |de )?impostor$/.test(norm) ||
    NEWS_COMMAND.test(norm) || LIGAS_COMMAND.test(norm) ||
    Boolean(parsePartyStart(norm)) || Boolean(parseStart(norm));
  return relevant ? isImpostorOnly(store, groupJid) : false;
}
const DEACTIVATE = ['desativar jogos', 'desativar jogo', 'desativar duelo'];

/**
 * Mensagem no privado do bot: só o Impostor usa. Quem está numa partida
 * aberta e manda "oi" ou "carta" recebe a carta de novo; o resto é ignorado
 * (o bot não vira chat, e nada no privado mexe em grupo).
 */
async function handlePrivate(msg: IncomingMessage, deps: EngineDeps): Promise<Outgoing[]> {
  const norm = normalize(msg.text);
  if (!['oi', 'ola', 'oi bot', 'carta', 'minha carta', 'segredo', 'meu segredo'].includes(norm)) return [];
  const ids = [msg.senderJid, ...(msg.senderAliases ?? [])];
  const matches = await deps.store.openMatchesByGame('impostor').catch(() => []);
  for (const m of matches) {
    const st = m.state as ImpostorParty;
    if (st.status !== 'PLAYING' || !st.secretId) continue;
    const player = st.players.find((p) => p.missed < 99 && sameMember(ids, p.jid));
    if (player) return [text(cardText(st, player.jid))];
  }
  return [];
}

async function handleOnce(msg: IncomingMessage, deps: EngineDeps): Promise<Outgoing[]> {
  if (msg.private) return handlePrivate(msg, deps);
  const { store } = deps;
  const now = (deps.now ?? (() => new Date()))();
  const nowMs = now.getTime();
  const rng = deps.rng ?? Math.random;
  const norm = normalize(msg.text);
  const sender: MatchPlayer = { jid: msg.senderJid, name: msg.senderName };

  const ids = [msg.senderJid, ...(msg.senderAliases ?? [])];
  const manager = deps.canManageGroup ? ids.some((id) => deps.canManageGroup!(id)) : true;

  // Coleta independente: não abre jogos, não altera partidas nem aparece nas imagens.
  // Permissão explícita e fechada por padrão, inclusive fora do webhook de produção.
  const awards = await handleAwards(msg, store, Boolean(deps.canManageGroup && manager), now);
  if (awards !== null) return awards;

  // O bot só "enxerga" grupos ativados; em qualquer outro, tudo é ignorado.
  // "ativar grupo" é do Finanças G&J (bot pessoal no número do admin): o jogo usa outro nome.
  // "ativar impostor": grupo que não é de futebol, só com o Impostor (sem tema, temas gerais).
  if (ACTIVATE_IMPOSTOR.test(norm)) {
    if (!manager) return [text('Só o administrador do bot ativa o Impostor neste grupo.')];
    await store.setGroupActive(msg.groupJid, msg.groupName, true, msg.senderJid);
    await setImpostorOnly(store, msg.groupJid, true);
    return [
      text(
        '✅ *Impostor* ativado neste grupo! Aqui só ele fica ligado (os outros jogos do bot não respondem).\n\n' +
          'Sem tema, a partida usa temas gerais: filmes, séries, lugares, animais... Mande *abrir impostor* para abrir a sala, ' +
          'ou *abrir impostor* + tema (*temas do impostor* mostra todos). *ajuda* mostra os comandos.\n\n' +
          'Para liberar todos os jogos: *ativar jogos*.',
      ),
    ];
  }
  if (ACTIVATE.includes(norm)) {
    if (!manager) {
      // Ajuda a configurar: mostra como o WhatsApp identificou quem mandou (número ou @lid).
      console.warn('ativação negada', ids);
      const id = ids.map((j) => j.split('@')[0]).join(' / ');
      return [text(`Só o administrador do bot ativa os jogos. Se você é o admin, adicione este id em ADMIN_NUMBERS na Vercel: ${id}`)];
    }
    const wasImpostorOnly = await isImpostorOnly(store, msg.groupJid);
    await store.setGroupActive(msg.groupJid, msg.groupName, true, msg.senderJid);
    if (wasImpostorOnly) await setImpostorOnly(store, msg.groupJid, false);
    return [
      text(
        wasImpostorOnly
          ? `✅ Todos os jogos do *${GAME_NAME}* liberados neste grupo (antes era só o Impostor).\nMande *ajuda* para ver os comandos.`
          : `✅ *${GAME_NAME}* ativado neste grupo!\nMande *iniciar jogo* para desafiar alguém ou *ajuda* para ver os comandos.`,
      ),
    ];
  }
  if (!(await store.isGroupActive(msg.groupJid))) return [];
  if (DEACTIVATE.includes(norm)) {
    if (!manager) return [text('Só um admin do bot pode desativar o jogo neste grupo.')];
    await store.setGroupActive(msg.groupJid, msg.groupName, false, msg.senderJid);
    const back = (await isImpostorOnly(store, msg.groupJid)) ? '*ativar impostor* (ou *ativar jogos* para todos os jogos)' : '*ativar jogos*';
    return [text(`Bot desativado neste grupo. Para voltar, mande ${back}.`)];
  }

  // Grupo só de Impostor: ajuda e temas próprios; os outros jogos não abrem.
  const onlyImpostor = await impostorOnlyFor(store, msg.groupJid, norm);
  if (onlyImpostor) {
    if (HELP_WORDS.includes(norm) || norm === 'ajuda texto') return [text(IMPOSTOR_GROUP_HELP)];
    if (norm === 'modos' || norm === 'temas') return [text(impostorThemesText('', true))];
    if (LIGAS_COMMAND.test(norm)) return [text('Neste grupo só o *Impostor* está ativo; as ligas são dos temas de futebol. O admin libera os outros jogos com *ativar jogos*.')];
    const other = parsePartyStart(norm);
    if ((other && other.game !== 'impostor') || parseStart(norm)) {
      return [text('Neste grupo só o *Impostor* está ativo. Mande *abrir impostor* (ou *ajuda*). O admin libera os outros jogos com *ativar jogos*.')];
    }
    if (norm === 'regras') {
      const open = await store.getActiveMatch(msg.groupJid);
      if (!open || !isParty(open.state)) return [text(['🕵️ *Regras do Impostor*', ...IMPOSTOR_RULES.map((r) => `• ${r}`)].join('\n'))];
    }
  }
  if (HELP_WORDS.includes(norm)) {
    return [{ type: 'image', image: { kind: 'help' }, caption: 'Mande o comando do jogo. Dúvida sobre um jogo? Abra a sala e mande *regras*.' }];
  }
  if (norm === 'ajuda texto') return [text(HELP)];
  if (NEWS_COMMAND.test(norm)) {
    const latest = latestNewsFor(onlyImpostor);
    const card = latest ? newsOutgoing(latest, onlyImpostor) : null;
    return card ? [card] : [text('Sem novidades por enquanto.')];
  }
  if (norm === 'modos' || norm === 'temas') return [{ type: 'image', image: { kind: 'modes' } }];
  if (LIGAS_COMMAND.test(norm)) return [ligasOutgoing()];
  if (/^temas (do |de )?anagramas?$/.test(norm) || /^anagramas? temas$/.test(norm)) return [text(anagramThemesText())];
  if (/^temas (do |de )?impostor$/.test(norm)) return [text(impostorThemesText('', onlyImpostor))];
  // "ranking": do 1º ao 10º. "ranking b": do 11º ao 20º.
  const rankingB = /^ranking (b|2|parte 2|(do |de )?11 a(o)? 20)$/.test(norm);
  if (norm === 'ranking' || rankingB) {
    const [all, season] = await Promise.all([store.getRanking(msg.groupJid, 20), store.getSeason(msg.groupJid)]);
    if (all.length === 0) return [text(`Ainda não há partidas finalizadas na *Temporada ${season.season}*.`)];
    const base = { kind: 'ranking' as const, groupName: msg.groupName ?? 'Grupo', season: season.season, since: shortDay(season.startedAt) };
    if (!rankingB) return [{ type: 'image', image: { ...base, rows: all.slice(0, 10), more: all.length > 10 } }];
    if (all.length <= 10) {
      return [text(`O *ranking B* mostra do 11º ao 20º, e a *Temporada ${season.season}* tem ${all.length} jogador${all.length === 1 ? '' : 'es'} no ranking. Mande *ranking* para ver a tabela.`)];
    }
    return [{ type: 'image', image: { ...base, rows: all.slice(10, 20), start: 11 } }];
  }
  if (/^(campeoes|temporadas|hall da fama|historico de campeoes)$/.test(norm)) return [text(await championsText(store, msg.groupJid))];
  if (SIM_COMMAND.test(norm)) return [text(simulatorText(await (deps.brasileirao ?? (async () => SNAPSHOT_2026))(), siteUrl()))];

  // ----- Comandos do admin -----
  if (/^(virada de temporada|virar (a )?temporada|fim de temporada|fechar (a )?temporada|encerrar (a )?temporada|nova temporada)$/.test(norm)) {
    if (!manager) return [text('Só o admin do bot faz a virada de temporada.')];
    return seasonTurnover(store, msg.groupJid, msg.groupName, now);
  }
  // Bloqueio do "próxima": o admin marca (@), responde a mensagem da pessoa ou digita o número.
  const nextCmd = norm.match(/^(bloquear|tirar|proibir|desativar|liberar|desbloquear|devolver|ativar) (o |a )?(proxima|proximo)\b/);
  if (nextCmd) {
    if (!manager) return [text('Só o admin do bot mexe em quem pode usar o *próxima*.')];
    const targets = targetsOf(msg);
    if (!targets.length) {
      return [text('Marque a pessoa (@), responda a uma mensagem dela ou digite o número. Ex.: *bloquear próxima @fulano* · *liberar próxima @fulano*.')];
    }
    const block = ['bloquear', 'tirar', 'proibir', 'desativar'].includes(nextCmd[1]);
    if (block) await store.markSeen(msg.groupJid, NEXT_BLOCK_KIND, targets);
    else await store.unmarkSeen(msg.groupJid, NEXT_BLOCK_KIND, targets);
    const names = (await blockedNames(store, msg.groupJid, targets)).join(', ');
    return [
      text(
        block
          ? `🚫 *Próxima* bloqueado para: ${names}. Só o admin libera (*liberar próxima @pessoa*).`
          : `✅ *Próxima* liberado de novo para: ${names}.`,
      ),
    ];
  }
  if (/^(bloqueados|quem nao pode (usar )?(o |a )?proxima|sem proxima|bloqueados (da |do )?proxima)$/.test(norm)) {
    const blocked = await store.getSeen(msg.groupJid, NEXT_BLOCK_KIND);
    if (!blocked.length) return [text('Ninguém está bloqueado: todo mundo pode usar o *próxima*.')];
    return [text(`🚫 Sem *próxima*: ${(await blockedNames(store, msg.groupJid, blocked)).join(', ')}.`)];
  }
  if (/^(resetar|liberar|zerar|reabrir|reset) (o )?(top ?)?100( do dia)?$/.test(norm)) {
    if (!manager) return [text('Só o admin do bot libera o Top 100 de novo.')];
    const open = await store.getActiveMatch(msg.groupJid);
    if (open && (open.state as { game?: string }).game === 'top100') return [text('Tem um *Top 100* rolando. Mande *encerrar* antes de liberar de novo.')];
    const day = dayKey(now);
    await store.unmarkSeen(msg.groupJid, 'top100', [playedTodayKey(day)]);
    await store.markSeen(msg.groupJid, 'top100', [resetTodayKey(day)]);
    return [text('✅ *Top 100* liberado: o grupo pode jogar mais uma vez hoje (mande *top 100*). Vem uma lista que vocês ainda não jogaram.')];
  }

  // ----- Dados à mão (F1) -----
  if (norm.startsWith('ficha ')) {
    const asked = msg.text.trim().slice(6).trim();
    const records = await findRecords(store, asked, 3);
    if (!records.length) return looksLikePlayerName(asked) ? [text(`Não achei "${asked}" na base.`)] : [];
    const extra = records.length > 1 ? `\n\nOutros com esse nome: ${records.slice(1).map((r) => `${r.name} (${r.birthDate?.slice(0, 4) ?? '?'}, ${r.id.startsWith('ai:') ? 'IA' : r.id})`).join('; ')}` : '';
    return [text(formatCard(records[0]) + extra)];
  }
  if (norm.startsWith('corrigir ')) {
    if (!manager) return [text('Só o admin do bot corrige dados.')];
    const clubCmd = parseClubCorrection(norm);
    if (clubCmd) return [text(await applyClubCorrection(store, clubCmd, now.toISOString().slice(0, 10)))];
    const cmd = parseCorrection(norm);
    if (!cmd) return [text('Formato: *corrigir <jogador> <dado> <valor>*. Ex.: corrigir Rogério Ceni gols 131. Dados: gols, jogos, assistências, valor atual, valor máximo, títulos, gols seleção, jogos seleção, gols copa, copas, gols champions, gols libertadores, gols brasileirão, altura, estreia.\nPassagem que falta: *corrigir <jogador> clube <clube> fonte <fonte>*. Ex.: corrigir Fábio clube Fluminense fonte ge.')];
    return [text(await applyCorrection(store, cmd, now.toISOString().slice(0, 10)))];
  }
  if (norm.startsWith('nome famoso ')) {
    if (!manager) return [text('Só o admin do bot cadastra nomes famosos.')];
    const cmd = parseFamousName(msg.text);
    if (!cmd) return [text('Formato: *nome famoso <apelido> = <jogador>*. Ex.: nome famoso Gabigol = Gabriel Barbosa.')];
    return [text(await applyFamousName(store, cmd))];
  }

  const session = await store.getActiveMatch(msg.groupJid);
  const partyDeps = {
    store,
    lookup: deps.lookup,
    now,
    rng,
    isAdmin: (jid: string) => deps.canManageGroup?.(jid) ?? false,
    judge: deps.judge,
    checkWords: deps.checkWords,
    checkFact: deps.checkFact,
  };

  // ----- Modo em Grupo (salas) -----
  if (session && isParty(session.state)) {
    if (isPartyStale(session.state, nowMs)) {
      session.state.status = 'CANCELLED';
      await store.saveMatch(session);
    } else {
      if (parseStart(norm) || parsePartyStart(norm)) {
        return [text('Já existe uma sala em andamento neste grupo. Esperem terminar ou o anfitrião manda *encerrar*.')];
      }
      const out = await handlePartyMessage(msg, session, partyDeps);
      await recordPartyIfFinished(session, store);
      return out;
    }
  }
  const partyStart = parsePartyStart(norm);
  if (partyStart) {
    if (session && !isParty(session.state) && !isStale(session.state, nowMs)) {
      return [text('Já existe uma partida em andamento neste grupo. Esperem terminar ou mandem *cancelar*.')];
    }
    if (session && !isParty(session.state)) {
      session.state.status = 'CANCELLED';
      await store.saveMatch(session);
    }
    return createParty(msg, partyStart, partyDeps);
  }

  // ----- 1 x 1 -----
  let match = session && !isParty(session.state) ? (session as Match) : null;
  if (norm === 'regras') return [text(RULES)];

  // Partida abandonada: encerra para liberar o grupo.
  if (match && isStale(match.state, nowMs)) {
    match.state.status = 'CANCELLED';
    await store.saveMatch(match);
    match = null;
  }

  const start = parseStart(norm);
  if (start) {
    if (match) {
      return [text('Já existe uma partida em andamento neste grupo. Esperem terminar ou mandem *cancelar*.')];
    }
    const lobby = newLobby(sender, nowMs);
    if (start.random) lobby.options = { autoRandom: true };
    const created = await store.createMatch(msg.groupJid, lobby);
    if (!created) return [];
    return [
      {
        type: 'image',
        image: { kind: 'challenge', host: sender.name },
        caption: start.random
          ? `*${sender.name}* quer jogo com tema surpresa 🎲. O primeiro que mandar *aceitar* entra em campo.`
          : `*${sender.name}* quer jogo. O primeiro que mandar *aceitar* entra em campo.`,
      },
    ];
  }

  if (!match) return [];
  const state = match.state;
  const mode = getMode(state.modeId);
  const side = sideOf(state, msg.senderJid);

  const save = async (out: Outgoing[]): Promise<Outgoing[]> => {
    state.updatedAt = nowMs;
    if (!(await store.saveMatch(match!))) throw new ConflictError();
    return out;
  };

  if (norm === 'cancelar' || norm === 'desistir') {
    if (side === null) return [];
    state.status = 'CANCELLED';
    clearTimer(state);
    if (state.players[1] && mode && state.picks.some((p) => p.some(Boolean))) {
      // Desistir com a bola rolando conta como derrota (W.O.).
      state.winner = (1 - side) as Side;
      const saved = await save([text(`*${sender.name}* desistiu. Vitória de *${state.players[state.winner]!.name}* por W.O.`)]);
      if (saved.length) await store.recordResult(msg.groupJid, state.players as [MatchPlayer, MatchPlayer], state.winner);
      return saved;
    }
    return save([text('Partida cancelada.')]);
  }

  /** Tema sorteado no 1x1: prioriza o que o grupo ainda não jogou (e grava no histórico). */
  const freshMode = async (league?: Twists['league']): Promise<GameMode> => {
    const seen = await store.getSeen(msg.groupJid, '1x1-tema').catch(() => [] as string[]);
    // Com liga ("aleatório brasileirão"), só os temas de clube em que ela vale.
    const pool = league ? MODES.filter((m) => leagueFits(m, league)) : MODES;
    const mode = (seen.length ? freshPick(pool, (m) => `modo:${m.id}`, 1, rng, seen)[0] : undefined) ?? randomMode(rng, league);
    await store.markSeen(msg.groupJid, '1x1-tema', [`modo:${mode.id}`]).catch(() => undefined);
    return mode;
  };

  /** Sorteia restrições, liga os extras e manda a imagem de abertura. */
  const kickoff = async (chosen: GameMode, twists: Twists, random: boolean, lead = ''): Promise<Outgoing[]> => {
    if (random) chosen = await freshMode(twists.league);
    state.modeId = chosen.id;
    state.options = {
      blind: twists.blind,
      turnSeconds: twists.fast ? FAST_TURN_SECONDS : TURN_SECONDS,
      hard: twists.hard,
      ...(twists.league ? { league: twists.league } : {}),
    };
    state.restrictions = drawRestrictions(chosen, rng, twists.hard, twists.league);
    state.status = 'PLAYING';
    state.round = 0;
    state.turn = roundStarter(0);
    state.turnStartedAt = nowMs;
    const label = random ? `🎲 Tema sorteado: *${chosen.name}*` : `Tema: *${chosen.name}*`;
    return save([
      {
        type: 'image',
        image: { kind: 'kickoff', state: structuredClone(state) },
        caption: `${lead}${label}${twistLabel(state)}. Bola rolando!`,
      },
      text(turnPrompt(state)),
      scheduleTurn(state, nowMs),
    ]);
  };

  if (state.status === 'LOBBY') {
    if (norm !== 'aceitar') return [];
    if (side === 0) return [text('Você não pode aceitar o próprio desafio. Chama alguém.')];
    state.players[1] = sender;
    if (state.options?.autoRandom) {
      return kickoff(randomMode(rng), { blind: false, fast: false, hard: false }, true, `*${sender.name}* aceitou.\n`);
    }
    state.status = 'MODE_SELECT';
    return save([
      {
        type: 'image',
        image: { kind: 'modes' },
        caption: `*${sender.name}* aceitou.\n*${state.players[0].name}*, escolha o tema: mande o *número* (1 a ${MODES.length}) ou *aleatório*. Extras: *3 cego*, *5 relâmpago*, *1 brasileirão* (só clubes de uma liga: também *premier*, *la liga*, *série a*, *bundesliga*, *ligue 1*, *argentino*).`,
      },
    ]);
  }

  if (state.status === 'MODE_SELECT') {
    if (side !== 0) return [];
    const parsed = parseModeChoice(norm, rng);
    if (!parsed) return [];
    return kickoff(parsed.mode, parsed.twists, parsed.random, ignoredLeagueNote(parsed));
  }

  if (state.status !== 'PLAYING' || !mode) return [];

  // Prazo vencido sem o agendador ter chegado: cobra antes de qualquer coisa.
  if (state.deadline && nowMs >= state.deadline + 2000) {
    const out = await save(duelTimeout(state, mode, nowMs));
    if (isFinished(state) && state.winner !== null) {
      await store.recordResult(msg.groupJid, state.players as [MatchPlayer, MatchPlayer], state.winner);
    }
    return out;
  }

  if (norm === 'placar') {
    const head = isBlind(state) ? 'Modo cego: os números aparecem no apito final.' : scoreLine(state, mode);
    return [{ type: 'image', image: { kind: 'pitch', state }, caption: `${head}\n\n${turnPrompt(state)}` }];
  }

  if (norm === 'tempo') {
    if (side === null || side === state.turn) return [];
    const elapsed = Math.floor((nowMs - state.turnStartedAt) / 1000);
    const limit = turnSeconds(state);
    if (elapsed < limit) {
      return [text(`Calma, *${state.players[state.turn]!.name}* ainda tem ${limit - elapsed}s.`)];
    }
    const out = await save(duelTimeout(state, mode, nowMs));
    if (isFinished(state) && state.winner !== null) {
      await store.recordResult(msg.groupJid, state.players as [MatchPlayer, MatchPlayer], state.winner);
    }
    return out;
  }

  // A partir daqui, só interessa a mensagem de um dos dois jogadores que pareça um nome.
  // Quem está de fora nunca escala; mensagens dele são ignoradas até o fim do jogo.
  if (side === null || !looksLikePlayerName(msg.text)) return [];

  // Fora da vez: a jogada não vale. Avisa uma única vez por vez, sem gastar IA.
  if (side !== state.turn) {
    if (state.nudgedAt === state.turnStartedAt) return [];
    state.nudgedAt = state.turnStartedAt;
    const who = state.players[state.turn]!.name;
    const slot = POSITION_LABEL[SLOTS[state.round]];
    return save([
      text(`Segura, *${sender.name}*: agora é a vez de *${who}* escolher o ${slot}. Sua jogada só vale na sua vez.`),
    ]);
  }

  const slot = SLOTS[state.round];
  let profile;
  try {
    profile = await deps.lookup(msg.text.trim(), playContext(slot, state.restrictions[state.round], mode.metric));
  } catch (error) {
    console.error('lookup failed', error);
    return [text('A consulta falhou por um instante. Mande o nome de novo.')];
  }
  const retry = `A vez continua com *${sender.name}*.`;
  /**
   * Escolha errada gasta 1 das 3 tentativas da vez (contra "mandar nome
   * aleatório até passar"). Na 3ª, a vez acaba com o pior valor do tema.
   */
  const wrong = async (reason: string): Promise<Outgoing[]> => {
    const key = `${state.round}:${side}`;
    const n = state.tries?.key === key ? state.tries.n + 1 : 1;
    state.tries = { key, n };
    if (n < PICK_TRIES) return save([text(`❌ ${reason} Tentativa ${n}/${PICK_TRIES}. ${retry}`)]);
    const step = applyPick(state, side, { name: 'Sem acerto', key: `erros-${state.round}-${side}`, value: mode.penalty }, nowMs);
    return advance(
      `❌ ${reason}\n🚫 *${sender.name}* errou ${PICK_TRIES} vezes e ficou com o pior valor do tema nesta posição (*${formatNumber(mode.penalty)} ${mode.unit}*).`,
      step,
    );
  };
  if (!profile) {
    return wrong(`Não encontrei nenhum jogador chamado "${msg.text.trim()}".`);
  }
  // Cada jogador real só pode ser usado UMA vez na partida, por qualquer um dos dois,
  // em qualquer rodada e por qualquer clube (ex.: Alexis no Arsenal bloqueia Alexis no United).
  const key = normalize(profile.name);
  const typed = normalize(msg.text);
  const used = findUsed(state, [key, typed]);
  if (used) {
    const by = used.side === side ? 'por você' : `por *${state.players[used.side]!.name}*`;
    return wrong(`*${profile.name}* já foi escalado nesta partida (${by}). Respostas repetidas não valem, nem por outro time.`);
  }
  if (!profile.positions.includes(slot)) {
    const actual = profile.positions.map((p) => POSITION_LABEL[p]).join('/');
    return wrong(`*${profile.name}* é ${actual}, e esta rodada pede um ${POSITION_LABEL[slot]}.`);
  }
  const restriction = state.restrictions[state.round];
  const team = getTeam(restriction.teamId);
  const club = team && restriction.kind === 'club' ? clubVerdict(profile, team) : null;
  // Sem fonte para conferir (ficha só da IA): avisa e não gasta tentativa.
  if (club?.kind === 'data') return [text(`❌ ${club.reason}`)];
  if (club) return wrong(club.reason);
  if (team && restriction.kind === 'country' && !isFromNation(team, profile.nationality)) {
    return wrong(`*${profile.name}* não é da seleção *${team.name}*${profile.nationality ? ` (é de ${profile.nationality})` : ''}.`);
  }
  const value = metricValue(profile, mode.metric, now);
  if (value === null) {
    return [text(`❌ Não tenho um dado confiável de ${mode.tagline.split(' · ')[0].toLowerCase()} para *${profile.name}*. Escolha outro. ${retry}`)];
  }

  if (state.misses) state.misses[side] = 0;
  const step = applyPick(state, side, { name: profile.name, key, value, ...(typed !== key ? { aliases: [typed] } : {}) }, nowMs);
  const confirmed = isBlind(state)
    ? `✅ *${profile.name}* escalado. O número fica em segredo até o fim.`
    : `✅ *${profile.name}* — *${formatNumber(value)} ${mode.unit}*`;
  return advance(confirmed, step);

  /** Responde a uma escolha: mensagens + prazo da próxima vez; no fim, grava o resultado. */
  async function advance(lead: string, step: Step): Promise<Outgoing[]> {
    const saved = await save(duelAdvance(state, mode!, lead, step, nowMs));
    if (step === 'match-done' && saved.length && state.winner !== null) {
      await store.recordResult(msg.groupJid, state.players as [MatchPlayer, MatchPlayer], state.winner);
    }
    return saved;
  }
}

export type { Match };

