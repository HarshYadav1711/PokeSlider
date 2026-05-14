import type { PokemonSummary, PokemonTypeName } from '../../types/pokemon';
import type { TypeMatchupChart } from '../team-builder/typeMatchupChart';

/** Trainer vibe — maps to transparent stat + typing heuristics in the engine. */
export type DiscoveryPlaystyle =
  | 'aggressive'
  | 'bulky'
  | 'balanced'
  | 'speedy'
  | 'wallbreaker'
  | 'trickster';

/** Flavor axis — nudges type affinity with a fixed lookup table (no black box). */
export type DiscoveryAesthetic =
  | 'cute'
  | 'cool'
  | 'elegant'
  | 'mysterious'
  | 'fierce'
  | 'sleek';

export type DiscoveryRecommendationKind =
  | 'similar'
  | 'underrated'
  | 'hidden_gem'
  | 'synergy'
  | 'rare_treat';

/** Visual / semantic link between a pick and the profile (for badges + orbit). */
export type DiscoveryRelationshipKind =
  | 'type_overlap'
  | 'stat_resonance'
  | 'coverage'
  | 'rarity_curve'
  | 'session_explorer'
  | 'anchor_lineage';

export interface DiscoveryRelationship {
  readonly kind: DiscoveryRelationshipKind;
  /** Short label shown on chips (keep ≤ 32 chars). */
  readonly label: string;
  /** 0–1 for subtle UI weighting (orbit line opacity). */
  readonly strength: number;
}

/** One explainable line — always derived from engine rules, not an LLM. */
export interface DiscoveryReasonLine {
  readonly code: string;
  readonly text: string;
}

export interface DiscoveryRecommendationPreferences {
  readonly favoritePokemonIds: readonly number[];
  readonly favoriteTypes: readonly PokemonTypeName[];
  readonly favoriteRegionKeys: readonly string[];
  readonly playstyle: DiscoveryPlaystyle;
  readonly aesthetics: readonly DiscoveryAesthetic[];
}

export interface DiscoveryEngineInput {
  readonly prefs: DiscoveryRecommendationPreferences;
  /** Summaries for the scored pool (already de-duped). */
  readonly pool: readonly PokemonSummary[];
  /** Small set used as anchors (favorites the user named). */
  readonly anchorSummaries: readonly PokemonSummary[];
  readonly chart: TypeMatchupChart | null;
  /** My Dex recency — lowers weight for “rare treat” if recently viewed. */
  readonly recentPokemonIds: ReadonlySet<number>;
  /** Starred Dex ids — nudges novelty. */
  readonly dexFavoriteIds: ReadonlySet<number>;
  readonly sessionSeed: number;
}

export interface DiscoveryScoredPick {
  readonly pokemonId: number;
  readonly kind: DiscoveryRecommendationKind;
  readonly score: number;
  readonly reasons: readonly DiscoveryReasonLine[];
  readonly relationships: readonly DiscoveryRelationship[];
}

export interface DiscoveryEngineResult {
  readonly picks: readonly DiscoveryScoredPick[];
  /** Session copy for the UI header. */
  readonly sessionSummary: string;
}
