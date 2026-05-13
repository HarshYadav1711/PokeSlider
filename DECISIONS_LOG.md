# Decisions log — PokeSlider

Short **why** log for architectural and product-technical choices. Newest first.

---

## 2026-05 — Pokémon evolution timeline explorer (overlay)

**Decision:** Replace the flat “evolution chain” row in **Pokémon detail** with a **cinematic timeline explorer** (`PokemonEvolutionTimeline.tsx`): stage strip (vertical on narrow, horizontal from `md`), focus hero card with **Motion** enter/exit (gated by `usePrefersReducedMotion`), per-stage **genus + English Pokédex flavor** (version-priority picker), **human-readable evolution conditions** from full PokéAPI `evolution_details` (not only the first row), **stat bars + deltas** vs a user-chosen baseline stage, and a **focusable `role="region"`** for arrow-key navigation. Extend **`detailExtras`** so one query returns **type effectiveness**, **`chain`** (each node now includes `types`, `stats`, `baseStatTotal`, `evolutionDetails`), and **`timelineStages`** (chain merged with species lore via parallel `/pokemon-species` fetches). Centralize trigger copy in **`utils/evolutionTriggerSummary.ts`** (Vitest-covered).

**Why:** Meets product goals (premium, collectible, scannable) without new paid APIs or animation stacks; keeps **one cached payload** for evolution + matchups to avoid duplicate `/pokemon/{name}` fetches for the same overlay session.

**Alternatives rejected:** Separate `evolutionTimeline` query key (extra cache surface + duplicate Pokémon fetches unless carefully deduped); pulling only first `evolution_details` entry (loses trade, friendship, item, location, etc.); skipping species fetches (no per-stage flavor).

---

## 2026-05 — Team Builder (local rules) + `PokemonSummary.baseStats` + `html-to-image`

**Decision:** Ship a **Team Builder** modal that recommends six Pokémon using a **transparent, deterministic** objective (typed goal weights, greedy marginal picks, STAB mono coverage, shared-weakness pressure, role heuristics). Extend **`PokemonSummary`** with **`baseStats`** (mapped in `mapPokemonSummary`) so all summaries carry base stats for the solver. Add **`html-to-image`** for **PNG export** of a share card. Cache a full type matchup matrix from **18 PokéAPI `/type` calls** (`qk.teamBuilder.typeMatchup`, `STALE_TYPE_MATCHUP_MATRIX_MS`).

**Why:** Product asked for an “intelligent” assistant **without** paid models—rule tables and explainable deltas preserve trust. One chart fetch avoids duplicating the entire type chart in static JSON. `baseStats` avoids a second fetch per species for team logic and benefits any future stat-aware UI.

**Alternatives rejected:** External LLM APIs (cost, privacy, non-determinism); embedding a full dual-type matrix by hand (maintenance / drift); canvas-only export without a small library (more code for marginal gain); keeping stats off `PokemonSummary` (extra parallel fetch shape).

---

## 2026-05 — Vitest + jsdom for pure helpers

**Decision:** Add Vitest + jsdom + Testing Library as **dev** dependencies; test `carouselAngle`, `getFocusableElements`, `nextTrappedIndex` without E2E.

**Why:** Stable, boring toolchain aligned with Vite; fast CI signal; no runtime cost.

**Alternatives rejected:** Playwright for every small change (heavier); no tests (regression risk).

---

## 2026-05 — Custom focus trap vs dependency

**Decision:** Implement `useFocusTrap` + `getFocusableElements` in `src/a11y/`.

**Why:** Small surface area, full control over Tab cycle with `tabIndex={-1}` titles, no version drift from third-party trap libs.

**Alternatives rejected:** `@focus-trap/react` (fine library, but extra dep for narrow needs).

---

## 2026-05 — Zustand for UI-only vs Query for server

**Decision:** Keep TanStack Query for all PokéAPI-backed data; Zustand for overlay routing, dex UI, compare slots, favorites/recents.

**Why:** Clear split prevents duplicate caches and stale UI.

**Alternatives rejected:** Redux (boilerplate), storing fetched Pokémon in Zustand (cache duplication).

---

## 2026-05 — Motion for overlays, CSS tokens for micro-motion

**Decision:** `AnimatePresence` + springs for modals/sheets; gate springs with `usePrefersReducedMotion`; CSS variables for hover/active durations.

**Why:** Single animation story; predictable reduced-motion behavior.

**Alternatives rejected:** Framer Motion v6 duplicate import path; GSAP for layout (heavy).

---

## 2026-05 — Design tokens in CSS file + Tailwind arbitrary

**Decision:** `src/styles/design-tokens.css` imported from `index.css`; components use `var(--space-*)` etc. via Tailwind arbitrary values.

**Why:** Human-readable, no runtime token JS, works with Tailwind v4 Vite plugin.

**Alternatives rejected:** JS theme object only (harder for global atmosphere selectors on `html`).

---

## 2026-05 — Type atmosphere via `html` data attributes

**Decision:** `AppAtmosphere` sets `data-atmosphere` / `data-atmosphere-secondary` while Pokémon detail is active.

**Why:** Pure CSS reaction; no React re-render of whole app background.

**Alternatives rejected:** Inline `style` on `body` from many components (spaghetti).

---

## Template for new entries

```text
## YYYY-MM — Short title

**Decision:** …

**Why:** …

**Alternatives rejected:** …
```
