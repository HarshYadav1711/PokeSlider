import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { qk } from '../query/keys';
import { STALE_POKEMON_DETAIL_MS } from '../query/staleTimes';
import { fetchDetailedPokemon } from '../services/pokeapi/detailedPokemon';
import { useAtmosphereThemeStore } from '../store/atmosphereThemeStore';
import { useComparisonStore } from '../store/comparisonStore';
import { useUiStore } from '../store/uiStore';
import { buildAtmosphereDomSnapshot } from '../theme/atmosphereEngine';
import { applyAtmosphereDomTheme } from '../theme/atmosphereThemeDom';

/**
 * Dynamic atmosphere: type orbs + layered facets (region, battle/compare, evolution stage, time-of-day).
 * Tokens live in design-tokens.css + atmosphere-theme.css; logic is centralized in atmosphereEngine.
 */
export function AppAtmosphere() {
  const overlayOpen = useUiStore((s) => s.overlayOpen);
  const panel = useUiStore((s) => s.panel);
  const pokemonId = useUiStore((s) => s.selectedPokemonId);

  const compareModalOpen = useComparisonStore((s) => s.open);
  const evolutionChain = useAtmosphereThemeStore((s) => s.evolutionChain);
  const timeOfDayOverride = useAtmosphereThemeStore((s) => s.timeOfDayOverride);

  const enabled = overlayOpen && panel === 'pokemon' && pokemonId !== null;

  const [todTick, setTodTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTodTick((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

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
    if (!enabled) {
      useAtmosphereThemeStore.getState().clearPokemonContext();
    }
  }, [enabled]);

  useEffect(() => {
    const root = document.documentElement;
    const pokemon =
      enabled && detailQuery.data
        ? {
            primaryType: detailQuery.data.types[0] ?? null,
            secondaryType: detailQuery.data.types[1] ?? null,
            pokemonGeneration: detailQuery.data.generation,
            evolutionChain,
          }
        : null;

    const snap = buildAtmosphereDomSnapshot({
      pokemon,
      compareModalOpen,
      timeOfDayOverride,
      now: new Date(),
    });
    applyAtmosphereDomTheme(root, snap);
  }, [
    enabled,
    detailQuery.data,
    compareModalOpen,
    evolutionChain,
    timeOfDayOverride,
    todTick,
  ]);

  useEffect(
    () => () => {
      applyAtmosphereDomTheme(document.documentElement, null);
    },
    [],
  );

  return null;
}
