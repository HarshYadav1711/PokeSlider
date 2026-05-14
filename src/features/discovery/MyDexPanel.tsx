import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useId, useMemo, useRef } from 'react';

import { useFocusTrap } from '../../a11y/useFocusTrap';
import { ALL_POKEMON_TYPES } from '../../data/pokemonTypes';
import { TypeBadge } from '../../components/pokemon/TypeBadge';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { sheetSpringTransition } from '../../motion/motionPrefs';
import { InlineRowSkeleton } from '../../components/ui/PanelSkeletons';
import { useComparisonStore } from '../../store/comparisonStore';
import { useDexListsStore } from '../../store/dexListsStore';
import { useDiscoveryRecommendationStore } from '../../store/discoveryRecommendationStore';
import { useUiStore } from '../../store/uiStore';
import { useDiscoveryUiStore } from './discoveryUiStore';
import { DISCOVERY_HABITAT_SLUGS } from './discoveryTypes';
import { useAbilitySlugListQuery, useMyDexDiscovery, usePokedexSlugListQuery } from './useMyDexDiscovery';

function tabClass(active: boolean): string {
  return [
    'app-focus-ring min-h-11 flex-1 rounded-[var(--radius-lg)] px-3 py-2 text-center text-[var(--text-body-sm)] font-semibold transition-[background-color,color,box-shadow] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)]',
    active
      ? 'bg-white/18 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]'
      : 'bg-white/5 text-white/78 hover:bg-white/12 active:scale-[0.99]',
  ].join(' ');
}

