import { parseWikitext, playedCount, type SimData } from './brasileirao';
import { SNAPSHOT_2026 } from './snapshot-2026';

/** Página da Wikipédia com a matriz de resultados (texto cru, sem HTML). */
export const SIM_SOURCE_URL =
  'https://en.wikipedia.org/w/index.php?title=2026_Campeonato_Brasileiro_S%C3%A9rie_A&action=raw';
/** Relê a página no máximo uma vez por hora (cache do Next na Vercel). */
export const SIM_REVALIDATE_SECONDS = 3600;

/**
 * Dados do Brasileirão 2026: a página ao vivo, se vier inteira e com pelo
 * menos tantos jogos feitos quanto a versão guardada; senão, a guardada.
 */
export async function loadBrasileirao(fetcher: typeof fetch = fetch): Promise<SimData> {
  try {
    const res = await fetcher(SIM_SOURCE_URL, {
      headers: { 'user-agent': 'DueloDeCraques/1.0 (simulador do Brasileirao)' },
      next: { revalidate: SIM_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(8000),
    } as RequestInit);
    if (res.ok) {
      const live = parseWikitext(await res.text());
      if (live && playedCount(live) >= playedCount(SNAPSHOT_2026)) return live;
    }
  } catch {
    // Sem rede ou página fora do ar: fica a versão guardada.
  }
  return SNAPSHOT_2026;
}

/** Endereço público do site (para o link no grupo). */
export function siteUrl(): string {
  const env = process.env.PUBLIC_APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '');
  return (env || 'https://duelo-de-craques-peach.vercel.app').replace(/\/$/, '');
}
