import type { TypeResponse } from '../../types/pokeapi';
import { pokeFetch } from './client';
import { parsePokemonIdFromPokeApiUrl } from './resourceIds';

export async function fetchPokemonIdsForType(typeName: string, signal?: AbortSignal): Promise<number[]> {
  const data = await pokeFetch<TypeResponse>(`/type/${typeName}`, { signal });
  const slots = data.pokemon ?? [];
  const ids: number[] = [];
  for (const row of slots) {
    const id = parsePokemonIdFromPokeApiUrl(row.pokemon.url);
    if (id !== null) ids.push(id);
  }
  return ids;
}
