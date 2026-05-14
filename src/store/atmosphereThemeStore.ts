import { create } from 'zustand';

import type { TimeOfDay } from '../theme/timeOfDay';

export interface EvolutionChainPosition {
  readonly index: number;
  readonly total: number;
}

interface AtmosphereThemeState {
  /** Current stage within the viewed species’ evolution line (from timeline order). */
  evolutionChain: EvolutionChainPosition | null;
  /** When set, overrides local-clock time-of-day for atmosphere only. */
  timeOfDayOverride: TimeOfDay | null;

  setEvolutionChainPosition: (pos: EvolutionChainPosition | null) => void;
  setTimeOfDayOverride: (tod: TimeOfDay | null) => void;
  clearPokemonContext: () => void;
}

export const useAtmosphereThemeStore = create<AtmosphereThemeState>((set) => ({
  evolutionChain: null,
  timeOfDayOverride: null,

  setEvolutionChainPosition: (pos) => set({ evolutionChain: pos }),
  setTimeOfDayOverride: (tod) => set({ timeOfDayOverride: tod }),
  clearPokemonContext: () => set({ evolutionChain: null }),
}));
