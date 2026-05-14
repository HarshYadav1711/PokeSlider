import type { PokemonSpeciesResponse } from '../../types/pokeapi';
import { pokeFetch } from './client';
import { parsePokemonIdFromPokeApiUrl } from './resourceIds';

/**
 * Expands PokéAPI species ids to every linked `/pokemon/{id}` variety id for that species.
 * Used for generation / regional dex filters so alternate forms stay consistent with the national Pokémon index.
 */
export async function fetchPokemonIdsForSpeciesVarietyUnion(
  speciesIds: readonly number[],
  signal?: AbortSignal,
  batchSize = 12,
): Promise<number[]> {
  const out = new Set<number>();
  const unique = [...new Set(speciesIds)].filter((n) => n > 0);
  for (let i = 0; i < unique.length; i += batchSize) {
    if (signal?.aborted) break;
    const chunk = unique.slice(i, i + batchSize);
    const speciesRows = await Promise.all(
      chunk.map((sid) => pokeFetch<PokemonSpeciesResponse>(`/pokemon-species/${sid}`, { signal })),
    );
    for (const sp of speciesRows) {
      for (const v of sp.varieties ?? []) {
        const pid = parsePokemonIdFromPokeApiUrl(v.pokemon.url);
        if (pid !== null) out.add(pid);
      }
    }
  }
  return [...out].sort((a, b) => a - b);
}
