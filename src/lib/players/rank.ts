import { getTeam, isFromNation, playedForClub } from '../game/teams';
import { normalize } from '../game/text';
import { editDistance } from '../party/common';
import { nameKeys } from './keys';
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

/** Quão parecido o nome do jogador é com o que foi digitado (0 a 1000). */
export function nameScore(record: PlayerRecord, query: string): number {
  const q = normalize(query);
  const names = [record.name, ...record.aliases].map(normalize);
  if (names.includes(q)) return 1000;
  const keys = nameKeys([record.name, ...record.aliases]);
  if (keys.includes(q)) return q.includes(' ') ? 700 : 400;
  // Todas as palavras digitadas estão no nome ("pedro guilherme" → Pedro Guilherme Abreu dos Santos).
  const qTokens = q.split(' ').filter((t) => t.length >= 2);
  if (qTokens.length > 1 && qTokens.every((t) => keys.includes(t))) return 600;
  // Erro de digitação: compara com cada chave.
  const best = Math.min(...keys.map((k) => editDistance(k, q)));
  const tolerance = q.length >= 9 ? 2 : q.length >= 5 ? 1 : 0;
  return best <= tolerance ? 300 - best * 50 : 0;
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

/** O jogador que a IA devolveu tem a ver com o que foi digitado? Evita "digitei X e veio Y". */
export function nameMatchesQuery(query: string, names: string[]): boolean {
  const q = normalize(query);
  if (!q) return false;
  const qTokens = q.split(' ').filter((t) => t.length >= 2);
  for (const raw of names) {
    const n = normalize(raw);
    if (!n) continue;
    if (n === q || n.includes(q) || q.includes(n)) return true;
    const tokens = n.split(' ');
    for (const qt of qTokens) {
      const tol = qt.length >= 7 ? 2 : qt.length >= 4 ? 1 : 0;
      if (tokens.some((t) => t === qt || (tol > 0 && editDistance(t, qt) <= tol))) return true;
    }
  }
  return false;
}
