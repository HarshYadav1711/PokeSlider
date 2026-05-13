import type { GenerationResponse } from '../../types/pokeapi';
import { pokeFetch } from './client';
import { parsePokemonSpeciesIdFromPokeApiUrl } from './resourceIds';

/** National Dex Pokémon ids whose species belong to this generation (main-series games). */
export async function fetchPokemonIdsForGeneration(genId: number, signal?: AbortSignal): Promise<number[]> {
  const data = await pokeFetch<GenerationResponse>(`/generation/${genId}`, { signal });
  const ids: number[] = [];
  for (const row of data.pokemon_species) {
    const sid = parsePokemonSpeciesIdFromPokeApiUrl(row.url);
    if (sid !== null) ids.push(sid);
  }
  return ids;
}
