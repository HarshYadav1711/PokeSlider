import type { PokemonFormSearchRow } from '../../services/pokeapi/pokemonFormsIndex';
import type { NationalDexRow } from '../../services/pokeapi/pokemonListResource';
import type { PokemonSummary } from '../../types/pokemon';

import type { DiscoveryFiltersState } from './discoveryTypes';

export function stableBatchKey(ids: readonly number[], max = 220): string {
  return [...new Set(ids)]
    .sort((a, b) => a - b)
    .slice(0, max)
    .join('|');
}

export function toIdSet(ids: readonly number[]): Set<number> {
  return new Set(ids.filter((n) => n > 0));
}

export function intersectSets(base: Set<number>, other: Set<number> | null): Set<number> {
  if (other === null) return base;
  const out = new Set<number>();
  for (const x of base) {
    if (other.has(x)) out.add(x);
  }
  return out;
}

export function filterIdsByTextSearch(
  index: readonly NationalDexRow[],
  query: string,
  forms?: readonly PokemonFormSearchRow[] | null,
): Set<number> | null {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return null;
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;

  const formBlobByPokemon = new Map<number, string>();
  if (forms) {
    for (const f of forms) {
      const cur = formBlobByPokemon.get(f.pokemonId) ?? '';
      formBlobByPokemon.set(f.pokemonId, `${cur} ${f.formName}`);
    }
  }

  const out = new Set<number>();
  for (const row of index) {
    const blob = `${row.name} ${formBlobByPokemon.get(row.id) ?? ''}`
      .toLowerCase()
      .replaceAll('-', ' ');
    const ok = tokens.every((t) => blob.includes(t.replaceAll('-', ' ')));
    if (ok) out.add(row.id);
  }
  return out;
}

export function applySummaryFilters(
  rows: readonly PokemonSummary[],
  filters: DiscoveryFiltersState,
  priorMap: ReadonlyMap<number, boolean> | null,
): PokemonSummary[] {
  let r = [...rows];
  if (filters.rarity !== 'any') {
    r = r.filter((p) => p.category === filters.rarity);
  }
  if (filters.statMin !== null) {
    const min = filters.statMin;
    r = r.filter((p) => p.baseStatTotal >= min);
  }
  if (filters.statMax !== null) {
    const max = filters.statMax;
    r = r.filter((p) => p.baseStatTotal <= max);
  }
  if (filters.evolutionStage !== 'any' && priorMap) {
    const wantPrior = filters.evolutionStage === 'has_prior';
    r = r.filter((p) => {
      const prior = priorMap.get(p.id) ?? false;
      return wantPrior ? prior : !prior;
    });
  }
  return r;
}
