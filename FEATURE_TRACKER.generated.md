<!-- AUTO-GENERATED-START -->
_Auto-generated from `project-metadata/features/*.yaml`._

_Scan: 2026-05-14T20:38:22+00:00_

## Shipped

| Feature | Confidence | Files | Tests | Description |
|---|---|---|---|---|
| **3D Poké Ball carousel** | `verified` | 4 | 1 | Hero 3D carousel with pointer drag, keyboard navigation, and auto-rotate gated by `prefers-reduced-motion`. Front-ball selection drives the overlay. |
| **Battle Simulator** | `verified` | 4 | 1 | Local, rule-based battle simulator presented as a modal surface. |
| **Details overlay (ball + Pokémon)** | `verified` | 7 | 1 | Two-panel overlay: ball lore + suggested species, and full Pokémon detail (stats, type matchups, evolution timeline explorer, locations, cry, mega). |
| **My Dex discovery** | `partial` | 6 | 0 | Browse, filter, favorites, recents, and compare-from-row affordances. Bottom sheet on narrow viewports, side panel on `md+`. |
| **Pokémon comparison** | `partial` | 6 | 0 | Transparent rule-based scoring between two Pokémon with stat bars and per-side retry on profile load failures. |
| **Team Builder (local rule-based)** | `verified` | 7 | 1 | Deterministic party-of-six recommender with goal weights, risk tolerance, generation pool, locks, coverage/gaps/swap suggestions, and PNG card export via `html… |


## In progress

_None._

## Planned

| Feature | Description |
|---|---|
| **Comparison card export** | Export the Comparison Modal as a shareable image. The hook surface already exists via `data-comparison-export` on `ComparisonShareSurface`. |
<!-- AUTO-GENERATED-END -->

<!-- MANUAL-NOTES-START -->
<!-- MANUAL-NOTES-END -->
