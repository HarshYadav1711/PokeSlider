import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { qk } from '../query/keys';
import { STALE_POKEMON_DETAIL_MS } from '../query/staleTimes';
import { fetchDetailedPokemon } from '../services/pokeapi/detailedPokemon';
import { useUiStore } from '../store/uiStore';

/**
 * Subtly tints the global backdrop from the primary (and optional secondary) type
 * while viewing Pokémon details — keeps the hero carousel readable by default.
 */
export function AppAtmosphere() {
  const overlayOpen = useUiStore((s) => s.overlayOpen);
  const panel = useUiStore((s) => s.panel);
  const pokemonId = useUiStore((s) => s.selectedPokemonId);

  const enabled = overlayOpen && panel === 'pokemon' && pokemonId !== null;

  const detailQuery = useQuery({
    queryKey: pokemonId === null ? ['pokeapi', 'pokemon', 'atmosphere', 'idle'] : qk.pokemon.detail(pokemonId),
    queryFn: async ({ signal }) => {
      const row = await fetchDetailedPokemon(pokemonId!, signal);
      if (!row) throw new Error('Could not load Pokémon for atmosphere.');
      return row;
    },
    enabled,
    staleTime: STALE_POKEMON_DETAIL_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });

  useEffect(() => {
    const root = document.documentElement;
    if (!enabled) {
      root.removeAttribute('data-atmosphere');
      root.removeAttribute('data-atmosphere-secondary');
      return;
    }
    if (!detailQuery.data) {
      root.removeAttribute('data-atmosphere');
      root.removeAttribute('data-atmosphere-secondary');
      return;
    }
    const types = detailQuery.data.types;
    const primary = types[0];
    const secondary = types[1];
    if (primary) root.setAttribute('data-atmosphere', primary);
    else root.removeAttribute('data-atmosphere');
    if (secondary) root.setAttribute('data-atmosphere-secondary', secondary);
    else root.removeAttribute('data-atmosphere-secondary');
  }, [enabled, detailQuery.data]);

  return null;
}
