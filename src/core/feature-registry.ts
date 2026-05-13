/**
 * SYSTEM:
 * Feature Registry (TypeScript mirror)
 *
 * PURPOSE:
 * Strongly-typed mirror of the authoritative feature manifests stored as
 * YAML under `project-metadata/features/`. The Python Context Intelligence
 * Engine (see `tools/context-engine/`) keeps the YAML truth in sync with
 * the actual implementation; this module is the runtime-safe shape that
 * application code can consume without round-tripping through the engine.
 *
 * USED BY:
 * - Future in-app diagnostics or developer tooling
 * - Type-level guards when wiring new features
 *
 * DO NOT:
 * - Mark a feature as `shipped` here without matching evidence in
 *   `project-metadata/features/<id>.yaml`.
 * - Treat this list as authoritative ahead of the YAML; it is a *mirror*.
 */

export type FeatureStatus = 'planned' | 'in_progress' | 'shipped' | 'deprecated';

export type ConfidenceLevel = 'verified' | 'partial' | 'inferred' | 'uncertain';

export interface FeatureFileRef {
  readonly path: string;
  readonly symbol?: string;
}

export interface FeatureRecord {
  readonly id: string;
  readonly name: string;
  readonly status: FeatureStatus;
  readonly description: string;
  readonly stores: readonly string[];
  readonly queryKeys: readonly string[];
  readonly sharedSystems: readonly string[];
  readonly sourceFiles: readonly FeatureFileRef[];
  readonly tests: readonly FeatureFileRef[];
  readonly confidence: ConfidenceLevel;
}

/**
 * Authoritative subset of features kept in code for fast type-safe access.
 *
 * IMPORTANT: this is a *manual mirror* of `project-metadata/features/*.yaml`.
 * The Python engine validates that every entry here exists with the same
 * `id` in the YAML registry. Adding a feature here without YAML evidence
 * will fail `context-engine validate`.
 */
export const FEATURE_REGISTRY = {
  carousel: {
    id: 'carousel',
    name: '3D Poké Ball carousel',
    status: 'shipped',
    description:
      'Hero 3D carousel with pointer drag, keyboard nav, auto-rotate gated by reduced motion.',
    stores: ['useUiStore'],
    queryKeys: ['ballSuggestions'],
    sharedSystems: ['a11y', 'motion', 'query-layer'],
    sourceFiles: [
      { path: 'src/features/carousel/PokeBallCarousel.tsx' },
      { path: 'src/hooks/usePokeBallCarousel.ts' },
    ],
    tests: [{ path: 'src/a11y/carouselAngle.test.ts' }],
    confidence: 'verified',
  },
  overlay: {
    id: 'overlay',
    name: 'Details overlay (ball + Pokémon)',
    status: 'shipped',
    description:
      'Two-panel overlay: ball lore + suggestions, full Pokémon detail with stats, cry, mega, evolution timeline, locations.',
    stores: ['useUiStore'],
    queryKeys: ['ball', 'pokemon'],
    sharedSystems: ['a11y', 'motion', 'query-layer'],
    sourceFiles: [
      { path: 'src/features/overlay/DetailsOverlay.tsx' },
      { path: 'src/features/overlay/BallDetailPanel.tsx' },
      { path: 'src/features/overlay/PokemonDetailPanel.tsx' },
      { path: 'src/features/overlay/PokemonEvolutionTimeline.tsx' },
    ],
    tests: [{ path: 'src/utils/evolutionTriggerSummary.test.ts' }],
    confidence: 'verified',
  },
  discovery: {
    id: 'discovery',
    name: 'My Dex discovery',
    status: 'shipped',
    description: 'Browse, filter, favorites, recents, compare A/B from rows.',
    stores: ['useDiscoveryUiStore', 'useDexListsStore'],
    queryKeys: ['pokemonList'],
    sharedSystems: ['a11y', 'query-layer', 'zustand-stores'],
    sourceFiles: [
      { path: 'src/features/discovery/MyDexPanel.tsx' },
      { path: 'src/features/discovery/discoveryEngine.ts' },
      { path: 'src/features/discovery/useMyDexDiscovery.ts' },
      { path: 'src/features/discovery/discoveryUiStore.ts' },
      { path: 'src/store/dexListsStore.ts' },
    ],
    tests: [],
    confidence: 'verified',
  },
  compare: {
    id: 'compare',
    name: 'Pokémon comparison',
    status: 'shipped',
    description: 'Transparent rule-based scoring with stat bars and per-side retry.',
    stores: ['useComparisonStore'],
    queryKeys: ['pokemon', 'typeMatchupChart'],
    sharedSystems: ['query-layer', 'zustand-stores'],
    sourceFiles: [
      { path: 'src/features/compare/ComparisonModal.tsx' },
      { path: 'src/features/compare/ComparisonStatBars.tsx' },
      { path: 'src/features/compare/ComparisonShareSurface.tsx' },
      { path: 'src/features/compare/comparisonScoring.ts' },
    ],
    tests: [],
    confidence: 'verified',
  },
  team_builder: {
    id: 'team_builder',
    name: 'Team Builder (local rule-based)',
    status: 'shipped',
    description:
      'Deterministic party-of-six recommender; goals, risk, gen pool, locks; coverage/gaps/swaps; PNG card export.',
    stores: ['useTeamBuilderStore'],
    queryKeys: ['teamBuilder'],
    sharedSystems: ['rules-engines', 'query-layer', 'zustand-stores'],
    sourceFiles: [
      { path: 'src/features/team-builder/TeamBuilderModal.tsx' },
      { path: 'src/features/team-builder/teamBuilderEngine.ts' },
      { path: 'src/features/team-builder/useTeamBuilderData.ts' },
      { path: 'src/features/team-builder/typeMatchupChart.ts' },
      { path: 'src/store/teamBuilderStore.ts' },
    ],
    tests: [{ path: 'src/features/team-builder/teamBuilderEngine.test.ts' }],
    confidence: 'verified',
  },
  battle_sim: {
    id: 'battle_sim',
    name: 'Battle Simulator',
    status: 'shipped',
    description: 'Local rule-based battle simulator surfaced as a modal.',
    stores: ['useBattleSimulatorStore'],
    queryKeys: [],
    sharedSystems: ['rules-engines', 'zustand-stores'],
    sourceFiles: [
      { path: 'src/features/battle-sim/BattleSimulatorModal.tsx' },
      { path: 'src/features/battle-sim/battleSimulatorEngine.ts' },
      { path: 'src/store/battleSimulatorStore.ts' },
    ],
    tests: [{ path: 'src/features/battle-sim/battleSimulatorEngine.test.ts' }],
    confidence: 'verified',
  },
} as const satisfies Record<string, FeatureRecord>;

export type FeatureId = keyof typeof FEATURE_REGISTRY;

export function getFeature(id: FeatureId): FeatureRecord {
  return FEATURE_REGISTRY[id];
}

export function listFeatures(): readonly FeatureRecord[] {
  return Object.values(FEATURE_REGISTRY);
}

export function listShippedFeatures(): readonly FeatureRecord[] {
  return listFeatures().filter((f) => f.status === 'shipped');
}
