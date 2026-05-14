import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_NAME = 24;

export interface JourneyTrainerState {
  displayName: string;
  starterPokemonId: number | null;
  favoriteRegionKey: string | null;
  onboardingComplete: boolean;
  /** User chose "Maybe later" — app stays usable; Journey remains one click away. */
  onboardingDeferred: boolean;
  journeyStartedAt: number | null;

  setDisplayName: (name: string) => void;
  setStarterPokemonId: (id: number | null) => void;
  setFavoriteRegionKey: (key: string | null) => void;
  completeOnboarding: (payload: { displayName: string; starterPokemonId: number; favoriteRegionKey: string }) => void;
  updateTrainerProfile: (payload: { displayName: string; starterPokemonId: number; favoriteRegionKey: string }) => void;
  deferOnboarding: () => void;
}

function clampName(raw: string): string {
  const t = raw.trim().slice(0, MAX_NAME);
  return t;
}

export const useJourneyTrainerStore = create<JourneyTrainerState>()(
  persist(
    (set) => ({
      displayName: '',
      starterPokemonId: null,
      favoriteRegionKey: null,
      onboardingComplete: false,
      onboardingDeferred: false,
      journeyStartedAt: null,

      setDisplayName: (name) => set({ displayName: clampName(name) }),
      setStarterPokemonId: (id) => set({ starterPokemonId: id }),
      setFavoriteRegionKey: (key) => set({ favoriteRegionKey: key }),

      completeOnboarding: (payload) =>
        set((s) => ({
          displayName: clampName(payload.displayName),
          starterPokemonId: payload.starterPokemonId,
          favoriteRegionKey: payload.favoriteRegionKey,
          onboardingComplete: true,
          onboardingDeferred: false,
          journeyStartedAt: s.journeyStartedAt ?? Date.now(),
        })),

      updateTrainerProfile: (payload) =>
        set({
          displayName: clampName(payload.displayName),
          starterPokemonId: payload.starterPokemonId,
          favoriteRegionKey: payload.favoriteRegionKey,
        }),

      deferOnboarding: () => set({ onboardingDeferred: true }),
    }),
    { name: 'pokeslider-journey-trainer', version: 1 },
  ),
);
