import { create } from 'zustand';

import { partitionCatalog, type PokemonCatalogPartition } from '../services/ballSuggestions';
import { buildPokemonCatalog } from '../services/pokeapi/catalog';

export type CatalogStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error';

interface PokemonCatalogState {
  status: CatalogStatus;
  error: string | null;
  progress: { loaded: number; total: number };
  partition: PokemonCatalogPartition | null;
  startHydration: () => void;
  retryHydration: () => void;
}

let abortController: AbortController | null = null;

export const usePokemonCatalogStore = create<PokemonCatalogState>((set, get) => ({
  status: 'idle',
  error: null,
  progress: { loaded: 0, total: 0 },
  partition: null,
  retryHydration: () => {
    abortController?.abort();
    abortController = null;
    set({ status: 'idle', error: null, progress: { loaded: 0, total: 0 }, partition: null });
    get().startHydration();
  },
  startHydration: () => {
    const current = get().status;
    if (current === 'loading' || current === 'ready') return;

    abortController?.abort();
    abortController = new AbortController();
    const { signal } = abortController;

    set({ status: 'loading', error: null, progress: { loaded: 0, total: 0 }, partition: null });

    void buildPokemonCatalog({
      signal,
      onProgress: (loaded, total) => {
        set({ progress: { loaded, total } });
      },
    })
      .then((all) => {
        if (signal.aborted) return;
        if (all.length === 0) {
          set({ status: 'empty', partition: null, error: null });
          return;
        }
        set({ status: 'ready', partition: partitionCatalog(all), error: null });
      })
      .catch((err: unknown) => {
        if (signal.aborted) return;
        const message = err instanceof Error ? err.message : 'Failed to load Pokémon catalog';
        set({ status: 'error', error: message, partition: null });
      });
  },
}));
