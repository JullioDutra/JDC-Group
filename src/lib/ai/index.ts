import type { Store } from '../store/types';
import { createPlayerLookup, type ClubSource, type IdentifySource, type PlayerLookup, type StatSource } from '../players/lookup';
import { fetchClubs } from '../players/wikidata';
import { lookupDemo } from './demo';
import { hasMaritacaKey, lookupWithMaritaca } from './maritaca';
import { defaultStatFetcher } from './stats';

export type { PlayerLookup } from '../players/lookup';

/**
 * Busca de jogadores usada pelo jogo: primeiro a base própria (Wikidata +
 * pesquisas anteriores); quem não estiver lá a IA pesquisa e entra na base.
 * `source` e `stats` permitem trocar a IA nos testes.
 */
export function createLookup(store: Store, source?: IdentifySource, stats?: StatSource, clubs?: ClubSource): PlayerLookup {
  const identify = source ?? (hasMaritacaKey() ? lookupWithMaritaca : lookupDemo);
  // Clubes conferidos no Wikidata: em produção sempre; nos testes, só se passarem a fonte.
  const clubSource = clubs ?? (source ? undefined : (id: string) => fetchClubs(id));
  return createPlayerLookup(store, identify, stats ?? (source ? undefined : defaultStatFetcher()), clubSource);
}
