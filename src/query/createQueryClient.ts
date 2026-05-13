import { QueryClient } from '@tanstack/react-query';

import { PokeApiError } from '../services/pokeapi/client';

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
          if (failureCount >= 3) return false;
          if (error instanceof PokeApiError && error.status === 404) return false;
          return true;
        },
      },
    },
  });
}
