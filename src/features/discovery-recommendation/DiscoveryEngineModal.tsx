import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useId, useMemo, useRef, useState } from 'react';

import { useFocusTrap } from '../../a11y/useFocusTrap';
import { TypeBadge } from '../../components/pokemon/TypeBadge';
import { AsyncFeedback } from '../../components/ui/AsyncFeedback';
import { ALL_POKEMON_TYPES } from '../../data/pokemonTypes';
import { JOURNEY_REGIONS } from '../../data/journeyRegions';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { dialogSpringTransition, overlayBackdropTransition } from '../../motion/motionPrefs';
import { APP_FULLSCREEN_MODAL_BACKDROP } from '../../ui/appModalChrome';
import { useDexListsStore } from '../../store/dexListsStore';
import { useDiscoveryRecommendationStore } from '../../store/discoveryRecommendationStore';
import { useUiStore } from '../../store/uiStore';
import type { PokemonSummary } from '../../types/pokemon';

import { DiscoveryRelationshipOrbit } from './DiscoveryRelationshipOrbit';
import type {
  DiscoveryAesthetic,
  DiscoveryPlaystyle,
  DiscoveryRecommendationKind,
  DiscoveryScoredPick,
} from './discoveryRecommendationTypes';
import { useDiscoveryRecommendationData } from './useDiscoveryRecommendationData';

const PLAYSTYLES: { id: DiscoveryPlaystyle; label: string; hint: string }[] = [
  { id: 'aggressive', label: 'Aggressive', hint: 'Favors physical/special pressure and tempo.' },
  { id: 'bulky', label: 'Bulky', hint: 'Favors HP and layered defenses.' },
  { id: 'balanced', label: 'Balanced', hint: 'Stays near a mid BST curve.' },
  { id: 'speedy', label: 'Speedy', hint: 'Prioritizes high Speed stats.' },
  { id: 'wallbreaker', label: 'Wallbreaker', hint: 'Looks for high offensive ceilings.' },
  { id: 'trickster', label: 'Trickster', hint: 'Mixed offenses and speed quirks.' },
];

const AESTHETICS: { id: DiscoveryAesthetic; label: string }[] = [
  { id: 'cute', label: 'Cute' },
  { id: 'cool', label: 'Cool' },
  { id: 'elegant', label: 'Elegant' },
  { id: 'mysterious', label: 'Mysterious' },
  { id: 'fierce', label: 'Fierce' },
  { id: 'sleek', label: 'Sleek' },
];

const KIND_COPY: Record<
  DiscoveryRecommendationKind,
  { title: string; blurb: string }
> = {
  synergy: {
    title: 'Synergistic picks',
    blurb: 'STAB coverage into typings you already love — straight from the type chart.',
  },
  similar: {
    title: 'Similar Pokémon',
    blurb: 'Typing overlap and stat proximity to your anchors — transparent Jaccard + BST distance.',
  },
  hidden_gem: {
    title: 'Hidden gems',
    blurb: 'Strong totals without obvious sweeper skew; rewards off-beat typings.',
  },
  underrated: {
    title: 'Underrated standouts',
    blurb: 'Regular species in a dependable BST band — less poster-child, more mileage.',
  },
  rare_treat: {
    title: 'Rarely discovered favorites',
    blurb: 'Session-seeded novelty that steers away from your recent trail.',
  },
};

const KIND_ORDER: DiscoveryRecommendationKind[] = [
  'synergy',
  'similar',
  'hidden_gem',
  'underrated',
  'rare_treat',
];

function pill(active: boolean): string {
  return [
    'app-focus-ring rounded-full border px-3 py-1.5 text-xs font-semibold transition',
    active
      ? 'border-violet-400/55 bg-violet-500/25 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]'
      : 'border-white/12 bg-white/5 text-white/78 hover:border-white/22 hover:bg-white/10',
  ].join(' ');
}

