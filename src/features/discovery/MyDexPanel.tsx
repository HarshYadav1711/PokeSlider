import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useId, useMemo, useRef } from 'react';

import { ALL_POKEMON_TYPES } from '../../data/pokemonTypes';
import { TypeBadge } from '../../components/pokemon/TypeBadge';
import { InlineRowSkeleton } from '../../components/ui/PanelSkeletons';
import { useComparisonStore } from '../../store/comparisonStore';
import { useDexListsStore } from '../../store/dexListsStore';
import { useUiStore } from '../../store/uiStore';
import { useDiscoveryUiStore } from './discoveryUiStore';
import { useAbilitySlugListQuery, useMyDexDiscovery, usePokedexSlugListQuery } from './useMyDexDiscovery';

function tabClass(active: boolean): string {
  return [
    'min-h-11 flex-1 rounded-xl px-3 py-2 text-center text-sm font-semibold transition',
    active ? 'bg-white/25 text-white shadow-inner' : 'bg-white/5 text-white/80 hover:bg-white/15',
  ].join(' ');
}

export function MyDexPanel() {
  const listRef = useRef<HTMLDivElement>(null);
  const panelId = useId().replaceAll(':', '');
  const listboxId = `${panelId}-listbox`;

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
          className="flex min-h-12 items-center gap-2 rounded-full border border-white/25 bg-black/50 px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-black/60"
          aria-expanded={panelOpen}
          aria-controls={panelId}
        >
          <span aria-hidden>📖</span>
          My Dex
        </button>
      </div>

      <AnimatePresence>
        {panelOpen ? (
          <motion.div
            key="mydex"
            id={panelId}
            role="dialog"
            aria-modal
            aria-label="My Dex Pokémon browser"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="pointer-events-auto fixed inset-x-0 bottom-0 top-[8vh] z-[895] flex flex-col rounded-t-3xl border border-white/15 bg-[#0f172a]/97 p-4 shadow-[0_-12px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl max-md:top-[10vh] md:inset-y-4 md:right-4 md:left-auto md:w-[min(100vw-2rem,440px)] md:rounded-3xl md:border md:p-5"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white [font-family:var(--font-display)]">
                My Dex
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => useComparisonStore.getState().openModal()}
                  className="rounded-full border border-white/20 bg-violet-500/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500/30"
                  aria-label="Open Pokémon comparison"
                >
                  Compare
                </button>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="min-h-11 min-w-11 rounded-full border border-white/20 bg-white/10 text-lg text-white transition hover:bg-white/20"
                  aria-label="Close My Dex"
                >
                  ×
                </button>
              </div>
            </div>

            <div
              className="mb-3 grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-black/25 p-1"
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
                  aria-selected={tab === id}
                  className={tabClass(tab === id)}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60">
              Search
            </label>
            <input
              data-discovery-search
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, form, or words…"
              className="mb-3 w-full min-h-12 rounded-2xl border border-white/15 bg-white/10 px-4 text-base text-white outline-none ring-0 placeholder:text-white/45 focus:border-white/35"
              aria-label="Search Pokémon by name or form"
              autoComplete="off"
              spellCheck={false}
            />

            <details className="mb-3 rounded-2xl border border-white/10 bg-white/5">
              <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-white/90">
                Filters {tab === 'browse' ? '' : '(browse tab for type, region, ability)'}
              </summary>
              <div className="space-y-4 border-t border-white/10 px-3 pb-4 pt-3">
                {tab === 'browse' ? (
                  <>
                    <fieldset>
                      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/55">
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
                              onClick={() => toggleType(t)}
                              className={[
                                'rounded-full border px-2.5 py-1 text-xs font-semibold capitalize transition',
                                on ? 'border-white/40 bg-white/25 text-white' : 'border-white/15 bg-black/20 text-white/75 hover:bg-white/10',
                              ].join(' ')}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <label className="block text-xs font-semibold uppercase tracking-wide text-white/55">
                      Generation
                      <select
                        className="mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white"
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

                    <label className="block text-xs font-semibold uppercase tracking-wide text-white/55">
                      Regional dex
                      <select
                        className="mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white"
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

                    <label className="block text-xs font-semibold uppercase tracking-wide text-white/55">
                      Ability (slug)
                      <input
                        list={`${panelId}-abilities`}
                        className="mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white placeholder:text-white/40"
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
                  </>
                ) : (
                  <p className="text-sm text-white/70">
                    Switch to <strong className="text-white">Browse</strong> to filter by type, generation,
                    regional dex, or ability. Favorites and Recents still respect search and stat / rarity options
                    below.
                  </p>
                )}

                <label className="block text-xs font-semibold uppercase tracking-wide text-white/55">
                  Rarity group
                  <select
                    className="mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white"
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

                <label className="block text-xs font-semibold uppercase tracking-wide text-white/55">
                  Evolution stage (species)
                  <select
                    className="mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white"
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
                  <label className="text-xs font-semibold uppercase tracking-wide text-white/55">
                    Min BST
                    <input
                      type="number"
                      min={0}
                      max={800}
                      className="mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white"
                      value={filters.statMin ?? ''}
                      onChange={(e) =>
                        setFilters({ statMin: e.target.value === '' ? null : Number(e.target.value) })
                      }
                      aria-label="Minimum base stat total"
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-wide text-white/55">
                    Max BST
                    <input
                      type="number"
                      min={0}
                      max={800}
                      className="mt-1 w-full min-h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-sm text-white"
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
                  className="w-full rounded-xl border border-white/15 bg-white/10 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Reset filters
                </button>
              </div>
            </details>

            <p className="mb-2 text-xs text-white/55" aria-live="polite">
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
              className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-black/25 outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              {loadingList ? (
                <div className="space-y-2 p-3">
                  {Array.from({ length: 8 }, (_, i) => (
                    <InlineRowSkeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : displayRows.length === 0 ? (
                <p className="p-6 text-center text-sm text-white/70">
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
                            className="flex min-h-14 flex-1 items-center gap-3 text-left"
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
                              className="min-h-9 min-w-9 rounded-lg border border-violet-400/40 bg-violet-500/15 text-xs font-bold text-violet-100 hover:bg-violet-500/25"
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
                              className="min-h-9 min-w-9 rounded-lg border border-sky-400/40 bg-sky-500/15 text-xs font-bold text-sky-100 hover:bg-sky-500/25"
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
                            aria-label={favoriteSet.has(p.id) ? 'Remove from favorites' : 'Add to favorites'}
                            aria-pressed={favoriteSet.has(p.id)}
                            className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-lg leading-none text-amber-200 transition hover:bg-white/20"
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

            <p className="mt-2 text-center text-[11px] leading-snug text-white/45">
              <kbd className="rounded border border-white/15 px-1">/</kbd> search ·{' '}
              <kbd className="rounded border border-white/15 px-1">Esc</kbd> close · arrows +{' '}
              <kbd className="rounded border border-white/15 px-1">Enter</kbd> open
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
