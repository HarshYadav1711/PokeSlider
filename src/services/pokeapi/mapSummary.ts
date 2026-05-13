import type { PokemonSpeciesResponse, PokemonResponse, PokemonTypeSlot } from '../../types/pokeapi';
import type { PokemonBaseStats, PokemonCategory, PokemonSummary, PokemonTypeName } from '../../types/pokemon';
import { isPseudoLegendary } from '../../utils/pokemonMeta';

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

function mapTypes(slots: PokemonTypeSlot[]): PokemonTypeName[] {
  const out: PokemonTypeName[] = [];
  for (const slot of slots) {
    const name = slot.type.name;
    if (TYPE_SET.has(name)) {
      out.push(name as PokemonTypeName);
    }
  }
  return out;
}

function resolveCategory(
  isLegendary: boolean,
  isMythical: boolean,
  isPseudo: boolean,
): PokemonCategory {
  if (isLegendary) return 'legendary';
  if (isMythical) return 'mythical';
  if (isPseudo) return 'pseudoLegendary';
  return 'regular';
}

function mapBaseStats(stats: PokemonResponse['stats']): PokemonBaseStats {
  const m: Record<string, number> = {};
  for (const row of stats) {
    m[row.stat.name] = row.base_stat;
  }
  return {
    hp: m.hp ?? 0,
    attack: m.attack ?? 0,
    defense: m.defense ?? 0,
    specialAttack: m['special-attack'] ?? 0,
    specialDefense: m['special-defense'] ?? 0,
    speed: m.speed ?? 0,
  };
}

export function mapPokemonSummary(pokemon: PokemonResponse, species: PokemonSpeciesResponse): PokemonSummary {
  const baseStatTotal = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  const isLegendary = species.is_legendary;
  const isMythical = species.is_mythical;
  const pseudo = isPseudoLegendary(pokemon, species, baseStatTotal);
  const category = resolveCategory(isLegendary, isMythical, pseudo);

  const image =
    pokemon.sprites.other?.['official-artwork']?.front_default ?? pokemon.sprites.front_default;

  return {
    id: pokemon.id,
    name: pokemon.name,
    sprite: pokemon.sprites.front_default,
    image,
    types: mapTypes(pokemon.types),
    baseStatTotal,
    baseStats: mapBaseStats(pokemon.stats),
    isLegendary,
    isMythical,
    isPseudoLegendary: pseudo,
    category,
  };
}
