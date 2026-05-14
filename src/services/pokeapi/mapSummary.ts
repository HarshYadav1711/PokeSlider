import type { PokemonSpeciesResponse, PokemonResponse, PokemonTypeSlot } from '../../types/pokeapi';
import type { PokemonBaseStats, PokemonCategory, PokemonSummary, PokemonTypeName } from '../../types/pokemon';
import { getGeneration, isPseudoLegendary, parseGenerationFromPokeApiUrl } from '../../utils/pokemonMeta';
import { parsePokemonIdFromPokeApiUrl } from './resourceIds';

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

export function pickEnglishGenus(species: PokemonSpeciesResponse): string | null {
  const rows = species.genera;
  if (Array.isArray(rows) && rows.length > 0) {
    const en = rows.find((g) => g.language?.name === 'en');
    if (en?.genus?.trim()) return en.genus.trim();
  }
  if (species.genus?.trim()) return species.genus.trim();
  return null;
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

  const speciesId = typeof species.id === 'number' && species.id > 0 ? species.id : pokemon.id;
  const generation =
    parseGenerationFromPokeApiUrl(species.generation?.url) ?? getGeneration(pokemon.id);
  const habitatSlug = (species.habitat?.name ?? 'unknown').toLowerCase();
  const genus = pickEnglishGenus(species);
  const dexOrder = Number.isFinite(species.order) ? species.order : speciesId;
  const varieties = species.varieties ?? [];
  const defaultEntry = varieties.find((v) => v.is_default) ?? varieties[0];
  const defaultPid = defaultEntry ? parsePokemonIdFromPokeApiUrl(defaultEntry.pokemon.url) : null;
  const isDefaultVariety = defaultPid === null ? true : defaultPid === pokemon.id;

  return {
    id: pokemon.id,
    name: pokemon.name,
    speciesId,
    generation,
    habitatSlug,
    genus,
    dexOrder,
    isBaby: Boolean(species.is_baby),
    isDefaultVariety,
    sprite: pokemon.sprites.front_default,
    image,
    types: mapTypes(pokemon.types),
    baseStatTotal,
    baseStats: mapBaseStats(pokemon.stats),
    speciesCatchRate: Math.max(1, Math.min(255, species.capture_rate)),
    isLegendary,
    isMythical,
    isPseudoLegendary: pseudo,
    category,
  };
}
