import type { PokemonCategory, PokemonTypeName } from '../../types/pokemon';
import type { PokemonBattleRoleBucket } from '../../utils/pokemonBattleRole';

export type MyDexTab = 'browse' | 'favorites' | 'recents';

export type EvolutionStageFilter = 'any' | 'no_prior' | 'has_prior';

export type DiscoveryRarityFilter = 'any' | PokemonCategory;

/** Canonical PokéAPI habitat resource names surfaced in filters. */
export const DISCOVERY_HABITAT_SLUGS = [
  'cave',
  'forest',
  'grassland',
  'mountain',
  'rare',
  'rough-terrain',
  'sea',
  'urban',
  'waters-edge',
] as const;

export type DiscoveryHabitatSlug = (typeof DISCOVERY_HABITAT_SLUGS)[number];

export type FormVariantFilter = 'any' | 'default_only' | 'alternate_only';

export type DiscoveryBattleRoleFilter = 'any' | PokemonBattleRoleBucket;

export interface DiscoveryFiltersState {
  /** Pokémon that include any of these types (OR). */
  types: readonly PokemonTypeName[];
  generation: number | null;
  /** Regional / special dex slug from PokeAPI, e.g. `national`, `original-alola`. */
  pokedexSlug: string | null;
  abilitySlug: string | null;
  /** PokéAPI habitat slug, or null for any. */
  habitatSlug: string | null;
  formVariant: FormVariantFilter;
  battleRole: DiscoveryBattleRoleFilter;
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
  habitatSlug: null,
  formVariant: 'any',
  battleRole: 'any',
  rarity: 'any',
  evolutionStage: 'any',
  statMin: null,
  statMax: null,
});
