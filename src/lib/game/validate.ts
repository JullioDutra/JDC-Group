import { GameMode, metricValue } from './modes';
import { NATIONS, clubsIn, drawLeagueTeams, drawTeams, getTeam, isFromNation, playedForClub, type LeagueId, type Team } from './teams';
import { MetricKey, PlayerProfile, POSITION_LABEL, Position, Restriction, SLOTS } from './types';
import type { LookupContext } from '../players/types';

/**
 * Regras de escalação compartilhadas pelo 1 x 1 e pela Escalação em Grupo:
 * posição, clube/seleção sorteados e dado confiável no tema.
 */
/** `kind`: o que deu errado; 'data' (falta o número do tema) não é culpa de quem jogou e não gasta tentativa. */
export type Verdict = { ok: true; value: number } | { ok: false; reason: string; kind: 'position' | 'club' | 'country' | 'data' };

/** Tentativas por vez: nome inexistente, repetido, posição ou clube/seleção errados gastam uma. */
export const PICK_TRIES = 3;

/** "Clubes: Vélez, Porto, Valencia..." para a recusa: todo mundo vê por onde o jogador passou. */
export function clubsNote(clubs: string[], max = 7): string {
  if (!clubs.length) return '';
  return ` Clubes: ${clubs.slice(0, max).join(', ')}${clubs.length > max ? '…' : ''}.`;
}

/**
 * Passagem pelo clube da rodada. Ficha sem fonte (só a IA) não prova a
 * passagem: recusa sem gastar tentativa ('data'), porque a culpa não é de quem
 * jogou; se nem a IA põe o jogador no clube, aí é erro mesmo ('club').
 */
export function clubVerdict(profile: PlayerProfile, team: Team): Extract<Verdict, { ok: false }> | null {
  const played = playedForClub(team, profile.clubs);
  if (profile.clubsUnverified) {
    if (played) {
      return {
        ok: false,
        kind: 'data',
        reason: `Não achei a carreira de *${profile.name}* no Wikidata nem na Wikipédia, então não dá para confirmar a passagem pelo *${team.name}*. Manda outro (não gasta tentativa).`,
      };
    }
    return { ok: false, kind: 'club', reason: `*${profile.name}* não tem passagem confirmada pelo *${team.name}*.` };
  }
  return played ? null : { ok: false, kind: 'club', reason: `*${profile.name}* não tem passagem pelo *${team.name}*.${clubsNote(profile.clubs)}` };
}

export function checkPick(
  profile: PlayerProfile,
  slot: Position,
  restriction: Restriction | undefined,
  mode: GameMode,
  now: Date,
): Verdict {
  if (!profile.positions.includes(slot)) {
    const actual = profile.positions.map((p) => POSITION_LABEL[p]).join('/');
    return { ok: false, kind: 'position', reason: `*${profile.name}* é ${actual}, e esta rodada pede um ${POSITION_LABEL[slot]}.` };
  }
  const team = getTeam(restriction?.teamId);
  const club = team && restriction?.kind === 'club' ? clubVerdict(profile, team) : null;
  if (club) return club;
  if (team && restriction?.kind === 'country' && !isFromNation(team, profile.nationality)) {
    return { ok: false, kind: 'country', reason: `*${profile.name}* não é da seleção *${team.name}*${profile.nationality ? ` (é de ${profile.nationality})` : ''}.` };
  }
  const value = metricValue(profile, mode.metric, now);
  if (value === null) {
    return { ok: false, kind: 'data', reason: `Não tenho um dado confiável de ${mode.tagline.split(' · ')[0].toLowerCase()} para *${profile.name}*.` };
  }
  return { ok: true, value };
}

/**
 * `hard` (extra "difícil") inclui clubes/seleções de nível 2 no sorteio.
 * `league` (extra "brasileirão", "premier"...): só clubes da liga, misturando
 * gigantes, médios e raiz (o "difícil" puxa mais para a raiz).
 */
export function drawRestrictions(mode: GameMode, rng: () => number, hard = false, league?: LeagueId): Restriction[] {
  // Nenhum tema do jogo usa "livre" (teste garante); 'none' fica só para os testes do motor.
  if (mode.restriction === 'none') return SLOTS.map(() => ({ kind: 'none' }));
  const kind = mode.restriction;
  if (league && kind === 'club') return drawLeagueTeams(league, SLOTS.length, rng, hard).map((t) => ({ kind, teamId: t.id }));
  const pool = kind === 'club' ? clubsIn(mode.region) : NATIONS;
  return drawTeams(pool, SLOTS.length, rng, hard ? 2 : 1).map((t) => ({ kind, teamId: t.id }));
}

export function restrictionLine(restriction: Restriction | undefined): string {
  const team = getTeam(restriction?.teamId);
  if (!team) return '';
  return restriction?.kind === 'club' ? `Clube da rodada: *${team.name}*\n` : `Seleção da rodada: *${team.name}*\n`;
}

/**
 * Contexto da jogada para a busca de jogadores: posição, clube/seleção da
 * rodada e o número que o tema pede. Resolve homônimos ("Victor" + goleiro +
 * Atlético-MG) e completa o dado do tema.
 */
export function playContext(
  position: Position | null | undefined,
  restriction?: { kind: string; teamId?: string; value?: string },
  metric?: MetricKey,
): LookupContext {
  const teamId = restriction?.teamId ?? restriction?.value;
  const kind = restriction?.kind === 'club' ? 'club' : restriction?.kind === 'country' || restriction?.kind === 'nation' ? 'country' : undefined;
  return { position: position ?? null, ...(kind && teamId ? { kind, teamId } : {}), ...(metric ? { metric } : {}) };
}
