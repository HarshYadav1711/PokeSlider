import type { PokemonSpeciesResponse } from '../../types/pokeapi';
import { pokeFetch } from './client';

/** Map keyed by PokéAPI `pokemon-species` id → whether the species evolves from another species. */
export async function fetchSpeciesHasPriorEvolution(
  speciesId: number,
  signal?: AbortSignal,
): Promise<{ speciesId: number; hasPriorEvolution: boolean }> {
  const data = await pokeFetch<PokemonSpeciesResponse>(`/pokemon-species/${speciesId}`, { signal });
  return { speciesId, hasPriorEvolution: data.evolves_from_species !== null };
}

export async function fetchSpeciesPriorEvolutionMap(
  speciesIds: readonly number[],
  signal: AbortSignal,
  batchSize = 8,
): Promise<Map<number, boolean>> {
  const map = new Map<number, boolean>();
  const unique = [...new Set(speciesIds)].filter((n) => n > 0);
  for (let i = 0; i < unique.length; i += batchSize) {
    if (signal.aborted) break;
    const chunk = unique.slice(i, i + batchSize);
    const rows = await Promise.all(chunk.map((id) => fetchSpeciesHasPriorEvolution(id, signal)));
    for (const row of rows) {
      map.set(row.speciesId, row.hasPriorEvolution);
    }
  }
  return map;
}
