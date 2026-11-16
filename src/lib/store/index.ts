import { MemoryStore } from './memory';
import { NeonStore } from './neon';
import type { Store } from './types';

let store: Store | undefined;

/** Neon quando DATABASE_URL existe; memória (volátil) caso contrário. */
export function getStore(): Store {
  if (!store) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    store = url ? new NeonStore(url) : new MemoryStore();
  }
  return store;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}
