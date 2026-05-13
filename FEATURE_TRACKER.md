# Feature tracker — PokeSlider

**Context pack (keep in sync):** After **meaningful** product or architecture changes, update **this file**, `PROJECT_CONTEXT.md`, `DECISIONS_LOG.md` (ADR when justified), and **`.cursor/rules/project-context.mdc`** (plus other `.mdc` rules if patterns change)—ideally in the **same PR** as the code. Pure typo / one-line fixes can skip.

Legend: **Status** matches section. **Risk**: Low / Med / High.

---

## Planned

| Feature | Goal | Files (typical) | Dependencies | Risks | Status |
|---------|------|-----------------|----------------|-------|--------|
| Comparison card export | Let users export/share a visual summary of compare results | `ComparisonShareSurface.tsx`, `ComparisonModal.tsx`, new util or canvas | Possibly `html-to-image` (already used for Team Builder) or canvas-only | Bundle size, SSR none | Planned |
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
| Team Builder | Local deterministic party of six; goals, risk, gen, locks; coverage/gaps/swaps; PNG card | `features/team-builder/*`, `store/teamBuilderStore.ts`, `services/pokeapi/typeMatchupChart.ts`, `query/keys.ts` (`qk.teamBuilder`), `PokemonSummary.baseStats` in `types/pokemon.ts` + `mapSummary.ts` | PokéAPI, **`html-to-image`** | Pool sampling for "Any gen"; API etiquette | Completed |
| Keyboard shortcuts | `/`, `Esc` stack (team builder → compare → My Dex → overlay) | `useAppKeyboardShortcuts.ts` | — | Conflicts with inputs | Completed |

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
