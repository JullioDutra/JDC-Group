import type { PlayerLookup } from '../ai';
import type { Store } from '../store/types';
import { FAST_TURN_SECONDS, GameMode, MODES, Twists, getMode, isRandomWord, metricValue, parseModeChoice, randomMode } from './modes';
import { CLUBS, NATIONS, drawDistinct, getTeam, isFromNation, playedForClub } from './teams';
import { firstName, formatNumber, looksLikePlayerName, normalize } from './text';
import {
  IncomingMessage,
  Match,
  MatchPlayer,
  MatchState,
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
   * Quem pode mandar "ativar grupo"/"desativar grupo". Sem a função, qualquer
   * pessoa pode (simulador e testes). Em produção vem de ADMIN_NUMBERS.
   */
  canManageGroup?: (senderJid: string) => boolean;
}

/** Outra mensagem alterou a partida no meio do processamento. */
class ConflictError extends Error {}

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

const HELP = [
  `⚽ *${GAME_NAME}* — comandos`,
  '',
  '• *iniciar jogo* — lança um desafio no grupo',
  '• *iniciar aleatório* — desafio com tema sorteado (ótimo para quem está começando)',
  '• *aceitar* — entra como adversário',
  '• *regras* — como funciona',
  '• *modos* — lista os temas',
  '• *placar* — campinho da partida atual',
  '• *ranking* — tabela do grupo',
  `• *tempo* — cobra o adversário que estourou o tempo da jogada`,
  '• *cancelar* — desiste/encerra a partida',
  '• *desativar grupo* — o bot para de ler este grupo',
].join('\n');

const RULES = [
  `📋 *Como se joga ${GAME_NAME}*`,
  '',
  '1. Alguém manda *iniciar jogo*. O primeiro que responder *aceitar* é o adversário.',
  '2. O anfitrião escolhe o tema (ou manda *aleatório* para sortear; com *iniciar aleatório* o sorteio é automático). Temas: gols, assistências, valor de mercado, idade... Extras: some *cego* (números escondidos até o fim) ou *relâmpago* (45s por jogada). Ex.: *3 cego*.',
  '3. São 6 rodadas, uma por posição: goleiro, 2 defensores, 2 meias e 1 atacante.',
  '4. Um de cada vez: só depois que os dois escolhem o goleiro a rodada dos defensores é liberada, e assim por diante. Na sua vez, mande só o *nome do jogador*. A IA confere se ele existe, se joga na posição e informa o número dele no tema.',
  '5. Jogador inválido não passa a vez: você tenta de novo. Ninguém pode repetir um jogador já escalado.',
  '6. Só os dois jogadores da partida podem escalar; mensagens de quem está de fora são ignoradas até o fim do jogo.',
  '7. No fim, somam-se os números dos 6 escalados. Dependendo do tema, vence a maior ou a menor soma.',
].join('\n');

function restrictionLine(restriction: Restriction): string {
  const team = getTeam(restriction.teamId);
  if (!team) return '';
  return restriction.kind === 'club' ? `🏟️ Clube da rodada: *${team.name}*\n` : `🌎 Seleção da rodada: *${team.name}*\n`;
}

function turnPrompt(state: MatchState): string {
  const slot = SLOTS[state.round];
  const player = state.players[state.turn]!;
  return (
    `*Rodada ${state.round + 1}/${SLOTS.length} · ${POSITION_LABEL[slot].toUpperCase()}*\n` +
    restrictionLine(state.restrictions[state.round]) +
    `👉 *${player.name}*, mande o nome do seu ${POSITION_LABEL[slot]}.`
  );
}

function twistLabel(state: MatchState): string {
  const parts = [];
  if (state.options?.blind) parts.push('às cegas 🙈');
  if (turnSeconds(state) !== TURN_SECONDS) parts.push(`relâmpago ${turnSeconds(state)}s ⚡`);
  return parts.length ? ` (${parts.join(', ')})` : '';
}

function scoreLine(state: MatchState, mode: GameMode): string {
  const [a, b] = totals(state);
  return `📊 ${firstName(state.players[0].name)} *${formatNumber(a)}* x *${formatNumber(b)}* ${firstName(state.players[1]!.name)} (${mode.unit})`;
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

function drawRestrictions(mode: GameMode, rng: () => number): Restriction[] {
  if (mode.restriction === 'none') return SLOTS.map(() => ({ kind: 'none' }));
  const pool = mode.restriction === 'club' ? CLUBS : NATIONS;
  return drawDistinct(pool, SLOTS.length, rng).map((t) => ({ kind: mode.restriction, teamId: t.id }));
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
      return await handleOnce(msg, deps);
    } catch (error) {
      if (!(error instanceof ConflictError)) throw error;
    }
  }
  return [];
}

