import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { stableBatchKey } from '../discovery/discoveryEngine';
import { qk } from '../../query/keys';
import {
  STALE_GENERATION_MS,
  STALE_NATIONAL_LIST_MS,
  STALE_POKEMON_SUMMARY_MS,
  STALE_TYPE_MATCHUP_MATRIX_MS,
} from '../../query/staleTimes';
import { fetchPokemonIdsForGeneration } from '../../services/pokeapi/generation';
import { fetchPokemonNationalIndex } from '../../services/pokeapi/pokemonListResource';
import { fetchPokemonSummaryById } from '../../services/pokeapi/pokemonSummary';
import { fetchTypeResponsesForAllTypes } from '../../services/pokeapi/typeMatchupChart';
import type { PokemonSummary } from '../../types/pokemon';

import { buildTypeMatchupChart } from './typeMatchupChart';

const MAX_POOL = 220;

function deterministicSampleIds(sorted: readonly number[], max: number): number[] {
  if (sorted.length <= max) return [...sorted];
  const step = Math.ceil(sorted.length / max);
  const out: number[] = [];
  for (let i = 0; i < sorted.length && out.length < max; i += step) out.push(sorted[i]!);
  return out;
}

export function useTeamBuilderData(open: boolean, generation: number | null, lockedIds: readonly number[]) {
  const qc = useQueryClient();

  const indexQuery = useQuery({
    queryKey: qk.pokemon.nationalIndex(),
    queryFn: ({ signal }) => fetchPokemonNationalIndex(signal),
    enabled: open,
    staleTime: STALE_NATIONAL_LIST_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const genQuery = useQuery({
    queryKey: qk.pokemon.generationMembers(generation ?? -1),
    queryFn: ({ signal }) => fetchPokemonIdsForGeneration(generation!, signal),
    enabled: open && generation !== null,
    staleTime: STALE_GENERATION_MS,
    gcTime: 1000 * 60 * 60 * 24,
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

  const poolIds = useMemo(() => {
    if (!open) return [];
    if (generation !== null) {
      const ids = genQuery.data;
      if (!ids) return [];
      return deterministicSampleIds([...ids].sort((a, b) => a - b), MAX_POOL);
    }
    const rows = indexQuery.data;
    if (!rows) return [];
    const ids = rows.map((r) => r.id).sort((a, b) => a - b);
    return deterministicSampleIds(ids, MAX_POOL);
  }, [open, generation, genQuery.data, indexQuery.data]);

  const lockKey = useMemo(() => [...new Set(lockedIds)].sort((a, b) => a - b).join('|'), [lockedIds]);

  const poolQuery = useQuery({
    queryKey: qk.teamBuilder.poolSummaries(`${stableBatchKey(poolIds, MAX_POOL)}|${lockKey}`),
    enabled: open && poolIds.length > 0,
    staleTime: STALE_POKEMON_SUMMARY_MS,
    gcTime: 1000 * 60 * 60 * 12,
    queryFn: async ({ signal }) => {
      const summaries: PokemonSummary[] = [];
      const chunkSize = 12;
      for (let i = 0; i < poolIds.length; i += chunkSize) {
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

      const have = new Set(summaries.map((s) => s.id));
      for (const id of lockedIds) {
        if (have.has(id)) continue;
        const row = await qc.fetchQuery({
          queryKey: qk.pokemon.summary(id),
          queryFn: ({ signal: s }) => fetchPokemonSummaryById(id, AbortSignal.any([signal, s])),
          staleTime: STALE_POKEMON_SUMMARY_MS,
          gcTime: 1000 * 60 * 60 * 24,
        });
        if (row) {
          summaries.push(row);
          have.add(id);
        }
      }

      summaries.sort((a, b) => a.id - b.id);
      return summaries;
    },
  });

  const poolNote =
    generation === null
      ? `National Dex sample: up to ${MAX_POOL} evenly spaced species for fast local solving. Pick a generation for a fuller roster slice.`
      : `Generation ${generation}: up to ${MAX_POOL} species from that generation (evenly spaced when the roster is larger).`;

  const loadingIndex = generation === null ? indexQuery.isPending || indexQuery.isLoading : false;
  const loadingGen = generation !== null ? genQuery.isPending || genQuery.isLoading : false;

  return {
    chart: chartQuery.data ?? null,
    pool: poolQuery.data ?? [],
    poolNote,
    isLoading: chartQuery.isPending || poolQuery.isPending || loadingIndex || loadingGen,
    isError: chartQuery.isError || poolQuery.isError || indexQuery.isError || genQuery.isError,
    error: chartQuery.error ?? poolQuery.error ?? indexQuery.error ?? genQuery.error,
  };
}
