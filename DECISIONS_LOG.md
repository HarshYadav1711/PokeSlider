# Decisions log — PokeSlider

Short **why** log for architectural and product-technical choices. Newest first.

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
