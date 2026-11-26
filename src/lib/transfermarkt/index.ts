import { normalize } from '../game/text';
import type { PlayerRecord } from '../players/types';
import { TM_DADOS } from './dados';
import type { TmPlayer } from './types';

export type { TmPlayer, TmTarget } from './types';

let index: Map<string, TmPlayer> | null = null;
let extra: TmPlayer[] = [];

/** Ficha do Transfermarkt pelo Q-id (base gerada; nos testes dá para pôr outra). */
export function tmPlayerFor(qid: string): TmPlayer | undefined {
  index ??= new Map([...TM_DADOS, ...extra].map((p) => [p.qid, p]));
  return index.get(qid);
}

/** Só para testes: troca a base. */
export function setTmData(players: TmPlayer[]) {
  extra = players;
  index = new Map(players.map((p) => [p.qid, p]));
}

/**
 * Junta o Transfermarkt na ficha (rodada 17). Os números do Transfermarkt
 * valem mais que os do Wikidata e os da IA (a correção do admin continua
 * valendo mais que tudo, no statOf). Os clubes do histórico de transferências
 * entram na lista (os que a ficha ainda não tem com outro nome).
 */
export function withTransfermarkt(record: PlayerRecord): PlayerRecord {
  const tm = /^Q\d+$/.test(record.id) ? tmPlayerFor(record.id) : undefined;
  if (!tm) return record;
  const have = record.clubs.map(normalize);
  const clubs = [...record.clubs];
  for (const c of tm.clubs) {
    const n = normalize(c);
    if (!have.some((h) => h.includes(n) || n.includes(h))) {
      clubs.push(c);
      have.push(n);
    }
  }
  return { ...record, clubs, stats: { ...record.stats, ...tm.stats } };
}
