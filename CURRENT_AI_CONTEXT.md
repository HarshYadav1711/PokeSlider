<!-- AUTO-GENERATED-START -->
_AI/contributor onboarding capsule — auto-generated. Reflects on-disk state, not aspiration._

_Last scan: 2026-05-13T21:33:20+00:00 · commit `e6bc5d836a`_

## Identity

PokeSlider — React 19 + Vite 8 + TypeScript + Tailwind 4 SPA over PokéAPI. 3D Poké Ball carousel hero, overlay panels for ball/Pokémon detail, My Dex discovery, transparent Compare, local rule-based Team Builder, and Battle Simulator. No backend in repo.

## Current architecture (verified)

- **a11y** — 4 files (e.g. `src/a11y/carouselAngle.ts`)
- **data** — 24 files (e.g. `src/data/legendaryMythicalPool.ts`)
- **design** — 2 files (e.g. `src/index.css`)
- **engine** — 3 files (e.g. `src/features/battle-sim/battleSimulatorEngine.ts`)
- **hooks** — 5 files (e.g. `src/hooks/useAppKeyboardShortcuts.ts`)
- **motion** — 1 files (e.g. `src/motion/motionPrefs.ts`)
- **providers** — 2 files (e.g. `src/providers/AppAtmosphere.tsx`)
- **query** — 6 files (e.g. `src/query/ballSuggestionsQuery.ts`)
- **state** — 6 files (e.g. `src/features/discovery/discoveryUiStore.ts`)
- **test** — 6 files (e.g. `src/a11y/carouselAngle.test.ts`)
- **types** — 6 files (e.g. `src/features/battle-sim/battleSimulatorTypes.ts`)
- **ui** — 16 files (e.g. `src/App.tsx`)
- **unknown** — 63 files (e.g. `project-metadata/current-state/snapshot.json`)
- **util** — 9 files (e.g. `src/features/compare/compareTheme.ts`)


## Active features

- **3D Poké Ball carousel** (verified): Hero 3D carousel with pointer drag, keyboard navigation, and auto-rotate gated by `prefers-reduced-motion`. Front-ball selection drives the overlay. · stores: useUiStore · query keys: ballSuggestions
- **Battle Simulator** (verified): Local, rule-based battle simulator presented as a modal surface. · stores: useBattleSimulatorStore · query keys: pokemon, teamBuilder
- **Details overlay (ball + Pokémon)** (verified): Two-panel overlay surface: ball lore + suggested species, and full Pokémon detail (stats, type matchups, evolution timeline explorer, locations, cry, mega compare). · stores: useComparisonStore, useDexListsStore, useUiStore · query keys: ball, detailExtras, pokemon
- **My Dex discovery** (partial): Browse, filter, favorites, recents, and compare-from-row affordances. Bottom sheet on narrow viewports, side panel on `md+`. · stores: useComparisonStore, useDexListsStore, useDiscoveryUiStore, useUiStore · query keys: discovery, pokemon, pokemonList
- **Pokémon comparison** (partial): Transparent rule-based scoring between two Pokémon with stat bars and per-side retry on profile load failures. · stores: useBattleSimulatorStore, useComparisonStore · query keys: pokemon, typeMatchupChart
- **Team Builder (local rule-based)** (verified): Deterministic party-of-six recommender with goal weights, risk tolerance, generation pool, locks, coverage/gaps/swap suggestions, and PNG card export via `html-to-image`. · stores: useDexListsStore, useTeamBuilderStore · query keys: pokemon, teamBuilder


## Unfinished work


- *planned* — **Comparison card export**: Export the Comparison Modal as a shareable image. The hook surface already exists via `data-comparison-export` on `ComparisonShareSurface`.


## Dangerous modification zones

- `src/types/pokemon.ts` (coupling score 53) — changes here ripple widely; read consumers before refactor.
- `src/types/pokeapi.ts` (coupling score 36) — changes here ripple widely; read consumers before refactor.
- `src/services/pokeapi/client.ts` (coupling score 32) — changes here ripple widely; read consumers before refactor.
- `src/query/keys.ts` (coupling score 22) — changes here ripple widely; read consumers before refactor.
- `src/query/staleTimes.ts` (coupling score 20) — changes here ripple widely; read consumers before refactor.
- `src/data/pokeballs.ts` (coupling score 19) — changes here ripple widely; read consumers before refactor.
- `src/hooks/usePrefersReducedMotion.ts` (coupling score 18) — changes here ripple widely; read consumers before refactor.
- `src/motion/motionPrefs.ts` (coupling score 16) — changes here ripple widely; read consumers before refactor.
- `src/store/uiStore.ts` (coupling score 15) — changes here ripple widely; read consumers before refactor.
- `src/components/pokemon/TypeBadge.tsx` (coupling score 13) — changes here ripple widely; read consumers before refactor.


## Shared system boundaries

- **Accessibility primitives** (`a11y`) — Focus trap, focusable element discovery, carousel angle math; all unit tested. Used by overlay, modals, My Dex panel, and carousel. · DO NOT: Add another focus-trap dependency; this one is intentional and tested.
- **App Providers** (`providers`) — App-level providers (QueryClient, Atmosphere)
- **Motion** (`motion`) — Motion preferences and transitions
- **PokéAPI services** (`data`) — Typed HTTP layer over the public PokéAPI plus mappers that produce the domain shapes (PokemonSummary with baseStats, detailExtras with evolution timeline stages, type effectiveness, etc.). · DO NOT: Add ad-hoc fetch calls in components for shared data; route through here.
- **TanStack Query layer** (`query`) — Centralized query client, key factory, prefetch helpers, and stale-time config. All PokéAPI-backed server state flows through here. · DO NOT: Bypass `qk.*` factory with stringly-typed query keys.; Introduce a second QueryClient instance.
- **Deterministic rule engines** (`engine`) — Pure, side-effect-free engines that power Team Builder and the Battle Simulator. Reproducible inputs → outputs; covered by Vitest where logic is non-trivial. · DO NOT: Inject randomness without a deterministic seed.
- **Zustand stores** (`state`) — Client UI state — overlay navigation, discovery UI, compare slots, dex lists, team builder, and battle simulator. Never duplicates Query cache. · DO NOT: Store server-fetched payloads inside a Zustand store.


## Current priorities (from registry)

1. Keep shipped surfaces accessible and accurate.
2. Update feature manifests in `project-metadata/features/` as code changes.
3. Run `context-engine validate` before any large refactor.

## Quick start for an AI session

1. Read `PROJECT_CONTEXT.md` and `.cursor/rules/project-context.mdc`.
2. Skim `docs/generated/feature-map.md`, `route-map.md`, `system-map.md` for verified scope.
3. Before claiming a feature exists, check the matching YAML in `project-metadata/features/`. If absent, the feature is **not** in the truth tier.
<!-- AUTO-GENERATED-END -->

<!-- MANUAL-NOTES-START -->
<!-- MANUAL-NOTES-END -->