export function DiscoveryEngineModal() {
  const reduced = usePrefersReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchId = useId().replaceAll(':', '');
  const [pokeQuery, setPokeQuery] = useState('');

  const open = useDiscoveryRecommendationStore((s) => s.open);
  const setOpen = useDiscoveryRecommendationStore((s) => s.setOpen);
  const newSession = useDiscoveryRecommendationStore((s) => s.newSession);
  const playstyle = useDiscoveryRecommendationStore((s) => s.playstyle);
  const setPlaystyle = useDiscoveryRecommendationStore((s) => s.setPlaystyle);
  const aesthetics = useDiscoveryRecommendationStore((s) => s.aesthetics);
  const toggleAesthetic = useDiscoveryRecommendationStore((s) => s.toggleAesthetic);
  const favoritePokemonIds = useDiscoveryRecommendationStore((s) => s.favoritePokemonIds);
  const toggleAnchorPokemon = useDiscoveryRecommendationStore((s) => s.toggleAnchorPokemon);
  const favoriteTypes = useDiscoveryRecommendationStore((s) => s.favoriteTypes);
  const toggleFavoriteType = useDiscoveryRecommendationStore((s) => s.toggleFavoriteType);
  const favoriteRegionKeys = useDiscoveryRecommendationStore((s) => s.favoriteRegionKeys);
  const toggleRegionKey = useDiscoveryRecommendationStore((s) => s.toggleRegionKey);
  const importDexFavoritesAsAnchors = useDiscoveryRecommendationStore((s) => s.importDexFavoritesAsAnchors);

  const dexFavorites = useDexListsStore((s) => s.favoriteIds);
  const toggleDexFavorite = useDexListsStore((s) => s.toggleFavorite);
  const showPokemon = useUiStore((s) => s.showPokemon);

  const {
    candidatesQuery,
    nationalIndexQuery,
    summariesQuery,
    chartQuery,
    engineResult,
    sessionSeed,
  } = useDiscoveryRecommendationData();

  useFocusTrap({
    active: open,
    containerRef: dialogRef,
    initialFocusSelector: '[data-discovery-engine-initial-focus]',
  });

  const summaryById = useMemo(() => {
    const m = new Map<number, PokemonSummary>();
    for (const row of summariesQuery.data ?? []) m.set(row.id, row);
    return m;
  }, [summariesQuery.data]);

  const picksByKind = useMemo(() => {
    const map: Record<DiscoveryRecommendationKind, DiscoveryScoredPick[]> = {
      synergy: [],
      similar: [],
      hidden_gem: [],
      underrated: [],
      rare_treat: [],
    };
    if (!engineResult) return map;
    for (const p of engineResult.picks) {
      map[p.kind].push(p);
    }
    return map;
  }, [engineResult]);

  const searchHits = useMemo(() => {
    const q = pokeQuery.trim().toLowerCase().replaceAll('-', ' ');
    const rows = nationalIndexQuery.data;
    if (!q || !rows?.length) return [];
    return rows
      .filter((r) => r.name.replaceAll('-', ' ').includes(q))
      .slice(0, 10);
  }, [pokeQuery, nationalIndexQuery.data]);

  const busy =
    open &&
    (candidatesQuery.isPending ||
      nationalIndexQuery.isPending ||
      summariesQuery.isPending ||
      chartQuery.isPending);

  const loadError =
    candidatesQuery.isError || summariesQuery.isError || nationalIndexQuery.isError || chartQuery.isError;

  const onRefreshSession = useCallback(() => {
    newSession();
  }, [newSession]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="discovery-engine"
          className={`fixed inset-0 z-[1005] flex items-end justify-center p-3 md:items-center ${APP_FULLSCREEN_MODAL_BACKDROP}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayBackdropTransition(reduced)}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${searchId}-title`}
            initial={reduced ? { opacity: 0 } : { y: 36, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 22, opacity: 0, scale: 0.985 }}
            transition={dialogSpringTransition(reduced)}
            className="flex max-h-[min(93dvh,54rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-white/12 bg-[rgb(7_9_16/0.97)] text-left text-[#f4f4f8] shadow-2xl"
            style={{ boxShadow: 'var(--shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="relative shrink-0 overflow-hidden border-b border-violet-500/15 px-5 py-4">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgb(139_92_246/0.22),transparent_55%),radial-gradient(ellipse_at_80%_40%,rgb(56_189_248/0.12),transparent_50%)]"
                aria-hidden
              />
              <div className="relative flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[var(--text-eyebrow)] font-semibold uppercase tracking-[0.14em] text-violet-200/85">
                    Discovery engine
                  </p>
                  <h2
                    id={`${searchId}-title`}
                    className="text-xl font-bold tracking-tight text-white [font-family:var(--font-display)]"
                  >
                    Your weekly-style mix
                  </h2>
                  <p className="mt-1 max-w-2xl text-[var(--text-body-sm)] text-white/72">
                    Deterministic scoring — every card lists the exact rules that nominated it. Refresh spins a new
                    session seed without changing your saved taste profile.
                  </p>
                  {engineResult ? (
                    <p className="mt-2 text-xs text-white/58" role="status">
                      {engineResult.sessionSummary}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="app-focus-ring rounded-xl border border-cyan-400/35 bg-cyan-500/15 px-3 py-2 text-sm font-semibold text-cyan-50 hover:bg-cyan-500/25"
                    onClick={onRefreshSession}
                  >
                    Refresh session
                  </button>
                  <button
                    type="button"
                    data-discovery-engine-initial-focus
                    className="app-focus-ring rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {loadError ? (
                <AsyncFeedback
                  title="Could not finish discovery"
                  description="Check your connection and reopen the mix. PokéAPI summaries and type data are required."
                />
              ) : null}

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                <div className="space-y-5">
                  <section className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/12 via-transparent to-cyan-500/10 p-4">
                    <p className="text-sm font-bold text-white">Taste profile</p>
                    <p className="mt-1 text-xs text-white/65">
                      Stored locally as <span className="font-mono text-white/80">pokeslider-discovery-reco</span>.
                    </p>

                    <div className="mt-4 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-white/55" htmlFor={`${searchId}-poke`}>
                        Favorite Pokémon (anchors)
                      </label>
                      <input
                        id={`${searchId}-poke`}
                        type="search"
                        autoComplete="off"
                        placeholder="Search national dex…"
                        value={pokeQuery}
                        onChange={(e) => setPokeQuery(e.target.value)}
                        className="app-focus-ring w-full rounded-xl border border-white/12 bg-black/25 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
                      />
                      {searchHits.length > 0 ? (
                        <ul
                          className="max-h-36 overflow-auto rounded-xl border border-white/10 bg-black/30 text-sm"
                          role="listbox"
                          aria-label="Search results"
                        >
                          {searchHits.map((row) => (
                            <li key={row.id}>
                              <button
                                type="button"
                                className="app-focus-ring flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-white/10"
                                onClick={() => {
                                  toggleAnchorPokemon(row.id);
                                  setPokeQuery('');
                                }}
                              >
                                <span className="capitalize text-white">{row.name.replaceAll('-', ' ')}</span>
                                <span className="text-xs text-white/50">#{row.id}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {favoritePokemonIds.map((id) => (
                          <button
                            key={id}
                            type="button"
                            className={pill(true)}
                            onClick={() => toggleAnchorPokemon(id)}
                            aria-pressed
                          >
                            #{id} ×
                          </button>
                        ))}
                        {favoritePokemonIds.length === 0 ? (
                          <span className="text-xs text-white/55">Pick up to six anchors.</span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="app-focus-ring mt-1 text-xs font-semibold text-violet-200 underline-offset-2 hover:underline"
                        onClick={() => importDexFavoritesAsAnchors(dexFavorites)}
                      >
                        Import starred My Dex favorites
                      </button>
                    </div>

                    <fieldset className="mt-5 space-y-2">
                      <legend className="text-xs font-bold uppercase tracking-wide text-white/55">Favorite types</legend>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_POKEMON_TYPES.map((t) => (
                          <button
                            key={t}
                            type="button"
                            className={pill(favoriteTypes.includes(t))}
                            onClick={() => toggleFavoriteType(t)}
                            aria-pressed={favoriteTypes.includes(t)}
                          >
                            <span className="capitalize">{t}</span>
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <fieldset className="mt-5 space-y-2">
                      <legend className="text-xs font-bold uppercase tracking-wide text-white/55">Regions</legend>
                      <div className="flex flex-wrap gap-1.5">
                        {JOURNEY_REGIONS.map((r) => (
                          <button
                            key={r.key}
                            type="button"
                            className={pill(favoriteRegionKeys.includes(r.key))}
                            onClick={() => toggleRegionKey(r.key)}
                            aria-pressed={favoriteRegionKeys.includes(r.key)}
                          >
                            {r.shortLabel}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <fieldset className="mt-5 space-y-2">
                      <legend className="text-xs font-bold uppercase tracking-wide text-white/55">Playstyle</legend>
                      <div className="flex flex-col gap-2">
                        {PLAYSTYLES.map((p) => (
                          <label
                            key={p.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 text-sm ${
                              playstyle === p.id
                                ? 'border-violet-400/45 bg-violet-500/15'
                                : 'border-white/10 bg-black/20 hover:border-white/18'
                            }`}
                          >
                            <input
                              type="radio"
                              className="mt-1"
                              name="discovery-playstyle"
                              checked={playstyle === p.id}
                              onChange={() => setPlaystyle(p.id)}
                            />
                            <span>
                              <span className="font-semibold text-white">{p.label}</span>
                              <span className="mt-0.5 block text-xs text-white/65">{p.hint}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <fieldset className="mt-5 space-y-2">
                      <legend className="text-xs font-bold uppercase tracking-wide text-white/55">Aesthetics (up to 3)</legend>
                      <div className="flex flex-wrap gap-1.5">
                        {AESTHETICS.map((a) => (
                          <button key={a.id} type="button" className={pill(aesthetics.includes(a.id))} onClick={() => toggleAesthetic(a.id)} aria-pressed={aesthetics.includes(a.id)}>
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </section>
                </div>

                <div className="space-y-5">
                  {busy ? (
                    <div role="status" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-white/75">
                      <p className="font-semibold text-white">Brewing your mix…</p>
                      <p className="mt-2 text-xs text-white/60">
                        Session seed <span className="font-mono text-white/80">{sessionSeed}</span> · sampling up to{' '}
                        {280} summaries from your region filter.
                      </p>
                    </div>
                  ) : null}

                  {!busy && engineResult && engineResult.picks.length === 0 ? (
                    <AsyncFeedback
                      role="status"
                      title="Nothing to show yet"
                      description="Add anchors or types, widen regions, then refresh the session."
                    />
                  ) : null}

                  {KIND_ORDER.map((kind) => {
                    const rows = picksByKind[kind];
                    if (!rows.length) return null;
                    const meta = KIND_COPY[kind];
                    return (
                      <section
                        key={kind}
                        className="rounded-2xl border border-white/10 bg-[rgb(10_12_22/0.55)] p-4 shadow-[var(--shadow-sm)] backdrop-blur-md"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-base font-bold text-white [font-family:var(--font-display)]">{meta.title}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Rule lane</span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-white/65">{meta.blurb}</p>
                        <ul className="mt-4 space-y-3">
                          {rows.map((pick) => {
                            const mon = summaryById.get(pick.pokemonId);
                            if (!mon) return null;
                            const starred = dexFavorites.includes(mon.id);
                            return (
                              <li
                                key={`${kind}-${mon.id}`}
                                className="rounded-xl border border-white/8 bg-black/25 p-3"
                              >
                                <div className="flex gap-3">
                                  <DiscoveryRelationshipOrbit relationships={pick.relationships} />
                                  <img
                                    src={
                                      mon.sprite ??
                                      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mon.id}.png`
                                    }
                                    alt=""
                                    className="size-14 shrink-0 rounded-lg bg-white/10 object-contain"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="truncate font-semibold capitalize text-white">{mon.name.replaceAll('-', ' ')}</p>
                                      <span className="text-xs text-white/45">#{mon.id}</span>
                                      <span className="text-[10px] font-bold uppercase tracking-wide text-violet-200/80">
                                        score {pick.score.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {mon.types.map((t) => (
                                        <TypeBadge key={t} type={t} />
                                      ))}
                                    </div>
                                    <ul className="mt-2 space-y-1.5 text-xs leading-snug text-white/78">
                                      {pick.reasons.map((r) => (
                                        <li key={r.code}>• {r.text}</li>
                                      ))}
                                    </ul>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        className="app-focus-ring rounded-lg border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/14"
                                        onClick={() => showPokemon(mon.id)}
                                      >
                                        Open detail
                                      </button>
                                      <button
                                        type="button"
                                        className="app-focus-ring rounded-lg border border-amber-300/35 bg-amber-400/15 px-3 py-1.5 text-xs font-semibold text-amber-50 hover:bg-amber-400/25"
                                        onClick={() => toggleDexFavorite(mon.id)}
                                        aria-pressed={starred}
                                      >
                                        {starred ? 'Unstar in My Dex' : 'Star in My Dex'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </section>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
