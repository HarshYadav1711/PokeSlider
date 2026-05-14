# Decisions log — PokeSlider

Short **why** log for architectural and product-technical choices. Newest first.

---

## 2026-05 — Home hero isolation + adaptive performance

**Decision:** Gate the **Poké Ball carousel** with `useHomeHeroSurfaceActive()` so the hero **unmounts** whenever an immersive surface is open (details overlay, My Dex panel, compare, team builder, battle simulator, region explorer, discovery mix, journey dashboard/onboarding). Persist orbit **angle** in `carouselAngleSession` across remounts. Introduce **`usePerformanceTier()`** (`high` / `mid` / `low`) from viewport, pointer, `deviceMemory` / `hardwareConcurrency`, and reduced motion; drive `html[data-performance-tier]` for CSS (blur tokens, slower halo, calmer body gradient) and pass tier into **`usePokeBallCarousel`** for gentler auto-spin on phones. **Route-level code split** heavy modals via `React.lazy` + one `Suspense`. **Soundscape:** extend scene with `discoveryRecoOpen`; **pause Web Audio** when the tab is hidden (`useDocumentVisibility` + `setPaused`); **AppAtmosphere** time-of-day tick only while visible. **Dev-only** FPS readout behind `import.meta.env.DEV` + `lazy`. Pointer drag uses **AbortController** so listeners never leak on unmount.

**Why:** The carousel’s always-on RAF + 3D transforms were competing with full-screen feature UIs on mobile, causing jank and wasted battery/audio work. Unmounting is the strongest isolation; tiered degradation keeps desktop premium while phones stay smooth.

**Alternatives rejected:** CSS `visibility:hidden` on the carousel (still paid React reconciliation + hook work); a single global “mode” store duplicating every modal’s truth (more drift than subscribing to existing Zustand flags).

---

## 2026-05 — Poké Ball Intelligence (local catch estimates)

**Decision:** Centralize extended Poké Ball metadata in `src/data/pokeballs.ts` (rarity tier, collectibility score, heritage copy, `mechanic` discriminant). Add pure **`src/engine/*`** helpers: neutral-HP estimate, contextual ball multipliers (Net/Dive/Nest/Repeat/Timer/Master), modified catch rate + **Gen III–IV style four-shake** probability, snapshot + ranking builders. Surface **Catch Lab** on ball overlay (`BallCatchLaboratory`) and **Poké Ball fit** on Pokémon detail (`PokemonBallFitSection`) with Motion **cinematic previews** gated by reduced motion. Thread **`speciesCatchRate`** through `PokemonSpeciesResponse`, `mapPokemonSummary`, and `DetailedPokemon` from PokéAPI `capture_rate`.

**Why:** Makes Poké Balls a first-class “intelligence” surface with explainable, deterministic math (no server RNG) while staying honest that modern titles tweak formulas — UI copy frames estimates explicitly.

**Alternatives rejected:** Calling PokéAPI per throw simulation (no endpoint; would be fake anyway); hiding ball math entirely (missed product identity).

---

## 2026-05 — Simplify the Context Engine (v0.2.0)

**Decision:** Collapse the Context Intelligence Engine into a flat, ~1000-LOC Python package with 4 CLI commands (`scan`, `generate`, `validate`, `watch`), 4 generated artifacts (`PROJECT_CONTEXT.md`, `FEATURE_TRACKER.md`, `CURRENT_AI_CONTEXT.md`, `.cursor/rules/context-engine.mdc`), and 3 validators (`MISSING_FILE`, `SHIPPED_NO_EVIDENCE`, `UNKNOWN_DEPENDENCY`). Removed the dependency-graph layer (networkx + Mermaid/DOT exports + coupling hotspots), the libcst Python parser (never used in the pipeline), GitPython (subprocess `git` is enough), system / route / decision YAML registries (folded into free-form strings on a feature manifest), and the noisy validators (orphan components, dead routes, unused stores). Sub-packages collapsed into single-file modules (`schemas.py`, `scanner.py`, `parser.py`, `generator.py`, `validator.py`, `registry.py`, `cache.py`, `watcher.py`, `markers.py`, `cli.py`).

**Why:** The first version of the engine drifted into platform territory — it had more abstractions than this repo can repay. The truth contract (anti-hallucination, evidence-required, safe-merge markers) is preserved; the surface area is roughly halved. Easier to read, easier to maintain, faster to run, less for contributors (and future AI sessions) to internalize.

**Alternatives rejected:** Keep the previous engine (overhead grows faster than the codebase); rewrite from scratch (the truth-contract logic was sound, only the surface area was wrong).

---

## 2026-05 — Context Intelligence Engine (Python, `tools/context-engine/`)

**Decision:** Introduce a Python 3.12+ engine that scans `src/` deterministically, persists structural truth in YAML/JSON under `project-metadata/`, and generates documentation + Cursor rules inside explicit `<!-- AUTO-GENERATED-START -->` / `<!-- AUTO-GENERATED-END -->` markers. The engine refuses to call a feature "shipped" without on-disk evidence and emits a confidence tier (`verified` / `partial` / `inferred` / `uncertain`) for every claim. CLI: `scan`, `generate`, `validate`, `drift-report`, `architecture-report`, `context-report`, `graph`, `watch`, `init`. TS mirror lives at `src/core/feature-registry.ts`. Full design captured in `docs/adr/0001-context-intelligence-engine.md`.

**Why:** Manual onboarding docs were drifting from reality (new stores, new query keys, Team Builder and Battle Simulator surfaces). The engine makes truth machine-verifiable, gives CI a real drift gate, and lets future AI sessions load grounded context instead of guessing.

**Alternatives rejected:** Hand-maintained docs (proven to drift); LLM-driven generation (non-deterministic, hallucinations); `ts-morph`-only tooling (heavier toolchain dependency for CI).

**Parsing tools — deviation noted:** The brief asked for `libcst` (Python-only) to parse TypeScript. We use `tree-sitter` + `tree-sitter-typescript` for `.ts`/`.tsx` AST analysis (deterministic, structured — same "no regex parsing" intent) and keep `libcst` for any Python files, including the engine itself.

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
