import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { stableBatchKey } from '../discovery/discoveryEngine';
import {
  buildDiscoveryRecommendations,
  seededShuffle,
} from './discoveryRecommendationEngine';
import { buildTypeMatchupChart } from '../team-builder/typeMatchupChart';
import { qk } from '../../query/keys';
import {
  STALE_GENERATION_MS,
  STALE_NATIONAL_LIST_MS,
  STALE_POKEMON_SUMMARY_MS,
  STALE_TYPE_MATCHUP_MATRIX_MS,
} from '../../query/staleTimes';
import { fetchDiscoveryCandidateIds } from '../../services/pokeapi/discoveryRecommendationIds';
import { fetchPokemonNationalIndex } from '../../services/pokeapi/pokemonListResource';
import { fetchPokemonSummaryById } from '../../services/pokeapi/pokemonSummary';
import { fetchTypeResponsesForAllTypes } from '../../services/pokeapi/typeMatchupChart';
import { useDexListsStore } from '../../store/dexListsStore';
import { useDiscoveryRecommendationStore } from '../../store/discoveryRecommendationStore';
import type { DiscoveryEngineResult, DiscoveryRecommendationPreferences } from './discoveryRecommendationTypes';
import type { PokemonSummary } from '../../types/pokemon';
import { regionKeysToGenerationIds } from './regionToGeneration';

const MAX_POOL_FETCH = 280;

function generationKey(genIds: readonly number[] | null): string {
  if (genIds === null) return 'national';
  if (genIds.length === 0) return 'national';
  return genIds.join('-');
}

export function useDiscoveryRecommendationData() {
  const qc = useQueryClient();
  const open = useDiscoveryRecommendationStore((s) => s.open);
  const sessionSeed = useDiscoveryRecommendationStore((s) => s.sessionSeed);
  const favoritePokemonIds = useDiscoveryRecommendationStore((s) => s.favoritePokemonIds);
  const favoriteTypes = useDiscoveryRecommendationStore((s) => s.favoriteTypes);
  const favoriteRegionKeys = useDiscoveryRecommendationStore((s) => s.favoriteRegionKeys);
  const playstyle = useDiscoveryRecommendationStore((s) => s.playstyle);
  const aesthetics = useDiscoveryRecommendationStore((s) => s.aesthetics);

  const prefs = useMemo(
    (): DiscoveryRecommendationPreferences => ({
      favoritePokemonIds,
      favoriteTypes,
      favoriteRegionKeys,
      playstyle,
      aesthetics,
    }),
    [favoritePokemonIds, favoriteTypes, favoriteRegionKeys, playstyle, aesthetics],
  );

  const genIds = useMemo(() => regionKeysToGenerationIds(prefs.favoriteRegionKeys), [prefs.favoriteRegionKeys]);

  const nationalIndexQuery = useQuery({
    queryKey: qk.pokemon.nationalIndex(),
    queryFn: ({ signal }) => fetchPokemonNationalIndex(signal),
    enabled: open,
    staleTime: STALE_NATIONAL_LIST_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const candidatesQuery = useQuery({
    queryKey: qk.discovery.recommendationCandidates(generationKey(genIds)),
    queryFn: ({ signal }) => fetchDiscoveryCandidateIds(genIds, signal),
    enabled: open,
    staleTime: genIds === null ? STALE_NATIONAL_LIST_MS : STALE_GENERATION_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const poolIds = useMemo(() => {
    const base = candidatesQuery.data;
    if (!base?.length) return [];
    const merged = [...new Set([...prefs.favoritePokemonIds, ...base])];
    return seededShuffle(merged, sessionSeed).slice(0, MAX_POOL_FETCH);
  }, [candidatesQuery.data, prefs.favoritePokemonIds, sessionSeed]);

  const batchKey = stableBatchKey(poolIds, MAX_POOL_FETCH);

  const summariesQuery = useQuery({
    queryKey: qk.discovery.recommendationSummaries(`${batchKey}|${sessionSeed}`),
    enabled: open && poolIds.length > 0,
    staleTime: STALE_POKEMON_SUMMARY_MS,
    gcTime: 1000 * 60 * 60 * 6,
    queryFn: async ({ signal }) => {
      const summaries: PokemonSummary[] = [];
      const chunkSize = 14;
      for (let i = 0; i < poolIds.length; i += chunkSize) {
        if (signal.aborted) break;
        const chunk = poolIds.slice(i, i + chunkSize);
        const part = await Promise.all(
          chunk.map((id) =>
            qc.fetchQuery({
              queryKey: qk.pokemon.summary(id),
              queryFn: ({ signal: s }) => fetchPokemonSummaryById(id, AbortSignal.any([signal, s])),
              staleTime: STALE_POKEMON_SUMMARY_MS,
              gcTime: 1000 * 60 * 60 * 24,
            }),
          ),
        );
        for (const row of part) {
          if (row) summaries.push(row);
        }
      }
      return summaries;
    },
  });

  const chartQuery = useQuery({
    queryKey: qk.teamBuilder.typeMatchup(),
    queryFn: async ({ signal }) => {
      const rows = await fetchTypeResponsesForAllTypes(signal);
      return buildTypeMatchupChart(rows);
    },
    enabled: open,
    staleTime: STALE_TYPE_MATCHUP_MATRIX_MS,
    gcTime: 1000 * 60 * 60 * 24 * 90,
  });

  const recentViews = useDexListsStore((s) => s.recentViews);
  const dexFavoriteIds = useDexListsStore((s) => s.favoriteIds);

  const recentSet = useMemo(() => new Set(recentViews.map((r) => r.id)), [recentViews]);
  const dexFavSet = useMemo(() => new Set(dexFavoriteIds), [dexFavoriteIds]);

  const engineResult: DiscoveryEngineResult | null = useMemo(() => {
    if (!summariesQuery.data?.length) return null;
    const chart = chartQuery.data ?? null;
    const favSet = new Set(prefs.favoritePokemonIds);
    const poolRows = summariesQuery.data.filter((p) => !favSet.has(p.id));
    const anchors = prefs.favoritePokemonIds
      .map((id) => summariesQuery.data.find((p) => p.id === id))
      .filter((p): p is PokemonSummary => Boolean(p));
    return buildDiscoveryRecommendations({
      prefs,
      pool: poolRows,
      anchorSummaries: anchors,
      chart,
      recentPokemonIds: recentSet,
      dexFavoriteIds: dexFavSet,
      sessionSeed,
    });
  }, [summariesQuery.data, chartQuery.data, prefs, recentSet, dexFavSet, sessionSeed]);

  return {
    open,
    prefs,
    sessionSeed,
    candidatesQuery,
    nationalIndexQuery,
    summariesQuery,
    chartQuery,
    engineResult,
    poolIds,
  };
}
