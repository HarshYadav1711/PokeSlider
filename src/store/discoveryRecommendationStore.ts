import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  DiscoveryAesthetic,
  DiscoveryPlaystyle,
  DiscoveryRecommendationPreferences,
} from '../features/discovery-recommendation/discoveryRecommendationTypes';
import type { PokemonTypeName } from '../types/pokemon';

const MAX_ANCHOR = 6;
const MAX_TYPES = 5;
const MAX_AESTHETICS = 3;

export interface DiscoveryRecommendationState {
  open: boolean;
  sessionSeed: number;
  favoritePokemonIds: number[];
  favoriteTypes: PokemonTypeName[];
  favoriteRegionKeys: string[];
  playstyle: DiscoveryPlaystyle;
  aesthetics: DiscoveryAesthetic[];
  setOpen: (open: boolean) => void;
  newSession: () => void;
  setFavoritePokemonIds: (ids: readonly number[]) => void;
  toggleAnchorPokemon: (id: number) => void;
  toggleFavoriteType: (t: PokemonTypeName) => void;
  toggleRegionKey: (key: string) => void;
  setPlaystyle: (p: DiscoveryPlaystyle) => void;
  toggleAesthetic: (a: DiscoveryAesthetic) => void;
  importDexFavoritesAsAnchors: (ids: readonly number[]) => void;
  getPreferences: () => DiscoveryRecommendationPreferences;
}

const defaultRegions = (): string[] => ['any'];

export const useDiscoveryRecommendationStore = create<DiscoveryRecommendationState>()(
  persist(
    (set, get) => ({
      open: false,
      sessionSeed: 1337,
      favoritePokemonIds: [],
      favoriteTypes: [],
      favoriteRegionKeys: defaultRegions(),
      playstyle: 'balanced',
      aesthetics: [],
      setOpen: (open) => set({ open }),
      newSession: () =>
        set((s) => ({
          sessionSeed: (Math.imul(s.sessionSeed ^ 0x9e3779b9, 0x85ebca6b) >>> 0) || 1,
        })),
      setFavoritePokemonIds: (ids) =>
        set({ favoritePokemonIds: [...new Set(ids)].filter((n) => n > 0).slice(0, MAX_ANCHOR) }),
      toggleAnchorPokemon: (id) =>
        set((s) => {
          const has = s.favoritePokemonIds.includes(id);
          const next = has
            ? s.favoritePokemonIds.filter((x) => x !== id)
            : [...s.favoritePokemonIds, id].slice(-MAX_ANCHOR);
          return { favoritePokemonIds: next };
        }),
      toggleFavoriteType: (t) =>
        set((s) => {
          const has = s.favoriteTypes.includes(t);
          const next = has
            ? s.favoriteTypes.filter((x) => x !== t)
            : [...s.favoriteTypes, t].slice(0, MAX_TYPES);
          return { favoriteTypes: next };
        }),
      toggleRegionKey: (key) =>
        set((s) => {
          if (key === 'any') {
            return { favoriteRegionKeys: ['any'] };
          }
          const withoutAny = s.favoriteRegionKeys.filter((k) => k !== 'any');
          const has = withoutAny.includes(key);
          const next = has ? withoutAny.filter((k) => k !== key) : [...withoutAny, key];
          return { favoriteRegionKeys: next.length === 0 ? ['any'] : next };
        }),
      setPlaystyle: (playstyle) => set({ playstyle }),
      toggleAesthetic: (a) =>
        set((s) => {
          const has = s.aesthetics.includes(a);
          const next = has
            ? s.aesthetics.filter((x) => x !== a)
            : [...s.aesthetics, a].slice(0, MAX_AESTHETICS);
          return { aesthetics: next };
        }),
      importDexFavoritesAsAnchors: (ids) =>
        set((s) => {
          const merged = [...new Set([...s.favoritePokemonIds, ...ids])].filter((n) => n > 0);
          return { favoritePokemonIds: merged.slice(0, MAX_ANCHOR) };
        }),
      getPreferences: () => {
        const st = get();
        return {
          favoritePokemonIds: st.favoritePokemonIds,
          favoriteTypes: st.favoriteTypes,
          favoriteRegionKeys: st.favoriteRegionKeys,
          playstyle: st.playstyle,
          aesthetics: st.aesthetics,
        };
      },
    }),
    {
      name: 'pokeslider-discovery-reco',
      version: 1,
      partialize: (s) => ({
        favoritePokemonIds: s.favoritePokemonIds,
        favoriteTypes: s.favoriteTypes,
        favoriteRegionKeys: s.favoriteRegionKeys,
        playstyle: s.playstyle,
        aesthetics: s.aesthetics,
      }),
    },
  ),
);
