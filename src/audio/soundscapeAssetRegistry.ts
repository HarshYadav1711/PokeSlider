import type { RegionId } from '../features/region-explorer/data/regionTypes';
import type { PokemonTypeName } from '../types/pokemon';

/**
 * Optional remote loops — leave empty to use procedural beds only.
 * When a URL is set, the loader fetches lazily on first use (see `lazyAmbientLoop`).
 */
export const SOUNDSCAPE_OPTIONAL_TYPE_LOOPS: Partial<Readonly<Record<PokemonTypeName, string>>> = {};

export const SOUNDSCAPE_OPTIONAL_REGION_LOOPS: Partial<Readonly<Record<RegionId, string>>> = {};
