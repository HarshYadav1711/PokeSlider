# Feature tracker — PokeSlider

**Context pack (keep in sync):** After **meaningful** product or architecture changes, update **this file**, `PROJECT_CONTEXT.md`, `DECISIONS_LOG.md` (ADR when justified), and **`.cursor/rules/project-context.mdc`** (plus other `.mdc` rules if patterns change)—ideally in the **same PR** as the code. Treat the context pack as **part of the definition of done** for non-trivial work—not an optional follow-up. Pure typo / one-line fixes can skip.

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
| 3D carousel | Hero interaction, spin, front ball; **unmounts** when immersive UI is open; **adaptive perf tier** | `PokeBallCarousel.tsx`, `usePokeBallCarousel.ts`, `useHomeHeroSurfaceActive.ts`, `usePerformanceTier.ts`, `carouselAngleSession.ts` | Motion (CSS mostly), pointer | Motion sickness → mitigated by reduced motion + tier | Completed |
| Ball detail overlay | Catch Lab + lore + suggested Pokémon | `DetailsOverlay.tsx`, `BallDetailPanel.tsx`, `features/pokeballs/BallCatchLaboratory.tsx`, ball queries | Query, pokeapi services, `speciesCatchRate` on summaries | API rate | Completed |
| Pokémon detail | Full dex page + ball fit in overlay | `PokemonDetailPanel.tsx`, `PokemonBallFitSection.tsx`, `detailedPokemon.ts`, extras query | Query | Large payloads | Completed |
| Evolution timeline explorer | Cinematic chain UI: triggers, per-stage Pokédex flavor + genus, stat deltas vs baseline, Motion transitions, keyboard region; extras query returns `timelineStages` | `PokemonEvolutionTimeline.tsx`, `evolution.ts`, `evolutionSpeciesLore.ts`, `utils/evolutionTriggerSummary.ts` (+ test), `PokemonDetailPanel.tsx` | Query (`detailExtras`), PokéAPI | Extra parallel `/pokemon-species` calls per chain member; mitigated by extras `staleTime` | Completed |
| My Dex | Browse/filter/favorites/recents | `MyDexPanel.tsx`, `discoveryEngine.ts`, `useMyDexDiscovery.ts` | Zustand discovery store | Client perf on huge lists | Completed |
| Compare | Transparent multi-category scoring | `ComparisonModal.tsx`, `comparisonScoring.ts`, `ComparisonStatBars.tsx` | Query profiles + type chart | Misinterpretation of rules → mitigated by copy | Completed |
| Design tokens & atmosphere | Premium visual system + type tint | `design-tokens.css`, `index.css`, `AppAtmosphere.tsx` | CSS `color-mix` | Older browsers | Completed |
| A11y foundation | Trap, carousel keyboard, tests | `useFocusTrap.ts`, `getFocusable.ts`, `carouselAngle.ts`, `*.test.ts` | Vitest | Maintenance | Completed |
| Team Builder | Local deterministic party of six; goals, risk, gen, locks; coverage/gaps/swaps; PNG card | `features/team-builder/*`, `store/teamBuilderStore.ts`, `services/pokeapi/typeMatchupChart.ts`, `query/keys.ts` (`qk.teamBuilder`), `PokemonSummary.baseStats` in `types/pokemon.ts` + `mapSummary.ts` | PokéAPI, **`html-to-image`** | Pool sampling for "Any gen"; API etiquette | Completed |
| Journey Mode | Local trainer profile, starter + region, glass trainer card, dashboard (achievements, discovery/favorite/team history); Zustand persist + Motion onboarding | `features/journey/*`, `store/journeyTrainerStore.ts`, `store/journeyProgressStore.ts`, `store/journeyUiStore.ts`, `data/journeyRegions.ts`, `data/journeyStarters.ts`, `achievementEngine.ts` (+ test), `App.tsx`, `useAppKeyboardShortcuts.ts`, `dexListsStore.ts`, `uiStore.ts`, `ComparisonModal.tsx`, `TeamBuilderModal.tsx` | Zustand persist, Motion | Storage quota on huge histories → capped lists | Completed |
| Keyboard shortcuts | `/`, `Esc` stack (team builder → battle sim → compare → journey onboarding → journey dashboard → My Dex → overlay) | `useAppKeyboardShortcuts.ts` | — | Conflicts with inputs | Completed |

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
