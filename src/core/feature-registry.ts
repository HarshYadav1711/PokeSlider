/**
 * SYSTEM:
 * Feature Registry (TypeScript mirror)
 *
 * PURPOSE:
 * Strongly-typed mirror of the authoritative feature manifests in
 * `project-metadata/features/*.yaml`. The Python Context Engine (see
 * `tools/context-engine/`) keeps the YAML truth in sync with the actual
 * implementation; this module is a small, type-safe shape that application
 * code can consume without going through the engine.
 *
 * USED BY:
 * - Future in-app diagnostics or developer tooling.
 *
 * DO NOT:
 * - Mark a feature as `shipped` here without a matching YAML manifest with
 *   real `source_files` on disk.
 * - Treat this list as authoritative ahead of the YAML; it is a *mirror*.
 */

export type FeatureStatus = 'planned' | 'in_progress' | 'shipped' | 'deprecated';
export type ConfidenceLevel = 'verified' | 'partial' | 'inferred' | 'uncertain';

export interface FeatureRecord {
  readonly id: string;
  readonly name: string;
  readonly status: FeatureStatus;
  readonly description: string;
  readonly stores: readonly string[];
  readonly sharedSystems: readonly string[];
  readonly confidence: ConfidenceLevel;
}

export const FEATURE_REGISTRY = {
  carousel: {
    id: 'carousel',
    name: '3D Poké Ball carousel',
    status: 'shipped',
    description: 'Hero 3D carousel with pointer drag, keyboard nav, auto-rotate gated by reduced motion.',
    stores: ['useUiStore'],
    sharedSystems: ['a11y', 'motion', 'query-layer'],
    confidence: 'verified',
  },
  overlay: {
    id: 'overlay',
    name: 'Details overlay (ball + Pokémon)',
    status: 'shipped',
    description: 'Two-panel overlay with ball lore + full Pokémon detail (stats, cry, evolution timeline, locations).',
    stores: ['useUiStore'],
    sharedSystems: ['a11y', 'motion', 'query-layer'],
    confidence: 'verified',
  },
  discovery: {
    id: 'discovery',
    name: 'My Dex discovery',
    status: 'shipped',
    description: 'Browse, filter, favorites, recents, and compare A/B from rows.',
    stores: ['useDiscoveryUiStore', 'useDexListsStore'],
    sharedSystems: ['a11y', 'query-layer', 'zustand-stores'],
    confidence: 'partial',
  },
  compare: {
    id: 'compare',
    name: 'Pokémon comparison',
    status: 'shipped',
    description: 'Transparent rule-based scoring with stat bars and per-side retry.',
    stores: ['useComparisonStore'],
    sharedSystems: ['query-layer', 'zustand-stores'],
    confidence: 'partial',
  },
  team_builder: {
    id: 'team_builder',
    name: 'Team Builder (local rule-based)',
    status: 'shipped',
    description: 'Deterministic party-of-six recommender with coverage/gaps/swaps and PNG card export.',
    stores: ['useTeamBuilderStore'],
    sharedSystems: ['rules-engines', 'query-layer', 'zustand-stores'],
    confidence: 'verified',
  },
  battle_sim: {
    id: 'battle_sim',
    name: 'Battle Simulator',
    status: 'shipped',
    description: 'Local rule-based battle simulator surfaced as a modal.',
    stores: ['useBattleSimulatorStore'],
    sharedSystems: ['rules-engines', 'zustand-stores'],
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
