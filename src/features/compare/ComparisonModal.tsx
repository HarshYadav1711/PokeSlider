import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useFocusTrap } from '../../a11y/useFocusTrap';
import { TypeBadge } from '../../components/pokemon/TypeBadge';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import {
  dialogSpringTransition,
  layoutTransition,
  overlayBackdropTransition,
} from '../../motion/motionPrefs';
import { qk } from '../../query/keys';
import { STALE_POKEMON_DETAIL_EXTRAS_MS, STALE_POKEMON_DETAIL_MS } from '../../query/staleTimes';
import { fetchPokemonComparisonProfile } from '../../services/pokeapi/comparisonProfile';
import { getTypeEffectiveness } from '../../services/pokeapi/typeEffectiveness';
import { useComparisonStore } from '../../store/comparisonStore';
import type { PokemonTypeName } from '../../types/pokemon';

import { duelBackground } from './compareTheme';
import { buildComparisonReport, type ComparisonCategoryResult, type ComparisonSide } from './comparisonScoring';
import { ComparisonShareSurface } from './ComparisonShareSurface';
import { ComparisonStatBars } from './ComparisonStatBars';

function typeChartKey(types: readonly PokemonTypeName[]): readonly string[] {
  return ['pokeapi', 'type-chart', [...types].slice().sort().join(',')] as const;
}

