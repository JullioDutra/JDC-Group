import type { PlayerRecord } from './types';
import { WIKI_STATS } from './wikistats-dados';
import type { WikiStats } from './wikistats-parse';

/** Linha da base de números da Wikipédia (rodada 17). */
export interface WikiStatsEntry extends WikiStats {
  qid: string;
  /** Título da página na Wikipédia em inglês. */
  title: string;
  /** Dia da leitura (AAAA-MM-DD). */
  read: string;
}

let index: Map<string, WikiStatsEntry> | null = null;

export function wikiStatsFor(qid: string): WikiStatsEntry | undefined {
  index ??= new Map(WIKI_STATS.map((e) => [e.qid, e]));
  return index.get(qid);
}

/** Só para testes: troca a base. */
export function setWikiStats(entries: WikiStatsEntry[]) {
  index = new Map(entries.map((e) => [e.qid, e]));
}

/**
 * Números da Wikipédia na ficha: jogos e gols na carreira = clubes (todas as
 * competições) + seleção principal; jogos e gols pela seleção. Valem mais que
 * Wikidata e IA; o Transfermarkt (quando houver) e a correção do admin valem
 * mais que eles. Base estática: o número não muda no meio da partida.
 */
export function withWikiStats(record: PlayerRecord): PlayerRecord {
  const w = /^Q\d+$/.test(record.id) ? wikiStatsFor(record.id) : undefined;
  if (!w) return record;
  const stats = { ...record.stats };
  stats.careerApps = w.clubApps + (w.intlCaps ?? 0);
  stats.careerGoals = w.clubGoals + (w.intlGoals ?? 0);
  if (w.intlCaps !== undefined) {
    stats.intlCaps = w.intlCaps;
    stats.intlGoals = w.intlGoals ?? 0;
  }
  return { ...record, stats };
}
