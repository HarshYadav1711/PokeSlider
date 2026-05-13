import type { PokemonResponse, PokemonSpeciesResponse } from '../../types/pokeapi';
import type {
  PokemonComparisonAbility,
  PokemonComparisonProfile,
  PokemonStatRow,
  PokemonTypeName,
} from '../../types/pokemon';
import { pokeFetch, pokePathFromResourceUrl } from './client';

const TYPE_SET = new Set<string>([
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
]);

function mapTypes(slots: PokemonResponse['types']): PokemonTypeName[] {
  const out: PokemonTypeName[] = [];
  for (const slot of slots) {
    const name = slot.type.name;
    if (TYPE_SET.has(name)) out.push(name as PokemonTypeName);
  }
  return out;
}

function mapStats(stats: PokemonResponse['stats']): PokemonStatRow[] {
  return stats.map((s) => ({
    name: s.stat.name.replaceAll('-', ' '),
    value: s.base_stat,
  }));
}

function mapAbilities(slots: PokemonResponse['abilities'] | undefined): PokemonComparisonAbility[] {
  if (!slots) return [];
  return [...slots]
    .sort((a, b) => a.slot - b.slot)
    .map((row) => ({
      name: row.ability.name.replaceAll('-', ' '),
      isHidden: row.is_hidden,
      slot: row.slot,
    }));
}

export async function fetchPokemonComparisonProfile(
  id: number | string,
  signal?: AbortSignal,
): Promise<PokemonComparisonProfile | null> {
  try {
    const data = await pokeFetch<PokemonResponse>(`/pokemon/${id}`, { signal });
    const speciesData = await pokeFetch<PokemonSpeciesResponse>(
      pokePathFromResourceUrl(data.species.url),
      { signal },
    );

    const baseStatTotal = data.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

    return {
      id: data.id,
      name: data.name,
      image:
        data.sprites.other?.['official-artwork']?.front_default ??
        data.sprites.other?.['home']?.front_default ??
        data.sprites.front_default,
      types: mapTypes(data.types),
      stats: mapStats(data.stats),
      baseStatTotal,
      heightM: data.height / 10,
      weightKg: data.weight / 10,
      abilities: mapAbilities(data.abilities),
      hasPriorEvolution: speciesData.evolves_from_species !== null,
    };
  } catch {
    return null;
  }
}
