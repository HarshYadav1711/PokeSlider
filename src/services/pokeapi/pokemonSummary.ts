import type { PokemonResponse, PokemonSpeciesResponse } from '../../types/pokeapi';
import type { PokemonSummary } from '../../types/pokemon';
import { pokeFetch, pokePathFromResourceUrl } from './client';
import { mapPokemonSummary } from './mapSummary';

export async function fetchPokemonSummaryById(id: number, signal?: AbortSignal): Promise<PokemonSummary | null> {
  try {
    const pokemon = await pokeFetch<PokemonResponse>(`/pokemon/${id}`, { signal });
    const species = await pokeFetch<PokemonSpeciesResponse>(pokePathFromResourceUrl(pokemon.species.url), {
      signal,
    });
    return mapPokemonSummary(pokemon, species);
  } catch {
    return null;
  }
}
