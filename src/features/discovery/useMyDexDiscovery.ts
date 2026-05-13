import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useDexListsStore } from '../../store/dexListsStore';
import { fetchAbilitySlugList, fetchPokemonIdsForAbility } from '../../services/pokeapi/abilityPokemon';
import { fetchPokemonIdsForGeneration } from '../../services/pokeapi/generation';
import { fetchPokemonNationalIndex } from '../../services/pokeapi/pokemonListResource';
import { fetchPokemonFormSearchIndex } from '../../services/pokeapi/pokemonFormsIndex';
import { fetchPokemonIdsForPokedex, fetchPokedexSlugList } from '../../services/pokeapi/pokedex';
import { fetchPokemonIdsForType } from '../../services/pokeapi/typePokemonIds';
import { fetchPokemonSummaryById } from '../../services/pokeapi/pokemonSummary';
import { fetchSpeciesPriorEvolutionMap } from '../../services/pokeapi/speciesEvolutionHint';
import type { PokemonSummary } from '../../types/pokemon';
import { qk } from '../../query/keys';
import {
  STALE_ABILITY_MEMBERS_MS,
  STALE_FORM_SEARCH_INDEX_MS,
  STALE_GENERATION_MS,
  STALE_NATIONAL_LIST_MS,
  STALE_POKEDEX_LIST_MS,
  STALE_POKEDEX_MEMBERS_MS,
  STALE_POKEMON_SUMMARY_MS,
  STALE_SPECIES_PRIOR_MS,
  STALE_TYPE_MEMBERS_MS,
} from '../../query/staleTimes';

import {
  applySummaryFilters,
  filterIdsByTextSearch,
  intersectSets,
  stableBatchKey,
  toIdSet,
} from './discoveryEngine';
import { useDiscoveryUiStore } from './discoveryUiStore';

