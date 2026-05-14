import type { PokemonListResponse } from '../../types/pokeapi';
import { pokeFetch } from './client';
import { parsePokemonIdFromPokeApiUrl } from './resourceIds';

const PAGE_SIZE = 500;

export interface NationalDexRow {
  id: number;
  name: string;
}

/** Full `/pokemon` index (every canonical form id) — paginated, never eager-loaded as summaries. */
export async function fetchPokemonNationalIndex(signal?: AbortSignal): Promise<NationalDexRow[]> {
  const head = await pokeFetch<PokemonListResponse>('/pokemon?limit=1', { signal });
  const total = head.count;
  const out: NationalDexRow[] = [];
  let offset = 0;
  while (offset < total) {
    if (signal?.aborted) break;
    const page = await pokeFetch<PokemonListResponse>(
      `/pokemon?limit=${PAGE_SIZE}&offset=${offset}`,
      { signal },
    );
    for (const row of page.results) {
      const id = parsePokemonIdFromPokeApiUrl(row.url);
      if (id !== null) out.push({ id, name: row.name });
    }
    offset += page.results.length;
    if (page.results.length === 0) break;
  }
  return out;
}

export async function fetchPokemonNationalDexIds(signal?: AbortSignal): Promise<number[]> {
  const rows = await fetchPokemonNationalIndex(signal);
  return rows.map((r) => r.id);
}
