import type { GenerationResponse } from '../../types/pokeapi';
import { pokeFetch } from './client';
import { parsePokemonSpeciesIdFromPokeApiUrl } from './resourceIds';
import { fetchPokemonIdsForSpeciesVarietyUnion } from './speciesVarietyExpansion';

/** Every `/pokemon/{id}` variety whose species is listed on this main-series generation. */
export async function fetchPokemonIdsForGeneration(genId: number, signal?: AbortSignal): Promise<number[]> {
  const data = await pokeFetch<GenerationResponse>(`/generation/${genId}`, { signal });
  const speciesIds: number[] = [];
  for (const row of data.pokemon_species) {
    const sid = parsePokemonSpeciesIdFromPokeApiUrl(row.url);
    if (sid !== null) speciesIds.push(sid);
  }
  return fetchPokemonIdsForSpeciesVarietyUnion(speciesIds, signal);
}
