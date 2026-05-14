export const REGION_IDS = [
  'kanto',
  'johto',
  'hoenn',
  'sinnoh',
  'unova',
  'kalos',
  'alola',
  'galar',
  'paldea',
] as const;

export type RegionId = (typeof REGION_IDS)[number];

export type RegionHotspotKind =
  | 'city'
  | 'route'
  | 'gym'
  | 'cave'
  | 'legendary'
  | 'landmark'
  | 'island'
  | 'forest';

/**
 * Stylized canonical SVG map layers (normalized viewBox 0 0 100 60).
 * Vector-only — no embedded rasters; paths are optimized recreations, not ROM-derived art.
 */
export interface RegionMapArt {
  /** Primary land masses (filled). */
  readonly terrain: readonly string[];
  /** Bays, lakes, inland water (filled under terrain cutouts or as overlays). */
  readonly water: readonly string[];
  /** Forest / park canopy masses (filled, drawn above terrain). */
  readonly forests: readonly string[];
  /** Optional smaller land bodies separated by water (archipelagos). */
  readonly islands?: readonly string[];
  /** Thin coast accents (stroked, non-interactive). */
  readonly coast?: readonly string[];
  /** Surf / channel corridors (stroked, dashed). */
  readonly waterRoutes?: readonly string[];
  /** When set, water paths are filled with `fill-rule="evenodd"` (ocean frames with holes). */
  readonly waterFillRule?: 'evenodd';
}

export interface RegionHotspot {
  readonly id: string;
  readonly kind: RegionHotspotKind;
  readonly label: string;
  /** Normalized map position (0–100) in the shared scene viewBox. */
  readonly map: { readonly x: number; readonly y: number };
  readonly lore: string;
  readonly linkedRouteId?: string;
  readonly progressionTease?: string;
  readonly habitatTease?: string;
  readonly atmosphereTease?: string;
  readonly weatherHint?: string;
}

export interface RegionRoute {
  readonly id: string;
  readonly name: string;
  /** Normalized map position (0–100). */
  readonly map: { readonly x: number; readonly y: number };
  readonly blurb: string;
  /** Curated species ids for quick previews (default forms). */
  readonly encounterSampleIds: readonly number[];
}

export interface RegionHabitat {
  readonly title: string;
  readonly tease: string;
}

export interface RegionAtmosphere {
  readonly bgFrom: string;
  readonly bgVia: string;
  readonly bgTo: string;
  readonly accent: string;
  readonly accentSoft: string;
  readonly mist: string;
  /** Short mood line for the scene chrome (optional). */
  readonly weatherHint?: string;
}

export interface RegionDefinition {
  readonly id: RegionId;
  readonly name: string;
  readonly generation: number;
  readonly tagline: string;
  readonly lore: string;
  readonly habitats: readonly RegionHabitat[];
  readonly routes: readonly RegionRoute[];
  readonly atmosphere: RegionAtmosphere;
  /**
   * Optional SVG atlas override. When omitted, the explorer resolves art from the
   * lazy `regionLayerAtlas` keyed by `id` so region data chunks stay small.
   */
  readonly mapArt?: RegionMapArt;
}
