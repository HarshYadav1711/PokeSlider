<!-- AUTO-GENERATED-START -->
_Auto-generated shared-system map._

_Generated: 2026-05-13T21:33:20+00:00_

| System | Layer | Purpose | Files | Confidence |
|---|---|---|---|---|
| **Accessibility primitives** | `a11y` | Focus trap, focusable element discovery, carousel angle math; all unit tested. Used by overlay, modals, My Dex panel, and carousel. | 4 | `verified` |
| **App Providers** | `providers` | App-level providers (QueryClient, Atmosphere) | 2 | `partial` |
| **Deterministic rule engines** | `engine` | Pure, side-effect-free engines that power Team Builder and the Battle Simulator. Reproducible inputs → outputs; covered by Vitest where log… | 2 | `verified` |
| **Motion** | `motion` | Motion preferences and transitions | 1 | `partial` |
| **PokéAPI services** | `data` | Typed HTTP layer over the public PokéAPI plus mappers that produce the domain shapes (PokemonSummary with baseStats, detailExtras with evol… | 6 | `verified` |
| **TanStack Query layer** | `query` | Centralized query client, key factory, prefetch helpers, and stale-time config. All PokéAPI-backed server state flows through here. | 6 | `verified` |
| **Zustand stores** | `state` | Client UI state — overlay navigation, discovery UI, compare slots, dex lists, team builder, and battle simulator. Never duplicates Query cache. | 6 | `verified` |
<!-- AUTO-GENERATED-END -->

<!-- MANUAL-NOTES-START -->
<!-- MANUAL-NOTES-END -->
