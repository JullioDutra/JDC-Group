import type { Store } from '../store/types';
import { createPlayerLookup, type IdentifySource, type PlayerLookup, type StatSource } from '../players/lookup';
import { lookupDemo } from './demo';
import { hasMaritacaKey, lookupWithMaritaca } from './maritaca';
import { defaultStatFetcher } from './stats';

export type { PlayerLookup } from '../players/lookup';

/**
 * Busca de jogadores usada pelo jogo: primeiro a base própria (Wikidata +
 * pesquisas anteriores); quem não estiver lá a IA pesquisa e entra na base.
 * `source` e `stats` permitem trocar a IA nos testes.
 */
export function createLookup(store: Store, source?: IdentifySource, stats?: StatSource): PlayerLookup {
  const identify = source ?? (hasMaritacaKey() ? lookupWithMaritaca : lookupDemo);
  return createPlayerLookup(store, identify, stats ?? (source ? undefined : defaultStatFetcher()));
}
