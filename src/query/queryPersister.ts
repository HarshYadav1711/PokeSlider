import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { Query } from '@tanstack/query-core';
import type { Persister } from '@tanstack/query-persist-client-core';
import { defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { createStore, del, get, set } from 'idb-keyval';

const IDB_DB = 'pokeslider-pwa';
const IDB_STORE = 'tanstack-query';

const rqStore = createStore(IDB_DB, IDB_STORE);

const PERSIST_ROOT_KEYS = new Set(['pokeapi', 'discovery', 'team-builder', 'ball']);

const asyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const v = await get<string>(key, rqStore);
    return v === undefined ? null : v;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await set(key, value, rqStore);
  },
  removeItem: async (key: string): Promise<void> => {
    await del(key, rqStore);
  },
};

/** Two weeks — stale persisted cache is discarded on restore to avoid unbounded drift. */
export const QUERY_PERSIST_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14;

/** Throttle writes so rapid query churn does not hammer IndexedDB. */
const PERSIST_THROTTLE_MS = 2500;

const PERSIST_KEY = 'pokeslider-react-query-v1';

export function createQueryPersister(): Persister {
  return createAsyncStoragePersister({
    storage: asyncStorage,
    key: PERSIST_KEY,
    throttleTime: PERSIST_THROTTLE_MS,
    retry: async ({ error, errorCount, persistedClient }) => {
      if (errorCount > 2) return undefined;
      if (error.name !== 'QuotaExceededError') return undefined;
      const q = persistedClient.clientState.queries;
      if (q.length < 8) {
        await asyncStorage.removeItem(PERSIST_KEY);
        return undefined;
      }
      return {
        ...persistedClient,
        clientState: {
          ...persistedClient.clientState,
          queries: q.slice(Math.floor(q.length / 3)),
        },
      };
    },
  });
}

export function shouldPersistPokemonQuery(query: Query): boolean {
  if (!defaultShouldDehydrateQuery(query)) return false;
  const root = query.queryKey[0];
  return typeof root === 'string' && PERSIST_ROOT_KEYS.has(root);
}
