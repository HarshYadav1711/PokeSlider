# Feature tracker — PokeSlider

Maintenance rule: after **major** feature work, update this file in the same change set (or immediately after merge). Trivial bugfixes can skip.

Legend: **Status** matches section. **Risk**: Low / Med / High.

---

## Planned

| Feature | Goal | Files (typical) | Dependencies | Risks | Status |
|---------|------|-----------------|----------------|-------|--------|
| Comparison card export | Let users export/share a visual summary of compare results | `ComparisonShareSurface.tsx`, `ComparisonModal.tsx`, new util or canvas | Possibly `html-to-image` or canvas-only — **requires ADR** | Bundle size, SSR none | Planned |
| URL-deep links | Optional shareable URLs for compare slots or open dex | router TBD, stores | New dep or lightweight hash router | Scope creep | Planned |

---

## In progress

| Feature | Goal | Files | Dependencies | Risks | Status |
|---------|------|-------|----------------|-------|--------|
| — | *None tracked in-repo* | — | — | — | — |

---

## Completed

| Feature | Goal | Files (representative) | Dependencies | Risks | Status |
|---------|------|------------------------|----------------|-------|--------|
| 3D carousel | Hero interaction, spin, front ball | `PokeBallCarousel.tsx`, `usePokeBallCarousel.ts` | Motion (CSS mostly), pointer | Motion sickness → mitigated by reduced motion | Completed |
| Ball detail overlay | Lore + suggested Pokémon | `DetailsOverlay.tsx`, `BallDetailPanel.tsx`, ball queries | Query, pokeapi services | API rate | Completed |
| Pokémon detail | Full dex page in overlay | `PokemonDetailPanel.tsx`, `detailedPokemon.ts`, extras query | Query | Large payloads | Completed |
| My Dex | Browse/filter/favorites/recents | `MyDexPanel.tsx`, `discoveryEngine.ts`, `useMyDexDiscovery.ts` | Zustand discovery store | Client perf on huge lists | Completed |
| Compare | Transparent multi-category scoring | `ComparisonModal.tsx`, `comparisonScoring.ts`, `ComparisonStatBars.tsx` | Query profiles + type chart | Misinterpretation of rules → mitigated by copy | Completed |
| Design tokens & atmosphere | Premium visual system + type tint | `design-tokens.css`, `index.css`, `AppAtmosphere.tsx` | CSS `color-mix` | Older browsers | Completed |
| A11y foundation | Trap, carousel keyboard, tests | `useFocusTrap.ts`, `getFocusable.ts`, `carouselAngle.ts`, `*.test.ts` | Vitest | Maintenance | Completed |
| Keyboard shortcuts | `/`, `Esc` stack | `useAppKeyboardShortcuts.ts` | — | Conflicts with inputs | Completed |

---

## Blocked

| Feature | Goal | Blocker | Status |
|---------|------|---------|--------|
| — | — | — | — |

---

## Future ideas

| Idea | Value | Notes |
|------|--------|------|
| PWA / offline dex slice | Retention | Large scope; needs caching strategy ADR |
| User accounts / cloud saves | Cross-device | Out of scope unless product pivots |
| Battle damage calculator | Engagement | Different product surface; evaluate fit |
| OG / social preview | Growth | Static hosting implications |
