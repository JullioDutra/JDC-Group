import { GameMode, metricValue } from './modes';
import { CLUBS, NATIONS, clubsIn, drawTeams, getTeam, isFromNation, playedForClub } from './teams';
import { MetricKey, PlayerProfile, POSITION_LABEL, Position, Restriction, SLOTS } from './types';
import type { LookupContext } from '../players/types';

/**
 * Regras de escalação compartilhadas pelo 1 x 1 e pela Escalação em Grupo:
 * posição, clube/seleção sorteados e dado confiável no tema.
 */
export type Verdict = { ok: true; value: number } | { ok: false; reason: string };

export function checkPick(
  profile: PlayerProfile,
  slot: Position,
  restriction: Restriction | undefined,
  mode: GameMode,
  now: Date,
): Verdict {
  if (!profile.positions.includes(slot)) {
    const actual = profile.positions.map((p) => POSITION_LABEL[p]).join('/');
    return { ok: false, reason: `*${profile.name}* é ${actual}, e esta rodada pede um ${POSITION_LABEL[slot]}.` };
  }
  const team = getTeam(restriction?.teamId);
  if (team && restriction?.kind === 'club' && !playedForClub(team, profile.clubs)) {
    return { ok: false, reason: `*${profile.name}* não tem passagem pelo *${team.name}*.` };
  }
  if (team && restriction?.kind === 'country' && !isFromNation(team, profile.nationality)) {
    return { ok: false, reason: `*${profile.name}* não é da seleção *${team.name}*.` };
  }
  const value = metricValue(profile, mode.metric, now);
  if (value === null) {
    return { ok: false, reason: `Não tenho um dado confiável de ${mode.tagline.split(' · ')[0].toLowerCase()} para *${profile.name}*.` };
  }
  return { ok: true, value };
}

/** `hard` (extra "difícil") inclui clubes/seleções de nível 2 no sorteio. */
export function drawRestrictions(mode: GameMode, rng: () => number, hard = false): Restriction[] {
  // Nenhum tema do jogo usa "livre" (teste garante); 'none' fica só para os testes do motor.
  if (mode.restriction === 'none') return SLOTS.map(() => ({ kind: 'none' }));
  const kind = mode.restriction;
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
