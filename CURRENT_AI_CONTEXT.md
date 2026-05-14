<!-- AUTO-GENERATED-START -->
_Auto-generated AI/contributor onboarding snapshot. Reflects on-disk state, not aspiration._

_Scan: 2026-05-14T19:40:49+00:00 · commit `50f77c0cf2`_

## Identity

PokeSlider — React 19 + Vite 8 + TypeScript + Tailwind 4 over PokéAPI. 3D Poké Ball carousel hero, overlay panels (ball + Pokémon detail), My Dex discovery, transparent Compare, rule-based Team Builder, Battle Simulator. No backend in repo.

## Active features

- **3D Poké Ball carousel** _(verified)_ — Hero 3D carousel with pointer drag, keyboard navigation, and auto-rotate gated by `prefers-reduced-motion`. Front-ball selection drives the overlay. · stores: `useUiStore` · systems: a11y, motion, query-layer
- **Battle Simulator** _(verified)_ — Local, rule-based battle simulator presented as a modal surface. · stores: `useBattleSimulatorStore` · systems: rules-engines, zustand-stores
- **Details overlay (ball + Pokémon)** _(verified)_ — Two-panel overlay: ball lore + suggested species, and full Pokémon detail (stats, type matchups, evolution timeline explorer, locations, cry, mega). · stores: `useAtmosphereThemeStore`, `useComparisonStore`, `useDexListsStore`, `useUiStore` · systems: a11y, motion, query-layer
- **My Dex discovery** _(partial)_ — Browse, filter, favorites, recents, and compare-from-row affordances. Bottom sheet on narrow viewports, side panel on `md+`. · stores: `useComparisonStore`, `useDexListsStore`, `useDiscoveryRecommendationStore`, `useDiscoveryUiStore`, `useUiStore` · systems: a11y, query-layer, zustand-stores
- **Pokémon comparison** _(partial)_ — Transparent rule-based scoring between two Pokémon with stat bars and per-side retry on profile load failures. · stores: `useBattleSimulatorStore`, `useComparisonStore`, `useJourneyProgressStore` · systems: query-layer, zustand-stores
- **Team Builder (local rule-based)** _(verified)_ — Deterministic party-of-six recommender with goal weights, risk tolerance, generation pool, locks, coverage/gaps/swap suggestions, and PNG card export via `html-to-image`. · stores: `useDexListsStore`, `useJourneyProgressStore`, `useTeamBuilderStore` · systems: rules-engines, query-layer, zustand-stores


## Unfinished

- _planned_ — **Comparison card export**: Export the Comparison Modal as a shareable image. The hook surface already exists via `data-comparison-export` on `ComparisonShareSurface`.


## Shared systems referenced

a11y, motion, query-layer, rules-engines, zustand-stores

## Hard rules for AI sessions

1. **Implementation truth is the source of truth.** Anything not represented in `project-metadata/features/<id>.yaml` is unverified.
2. Before claiming a feature is shipped, confirm a matching YAML manifest exists with `source_files` that resolve on disk.
3. Edit YAML; never hand-edit AUTO-GENERATED regions. Run `context-engine generate` to refresh.
4. MANUAL-NOTES blocks are preserved verbatim — record context there if needed.
<!-- AUTO-GENERATED-END -->

<!-- MANUAL-NOTES-START -->
<!-- MANUAL-NOTES-END -->
