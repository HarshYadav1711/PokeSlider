import { useCallback, useEffect, useRef, useState } from 'react';

import type { DetailedPokemon } from '../types/pokemon';
import { fetchDetailedPokemon } from '../services/pokeapi/detailedPokemon';
import type { AsyncState } from '../types/async';
import { errorState, initialAsync, loadingState, successState } from '../types/async';

export function usePokemonDetail(pokemonId: number | null): AsyncState<DetailedPokemon> {
  const [state, setState] = useState<AsyncState<DetailedPokemon>>(() => initialAsync<DetailedPokemon>());
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(async (id: number) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState(loadingState());

    const result = await fetchDetailedPokemon(id, controller.signal);
    if (controller.signal.aborted) return;

    if (!result) {
      setState(errorState('Could not load Pokémon details.'));
      return;
    }

    setState(successState(result));
  }, []);

  useEffect(() => {
    if (pokemonId === null) {
      controllerRef.current?.abort();
      setState(initialAsync<DetailedPokemon>());
      return;
    }
    void load(pokemonId);
    return () => {
      controllerRef.current?.abort();
    };
  }, [load, pokemonId]);

  return state;
}
