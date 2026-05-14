<!-- AUTO-GENERATED-START -->
_Auto-generated. Edit YAML under `project-metadata/features/` and re-run `context-engine generate`._

_Scan: 2026-05-14T16:53:50+00:00 · `5f53777332` · `main` · dirty_

## Identity

PokeSlider — React 19 + Vite 8 + TypeScript + Tailwind 4 SPA over the public PokéAPI. Hero 3D Poké Ball carousel, overlay panels for ball/Pokémon detail, My Dex discovery, transparent Compare, local rule-based Team Builder, and Battle Simulator. No backend in repo.

## State

| Metric | Value |
|---|---|
| Files scanned | 147 |
| TypeScript / TSX | 117 |
| Tests | 8 |
| Shipped features | 6 / 7 |

## Shipped features

- **3D Poké Ball carousel** — _verified_ — Hero 3D carousel with pointer drag, keyboard navigation, and auto-rotate gated by `prefers-reduced-motion`. Front-ball selection drives the overlay.
- **Battle Simulator** — _verified_ — Local, rule-based battle simulator presented as a modal surface.
- **Details overlay (ball + Pokémon)** — _verified_ — Two-panel overlay: ball lore + suggested species, and full Pokémon detail (stats, type matchups, evolution timeline explorer, locations, cry, mega).
- **My Dex discovery** — _partial_ — Browse, filter, favorites, recents, and compare-from-row affordances. Bottom sheet on narrow viewports, side panel on `md+`.
- **Pokémon comparison** — _partial_ — Transparent rule-based scoring between two Pokémon with stat bars and per-side retry on profile load failures.
- **Team Builder (local rule-based)** — _verified_ — Deterministic party-of-six recommender with goal weights, risk tolerance, generation pool, locks, coverage/gaps/swap suggestions, and PNG card export via `html-to-image`.


## In progress

_Nothing in-flight._

## Planned

- **Comparison card export** — Export the Comparison Modal as a shareable image. The hook surface already exists via `data-comparison-export` on `ComparisonShareSurface`.


## Shared systems referenced

a11y, motion, query-layer, rules-engines, zustand-stores

_Source-of-truth order: implementation → `project-metadata/features/` → generated docs → human prose in MANUAL-NOTES._
<!-- AUTO-GENERATED-END -->

<!-- MANUAL-NOTES-START -->
<!-- MANUAL-NOTES-END -->
