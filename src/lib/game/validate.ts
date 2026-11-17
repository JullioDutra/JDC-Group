import { GameMode, metricValue } from './modes';
import { CLUBS, NATIONS, clubsIn, drawTeams, getTeam, isFromNation, playedForClub } from './teams';
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

/** Contexto da jogada para a IA desambiguar nomes: "goleiro que jogou no Atlético-MG". */
export function lookupHint(position: Position | null | undefined, restriction?: Restriction | { kind: string; teamId?: string; value?: string }): string | undefined {
  const pos = position ? POSITION_LABEL[position] : 'jogador';
  const teamId = (restriction as { teamId?: string; value?: string } | undefined)?.teamId ?? (restriction as { value?: string } | undefined)?.value;
  const team = getTeam(teamId);
  if (!team) return position ? pos : undefined;
  if (restriction?.kind === 'club') return `${pos} que jogou no ${team.name}`;
  if (restriction?.kind === 'country' || restriction?.kind === 'nation') return `${pos} da seleção ${team.name === 'Brasil' ? 'brasileira' : `de ${team.name}`}`;
  return pos;
}
