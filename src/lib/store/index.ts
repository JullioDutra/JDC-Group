import { MemoryStore } from './memory';
import { NeonStore } from './neon';
import type { Store } from './types';

let store: Store | undefined;

/**
 * Garante as tabelas antes do primeiro uso (CREATE TABLE IF NOT EXISTS),
 * uma vez por instância da função. Assim o banco recém-criado funciona sem
 * rodar /api/admin/migrate à mão.
 */
function withSchema(neon: NeonStore): Store {
  let ready: Promise<void> | null = null;
  return new Proxy(neon, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function' || prop === 'migrate') return value;
      return async (...args: unknown[]) => {
        ready ??= target.migrate().catch((error) => {
          ready = null; // tenta de novo na próxima chamada
          throw error;
        });
        await ready;
        return (value as (...a: unknown[]) => unknown).apply(target, args);
      };
    },
  }) as Store;
}

/** Neon quando DATABASE_URL existe; memória (volátil) caso contrário. */
export function getStore(): Store {
  if (!store) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    store = url ? withSchema(new NeonStore(url)) : new MemoryStore();
  }
  return store;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}
