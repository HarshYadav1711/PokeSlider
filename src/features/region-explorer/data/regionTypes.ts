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

export type RegionHotspotKind = 'city' | 'route' | 'gym' | 'cave' | 'legendary' | 'landmark';

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
}
