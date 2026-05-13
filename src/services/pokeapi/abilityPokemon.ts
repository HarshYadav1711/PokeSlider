import type { AbilityDetailResponse, PokemonListResponse } from '../../types/pokeapi';
import { pokeFetch } from './client';
import { parsePokemonIdFromPokeApiUrl } from './resourceIds';

export async function fetchAbilitySlugList(signal?: AbortSignal): Promise<string[]> {
  const data = await pokeFetch<PokemonListResponse>('/ability?limit=1000', { signal });
  return data.results.map((r) => r.name);
}

export async function fetchPokemonIdsForAbility(abilitySlug: string, signal?: AbortSignal): Promise<number[]> {
  const data = await pokeFetch<AbilityDetailResponse>(`/ability/${encodeURIComponent(abilitySlug)}`, { signal });
  const ids: number[] = [];
  for (const row of data.pokemon) {
    const id = parsePokemonIdFromPokeApiUrl(row.pokemon.url);
    if (id !== null) ids.push(id);
  }
  return ids;
}
