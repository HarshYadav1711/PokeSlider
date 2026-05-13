import type { EvolutionChainResponse, EvolutionDetail } from './pokeapi';

export type PokemonTypeName =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

export type PokemonCategory = 'legendary' | 'mythical' | 'pseudoLegendary' | 'regular';

/** Lightweight index row used for grids + ball suggestions */
export interface PokemonSummary {
  id: number;
  name: string;
  sprite: string | null;
  image: string | null;
  types: PokemonTypeName[];
  baseStatTotal: number;
  isLegendary: boolean;
  isMythical: boolean;
  isPseudoLegendary: boolean;
  category: PokemonCategory;
}

export interface PokemonStatRow {
  name: string;
  value: number;
}

export interface PokemonEncounterLocation {
  location: string;
  game: string;
  method: string;
  chance: number;
  minLevel: number;
  maxLevel: number;
}

export interface MegaFormSummary {
  id: number;
  name: string;
  formName: string;
  image: string | null;
  types: PokemonTypeName[];
  stats: PokemonStatRow[];
  baseStatTotal: number;
  megaStone: string;
  isMega: true;
}

export interface DetailedPokemon {
  id: number;
  name: string;
  image: string | null;
  types: PokemonTypeName[];
  stats: PokemonStatRow[];
  baseStatTotal: number;
  pokedexEntries: string[];
  evolutionData: EvolutionChainResponse;
  isLegendary: boolean;
  isMythical: boolean;
  isPseudoLegendary: boolean;
  locations: PokemonEncounterLocation[];
  generation: number;
  habitat: string;
  megaEvolutions: MegaFormSummary[];
  cryUrl: string | null;
}

export interface EvolutionChainPokemon {
  id: number;
  name: string;
  image: string | null;
  level: number;
  details: EvolutionDetail | null;
}

export interface TypeEffectivenessResult {
  superEffective: PokemonTypeName[];
  notVeryEffective: PokemonTypeName[];
  noEffect: PokemonTypeName[];
}