async function handleOnce(msg: IncomingMessage, deps: EngineDeps): Promise<Outgoing[]> {
  const { store } = deps;
  const now = (deps.now ?? (() => new Date()))();
  const nowMs = now.getTime();
  const rng = deps.rng ?? Math.random;
  const norm = normalize(msg.text);
  const sender: MatchPlayer = { jid: msg.senderJid, name: msg.senderName };

  const manager = deps.canManageGroup?.(msg.senderJid) ?? true;

  // O bot só "enxerga" grupos ativados; em qualquer outro, tudo é ignorado.
  if (norm === 'ativar grupo') {
    if (!manager) return [];
    await store.setGroupActive(msg.groupJid, msg.groupName, true, msg.senderJid);
    return [text(`✅ *${GAME_NAME}* ativado neste grupo!\nMande *iniciar jogo* para desafiar alguém ou *ajuda* para ver os comandos.`)];
  }
  if (!(await store.isGroupActive(msg.groupJid))) return [];
  if (norm === 'desativar grupo') {
    if (!manager) return [text('🔒 Só um admin do bot pode desativar o jogo neste grupo.')];
    await store.setGroupActive(msg.groupJid, msg.groupName, false, msg.senderJid);
    return [text('👋 Bot desativado neste grupo. Para voltar, mande *ativar grupo*.')];
  }

  if (norm === 'ajuda' || norm === 'menu' || norm === 'comandos') return [text(HELP)];
  if (norm === 'regras') return [text(RULES)];
  if (norm === 'modos' || norm === 'temas') return [{ type: 'image', image: { kind: 'modes' } }];
  if (norm === 'ranking') {
    const rows = await store.getRanking(msg.groupJid, 10);
    if (rows.length === 0) return [text('📉 Ainda não há partidas finalizadas neste grupo.')];
    return [{ type: 'image', image: { kind: 'ranking', groupName: msg.groupName ?? 'Grupo', rows } }];
  }

  let match = await store.getActiveMatch(msg.groupJid);

  // Partida abandonada: encerra para liberar o grupo.
  if (match && isStale(match.state, nowMs)) {
    match.state.status = 'CANCELLED';
    await store.saveMatch(match);
    match = null;
  }

  const start = parseStart(norm);
  if (start) {
    if (match) {
      return [text('⏳ Já existe uma partida em andamento neste grupo. Esperem terminar ou mandem *cancelar*.')];
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
          ? `🔥 *${sender.name}* quer jogo com *tema surpresa* 🎲! O primeiro que mandar *aceitar* entra em campo.`
          : `🔥 *${sender.name}* quer jogo! O primeiro que mandar *aceitar* entra em campo.`,
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
    if (state.players[1] && mode && state.picks.some((p) => p.some(Boolean))) {
      // Desistir com a bola rolando conta como derrota (W.O.).
      state.winner = (1 - side) as Side;
      const saved = await save([text(`🏳️ *${sender.name}* desistiu. Vitória de *${state.players[state.winner]!.name}* por W.O.`)]);
      if (saved.length) await store.recordResult(msg.groupJid, state.players as [MatchPlayer, MatchPlayer], state.winner);
      return saved;
    }
    return save([text('🚫 Partida cancelada.')]);
  }

  /** Sorteia restrições, liga os extras e manda a imagem de abertura. */
  const kickoff = (chosen: GameMode, twists: Twists, random: boolean, lead = ''): Promise<Outgoing[]> => {
    state.modeId = chosen.id;
    state.options = {
      blind: twists.blind,
      turnSeconds: twists.fast ? FAST_TURN_SECONDS : TURN_SECONDS,
    };
    state.restrictions = drawRestrictions(chosen, rng);
    state.status = 'PLAYING';
    state.round = 0;
    state.turn = roundStarter(0);
    state.turnStartedAt = nowMs;
    const label = random ? `🎲 Tema sorteado: *${chosen.name}*` : `🎬 Tema: *${chosen.name}*`;
    return save([
      {
        type: 'image',
        image: { kind: 'kickoff', state: structuredClone(state) },
        caption: `${lead}${label}${twistLabel(state)}. Bola rolando!`,
      },
      text(turnPrompt(state)),
    ]);
  };

  if (state.status === 'LOBBY') {
    if (norm !== 'aceitar') return [];
    if (side === 0) return [text('😅 Você não pode aceitar o próprio desafio. Chama alguém!')];
    state.players[1] = sender;
    if (state.options?.autoRandom) {
      return kickoff(randomMode(rng), { blind: false, fast: false }, true, `🤝 *${sender.name}* aceitou!\n`);
    }
    state.status = 'MODE_SELECT';
    return save([
      {
        type: 'image',
        image: { kind: 'modes' },
        caption: `🤝 *${sender.name}* aceitou!\n*${state.players[0].name}*, escolha o tema: mande o *número* (1 a ${MODES.length}) ou *aleatório*. Quer tempero? Ex.: *3 cego* ou *5 relâmpago*.`,
      },
    ]);
  }

  if (state.status === 'MODE_SELECT') {
    if (side !== 0) return [];
    const parsed = parseModeChoice(norm, rng);
    if (!parsed) return [];
    return kickoff(parsed.mode, parsed.twists, parsed.random);
  }

  if (state.status !== 'PLAYING' || !mode) return [];

  if (norm === 'placar') {
    const head = isBlind(state) ? '🙈 Modo cego: os números aparecem no apito final.' : scoreLine(state, mode);
    return [{ type: 'image', image: { kind: 'pitch', state }, caption: `${head}\n\n${turnPrompt(state)}` }];
  }

  if (norm === 'tempo') {
    if (side === null || side === state.turn) return [];
    const elapsed = Math.floor((nowMs - state.turnStartedAt) / 1000);
    const limit = turnSeconds(state);
    if (elapsed < limit) {
      return [text(`⏱️ Calma! *${state.players[state.turn]!.name}* ainda tem ${limit - elapsed}s.`)];
    }
    const late = state.players[state.turn]!;
    const step = applyPick(state, state.turn, { name: 'Tempo esgotado', key: `tempo-${state.round}-${state.turn}`, value: mode.penalty }, nowMs);
    const lead = `⏱️ *${late.name}* estourou o tempo e ficou com a pior nota possível nesta posição (*${formatNumber(mode.penalty)} ${mode.unit}*).`;
    return advance(lead, step);
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
      text(`⏳ Segura, *${sender.name}*! Agora é a vez de *${who}* escolher o ${slot}. Sua jogada só vale quando chegar a sua vez.`),
    ]);
  }

  const slot = SLOTS[state.round];
  let profile;
  try {
    profile = await deps.lookup(msg.text.trim());
  } catch (error) {
    console.error('lookup failed', error);
    return [text('⚠️ O VAR caiu por um instante (falha na IA). Mande o nome de novo.')];
  }
  const retry = `A vez continua com *${sender.name}*.`;
  if (!profile) {
    return [text(`❌ Não encontrei nenhum jogador chamado "${msg.text.trim()}". ${retry}`)];
  }
  const key = normalize(profile.name);
  if (state.picks.some((list) => list.some((p) => p?.key === key))) {
    return [text(`❌ *${profile.name}* já foi escalado nesta partida. ${retry}`)];
  }
  if (!profile.positions.includes(slot)) {
    const actual = profile.positions.map((p) => POSITION_LABEL[p]).join('/');
    return [text(`❌ *${profile.name}* é ${actual}, e esta rodada pede um ${POSITION_LABEL[slot]}. ${retry}`)];
  }
  const restriction = state.restrictions[state.round];
  const team = getTeam(restriction.teamId);
  if (team && restriction.kind === 'club' && !playedForClub(team, profile.clubs)) {
    return [text(`❌ *${profile.name}* não tem passagem pelo *${team.name}*. ${retry}`)];
  }
  if (team && restriction.kind === 'country' && !isFromNation(team, profile.nationality)) {
    return [text(`❌ *${profile.name}* não é da seleção *${team.name}*. ${retry}`)];
  }
  const value = metricValue(profile, mode.metric, now);
  if (value === null) {
    return [text(`🤷 Não tenho um dado confiável de ${mode.tagline.split(' · ')[0].toLowerCase()} para *${profile.name}*. Escolha outro. ${retry}`)];
  }

  const step = applyPick(state, side, { name: profile.name, key, value }, nowMs);
  const confirmed = isBlind(state)
    ? `✅ *${profile.name}* escalado! O número fica em segredo até o fim. 🤫`
    : `✅ *${profile.name}* — *${formatNumber(value)} ${mode.unit}*`;
  return advance(confirmed, step);

  /**
   * Responde a uma escolha. No meio da rodada vai só texto (rápido);
   * ao fechar a rodada ou a partida, vai a imagem do campinho.
   */
  async function advance(lead: string, step: Step): Promise<Outgoing[]> {
    if (step === 'same-round') return save([text(`${lead}\n\n${turnPrompt(state)}`)]);
    const image = { kind: 'pitch' as const, state: structuredClone(state) };
    if (step === 'round-done') {
      const head = isBlind(state) ? '🙈 Placar escondido até o apito final.' : scoreLine(state, mode!);
      return save([
        { type: 'image', image, caption: `${lead}\n${head}` },
        text(turnPrompt(state)),
      ]);
    }
    state.winner = leader(state, mode!);
    image.state.winner = state.winner;
    const result =
      state.winner === 'draw'
        ? '🤝 *Empate!* Ninguém leva essa.'
        : `🏆 *${state.players[state.winner]!.name}* venceu o duelo!`;
    const saved = await save([
      {
        type: 'image',
        image,
        caption: `${lead}\n${scoreLine(state, mode!)}\n\n${result}\nMandem *iniciar jogo* para a revanche ou *ranking* para ver a tabela.`,
      },
    ]);
    if (saved.length) {
      await store.recordResult(msg.groupJid, state.players as [MatchPlayer, MatchPlayer], state.winner);
    }
    return saved;
  }
}

export type { Match };
