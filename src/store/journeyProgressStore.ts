import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { evaluateNewJourneyAchievements, type JourneyProgressSnapshot } from '../features/journey/achievementEngine';

const MAX_FAVORITE_EVENTS = 80;
const MAX_TEAM_SNAPSHOTS = 24;

export interface JourneyFavoriteEvent {
  readonly pokemonId: number;
  readonly at: number;
}

export interface JourneyTeamSnapshot {
  readonly ids: readonly number[];
  readonly savedAt: number;
}

interface JourneyProgressState {
  /** Unique Pokémon ids opened in the overlay (national-style ids used across the app). */
  discoveredIds: number[];
  favoriteEvents: JourneyFavoriteEvent[];
  teamSnapshots: JourneyTeamSnapshot[];
  compareSessionsCount: number;
  unlockedAchievementIds: string[];

  recordPokemonDiscovered: (pokemonId: number) => void;
  recordFavoriteStarred: (pokemonId: number) => void;
  pushTeamSnapshotIfFull: (ids: readonly number[]) => void;
  recordCompareSession: () => void;
}

function snapshotFromState(s: JourneyProgressState): JourneyProgressSnapshot {
  return {
    uniqueDiscoveredCount: s.discoveredIds.length,
    favoriteEventsCount: s.favoriteEvents.length,
    compareSessionsCount: s.compareSessionsCount,
    teamSnapshotsCount: s.teamSnapshots.length,
  };
}

function mergeUnlocked(next: JourneyProgressState): string[] {
  const newly = evaluateNewJourneyAchievements(snapshotFromState(next), new Set(next.unlockedAchievementIds));
  if (newly.length === 0) return next.unlockedAchievementIds;
  return [...next.unlockedAchievementIds, ...newly];
}

export const useJourneyProgressStore = create<JourneyProgressState>()(
  persist(
    (set) => ({
      discoveredIds: [],
      favoriteEvents: [],
      teamSnapshots: [],
      compareSessionsCount: 0,
      unlockedAchievementIds: [],

      recordPokemonDiscovered: (pokemonId) =>
        set((s) => {
          if (s.discoveredIds.includes(pokemonId)) return s;
          const discoveredIds = [...s.discoveredIds, pokemonId];
          const draft: JourneyProgressState = { ...s, discoveredIds };
          return { ...draft, unlockedAchievementIds: mergeUnlocked(draft) };
        }),

      recordFavoriteStarred: (pokemonId) =>
        set((s) => {
          const favoriteEvents = [{ pokemonId, at: Date.now() }, ...s.favoriteEvents].slice(0, MAX_FAVORITE_EVENTS);
          const draft: JourneyProgressState = { ...s, favoriteEvents };
          return { ...draft, unlockedAchievementIds: mergeUnlocked(draft) };
        }),

      pushTeamSnapshotIfFull: (ids) =>
        set((s) => {
          if (ids.length !== 6) return s;
          const teamSnapshots = [{ ids: [...ids], savedAt: Date.now() }, ...s.teamSnapshots].slice(
            0,
            MAX_TEAM_SNAPSHOTS,
          );
          const draft: JourneyProgressState = { ...s, teamSnapshots };
          return { ...draft, unlockedAchievementIds: mergeUnlocked(draft) };
        }),

      recordCompareSession: () =>
        set((s) => {
          const compareSessionsCount = s.compareSessionsCount + 1;
          const draft: JourneyProgressState = { ...s, compareSessionsCount };
          return { ...draft, unlockedAchievementIds: mergeUnlocked(draft) };
        }),
    }),
    { name: 'pokeslider-journey-progress', version: 1 },
  ),
);