export function MyDexPanel() {
  const reduced = usePrefersReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const trapRef = useRef<HTMLDivElement>(null);
  const panelId = useId().replaceAll(':', '');
  const listboxId = `${panelId}-listbox`;
  const mainPanelId = `${panelId}-main-panel`;

  const panelOpen = useDiscoveryUiStore((s) => s.panelOpen);
  const setPanelOpen = useDiscoveryUiStore((s) => s.setPanelOpen);
  const tab = useDiscoveryUiStore((s) => s.tab);
  const setTab = useDiscoveryUiStore((s) => s.setTab);
  const query = useDiscoveryUiStore((s) => s.query);
  const setQuery = useDiscoveryUiStore((s) => s.setQuery);
  const filters = useDiscoveryUiStore((s) => s.filters);
  const setFilters = useDiscoveryUiStore((s) => s.setFilters);
  const resetFilters = useDiscoveryUiStore((s) => s.resetFilters);
  const activeResultIndex = useDiscoveryUiStore((s) => s.activeResultIndex);
  const setActiveResultIndex = useDiscoveryUiStore((s) => s.setActiveResultIndex);

  useFocusTrap({
    active: panelOpen,
    containerRef: trapRef,
    initialFocusSelector: '[data-initial-focus]',
  });

  const showPokemon = useUiStore((s) => s.showPokemon);
  const toggleFavorite = useDexListsStore((s) => s.toggleFavorite);
  const favoriteIds = useDexListsStore((s) => s.favoriteIds);
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const assignCompareSlot = useComparisonStore((s) => s.assignSlot);

  const {
    displayRows,
    enrichmentQuery,
    isResolvingStructure,
    isIndexingForms,
    nationalQuery,
    candidateIds,
  } = useMyDexDiscovery();

  const pokedexListQuery = usePokedexSlugListQuery(panelOpen);
  const abilityListQuery = useAbilitySlugListQuery(panelOpen);

  const toggleType = useCallback(
    (t: (typeof ALL_POKEMON_TYPES)[number]) => {
      const cur = [...filters.types];
      const has = cur.includes(t);
      setFilters({ types: has ? cur.filter((x) => x !== t) : [...cur, t] });
    },
    [filters.types, setFilters],
  );

  useEffect(() => {
    if (displayRows.length === 0) {
      setActiveResultIndex(0);
      return;
    }
    setActiveResultIndex((i) => Math.min(Math.max(i, 0), displayRows.length - 1));
  }, [displayRows.length, setActiveResultIndex]);

  const onListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable="true"]')) {
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveResultIndex((i) => Math.min(i + 1, Math.max(displayRows.length - 1, 0)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveResultIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        setActiveResultIndex((i) => Math.min(i + 10, Math.max(displayRows.length - 1, 0)));
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        setActiveResultIndex((i) => Math.max(i - 10, 0));
      } else if (e.key === 'Enter') {
        const row = displayRows[activeResultIndex];
        if (row) {
          e.preventDefault();
          showPokemon(row.id);
        }
      }
    },
    [activeResultIndex, displayRows, setActiveResultIndex, showPokemon],
  );

  useEffect(() => {
    const optId = `${listboxId}-opt-${activeResultIndex}`;
    const el = listRef.current?.querySelector<HTMLElement>(`#${optId}`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeResultIndex, listboxId, displayRows]);

  const loadingList =
    nationalQuery.isLoading ||
    isResolvingStructure ||
    enrichmentQuery.isPending ||
    enrichmentQuery.isLoading;

  return (
    <>
      <div className="pointer-events-auto fixed bottom-5 right-4 z-[890] max-md:bottom-4 max-md:right-3">
        <button
          type="button"
          onClick={() => setPanelOpen(!panelOpen)}
          className="app-focus-ring flex min-h-12 items-center gap-2 rounded-[var(--radius-pill)] border border-white/18 bg-[rgb(8_10_18/0.72)] px-5 py-3 text-[var(--text-body-sm)] font-semibold text-white shadow-[var(--shadow-md)] backdrop-blur-[var(--blur-glass)] transition-[transform,background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:border-white/26 hover:bg-[rgb(8_10_18/0.82)] active:scale-[0.98]"
          aria-expanded={panelOpen}
          aria-controls={panelId}
        >
          <span aria-hidden>📖</span>
          My Dex
        </button>
      </div>

      {panelOpen ? (
        <button
          type="button"
          className="pointer-events-auto fixed inset-0 z-[883] bg-[rgb(2_3_8/0.78)] max-md:bg-[rgb(2_3_8/0.92)] backdrop-blur-[var(--blur-overlay)] max-md:backdrop-blur-none"
          aria-label="Dismiss My Dex"
          onClick={() => setPanelOpen(false)}
        />
      ) : null}

      <AnimatePresence>
        {panelOpen ? (
          <motion.div
            key="mydex"
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="My Dex Pokémon browser"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={sheetSpringTransition(reduced)}
            className="pointer-events-auto fixed inset-x-0 bottom-0 top-[min(12dvh,120px)] z-[895] flex flex-col rounded-t-[var(--radius-3xl)] border border-white/12 bg-[rgb(10_14_26/0.98)] p-[var(--space-4)] shadow-[var(--shadow-lg)] backdrop-blur-[var(--blur-overlay)] max-md:top-[10vh] max-md:backdrop-blur-none md:inset-y-4 md:right-4 md:left-auto md:w-[min(100vw-2rem,440px)] md:rounded-[var(--radius-3xl)] md:p-[var(--space-5)]"
          >
            <div ref={trapRef} className="flex min-h-0 flex-1 flex-col">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[var(--text-title-sm)] font-bold tracking-[var(--tracking-tight)] text-white [font-family:var(--font-display)]">
                My Dex
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => useDiscoveryRecommendationStore.getState().setOpen(true)}
                  className="app-focus-ring rounded-[var(--radius-pill)] border border-cyan-400/35 bg-cyan-500/16 px-4 py-2 text-[var(--text-eyebrow)] font-semibold uppercase tracking-wide text-white transition-[background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:border-cyan-300/45 hover:bg-cyan-500/24 active:scale-[0.98]"
                  aria-label="Open personalized discovery mix"
                >
                  Discovery
                </button>
                <button
                  type="button"
                  onClick={() => useComparisonStore.getState().openModal()}
                  className="app-focus-ring rounded-[var(--radius-pill)] border border-violet-400/35 bg-violet-500/16 px-4 py-2 text-[var(--text-eyebrow)] font-semibold uppercase tracking-wide text-white transition-[background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:border-violet-300/45 hover:bg-violet-500/24 active:scale-[0.98]"
                  aria-label="Open Pokémon comparison"
                >
                  Compare
                </button>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="app-focus-ring min-h-11 min-w-11 rounded-[var(--radius-pill)] border border-white/16 bg-white/8 text-lg text-white transition-[background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:border-white/24 hover:bg-white/14 active:scale-[0.97]"
                  aria-label="Close My Dex"
                >
                  ×
                </button>
              </div>
            </div>

            <div
              className="mb-3 grid grid-cols-3 gap-1 rounded-[var(--radius-2xl)] border border-white/10 bg-black/28 p-1"
              role="tablist"
              aria-label="My Dex sections"
            >
              {(
                [
                  ['browse', 'Browse'],
                  ['favorites', 'Favorites'],
                  ['recents', 'Recents'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`${panelId}-tab-${id}`}
                  aria-selected={tab === id}
                  aria-controls={mainPanelId}
                  className={tabClass(tab === id)}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div
              id={mainPanelId}
              role="tabpanel"
              aria-labelledby={`${panelId}-tab-${tab}`}
              className="flex min-h-0 flex-1 flex-col"
            >
            <label className="mb-2 block text-[var(--text-eyebrow)] font-semibold uppercase tracking-wide text-white/68" htmlFor={`${panelId}-search`}>
              Search
            </label>
            <input
              id={`${panelId}-search`}
              data-discovery-search
              data-initial-focus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, form, or words…"
              className="app-focus-ring mb-3 w-full min-h-12 rounded-[var(--radius-2xl)] border border-white/14 bg-white/8 px-4 text-[var(--text-body)] text-white outline-none placeholder:text-white/42 focus:border-white/32"
              aria-label="Search Pokémon by name or form"
              autoComplete="off"
              spellCheck={false}
            />

            <details className="mb-3 rounded-2xl border border-white/10 bg-white/5">
              <summary className="app-focus-ring cursor-pointer select-none rounded-[var(--radius-2xl)] px-4 py-3 text-sm font-semibold text-white/92 min-h-12">
                Filters {tab === 'browse' ? '' : '(browse tab for filters)'}
              </summary>
              <div className="space-y-4 border-t border-white/10 px-3 pb-4 pt-3">
                {tab === 'browse' ? (
                  <>
                    <fieldset>
                      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/68">
                        Types (any match)
                      </legend>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_POKEMON_TYPES.map((t) => {
                          const on = filters.types.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              aria-pressed={on}
                              aria-label={
                                on ? `Remove ${t} from type filter` : `Add ${t} to type filter (any match)`
                              }
                              onClick={() => toggleType(t)}
                              className={[
                                'app-focus-ring min-h-10 rounded-full border px-2.5 py-2 text-xs font-semibold capitalize transition',
                                on ? 'border-white/40 bg-white/25 text-white' : 'border-white/15 bg-black/20 text-white/75 hover:bg-white/10',
                              ].join(' ')}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <label className="block text-xs font-semibold uppercase tracking-wide text-white/68">
                      Generation
                      <select
                        className="app-focus-ring mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white"
                        value={filters.generation ?? ''}
                        onChange={(e) =>
                          setFilters({
                            generation: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        aria-label="Filter by generation"
                      >
                        <option value="">Any generation</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                          <option key={g} value={g}>
                            Generation {g}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-xs font-semibold uppercase tracking-wide text-white/68">
                      Regional dex
                      <select
                        className="app-focus-ring mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white"
                        value={filters.pokedexSlug ?? ''}
                        onChange={(e) => setFilters({ pokedexSlug: e.target.value || null })}
                        aria-label="Filter by regional Pokédex"
                      >
                        <option value="">Any region / dex</option>
                        {(pokedexListQuery.data ?? []).map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.displayName}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-xs font-semibold uppercase tracking-wide text-white/68">
                      Ability (slug)
                      <input
                        list={`${panelId}-abilities`}
                        className="app-focus-ring mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white placeholder:text-white/45"
                        value={filters.abilitySlug ?? ''}
                        onChange={(e) => setFilters({ abilitySlug: e.target.value.trim() || null })}
                        placeholder="e.g. overgrow"
                        aria-label="Filter by ability slug"
                      />
                      <datalist id={`${panelId}-abilities`}>
                        {(abilityListQuery.data ?? []).slice(0, 200).map((a) => (
                          <option key={a} value={a} />
                        ))}
                      </datalist>
                    </label>

                    <label className="block text-xs font-semibold uppercase tracking-wide text-white/68">
                      Habitat
                      <select
                        className="app-focus-ring mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white"
                        value={filters.habitatSlug ?? ''}
                        onChange={(e) => setFilters({ habitatSlug: e.target.value || null })}
                        aria-label="Filter by habitat"
                      >
                        <option value="">Any habitat</option>
                        {DISCOVERY_HABITAT_SLUGS.map((h) => (
                          <option key={h} value={h}>
                            {h.replaceAll('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-xs font-semibold uppercase tracking-wide text-white/68">
                      Form variant
                      <select
                        className="app-focus-ring mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white"
                        value={filters.formVariant}
                        onChange={(e) =>
                          setFilters({ formVariant: e.target.value as (typeof filters)['formVariant'] })
                        }
                        aria-label="Filter default versus alternate forms"
                      >
                        <option value="any">Any form</option>
                        <option value="default_only">Default variety only</option>
                        <option value="alternate_only">Alternate forms only</option>
                      </select>
                    </label>

                    <label className="block text-xs font-semibold uppercase tracking-wide text-white/68">
                      Battle role (stats)
                      <select
                        className="app-focus-ring mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white"
                        value={filters.battleRole}
                        onChange={(e) =>
                          setFilters({ battleRole: e.target.value as (typeof filters)['battleRole'] })
                        }
                        aria-label="Filter by inferred battle role"
                      >
                        <option value="any">Any role</option>
                        <option value="physical">Physical</option>
                        <option value="special">Special</option>
                        <option value="mixed">Mixed</option>
                        <option value="wall">Wall</option>
                        <option value="scout">Scout</option>
                      </select>
                    </label>
                  </>
                ) : (
                  <p className="text-sm text-white/70">
                    Switch to <strong className="text-white">Browse</strong> to filter by type, generation,
                    regional dex, ability, habitat, form variant, or battle role. Favorites and Recents still respect
                    search and stat / rarity options below.
                  </p>
                )}

                <label className="block text-xs font-semibold uppercase tracking-wide text-white/68">
                  Rarity group
                  <select
                    className="app-focus-ring mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white"
                    value={filters.rarity}
                    onChange={(e) =>
                      setFilters({ rarity: e.target.value as (typeof filters)['rarity'] })
                    }
                    aria-label="Filter by rarity group"
                  >
                    <option value="any">Any</option>
                    <option value="legendary">Legendary</option>
                    <option value="mythical">Mythical</option>
                    <option value="pseudoLegendary">Pseudo-legendary</option>
                    <option value="regular">Regular</option>
                  </select>
                </label>

                <label className="block text-xs font-semibold uppercase tracking-wide text-white/68">
                  Evolution stage (species)
                  <select
                    className="app-focus-ring mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white"
                    value={filters.evolutionStage}
                    onChange={(e) =>
                      setFilters({ evolutionStage: e.target.value as (typeof filters)['evolutionStage'] })
                    }
                    aria-label="Filter by whether species evolves from another"
                  >
                    <option value="any">Any</option>
                    <option value="no_prior">No prior evolution (base of line)</option>
                    <option value="has_prior">Has prior evolution</option>
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-white/68">
                    Min BST
                    <input
                      type="number"
                      min={0}
                      max={800}
                      className="app-focus-ring mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white"
                      value={filters.statMin ?? ''}
                      onChange={(e) =>
                        setFilters({ statMin: e.target.value === '' ? null : Number(e.target.value) })
                      }
                      aria-label="Minimum base stat total"
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-wide text-white/68">
                    Max BST
                    <input
                      type="number"
                      min={0}
                      max={800}
                      className="app-focus-ring mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white"
                      value={filters.statMax ?? ''}
                      onChange={(e) =>
                        setFilters({ statMax: e.target.value === '' ? null : Number(e.target.value) })
                      }
                      aria-label="Maximum base stat total"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => resetFilters()}
                  className="app-focus-ring w-full min-h-11 rounded-xl border border-white/15 bg-white/10 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Reset filters
                </button>
              </div>
            </details>

            <p className="mb-2 text-xs text-white/65" aria-live="polite">
              {isIndexingForms ? 'Indexing alternate forms (first open may take a moment)…' : null}
              {!isIndexingForms && tab === 'browse' ? `${candidateIds.length} matches` : null}
              {tab === 'favorites' ? `${candidateIds.length} favorites` : null}
              {tab === 'recents' ? `${candidateIds.length} recent` : null}
            </p>

            <div
              ref={listRef}
              tabIndex={0}
              role="listbox"
              id={listboxId}
              aria-label="Pokémon results"
              aria-activedescendant={
                displayRows[activeResultIndex] ? `${listboxId}-opt-${activeResultIndex}` : undefined
              }
              onKeyDown={onListKeyDown}
              className="app-focus-ring min-h-0 flex-1 overflow-y-auto rounded-[var(--radius-2xl)] border border-white/10 bg-black/26 outline-none"
            >
              {loadingList ? (
                <div className="space-y-2 p-3" aria-busy="true" aria-label="Loading Pokémon list">
                  {Array.from({ length: 8 }, (_, i) => (
                    <InlineRowSkeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : displayRows.length === 0 ? (
                <p className="p-6 text-center text-sm text-white/75" role="status">
                  No Pokémon match these filters. Try clearing search or filters.
                </p>
              ) : (
                <ul className="divide-y divide-white/10 p-2">
                  {displayRows.map((p, i) => {
                    const active = i === activeResultIndex;
                    return (
                      <li key={p.id}>
                        <div
                          id={`${listboxId}-opt-${i}`}
                          role="option"
                          aria-selected={active}
                          className={[
                            'flex items-center gap-3 rounded-xl px-2 py-2 transition',
                            active ? 'bg-white/15 ring-1 ring-white/25' : 'hover:bg-white/10',
                          ].join(' ')}
                        >
                          <button
                            type="button"
                            className="app-focus-ring flex min-h-14 flex-1 items-center gap-3 rounded-[var(--radius-lg)] text-left outline-none"
                            onClick={() => {
                              setActiveResultIndex(i);
                              showPokemon(p.id);
                            }}
                          >
                            <img
                              src={
                                p.sprite ??
                                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`
                              }
                              alt=""
                              className="size-12 shrink-0 rounded-lg bg-white/10 object-contain"
                              loading="lazy"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-semibold capitalize text-white">{p.name}</span>
                              <span className="mt-1 flex flex-wrap gap-1">
                                {p.types.map((t) => (
                                  <TypeBadge key={t} type={t} />
                                ))}
                              </span>
                              <span className="mt-1 block text-xs text-white/60">BST {p.baseStatTotal}</span>
                            </span>
                          </button>
                          <div className="flex shrink-0 flex-col gap-1">
                            <button
                              type="button"
                              aria-label={`Set ${p.name} as comparison slot A`}
                              className="app-focus-ring min-h-11 min-w-11 rounded-[var(--radius-md)] border border-violet-400/38 bg-violet-500/14 text-xs font-bold text-violet-100 transition-[background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:bg-violet-500/22 active:scale-[0.97]"
                              onClick={(e) => {
                                e.stopPropagation();
                                assignCompareSlot('a', p.id);
                              }}
                            >
                              A
                            </button>
                            <button
                              type="button"
                              aria-label={`Set ${p.name} as comparison slot B`}
                              className="app-focus-ring min-h-11 min-w-11 rounded-[var(--radius-md)] border border-sky-400/38 bg-sky-500/14 text-xs font-bold text-sky-100 transition-[background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:bg-sky-500/22 active:scale-[0.97]"
                              onClick={(e) => {
                                e.stopPropagation();
                                assignCompareSlot('b', p.id);
                              }}
                            >
                              B
                            </button>
                          </div>
                          <button
                            type="button"
                            aria-label={favoriteSet.has(p.id) ? `Remove ${p.name} from favorites` : `Add ${p.name} to favorites`}
                            aria-pressed={favoriteSet.has(p.id)}
                            className="app-focus-ring flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-[var(--radius-pill)] border border-white/16 bg-white/8 px-3 text-lg leading-none text-amber-200 transition-[background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:border-white/22 hover:bg-white/14 active:scale-[0.96]"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(p.id);
                            }}
                          >
                            {favoriteSet.has(p.id) ? '★' : '☆'}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <p className="mt-2 text-center text-[11px] leading-snug text-white/62">
              <kbd className="rounded border border-white/18 px-1">/</kbd> focus search ·{' '}
              <kbd className="rounded border border-white/18 px-1">Esc</kbd> close ·{' '}
              <kbd className="rounded border border-white/18 px-1">↑</kbd>{' '}
              <kbd className="rounded border border-white/18 px-1">↓</kbd> move highlight ·{' '}
              <kbd className="rounded border border-white/18 px-1">PgUp</kbd>{' '}
              <kbd className="rounded border border-white/18 px-1">PgDn</kbd> page results ·{' '}
              <kbd className="rounded border border-white/18 px-1">Enter</kbd> open highlighted Pokémon
            </p>
            </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
