import { PARTY_CONFIG } from '../party/common';
import type { Store } from '../store/types';
import type { Outgoing, PartyGame, RankingRow } from './types';

/**
 * Temporadas do ranking: o admin manda "virada de temporada", o bot mostra a
 * imagem com os melhores do período (pódio, tabela e destaques), guarda o
 * ranking final no histórico e zera o placar para a próxima.
 */
const text = (t: string): Outgoing => ({ type: 'text', text: t });
const points = (r: RankingRow) => r.wins * 3 + r.draws;

/** Aproveitamento: pontos ganhos sobre os possíveis (3 por jogo). Sem jogos: null. */
export const aproveitamento = (r: RankingRow): number | null => (r.games ? points(r) / (3 * r.games) : null);
/** "67%" (ou "—" sem jogos). */
export function aproveitamentoText(r: RankingRow): string {
  const a = aproveitamento(r);
  return a === null ? '—' : `${Math.round(a * 100)}%`;
}

/** Data no horário de Brasília (dd/mm). */
export function shortDay(iso: string): string {
  const d = new Date(new Date(iso).getTime() - 3 * 3600_000);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Nome do jogo para os destaques ("top10" -> "Top 10"). */
export function gameName(id: string): string {
  if (id === '1x1') return 'Duelo 1x1';
  return PARTY_CONFIG[id as PartyGame]?.name ?? id;
}

/** Destaques do período: mais vitórias, mais partidas, melhor aproveitamento e o jogo mais jogado. */
export function seasonHighlights(rows: RankingRow[], counts: Record<string, number>): Array<{ label: string; name: string; value: string }> {
  const out: Array<{ label: string; name: string; value: string }> = [];
  if (!rows.length) return out;
  const most = (key: (r: RankingRow) => number) => [...rows].sort((a, b) => key(b) - key(a) || points(b) - points(a))[0];
  const wins = most((r) => r.wins);
  out.push({ label: 'Mais vitórias', name: wins.name, value: `${wins.wins} vitória${wins.wins === 1 ? '' : 's'}` });
  const games = most((r) => r.games);
  out.push({ label: 'Mais partidas', name: games.name, value: `${games.games} jogo${games.games === 1 ? '' : 's'}` });
  // Aproveitamento só vale para quem jogou um mínimo (3 jogos ou 1/4 do mais assíduo).
  const min = Math.max(3, Math.ceil(games.games / 4));
  const eligible = rows.filter((r) => r.games >= min);
  if (eligible.length) {
    const pct = (r: RankingRow) => aproveitamento(r) ?? 0;
    const best = [...eligible].sort((a, b) => pct(b) - pct(a) || b.games - a.games)[0];
    out.push({ label: 'Melhor aproveitamento', name: best.name, value: aproveitamentoText(best) });
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (top) out.push({ label: 'Jogo mais jogado', name: gameName(top[0]), value: `${top[1]} partida${top[1] === 1 ? '' : 's'}` });
  return out;
}

/** Virada de temporada: imagem com os melhores, ranking guardado e zerado. */
export async function seasonTurnover(store: Store, groupJid: string, groupName: string | undefined, now: Date): Promise<Outgoing[]> {
  const season = await store.getSeason(groupJid);
  const rows = await store.getRanking(groupJid, 1000);
  if (!rows.length) return [text(`A *Temporada ${season.season}* ainda não tem partidas com resultado. Nada para fechar.`)];
  const counts = await store.groupGameCounts(groupJid, season.startedAt);
  const matches = Object.values(counts).reduce((a, n) => a + n, 0);
  const highlights = seasonHighlights(rows, counts);
  const next = await store.closeSeason(groupJid, rows);
  const champ = rows[0];
  return [
    {
      type: 'image',
      image: {
        kind: 'season',
        groupName: groupName ?? 'Grupo',
        season: season.season,
        startedAt: season.startedAt,
        endedAt: now.toISOString(),
        rows: rows.slice(0, 10),
        matches,
        highlights,
        games: Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([id, count]) => ({ name: gameName(id), count })),
      },
      caption:
        `🏆 *Fim da Temporada ${season.season}!* Campeão: *${champ.name}*, com ${points(champ)} pontos (${champ.wins}V ${champ.draws}E ${champ.losses}D).\n\n` +
        `A *Temporada ${next.season}* começa agora: o ranking foi zerado. Mande *campeões* para ver o histórico.`,
    },
  ];
}

/** "campeões": o campeão de cada temporada encerrada e a temporada atual. */
export async function championsText(store: Store, groupJid: string): Promise<string> {
  const [past, current] = await Promise.all([store.listSeasons(groupJid), store.getSeason(groupJid)]);
  const lines = past.map((s) => {
    const champ = s.ranking?.[0];
    const period = `${shortDay(s.startedAt)} a ${s.endedAt ? shortDay(s.endedAt) : '?'}`;
    return champ ? `🏆 Temporada ${s.season} (${period}): *${champ.name}*, ${points(champ)} pts` : `Temporada ${s.season} (${period}): sem campeão`;
  });
  const now = `Temporada atual: *${current.season}*, desde ${shortDay(current.startedAt)}.`;
  return lines.length ? ['*Campeões do grupo*', ...lines, '', now].join('\n') : `Ainda não teve virada de temporada. ${now}`;
}
