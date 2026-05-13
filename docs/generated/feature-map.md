<!-- AUTO-GENERATED-START -->
_Auto-generated feature map._

_Generated: 2026-05-13T21:33:20+00:00_

## Comparison card export

- **Status:** `planned` · **Confidence:** `inferred`
- **Stores:** useComparisonStore
- **Query keys:** —
- **Shared systems:** query-layer
- **Source files (1):**
    - `src/features/compare/ComparisonShareSurface.tsx`


Export the Comparison Modal as a shareable image. The hook surface already exists via `data-comparison-export` on `ComparisonShareSurface`.

---
## 3D Poké Ball carousel

- **Status:** `shipped` · **Confidence:** `verified`
- **Stores:** useUiStore
- **Query keys:** ballSuggestions
- **Shared systems:** a11y, motion, query-layer
- **Source files (3):**
    - `src/a11y/carouselAngle.ts`
    - `src/features/carousel/PokeBallCarousel.tsx`
    - `src/hooks/usePokeBallCarousel.ts`

- **Tests:**
    - `src/a11y/carouselAngle.test.ts`

- **DO NOT:** Stack additional drop-shadow animations on the carousel.; Bypass the reduced-motion gate when auto-rotating.


Hero 3D carousel with pointer drag, keyboard navigation, and auto-rotate gated by `prefers-reduced-motion`. Front-ball selection drives the overlay.

---
## Battle Simulator

- **Status:** `shipped` · **Confidence:** `verified`
- **Stores:** useBattleSimulatorStore
- **Query keys:** pokemon, teamBuilder
- **Shared systems:** rules-engines, zustand-stores
- **Source files (4):**
    - `src/features/battle-sim/BattleSimulatorModal.tsx`
    - `src/features/battle-sim/battleSimulatorEngine.ts`
    - `src/features/battle-sim/battleSimulatorTypes.ts`
    - `src/store/battleSimulatorStore.ts`

- **Tests:**
    - `src/features/battle-sim/battleSimulatorEngine.test.ts`

- **DO NOT:** Couple the simulator engine to overlay or compare scoring.


Local, rule-based battle simulator presented as a modal surface.

---
## Details overlay (ball + Pokémon)

- **Status:** `shipped` · **Confidence:** `verified`
- **Stores:** useComparisonStore, useDexListsStore, useUiStore
- **Query keys:** ball, detailExtras, pokemon
- **Shared systems:** a11y, motion, query-layer
- **Source files (7):**
    - `src/features/overlay/BallDetailPanel.tsx`
    - `src/features/overlay/DetailsOverlay.tsx`
    - `src/features/overlay/PokemonDetailPanel.tsx`
    - `src/features/overlay/PokemonEvolutionTimeline.tsx`
    - `src/services/pokeapi/evolution.ts`
    - `src/services/pokeapi/evolutionSpeciesLore.ts`
    - `src/utils/evolutionTriggerSummary.ts`

- **Tests:**
    - `src/utils/evolutionTriggerSummary.test.ts`

- **DO NOT:** Add a second focus trap inside the overlay; keep the existing trap.; Fetch evolution chain members outside of `qk.pokemon.detailExtras`.


Two-panel overlay surface: ball lore + suggested species, and full Pokémon detail (stats, type matchups, evolution timeline explorer, locations, cry, mega compare).

---
## My Dex discovery

- **Status:** `shipped` · **Confidence:** `partial`
- **Stores:** useComparisonStore, useDexListsStore, useDiscoveryUiStore, useUiStore
- **Query keys:** discovery, pokemon, pokemonList
- **Shared systems:** a11y, query-layer, zustand-stores
- **Source files (6):**
    - `src/features/discovery/MyDexPanel.tsx`
    - `src/features/discovery/discoveryEngine.ts`
    - `src/features/discovery/discoveryTypes.ts`
    - `src/features/discovery/discoveryUiStore.ts`
    - `src/features/discovery/useMyDexDiscovery.ts`
    - `src/store/dexListsStore.ts`

- **DO NOT:** Replace the listbox keyboard model without updating the panel footer help text.


Browse, filter, favorites, recents, and compare-from-row affordances. Bottom sheet on narrow viewports, side panel on `md+`.

---
## Pokémon comparison

- **Status:** `shipped` · **Confidence:** `partial`
- **Stores:** useBattleSimulatorStore, useComparisonStore
- **Query keys:** pokemon, typeMatchupChart
- **Shared systems:** query-layer, zustand-stores
- **Source files (6):**
    - `src/features/compare/ComparisonModal.tsx`
    - `src/features/compare/ComparisonShareSurface.tsx`
    - `src/features/compare/ComparisonStatBars.tsx`
    - `src/features/compare/compareTheme.ts`
    - `src/features/compare/comparisonScoring.ts`
    - `src/store/comparisonStore.ts`

- **DO NOT:** Hide the scoring rules from users; keep the explainable breakdown visible.


Transparent rule-based scoring between two Pokémon with stat bars and per-side retry on profile load failures.

---
## Team Builder (local rule-based)

- **Status:** `shipped` · **Confidence:** `verified`
- **Stores:** useDexListsStore, useTeamBuilderStore
- **Query keys:** pokemon, teamBuilder
- **Shared systems:** rules-engines, query-layer, zustand-stores
- **Source files (7):**
    - `src/features/team-builder/TeamBuilderModal.tsx`
    - `src/features/team-builder/teamBuilderEngine.ts`
    - `src/features/team-builder/teamBuilderTypes.ts`
    - `src/features/team-builder/typeMatchupChart.ts`
    - `src/features/team-builder/useTeamBuilderData.ts`
    - `src/services/pokeapi/typeMatchupChart.ts`
    - `src/store/teamBuilderStore.ts`

- **Tests:**
    - `src/features/team-builder/teamBuilderEngine.test.ts`

- **DO NOT:** Introduce non-deterministic suggestions; the engine must be reproducible.; Fetch the type matchup chart outside `qk.teamBuilder.typeMatchup`.


Deterministic party-of-six recommender with goal weights, risk tolerance, generation pool, locks, coverage/gaps/swap suggestions, and PNG card export via `html-to-image`.

---
<!-- AUTO-GENERATED-END -->

<!-- MANUAL-NOTES-START -->
<!-- MANUAL-NOTES-END -->
