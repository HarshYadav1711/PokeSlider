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

/** Base stats from PokéAPI (used by team builder + discovery summaries). */
export interface PokemonBaseStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

/** Lightweight index row used for grids + ball suggestions */
export interface PokemonSummary {
  /** `/pokemon/{id}` identity — unique per form / regional / mega resource. */
  id: number;
  name: string;
  /** Shared `/pokemon-species/{id}` identity for all varieties of a species. */
  speciesId: number;
  /** Main-series generation (1–9) from species `generation` resource. */
  generation: number;
  /** PokéAPI habitat resource name, or `unknown`. */
  habitatSlug: string;
  /** English species genus line, e.g. "Seed Pokémon", when available. */
  genus: string | null;
  /** Species `order` field (national dex ordering helper). */
  dexOrder: number;
  isBaby: boolean;
  /** True when this resource is the species default variety. */
  isDefaultVariety: boolean;
  sprite: string | null;
  image: string | null;
  types: PokemonTypeName[];
  baseStatTotal: number;
  baseStats: PokemonBaseStats;
  /** From species `capture_rate` — used for catch math + ball fit. */
  speciesCatchRate: number;
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
  speciesId: number;
  name: string;
  image: string | null;
  types: PokemonTypeName[];
  stats: PokemonStatRow[];
  baseStatTotal: number;
  /** Species capture_rate from PokéAPI (same field as summaries). */
  speciesCatchRate: number;
  pokedexEntries: string[];
  /** Best English flavor line (version-priority), cleaned for UI. */
  primaryPokedexFlavor: string;
  evolutionData: EvolutionChainResponse;
  isLegendary: boolean;
  isMythical: boolean;
  isPseudoLegendary: boolean;
  locations: PokemonEncounterLocation[];
  generation: number;
  /** PokéAPI habitat slug, or `unknown`. */
  habitat: string;
  /** English species genus line when available. */
  genus: string | null;
  isBaby: boolean;
  megaEvolutions: MegaFormSummary[];
  cryUrl: string | null;
}

export interface PokemonComparisonAbility {
  name: string;
  isHidden: boolean;
  slot: number;
}

/** Minimal fields for VS compare (no locations / mega / cries). */
export interface PokemonComparisonProfile {
  id: number;
  name: string;
  image: string | null;
  types: PokemonTypeName[];
  stats: PokemonStatRow[];
  baseStatTotal: number;
  /** PokéAPI height in meters (decimeters ÷ 10). */
  heightM: number;
  /** PokéAPI weight in kilograms (hectograms ÷ 10). */
  weightKg: number;
  abilities: PokemonComparisonAbility[];
  /** True if species has a prior evolution (`evolves_from_species`). */
  hasPriorEvolution: boolean;
}

export interface EvolutionChainPokemon {
  id: number;
  name: string;
  image: string | null;
  /** Depth in the evolution tree from the chain root (0 = base). */
  level: number;
  /** First evolution detail entry (legacy / compact UIs). */
  details: EvolutionDetail | null;
  /** All evolution detail objects for this stage (multiple valid methods). */
  evolutionDetails: EvolutionDetail[];
  types: PokemonTypeName[];
  stats: PokemonStatRow[];
  baseStatTotal: number;
}

/** One stage in the cinematic evolution explorer (chain + species flavor). */
export interface EvolutionTimelineStage extends EvolutionChainPokemon {
  genus: string;
  flavorText: string;
  /** Human-readable lines describing how this stage is reached (empty for the chain root). */
  evolutionHintLines: string[];
}

export interface TypeEffectivenessResult {
  superEffective: PokemonTypeName[];
  notVeryEffective: PokemonTypeName[];
  noEffect: PokemonTypeName[];
}
