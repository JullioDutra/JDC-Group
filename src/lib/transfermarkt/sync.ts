import { TmBlocked, TmDisallowed, type TmClient } from './client';
import { parseCareerTotals, parseMarketValue, parseTransferClubs } from './parse';
import type { TmPlayer, TmTarget } from './types';

/**
 * Lê um jogador no Transfermarkt (3 pedidos: dados detalhados, histórico de
 * transferências e valor de mercado). O que não vier no formato esperado fica
 * de fora (`missing`); se nada vier, `player` é null. Bloqueio do site
 * (TmBlocked) sobe para o script parar.
 */
export async function readTmPlayer(client: TmClient, t: TmTarget, today: string): Promise<{ player: TmPlayer | null; missing: string[] }> {
  const missing: string[] = [];
  const attempt = async <T>(what: string, run: () => Promise<T | null>): Promise<T | null> => {
    try {
      const out = await run();
      if (out === null) missing.push(what);
      return out;
    } catch (error) {
      if (error instanceof TmBlocked) throw error;
      missing.push(error instanceof TmDisallowed ? `${what} (robots.txt)` : what);
      return null;
    }
  };
  const totals = await attempt('totais da carreira', async () => {
    const html = await client.get(`/-/leistungsdatendetails/spieler/${t.tmId}`);
    return html ? parseCareerTotals(html) : null;
  });
  const clubs = await attempt('clubes', async () => parseTransferClubs(await client.json(`/ceapi/transferHistory/list/${t.tmId}`)));
  const market = await attempt('valor de mercado', async () => parseMarketValue(await client.json(`/ceapi/marketValueDevelopment/graph/${t.tmId}`)));
  if (!totals && !clubs?.length && !market) return { player: null, missing };
  const stats: TmPlayer['stats'] = {};
  if (totals) {
    stats.careerApps = totals.apps;
    if (totals.goals !== null) stats.careerGoals = totals.goals;
    if (totals.assists !== null) stats.careerAssists = totals.assists;
    if (totals.yellow !== null && totals.red !== null) stats.careerCards = totals.yellow + (totals.secondYellow ?? 0) + totals.red;
  }
  if (market) {
    stats.marketValueEurM = market.current;
    stats.peakValueEurM = market.peak;
  }
  return { player: { qid: t.qid, tmId: t.tmId, name: t.name, at: today, clubs: clubs ?? [], stats }, missing };
}
