import { ALL_POKEMON_TYPES } from '../../data/pokemonTypes';
import type { TypeResponse } from '../../types/pokeapi';
import { pokeFetch } from './client';

/** One `/type/{name}` payload per type, in `ALL_POKEMON_TYPES` order. */
export async function fetchTypeResponsesForAllTypes(signal?: AbortSignal): Promise<TypeResponse[]> {
  return Promise.all(ALL_POKEMON_TYPES.map((t) => pokeFetch<TypeResponse>(`/type/${t}`, { signal })));
}
