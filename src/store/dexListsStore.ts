import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useJourneyProgressStore } from './journeyProgressStore';

const MAX_RECENTS = 50;

export interface RecentView {
  id: number;
  viewedAt: number;
}

interface DexListsState {
  favoriteIds: number[];
  recentViews: RecentView[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  pushRecent: (id: number) => void;
}

export const useDexListsStore = create<DexListsState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      recentViews: [],
      toggleFavorite: (id) =>
        set((s) => {
          const has = s.favoriteIds.includes(id);
          if (!has) {
            queueMicrotask(() => {
              useJourneyProgressStore.getState().recordFavoriteStarred(id);
            });
          }
          return {
            favoriteIds: has ? s.favoriteIds.filter((x) => x !== id) : [...s.favoriteIds, id],
          };
        }),
      isFavorite: (id) => get().favoriteIds.includes(id),
      pushRecent: (id) =>
        set((s) => {
          const rest = s.recentViews.filter((r) => r.id !== id);
          return {
            recentViews: [{ id, viewedAt: Date.now() }, ...rest].slice(0, MAX_RECENTS),
          };
        }),
    }),
    { name: 'pokeslider-my-dex-lists', version: 1 },
  ),
);
