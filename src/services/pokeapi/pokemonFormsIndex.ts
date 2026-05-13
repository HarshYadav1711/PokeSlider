import type { NamedApiResource, PokemonFormDetailResponse, PokemonListResponse } from '../../types/pokeapi';
import { pokeFetch, pokePathFromResourceUrl } from './client';
import { parsePokemonIdFromPokeApiUrl } from './resourceIds';

export interface PokemonFormSearchRow {
  pokemonId: number;
  formName: string;
}

const PAGE = 200;
const CONCURRENCY = 10;

export async function fetchPokemonFormSearchIndex(signal?: AbortSignal): Promise<PokemonFormSearchRow[]> {
  const listRows: NamedApiResource[] = [];
  let pageUrl: string | null = `/pokemon-form?limit=${PAGE}`;

  while (pageUrl) {
    if (signal?.aborted) break;
    const page: PokemonListResponse = await pokeFetch<PokemonListResponse>(pageUrl, { signal });
    listRows.push(...page.results);
    if (!page.next) break;
    const nextUrl = new URL(page.next);
    pageUrl = `${nextUrl.pathname.replace(/^\/api\/v2/, '')}${nextUrl.search}`;
  }

  const out: PokemonFormSearchRow[] = [];
  for (let i = 0; i < listRows.length; i += CONCURRENCY) {
    if (signal?.aborted) break;
    const chunk = listRows.slice(i, i + CONCURRENCY);
    const part = await Promise.all(
      chunk.map(async (row) => {
        const path = pokePathFromResourceUrl(row.url);
        const detail = await pokeFetch<PokemonFormDetailResponse>(path, { signal });
        const pokemonId = parsePokemonIdFromPokeApiUrl(detail.pokemon.url);
        if (pokemonId === null) return null;
        return { pokemonId, formName: detail.name } satisfies PokemonFormSearchRow;
      }),
    );
    for (const row of part) {
      if (row) out.push(row);
    }
  }

  return out;
}
