import type { PokemonListResponse } from '../../types/pokeapi';
import { pokeFetch } from './client';
import { parsePokemonIdFromPokeApiUrl } from './resourceIds';

const NATIONAL_DEX_LIMIT = 1025;

export async function fetchPokemonNationalDexIds(signal?: AbortSignal): Promise<number[]> {
  const data = await pokeFetch<PokemonListResponse>(`/pokemon?limit=${NATIONAL_DEX_LIMIT}`, { signal });
  const ids: number[] = [];
  for (const row of data.results) {
    const id = parsePokemonIdFromPokeApiUrl(row.url);
    if (id !== null) ids.push(id);
  }
  return ids;
}
