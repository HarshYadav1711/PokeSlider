import { create } from 'zustand';

import type { PokeBallId } from '../data/pokeballs';
import { useDexListsStore } from './dexListsStore';
import { useJourneyProgressStore } from './journeyProgressStore';

export type OverlayPanel = 'ball' | 'pokemon';

interface UiState {
  overlayOpen: boolean;
  panel: OverlayPanel;
  selectedBallId: PokeBallId | null;
  selectedPokemonId: number | null;
  openBall: (ballId: PokeBallId) => void;
  showPokemon: (pokemonId: number) => void;
  backToBall: () => void;
  closeOverlay: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  overlayOpen: false,
  panel: 'ball',
  selectedBallId: null,
  selectedPokemonId: null,
  openBall: (ballId) =>
    set({
      overlayOpen: true,
      panel: 'ball',
      selectedBallId: ballId,
      selectedPokemonId: null,
    }),
  showPokemon: (pokemonId) => {
    useDexListsStore.getState().pushRecent(pokemonId);
    useJourneyProgressStore.getState().recordPokemonDiscovered(pokemonId);
    set({
      panel: 'pokemon',
      selectedPokemonId: pokemonId,
    });
  },
  backToBall: () =>
    set({
      panel: 'ball',
      selectedPokemonId: null,
    }),
  closeOverlay: () =>
    set({
      overlayOpen: false,
      panel: 'ball',
      selectedBallId: null,
      selectedPokemonId: null,
    }),
}));
