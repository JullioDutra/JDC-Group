import type { Store } from '../store/types';
import { createPlayerLookup, type IdentifySource, type PlayerLookup, type PlayerSources, type StatSource } from '../players/lookup';
import { defaultSources } from '../players/sources';
import { lookupDemo } from './demo';
import { hasMaritacaKey, lookupWithMaritaca } from './maritaca';
import { defaultStatFetcher } from './stats';

export type { PlayerLookup } from '../players/lookup';

/**
 * Busca de jogadores usada pelo jogo: primeiro a base própria (Wikidata +
 * pesquisas anteriores); quem não estiver lá a IA pesquisa e entra na base.
 * `source` e `stats` permitem trocar a IA nos testes.
 */
export function createLookup(store: Store, source?: IdentifySource, stats?: StatSource, sources?: PlayerSources): PlayerLookup {
  const identify = source ?? (hasMaritacaKey() ? lookupWithMaritaca : lookupDemo);
  // Passagens conferidas (Wikidata + Wikipédia): em produção sempre; nos testes, só se passarem as fontes.
  const playerSources = sources ?? (source ? undefined : defaultSources());
  return createPlayerLookup(store, identify, stats ?? (source ? undefined : defaultStatFetcher()), playerSources);
}
