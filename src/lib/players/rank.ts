import { getTeam, isFromNation, playedForClub } from '../game/teams';
import { coherenceScore } from './keys';
import type { LookupContext, PlayerRecord } from './types';

export interface Ranked {
  record: PlayerRecord;
  score: number;
  /** Cumpre todo o contexto da jogada (posição + clube/seleção). */
  fits: boolean;
}

/** O jogador cumpre a posição e o clube/seleção da rodada? */
export function fitsContext(record: PlayerRecord, ctx: LookupContext | undefined): { position: boolean; team: boolean } {
  const position = !ctx?.position || record.positions.length === 0 || record.positions.includes(ctx.position);
  const team = getTeam(ctx?.teamId);
  let teamOk = true;
  if (team && ctx?.kind === 'club') teamOk = playedForClub(team, record.clubs);
  if (team && (ctx?.kind === 'country' || ctx?.kind === 'nation')) teamOk = isFromNation(team, record.nationality);
  return { position, team: teamOk };
}

/** O digitado é um nome coerente do jogador? (0 = não vale; ver coherentWith). */
export function nameScore(record: PlayerRecord, query: string): number {
  return coherenceScore(query, [record.name, ...record.aliases]);
}

/**
 * Ordena os candidatos: quem cumpre o contexto vem antes; depois, o nome
 * mais parecido; no empate, o mais famoso (sitelinks).
 */
export function rankCandidates(candidates: PlayerRecord[], query: string, ctx?: LookupContext): Ranked[] {
  const seen = new Set<string>();
  const out: Ranked[] = [];
  for (const record of candidates) {
    if (seen.has(record.id)) continue;
    seen.add(record.id);
    const name = nameScore(record, query);
    if (name === 0) continue;
    const fit = fitsContext(record, ctx);
    const fits = fit.position && fit.team;
    const score = (fit.team ? 4000 : 0) + (fit.position ? 2000 : 0) + name + Math.log1p(record.sitelinks) * 20;
    out.push({ record, score, fits });
  }
  return out.sort((a, b) => b.score - a.score);
}

/** O jogador que a IA devolveu bate, pela regra de nomes, com o que foi digitado? Evita "digitei X e veio Y". */
export function nameMatchesQuery(query: string, names: string[]): boolean {
  return coherenceScore(query, names) > 0;
}
