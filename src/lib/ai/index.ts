import { normalize } from '../game/text';
import type { PlayerProfile } from '../game/types';
import type { Store } from '../store/types';
import { lookupDemo } from './demo';
import { hasMaritacaKey, lookupWithMaritaca } from './maritaca';

export type PlayerLookup = (query: string) => Promise<PlayerProfile | null>;

/** Mude quando a ficha ganhar campos novos: invalida o cache antigo. */
const PROFILE_VERSION = 'v2';

/**
 * Lookup com cache: a primeira consulta de um nome vai à IA (~1-2 s);
 * as seguintes saem do banco em milissegundos e sempre com o mesmo número,
 * o que mantém o jogo justo entre partidas.
 */
export function createLookup(store: Store, source?: PlayerLookup): PlayerLookup {
  const fetchProfile = source ?? (hasMaritacaKey() ? lookupWithMaritaca : lookupDemo);
  return async (query) => {
    const key = `${PROFILE_VERSION}:${normalize(query)}`;
    const cached = await store.getCachedProfile(key);
    if (cached !== undefined) return cached;
    const profile = await fetchProfile(query);
    await store.putCachedProfile(key, profile);
    // Guarda também pelo nome canônico: "ceni" e "rogerio ceni" viram a mesma ficha.
    if (profile) {
      const canonical = `${PROFILE_VERSION}:${normalize(profile.name)}`;
      if (canonical !== key) await store.putCachedProfile(canonical, profile);
    }
    return profile;
  };
}