function MatchupLists({
  label,
  eff,
}: {
  label: string;
  eff: { superEffective: readonly PokemonTypeName[]; notVeryEffective: readonly PokemonTypeName[]; noEffect: readonly PokemonTypeName[] };
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-white/70">{label}</h4>
      <div className="space-y-2 text-xs text-white/85">
        <div>
          <span className="text-white/60">Weak to (2× from): </span>
          <span className="flex flex-wrap gap-1">
            {eff.superEffective.length === 0 ? (
              <span className="text-white/50">None</span>
            ) : (
              eff.superEffective.map((t) => <TypeBadge key={t} type={t} />)
            )}
          </span>
        </div>
        <div>
          <span className="text-white/60">Resists (0.5× from): </span>
          <span className="flex flex-wrap gap-1">
            {eff.notVeryEffective.length === 0 ? (
              <span className="text-white/50">None</span>
            ) : (
              eff.notVeryEffective.map((t) => <TypeBadge key={t} type={t} />)
            )}
          </span>
        </div>
        <div>
          <span className="text-white/60">Immune (0× from): </span>
          <span className="flex flex-wrap gap-1">
            {eff.noEffect.length === 0 ? (
              <span className="text-white/50">None</span>
            ) : (
              eff.noEffect.map((t) => <TypeBadge key={t} type={t} />)
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ row, sideLabel }: { row: ComparisonCategoryResult; sideLabel: { a: string; b: string } }) {
  const badge = (w: ComparisonSide) => {
    if (w === 'tie')
      return (
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white/75">Tie</span>
      );
    if (w === 'a')
      return (
        <span className="rounded-full bg-emerald-500/25 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
          {sideLabel.a}
        </span>
      );
    return (
      <span className="rounded-full bg-sky-500/25 px-2 py-0.5 text-[11px] font-semibold text-sky-200">{sideLabel.b}</span>
    );
  };
  return (
    <tr className="border-b border-white/10 text-sm">
      <td className="py-3 pr-2 align-top font-medium text-white">{row.title}</td>
      <td className="py-3 px-2 align-top text-center text-white/90">{row.detailA}</td>
      <td className="py-3 px-2 align-top text-center text-white/90">{row.detailB}</td>
      <td className="py-3 pl-2 align-top text-center">{badge(row.winner)}</td>
    </tr>
  );
}

export function ComparisonModal() {
  const reduced = usePrefersReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const open = useComparisonStore((s) => s.open);
  const closeModal = useComparisonStore((s) => s.closeModal);
  const swap = useComparisonStore((s) => s.swap);
  const idA = useComparisonStore((s) => s.idA);
  const idB = useComparisonStore((s) => s.idB);

  const profileA = useQuery({
    queryKey: idA === null ? ['pokeapi', 'pokemon', 'compare-profile', 'idle-a'] : qk.pokemon.comparisonProfile(idA),
    queryFn: async ({ signal }) => {
      const row = await fetchPokemonComparisonProfile(idA!, signal);
      if (!row) throw new Error('Missing Pokémon A');
      return row;
    },
    enabled: open && idA !== null,
    staleTime: STALE_POKEMON_DETAIL_MS,
    gcTime: 1000 * 60 * 60 * 12,
  });

  const profileB = useQuery({
    queryKey: idB === null ? ['pokeapi', 'pokemon', 'compare-profile', 'idle-b'] : qk.pokemon.comparisonProfile(idB),
    queryFn: async ({ signal }) => {
      const row = await fetchPokemonComparisonProfile(idB!, signal);
      if (!row) throw new Error('Missing Pokémon B');
      return row;
    },
    enabled: open && idB !== null,
    staleTime: STALE_POKEMON_DETAIL_MS,
    gcTime: 1000 * 60 * 60 * 12,
  });

  const effA = useQuery({
    queryKey: typeChartKey(profileA.data?.types ?? []),
    queryFn: ({ signal }) => getTypeEffectiveness(profileA.data!.types, signal),
    enabled: open && Boolean(profileA.data),
    staleTime: STALE_POKEMON_DETAIL_EXTRAS_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const effB = useQuery({
    queryKey: typeChartKey(profileB.data?.types ?? []),
    queryFn: ({ signal }) => getTypeEffectiveness(profileB.data!.types, signal),
    enabled: open && Boolean(profileB.data),
    staleTime: STALE_POKEMON_DETAIL_EXTRAS_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const report = useMemo(() => {
    if (!profileA.data || !profileB.data || !effA.data || !effB.data) return null;
    return buildComparisonReport(profileA.data, profileB.data, effA.data, effB.data);
  }, [profileA.data, profileB.data, effA.data, effB.data]);

  const ready = Boolean(report && profileA.data && profileB.data);
  const bg = profileA.data && profileB.data ? duelBackground(profileA.data.types, profileB.data.types) : '#0b1220';

  const sideNames = useMemo(
    () => ({
      a: profileA.data?.name ? capitalizeWord(profileA.data.name) : 'A',
      b: profileB.data?.name ? capitalizeWord(profileB.data.name) : 'B',
    }),
    [profileA.data?.name, profileB.data?.name],
  );

  const overall =
    report === null
      ? null
      : report.pointsA > report.pointsB
        ? ('a' as const)
        : report.pointsB > report.pointsA
          ? ('b' as const)
          : ('tie' as const);

  useFocusTrap({
    active: open,
    containerRef: dialogRef,
    initialFocusSelector: '[data-compare-initial-focus]',
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="compare"
          className="fixed inset-0 z-[1005] flex items-end justify-center bg-[rgb(4_6_12/0.78)] p-3 backdrop-blur-[var(--blur-overlay)] md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayBackdropTransition(reduced)}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <motion.div
            ref={dialogRef}
            initial={reduced ? { opacity: 0 } : { y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 24, opacity: 0, scale: 0.98 }}
            transition={dialogSpringTransition(reduced)}
            role="dialog"
            aria-modal="true"
            aria-label="Pokémon comparison"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[94dvh] w-full max-w-5xl overflow-y-auto rounded-t-[var(--radius-3xl)] border border-white/12 shadow-[var(--shadow-lg)] md:max-h-[92dvh] md:rounded-[var(--radius-3xl)]"
            style={{ background: bg }}
          >
            <div className="sticky top-0 z-[1] flex items-center justify-between gap-2 border-b border-white/10 bg-[rgb(6_8_14/0.55)] px-4 py-3 backdrop-blur-[var(--blur-glass)] md:px-6">
              <h2
                tabIndex={-1}
                data-compare-initial-focus
                className="text-[var(--text-title-sm)] font-bold tracking-[var(--tracking-tight)] text-white outline-none [font-family:var(--font-display)]"
              >
                Compare
              </h2>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => swap()}
                  className="app-focus-ring min-h-11 rounded-[var(--radius-pill)] border border-white/16 bg-white/8 px-4 py-2 text-[var(--text-body-sm)] font-semibold text-white transition-[background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:border-white/24 hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!idA || !idB}
                >
                  Swap sides
                </button>
                <button
                  type="button"
                  onClick={() => closeModal()}
                  className="app-focus-ring flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-pill)] border border-white/18 bg-white/8 text-lg text-white transition-[background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:border-white/26 hover:bg-white/14"
                  aria-label="Close comparison dialog"
                >
                  <span aria-hidden>×</span>
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {!idA || !idB ? (
                <p className="rounded-2xl border border-white/15 bg-black/30 p-6 text-center text-sm text-white/80">
                  Choose two Pokémon using the <strong className="text-white">A</strong> and{' '}
                  <strong className="text-white">B</strong> buttons in My Dex, then return here. This view stays open
                  while you pick.
                </p>
              ) : null}

              {idA && idB && (profileA.isPending || profileB.isPending || effA.isPending || effB.isPending) ? (
                <p className="py-10 text-center text-sm text-white/70">Loading comparison data…</p>
              ) : null}

              {idA && idB && (profileA.isError || profileB.isError) ? (
                <div className="space-y-4 py-8 text-center" role="alert">
                  <p className="text-sm text-red-200">Could not load one or both Pokémon. You can retry each side below.</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {profileA.isError ? (
                      <button
                        type="button"
                        className="app-focus-ring min-h-11 rounded-[var(--radius-pill)] border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                        onClick={() => void profileA.refetch()}
                      >
                        Retry Pokémon A
                      </button>
                    ) : null}
                    {profileB.isError ? (
                      <button
                        type="button"
                        className="app-focus-ring min-h-11 rounded-[var(--radius-pill)] border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                        onClick={() => void profileB.refetch()}
                      >
                        Retry Pokémon B
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {ready && profileA.data && profileB.data && report && effA.data && effB.data ? (
                <ComparisonShareSurface className="border-white/10 bg-black/35">
                  <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
                    <motion.div
                      layout={!reduced}
                      transition={layoutTransition(reduced)}
                      className={[
                        'rounded-2xl border p-4 text-center md:text-left',
                        overall === 'a' ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-white/10 bg-white/5',
                      ].join(' ')}
                    >
                      <div className="mb-3 flex flex-col items-center gap-2 md:flex-row md:items-start">
                        <img
                          src={profileA.data.image ?? ''}
                          alt=""
                          className="size-28 rounded-2xl border border-white/15 bg-black/30 object-contain p-2"
                        />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-white/55">Pokémon A</p>
                          <h3 className="text-xl font-black capitalize text-white [font-family:var(--font-display)]">
                            {profileA.data.name.replaceAll('-', ' ')}
                          </h3>
                          <div className="mt-2 flex flex-wrap justify-center gap-1 md:justify-start">
                            {profileA.data.types.map((t) => (
                              <TypeBadge key={t} type={t} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {overall === 'a' ? (
                        <p className="text-center text-xs font-semibold text-emerald-200 md:text-left">Overall edge</p>
                      ) : null}
                    </motion.div>

                    <div className="flex items-center justify-center py-2 md:py-0">
                      <span className="rounded-full border border-white/20 bg-black/40 px-4 py-2 text-sm font-black text-white/90">
                        VS
                      </span>
                    </div>

                    <motion.div
                      layout={!reduced}
                      transition={layoutTransition(reduced)}
                      className={[
                        'rounded-2xl border p-4 text-center md:text-right',
                        overall === 'b' ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-white/10 bg-white/5',
                      ].join(' ')}
                    >
                      <div className="mb-3 flex flex-col items-center gap-2 md:flex-row-reverse md:items-start">
                        <img
                          src={profileB.data.image ?? ''}
                          alt=""
                          className="size-28 rounded-2xl border border-white/15 bg-black/30 object-contain p-2"
                        />
                        <div className="md:text-right">
                          <p className="text-xs font-semibold uppercase tracking-wide text-white/55">Pokémon B</p>
                          <h3 className="text-xl font-black capitalize text-white [font-family:var(--font-display)]">
                            {profileB.data.name.replaceAll('-', ' ')}
                          </h3>
                          <div className="mt-2 flex flex-wrap justify-center gap-1 md:justify-end">
                            {profileB.data.types.map((t) => (
                              <TypeBadge key={t} type={t} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {overall === 'b' ? (
                        <p className="text-center text-xs font-semibold text-emerald-200 md:text-right">Overall edge</p>
                      ) : null}
                    </motion.div>
                  </div>

                  {overall === 'tie' ? (
                    <p className="mb-6 text-center text-sm text-white/75">Overall score is even on these transparent rules.</p>
                  ) : (
                    <p className="mb-6 text-center text-sm text-white/80">
                      Overall points:{' '}
                      <strong className="text-white">
                        {sideNames.a} {report.pointsA.toFixed(1)}
                      </strong>{' '}
                      —{' '}
                      <strong className="text-white">
                        {sideNames.b} {report.pointsB.toFixed(1)}
                      </strong>{' '}
                      <span className="text-white/60">(max 5 from five scored categories)</span>
                    </p>
                  )}

                  <details className="mb-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                    <summary className="app-focus-ring min-h-11 cursor-pointer rounded-[var(--radius-lg)] px-1 py-2 text-sm font-semibold text-white">
                      How scoring works
                    </summary>
                    <p className="mt-2 text-xs leading-relaxed text-white/75">
                      Five independent categories each award <strong>1 point</strong> to the winner, or{' '}
                      <strong>0.5 each</strong> on a tie. Abilities and evolution stage are shown for context only and do
                      not change the score. All type math uses the same chart as the Pokédex detail view.
                    </p>
                  </details>

                  <div className="mb-8 overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full min-w-[520px] border-collapse text-left">
                      <caption className="sr-only">
                        Category-by-category comparison between {sideNames.a} and {sideNames.b}
                      </caption>
                      <thead>
                        <tr className="border-b border-white/15 text-xs uppercase tracking-wide text-white/70">
                          <th className="py-2 pr-2">Category</th>
                          <th className="px-2 py-2 text-center">{sideNames.a}</th>
                          <th className="px-2 py-2 text-center">{sideNames.b}</th>
                          <th className="pl-2 py-2 text-center">Winner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.categories.map((c) => (
                          <CategoryRow key={c.id} row={c} sideLabel={{ a: sideNames.a, b: sideNames.b }} />
                        ))}
                      </tbody>
                    </table>
                    <div className="border-t border-white/10 bg-black/20 px-3 py-2 text-[11px] leading-snug text-white/60">
                      {report.categories.map((c) => (
                        <p key={`${c.id}-rule`} className="mb-1 last:mb-0">
                          <strong className="text-white/80">{c.title}:</strong> {c.rule}
                        </p>
                      ))}
                    </div>
                  </div>

                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/70">Base stats</h3>
                  <ComparisonStatBars a={profileA.data} b={profileB.data} />

                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-white/70">Abilities</h3>
                      <ul className="space-y-1 text-sm text-white/90">
                        {profileA.data.abilities.map((ab) => (
                          <li key={`${ab.slot}-${ab.name}`}>
                            {ab.name}
                            {ab.isHidden ? <span className="text-white/50"> (hidden)</span> : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-white/70">Abilities</h3>
                      <ul className="space-y-1 text-sm text-white/90 md:text-right">
                        {profileB.data.abilities.map((ab) => (
                          <li key={`${ab.slot}-${ab.name}`}>
                            {ab.name}
                            {ab.isHidden ? <span className="text-white/50"> (hidden)</span> : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-white/70">Size & evolution</h3>
                      <dl className="space-y-1 text-sm text-white/90">
                        <div className="flex justify-between gap-2">
                          <dt className="text-white/60">Height</dt>
                          <dd>{profileA.data.heightM.toFixed(2)} m</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-white/60">Weight</dt>
                          <dd>{profileA.data.weightKg.toFixed(1)} kg</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-white/60">Evolution stage</dt>
                          <dd>{profileA.data.hasPriorEvolution ? 'Mid / evolved line' : 'Base of line'}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="md:text-right">
                      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-white/70">Size & evolution</h3>
                      <dl className="space-y-1 text-sm text-white/90 md:ml-auto md:max-w-xs">
                        <div className="flex justify-between gap-2 md:flex-row-reverse">
                          <dt className="text-white/60">Height</dt>
                          <dd>{profileB.data.heightM.toFixed(2)} m</dd>
                        </div>
                        <div className="flex justify-between gap-2 md:flex-row-reverse">
                          <dt className="text-white/60">Weight</dt>
                          <dd>{profileB.data.weightKg.toFixed(1)} kg</dd>
                        </div>
                        <div className="flex justify-between gap-2 md:flex-row-reverse">
                          <dt className="text-white/60">Evolution stage</dt>
                          <dd>{profileB.data.hasPriorEvolution ? 'Mid / evolved line' : 'Base of line'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <MatchupLists label={`${sideNames.a} defending`} eff={effA.data} />
                    <MatchupLists label={`${sideNames.b} defending`} eff={effB.data} />
                  </div>

                  <p className="mt-6 text-center text-[11px] text-white/45">
                    Share card surface is marked <code className="rounded bg-white/10 px-1">data-comparison-export</code>{' '}
                    for a future image export step.
                  </p>
                </ComparisonShareSurface>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function capitalizeWord(s: string): string {
  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
