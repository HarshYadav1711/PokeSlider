# PokeSlider — project context

Human- and AI-readable summary of **identity**, **architecture**, **status**, and **safe extension**. Authoritative Cursor rules live in `.cursor/rules/` (especially `project-context.mdc`).

---

## Project identity

**PokeSlider** is a React + Vite SPA for **exploring Poké Balls and Pokémon** using the public **PokéAPI**. The **3D Poké Ball carousel** is the hero; **My Dex** provides search, filters, and lists; **Compare** scores two Pokémon with transparent rules; **detail overlays** show species depth (stats, evolution, locations, type matchups, cry, mega).

**Personality:** cinematic, premium, playful-but-controlled — not noisy or gimmicky.

---

## Current implementation status

| Area | Status |
|------|--------|
| Build / lint / unit tests | `npm run build`, `npm run lint`, `npm run test` (Vitest + a11y/math tests) |
| Carousel | Pointer drag, auto-rotate (respects reduced motion), keyboard region, live region for front ball |
| Ball overlay | Suggestions grid, prefetch on interaction |
| Pokémon overlay | Detail + extras queries, cry, mega compare modal, type effectiveness, locations |
| My Dex | Tabs (browse / favorites / recents), filters, listbox + keyboard, compare A/B slots, focus trap |
| Compare modal | Profiles, scoring table, stat bars, duel background, error + per-side retry |
| Design system | `design-tokens.css`, Tailwind `@theme`, glass/focus utilities, type atmosphere via `AppAtmosphere` |
| Accessibility | Focus trap + restoration, skip link, ARIA on terse controls, Escape ordering |

---

## Architecture decisions

1. **TanStack Query** owns server state; **Zustand** owns UI navigation and small client-only lists (favorites/recents, compare slots, discovery UI).
2. **Single QueryClient** in `AppProviders` — no per-modal clients.
3. **PokéAPI** access centralized in `services/pokeapi/client.ts` with typed errors and shared retry policy.
4. **Query key factory** in `query/keys.ts` — no stringly-typed duplicate keys.
5. **Motion** only where it improves comprehension (overlays, sheets); springs gated by `usePrefersReducedMotion`.
6. **Pure helpers** (`a11y/carouselAngle.ts`, `getFocusable.ts`, etc.) unit-tested; heavy UI tested incrementally as needed.

---

## Important design decisions

- **Token-first styling** — spacing, radii, shadows, blur, motion, type scale in CSS variables.
- **Restrained glow** — single elevation language; avoid stacked drop-shadow animations on carousel.
- **Atmospheric backgrounds** — subtle type-tinted orbs when viewing Pokémon details (`data-atmosphere` on `html`).
- **Glass surfaces** — `app-surface-glass` for dialogs; sticky bars use translucent + blur tokens.

---

## Technical constraints

- **No backend in repo** — all data from PokéAPI + static catalogs in `src/data/`.
- **Strict TypeScript** — `noUncheckedIndexedAccess`, unused locals/params as errors.
- **Dependency discipline** — avoid new runtime deps unless clearly justified (see `DECISIONS_LOG.md`).
- **PokéAPI etiquette** — cache, prefetch thoughtfully, don’t hammer the API.

---

## Development priorities

1. Keep **carousel + overlay + dex + compare** flows fast, accessible, and visually coherent.
2. Extend **comparison share/export** when product-ready (marker exists on share surface).
3. Grow **tests** around pure logic and critical interaction helpers before bloating E2E.

---

## Known pitfalls

- **Query key drift** — changing `qk` shapes without updating prefetch + consumers breaks deduplication.
- **Focus trap + portals** — keep focusables inside the trapped container; mega modal stays inside overlay DOM for single trap.
- **Listbox + inner buttons** — My Dex rows mix listbox navigation with inner buttons; keyboard docs in panel footer describe behavior.
- **Duplicate paths** — avoid `src\App.tsx` vs `src/App.tsx` style duplication on case-sensitive systems.

---

## Current unfinished / deferred (see FEATURE_TRACKER)

- Comparison **image export** (explicit TODO in UI copy / `data-comparison-export`).
- Broader E2E coverage (not yet a dependency).

---

## How to safely extend the app

1. **New API shape** — add mapper in `services/pokeapi/`, types in `types/`, key in `keys.ts`, stale time if non-default.
2. **New global UI state** — prefer Query; if purely client, add minimal Zustand slice with clear name.
3. **New modal** — copy `DetailsOverlay` / `ComparisonModal` patterns: `useFocusTrap`, `aria-modal`, initial focus selector, Escape behavior coordinated with `useAppKeyboardShortcuts`.
4. **New tokens** — extend `design-tokens.css`; wire through Tailwind `@theme` only if you need first-class utilities.

---

## What should NEVER be changed casually

- **Query key contracts** and `createAppQueryClient` retry semantics without auditing all queries.
- **`POKEBALLS` canonical catalog** — downstream suggestion filters assume shape and ids.
- **Comparison scoring rules** — user trust; change only with visible “how scoring works” copy updates.
- **Reduced-motion and focus-trap behavior** — regressions are P0 for this product.

---

## Related files

| Doc | Purpose |
|-----|---------|
| `FEATURE_TRACKER.md` | Planned / in progress / completed / blocked / ideas |
| `DECISIONS_LOG.md` | Why major choices were made |
| `.cursor/rules/project-context.mdc` | Primary AI rules + onboarding block |
| `.cursor/rules/*.mdc` | Modular deep rules |
