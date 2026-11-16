import { GameMode, metricValue } from './modes';
import { CLUBS, NATIONS, drawDistinct, getTeam, isFromNation, playedForClub } from './teams';
import { PlayerProfile, POSITION_LABEL, Position, Restriction, SLOTS } from './types';

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

export function drawRestrictions(mode: GameMode, rng: () => number): Restriction[] {
  if (mode.restriction === 'none') return SLOTS.map(() => ({ kind: 'none' }));
  const pool = mode.restriction === 'club' ? CLUBS : NATIONS;
  return drawDistinct(pool, SLOTS.length, rng).map((t) => ({ kind: mode.restriction, teamId: t.id }));
}

export function restrictionLine(restriction: Restriction | undefined): string {
  const team = getTeam(restriction?.teamId);
  if (!team) return '';
  return restriction?.kind === 'club' ? `Clube da rodada: *${team.name}*\n` : `Seleção da rodada: *${team.name}*\n`;
}
