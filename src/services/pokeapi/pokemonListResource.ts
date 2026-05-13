import type { PokemonListResponse } from '../../types/pokeapi';
import { pokeFetch } from './client';
import { parsePokemonIdFromPokeApiUrl } from './resourceIds';

const NATIONAL_DEX_LIMIT = 1025;

export interface NationalDexRow {
  id: number;
  name: string;
}

export async function fetchPokemonNationalIndex(signal?: AbortSignal): Promise<NationalDexRow[]> {
  const data = await pokeFetch<PokemonListResponse>(`/pokemon?limit=${NATIONAL_DEX_LIMIT}`, { signal });
  const out: NationalDexRow[] = [];
  for (const row of data.results) {
    const id = parsePokemonIdFromPokeApiUrl(row.url);
    if (id !== null) out.push({ id, name: row.name });
  }
  return out;
}

export async function fetchPokemonNationalDexIds(signal?: AbortSignal): Promise<number[]> {
  const rows = await fetchPokemonNationalIndex(signal);
  return rows.map((r) => r.id);
}