export function useAbilitySlugListQuery(enabled: boolean) {
  return useQuery({
    queryKey: qk.pokemon.abilitySlugList(),
    queryFn: ({ signal }) => fetchAbilitySlugList(signal),
    enabled,
    staleTime: STALE_ABILITY_MEMBERS_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function usePokedexSlugListQuery(enabled: boolean) {
  return useQuery({
    queryKey: qk.pokemon.pokedexSlugList(),
    queryFn: ({ signal }) => fetchPokedexSlugList(signal),
    enabled,
    staleTime: STALE_POKEDEX_LIST_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useMyDexDiscovery() {
  const qc = useQueryClient();
  const panelOpen = useDiscoveryUiStore((s) => s.panelOpen);
  const tab = useDiscoveryUiStore((s) => s.tab);
  const searchText = useDiscoveryUiStore((s) => s.query);
  const filters = useDiscoveryUiStore((s) => s.filters);
  const favoriteIds = useDexListsStore((s) => s.favoriteIds);
  const recentViews = useDexListsStore((s) => s.recentViews);

  const nationalQuery = useQuery({
    queryKey: qk.pokemon.nationalIndex(),
    queryFn: ({ signal }) => fetchPokemonNationalIndex(signal),
    staleTime: STALE_NATIONAL_LIST_MS,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: panelOpen,
  });

  const formsQuery = useQuery({
    queryKey: qk.pokemon.pokemonFormSearchIndex(),
    queryFn: ({ signal }) => fetchPokemonFormSearchIndex(signal),
    staleTime: STALE_FORM_SEARCH_INDEX_MS,
    gcTime: 1000 * 60 * 60 * 24 * 60,
    enabled: panelOpen,
  });

  const typeQueries = useQueries({
    queries:
      panelOpen && tab === 'browse' && filters.types.length > 0
        ? [...filters.types].map((type) => ({
            queryKey: qk.pokemon.typeMembers(type),
            queryFn: ({ signal }) => fetchPokemonIdsForType(type, signal),
            staleTime: STALE_TYPE_MEMBERS_MS,
            gcTime: 1000 * 60 * 60 * 24,
          }))
        : [],
  });

  const generationQuery = useQuery({
    queryKey: qk.pokemon.generationMembers(filters.generation ?? -1),
    queryFn: ({ signal }) => fetchPokemonIdsForGeneration(filters.generation!, signal),
    enabled: panelOpen && tab === 'browse' && filters.generation !== null,
    staleTime: STALE_GENERATION_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const pokedexQuery = useQuery({
    queryKey: qk.pokemon.pokedexMembers(filters.pokedexSlug ?? ''),
    queryFn: ({ signal }) => fetchPokemonIdsForPokedex(filters.pokedexSlug!, signal),
    enabled: panelOpen && tab === 'browse' && Boolean(filters.pokedexSlug),
    staleTime: STALE_POKEDEX_MEMBERS_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const abilityQuery = useQuery({
    queryKey: qk.pokemon.abilityMembers(filters.abilitySlug ?? ''),
    queryFn: ({ signal }) => fetchPokemonIdsForAbility(filters.abilitySlug!, signal),
    enabled: panelOpen && tab === 'browse' && Boolean(filters.abilitySlug?.trim()),
    staleTime: STALE_ABILITY_MEMBERS_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const index = nationalQuery.data ?? [];

  const typeUnion = useMemo(() => {
    if (filters.types.length === 0) return null;
    const u = new Set<number>();
    for (const q of typeQueries) {
      for (const id of q.data ?? []) u.add(id);
    }
    return u;
  }, [filters.types, typeQueries]);

  const typesBlocking =
    tab === 'browse' &&
    filters.types.length > 0 &&
    typeQueries.some((q) => q.isPending || q.isLoading);

  const generationBlocking =
    tab === 'browse' && filters.generation !== null && (generationQuery.isPending || generationQuery.isLoading);

  const pokedexBlocking =
    tab === 'browse' && Boolean(filters.pokedexSlug) && (pokedexQuery.isPending || pokedexQuery.isLoading);

  const abilityBlocking =
    tab === 'browse' &&
    Boolean(filters.abilitySlug?.trim()) &&
    (abilityQuery.isPending || abilityQuery.isLoading);

  const candidateIds = useMemo(() => {
    if (!nationalQuery.data || nationalQuery.isLoading) return [];
    const natRows = nationalQuery.data;
    const natSet = toIdSet(natRows.map((r) => r.id));

    if (tab === 'favorites') {
      let base = new Set(favoriteIds.filter((id) => natSet.has(id)));
      const searchSet = filterIdsByTextSearch(natRows, searchText, formsQuery.data ?? null);
      if (searchSet) base = intersectSets(base, searchSet);
      return [...base].sort((a, b) => a - b);
    }

    if (tab === 'recents') {
      const ordered = recentViews.map((r) => r.id).filter((id) => natSet.has(id));
      const searchSet = filterIdsByTextSearch(natRows, searchText, formsQuery.data ?? null);
      if (!searchSet) return ordered;
      return ordered.filter((id) => searchSet.has(id));
    }

    if (typesBlocking || generationBlocking || pokedexBlocking || abilityBlocking) {
      return [];
    }

    let base = natSet;
    if (typeUnion) base = intersectSets(base, typeUnion);
    if (filters.generation !== null && generationQuery.data) {
      base = intersectSets(base, toIdSet(generationQuery.data));
    }
    if (filters.pokedexSlug && pokedexQuery.data) {
      base = intersectSets(base, toIdSet(pokedexQuery.data));
    }
    if (filters.abilitySlug?.trim() && abilityQuery.data) {
      base = intersectSets(base, toIdSet(abilityQuery.data));
    }

    const searchSet = filterIdsByTextSearch(natRows, searchText, formsQuery.data ?? null);
    if (searchSet) base = intersectSets(base, searchSet);

    return [...base].sort((a, b) => a - b);
  }, [
    nationalQuery.data,
    nationalQuery.isLoading,
    tab,
    favoriteIds,
    recentViews,
    filters.generation,
    filters.pokedexSlug,
    filters.abilitySlug,
    typeUnion,
    typesBlocking,
    generationBlocking,
    pokedexBlocking,
    abilityBlocking,
    generationQuery.data,
    pokedexQuery.data,
    abilityQuery.data,
    searchText,
    formsQuery.data,
  ]);

  const needsHeavySummary =
    filters.rarity !== 'any' ||
    filters.statMin !== null ||
    filters.statMax !== null ||
    filters.evolutionStage !== 'any';

  const batchIds = useMemo(() => {
    const cap = needsHeavySummary ? 220 : 120;
    return candidateIds.slice(0, cap);
  }, [candidateIds, needsHeavySummary]);

  const enrichmentKey = useMemo(
    () =>
      `${stableBatchKey(batchIds)}|${filters.rarity}|${filters.statMin ?? ''}|${filters.statMax ?? ''}|${
        filters.evolutionStage
      }|${tab}`,
    [batchIds, filters.rarity, filters.statMin, filters.statMax, filters.evolutionStage, tab],
  );

  const enrichmentQuery = useQuery({
    queryKey: qk.discovery.summaryBatch(enrichmentKey),
    enabled: panelOpen && batchIds.length > 0,
    staleTime: STALE_POKEMON_SUMMARY_MS,
    gcTime: 1000 * 60 * 60 * 6,
    queryFn: async ({ signal }) => {
      const summaries: PokemonSummary[] = [];
      const chunkSize = 12;
      for (let i = 0; i < batchIds.length; i += chunkSize) {
        if (signal.aborted) break;
        const chunk = batchIds.slice(i, i + chunkSize);
        const part = await Promise.all(
          chunk.map((id) =>
            qc.fetchQuery({
              queryKey: qk.pokemon.summary(id),
              queryFn: ({ signal: s }) =>
                fetchPokemonSummaryById(id, AbortSignal.any([signal, s])),
              staleTime: STALE_POKEMON_SUMMARY_MS,
              gcTime: 1000 * 60 * 60 * 24,
            }),
          ),
        );
        for (const row of part) {
          if (row) summaries.push(row);
        }
      }

      let priorMap: Map<number, boolean> | null = null;
      if (filters.evolutionStage !== 'any') {
        priorMap = await qc.fetchQuery({
          queryKey: qk.pokemon.speciesPriorBatch(stableBatchKey(batchIds)),
          queryFn: ({ signal: s }) =>
            fetchSpeciesPriorEvolutionMap(batchIds, AbortSignal.any([signal, s])),
          staleTime: STALE_SPECIES_PRIOR_MS,
          gcTime: 1000 * 60 * 60 * 24,
        });
      }

      const filtered = applySummaryFilters(summaries, filters, priorMap);
      filtered.sort((a, b) => a.id - b.id);
      return filtered.slice(0, 120);
    },
  });

  const isIndexingForms = formsQuery.isPending || formsQuery.isLoading;

  return {
    panelOpen,
    tab,
    searchText,
    filters,
    index,
    nationalQuery,
    formsQuery,
    isIndexingForms,
    candidateIds,
    displayRows: enrichmentQuery.data ?? [],
    enrichmentQuery,
    isResolvingStructure:
      nationalQuery.isLoading ||
      (tab === 'browse' && (typesBlocking || generationBlocking || pokedexBlocking || abilityBlocking)),
  };
}
