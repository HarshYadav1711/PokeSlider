import { useQuery, useQueries } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { qk } from '../../query/keys';
import { STALE_GENERATION_MS, STALE_POKEMON_SUMMARY_MS } from '../../query/staleTimes';
import { fetchPokemonIdsForGeneration } from '../../services/pokeapi/generation';
import { fetchPokemonSummaryById } from '../../services/pokeapi/pokemonSummary';
import type { PokemonSummary } from '../../types/pokemon';

import type { RegionDefinition } from './data/regionTypes';
import type { RegionRoute } from './data/regionTypes';
import { seededSampleUniqueIds } from './regionExplorerDiscovery';

export function useRegionExplorerPokemon(open: boolean, region: RegionDefinition, route: RegionRoute | null) {
  const [shuffleKey, setShuffleKey] = useState(0);

  const genQuery = useQuery({
    queryKey: qk.pokemon.generationMembers(region.generation),
    queryFn: ({ signal }) => fetchPokemonIdsForGeneration(region.generation, signal),
    enabled: open,
    staleTime: STALE_GENERATION_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const previewIds = useMemo(() => {
    if (!route) return [];
    const pool = genQuery.data;
    const base = [...route.encounterSampleIds];
    if (pool && pool.length > 0) {
      const seed = `${region.id}:${route.id}:${shuffleKey}`;
      const extra = seededSampleUniqueIds(pool, 8, seed);
      for (const id of extra) {
        if (base.length >= 12) break;
        if (!base.includes(id)) base.push(id);
      }
    }
    return base.slice(0, 12);
  }, [genQuery.data, region.id, route, shuffleKey]);

  const summaryQueries = useQueries({
    queries: previewIds.map((id) => ({
      queryKey: qk.pokemon.summary(id),
      queryFn: ({ signal }) => fetchPokemonSummaryById(id, signal),
      enabled: open && previewIds.length > 0,
      staleTime: STALE_POKEMON_SUMMARY_MS,
      gcTime: 1000 * 60 * 60 * 24,
    })),
  });

  const summaries: PokemonSummary[] = useMemo(() => {
    const out: PokemonSummary[] = [];
    for (const q of summaryQueries) {
      if (q.data) out.push(q.data);
    }
    return out;
  }, [summaryQueries]);

  const loadingSummaries = summaryQueries.some((q) => q.isPending || q.isLoading);

  return {
    genLoading: genQuery.isPending || genQuery.isLoading,
    genError: genQuery.isError,
    previewIds,
    summaries,
    loadingSummaries,
    reshuffle: () => setShuffleKey((k) => k + 1),
  };
}
