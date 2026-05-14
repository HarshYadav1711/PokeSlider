import type { RegionId } from '../features/region-explorer/data/regionTypes';
import type { PokemonTypeName } from '../types/pokemon';

export interface SoundscapeLayerToggles {
  readonly type: boolean;
  readonly region: boolean;
  readonly battle: boolean;
  readonly evolution: boolean;
  readonly environment: boolean;
}

export interface SoundscapeScene {
  readonly regionOpen: boolean;
  readonly regionId: RegionId | null;
  readonly battleOpen: boolean;
  readonly compareOpen: boolean;
  readonly discoveryOpen: boolean;
  readonly teamBuilderOpen: boolean;
  readonly overlayOpen: boolean;
  readonly overlayPanel: 'ball' | 'pokemon';
  readonly primaryType: PokemonTypeName | null;
  readonly secondaryType: PokemonTypeName | null;
}

export interface SoundscapeDriverState {
  /** When false, engine ramps to silence and may suspend the context. */
  readonly ctxAllowed: boolean;
  /** Master linear gain before per-layer weights (0–1). */
  readonly masterLinear: number;
  readonly layers: SoundscapeLayerToggles;
  readonly scene: SoundscapeScene;
}
