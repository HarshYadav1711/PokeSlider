import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useMemo, useState, type ReactNode } from 'react';

import { PwaClientChrome } from '../features/pwa/PwaClientChrome';
import { SoundscapeOrchestrator } from '../features/soundscape/SoundscapeOrchestrator';
import {
  createQueryPersister,
  QUERY_PERSIST_MAX_AGE_MS,
  shouldPersistPokemonQuery,
} from '../query/queryPersister';
import { createAppQueryClient } from '../query/createQueryClient';
import { AppAtmosphere } from './AppAtmosphere';

declare const __APP_CACHE_BUSTER__: string;

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => createAppQueryClient());
  const persister = useMemo(() => createQueryPersister(), []);

  const persistOptions = useMemo(
    () => ({
      persister,
      maxAge: QUERY_PERSIST_MAX_AGE_MS,
      buster: typeof __APP_CACHE_BUSTER__ === 'string' ? __APP_CACHE_BUSTER__ : 'dev',
      dehydrateOptions: {
        shouldDehydrateQuery: shouldPersistPokemonQuery,
      },
    }),
    [persister],
  );

  return (
    <PersistQueryClientProvider client={client} persistOptions={persistOptions}>
      <PwaClientChrome />
      <AppAtmosphere />
      <SoundscapeOrchestrator />
      {children}
    </PersistQueryClientProvider>
  );
}
