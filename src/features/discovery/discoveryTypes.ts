import type { PokemonCategory, PokemonTypeName } from '../../types/pokemon';

export type MyDexTab = 'browse' | 'favorites' | 'recents';

export type EvolutionStageFilter = 'any' | 'no_prior' | 'has_prior';

export type DiscoveryRarityFilter = 'any' | PokemonCategory;

export interface DiscoveryFiltersState {
  /** Pokémon that include any of these types (OR). */
  types: readonly PokemonTypeName[];
  generation: number | null;
  /** Regional / special dex slug from PokeAPI, e.g. `national`, `original-alola`. */
  pokedexSlug: string | null;
  abilitySlug: string | null;
  rarity: DiscoveryRarityFilter;
  evolutionStage: EvolutionStageFilter;
  statMin: number | null;
  statMax: number | null;
}

export const defaultDiscoveryFilters = (): DiscoveryFiltersState => ({
  types: [],
  generation: null,
  pokedexSlug: null,
  abilitySlug: null,
  rarity: 'any',
  evolutionStage: 'any',
  statMin: null,
  statMax: null,
});
