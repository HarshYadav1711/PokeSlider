import type { PokemonResponse, PokemonSpeciesResponse } from '../../types/pokeapi';
import type { PokemonSummary } from '../../types/pokemon';
import { pokeFetch } from './client';
import { mapPokemonSummary } from './mapSummary';

export async function fetchPokemonSummaryById(id: number, signal?: AbortSignal): Promise<PokemonSummary | null> {
  try {
    const [pokemon, species] = await Promise.all([
      pokeFetch<PokemonResponse>(`/pokemon/${id}`, { signal }),
      pokeFetch<PokemonSpeciesResponse>(`/pokemon-species/${id}`, { signal }),
    ]);
    return mapPokemonSummary(pokemon, species);
  } catch {
    return null;
  }
}
