import type {
  PokemonListResponse,
  PokemonResponse,
  PokemonSpeciesResponse,
} from '../../types/pokeapi';
import type { PokemonSummary } from '../../types/pokemon';
import { pokeFetch } from './client';
import { mapPokemonSummary } from './mapSummary';

const DEFAULT_LIMIT = 1025;
const CONCURRENCY = 8;

export interface CatalogBuildCallbacks {
  onProgress?: (loaded: number, total: number) => void;
  signal?: AbortSignal;
}

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

async function loadOne(id: number, signal?: AbortSignal): Promise<PokemonSummary | null> {
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

export async function buildPokemonCatalog(callbacks: CatalogBuildCallbacks = {}): Promise<PokemonSummary[]> {
  const { onProgress, signal } = callbacks;
  const list = await pokeFetch<PokemonListResponse>(`/pokemon?limit=${DEFAULT_LIMIT}`, { signal });
  const total = list.results.length;
  const ids = list.results.map((_, index) => index + 1);
  const batches = chunk(ids, CONCURRENCY);
  const collected: PokemonSummary[] = [];

  let loaded = 0;
  for (const batch of batches) {
    if (signal?.aborted) break;
    const results = await Promise.all(batch.map((id) => loadOne(id, signal)));
    for (const row of results) {
      if (row) collected.push(row);
    }
    loaded += batch.length;
    onProgress?.(Math.min(loaded, total), total);
  }

  collected.sort((a, b) => a.id - b.id);
  return collected;
}
