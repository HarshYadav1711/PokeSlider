import type { PokedexDetailResponse, PokemonListResponse } from '../../types/pokeapi';
import { pokeFetch } from './client';
import { parsePokemonSpeciesIdFromPokeApiUrl } from './resourceIds';

export async function fetchPokedexSlugList(signal?: AbortSignal): Promise<{ name: string; displayName: string }[]> {
  const data = await pokeFetch<PokemonListResponse>('/pokedex?limit=64', { signal });
  return data.results.map((r) => ({
    name: r.name,
    displayName: r.name.replaceAll('-', ' '),
  }));
}

export async function fetchPokemonIdsForPokedex(slug: string, signal?: AbortSignal): Promise<number[]> {
  const data = await pokeFetch<PokedexDetailResponse>(`/pokedex/${slug}`, { signal });
  const ids: number[] = [];
  for (const entry of data.pokemon_entries) {
    const sid = parsePokemonSpeciesIdFromPokeApiUrl(entry.pokemon_species.url);
    if (sid !== null) ids.push(sid);
  }
  return ids;
}
