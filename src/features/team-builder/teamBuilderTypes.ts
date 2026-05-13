import type { PokemonSummary, PokemonTypeName } from '../../types/pokemon';

export type TeamGoal =
  | 'balance'
  | 'offense'
  | 'defense'
  | 'speed'
  | 'nuzlocke'
  | 'type_coverage'
  | 'favorites_first';

export type RiskTolerance = 'low' | 'medium' | 'high';

export interface TeamBuilderParams {
  goal: TeamGoal;
  primaryType: PokemonTypeName | null;
  risk: RiskTolerance;
  /** Generation 1–9, or null for a deterministic national-dex sample (see UI copy). */
  generation: number | null;
}

export interface TeamBuilderInput extends TeamBuilderParams {
  favoriteIds: ReadonlySet<number>;
  /** Up to six Pokémon the solver must include (unique ids). */
  lockedIds: readonly number[];
}

export interface ScoreBreakdownLine {
  label: string;
  points: number;
  /** Short human-readable justification. */
  detail: string;
}

export interface TeamPickExplanation {
  pokemonId: number;
  /** Ordered: largest contribution first. */
  breakdown: ScoreBreakdownLine[];
  summary: string;
}

export interface TeamGap {
  severity: 'info' | 'warn';
  title: string;
  detail: string;
}

export interface TeamSwapSuggestion {
  /** Index 0–5 in the current team order. */
  slotIndex: number;
  replaceId: number;
  withId: number;
  /** Why this swap helps (rule-based deltas). */
  reason: string;
  /** Score delta on the same 0–100 scale as the builder objective. */
  scoreDelta: number;
}

export interface TeamMetrics {
  /** Fraction of mono typings (18) hit for ≥2× by at least one STAB type on the team. */
  stabMonoCoverage: number;
  /** Max count of team members weak to a single attacking type (higher = riskier). */
  maxSharedWeaknessCount: number;
  /** Which attacking types hit the most members for ≥2×. */
  worstOffensiveThreats: { attackType: PokemonTypeName; count: number }[];
  /** Average base stat total. */
  averageBst: number;
  /** Roles inferred from stats (for balance / assistant copy). */
  roleCounts: Record<'physical' | 'special' | 'mixed' | 'wall' | 'scout', number>;
  /** Average speed. */
  averageSpeed: number;
  /** Unique typings (sorted type pair key) / 6 — encourages variety. */
  typingDiversity: number;
}

export interface TeamBuildResult {
  team: PokemonSummary[];
  metrics: TeamMetrics;
  /** Mono typings not covered by STAB ≥2×. */
  uncoveredMonoTypes: PokemonTypeName[];
  picks: TeamPickExplanation[];
  gaps: TeamGap[];
  swaps: TeamSwapSuggestion[];
  /** Plain-language note on how the pool was chosen. */
  poolNote: string;
}
