/**
 * Barrel for path `data/regions` — does **not** import individual region modules
 * (those are lazy-loaded via `loadRegionDefinition`).
 */
export { loadRegionDefinition } from '../loadRegionDefinition';
export { REGION_TABS } from '../regionManifest';
export type { RegionTabMeta } from '../regionManifest';
