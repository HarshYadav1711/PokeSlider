import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';

import { useFocusTrap } from '../../a11y/useFocusTrap';
import { TypeBadge } from '../../components/pokemon/TypeBadge';
import { ALL_POKEMON_TYPES } from '../../data/pokemonTypes';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { dialogSpringTransition, overlayBackdropTransition } from '../../motion/motionPrefs';
import { APP_FULLSCREEN_MODAL_BACKDROP } from '../../ui/appModalChrome';
import { useDexListsStore } from '../../store/dexListsStore';
import { useJourneyProgressStore } from '../../store/journeyProgressStore';
import { useTeamBuilderStore } from '../../store/teamBuilderStore';
import type { PokemonTypeName } from '../../types/pokemon';

import {
  buildTeamRecommendation,
  formatPokemonLabel,
  getTeamBuilderGoalWeights,
} from './teamBuilderEngine';
import type { TeamGoal } from './teamBuilderTypes';
import { useTeamBuilderData } from './useTeamBuilderData';

const GOALS: { id: TeamGoal; label: string; hint: string }[] = [
  { id: 'balance', label: 'Balance', hint: 'Mix roles, coverage, and bulk evenly.' },
  { id: 'offense', label: 'Offense', hint: 'Bias toward pressure and breaking power.' },
  { id: 'defense', label: 'Defense', hint: 'Bias toward shared resistances and bulk.' },
  { id: 'speed', label: 'Speed', hint: 'Bias toward tempo and high Speed stats.' },
  { id: 'nuzlocke', label: 'Nuzlocke safety', hint: 'Regular species only; fewer stacked risks.' },
  { id: 'type_coverage', label: 'Type coverage', hint: 'Maximize STAB answers to mono typings.' },
  { id: 'favorites_first', label: 'Favorites first', hint: 'Prefer your starred Dex species when close.' },
];

function goalDescription(goal: TeamGoal): string {
  switch (goal) {
    case 'balance':
      return 'Balances STAB coverage, defensive clustering, speed, and role spread with equal weights.';
    case 'offense':
      return 'Prioritizes offensive pressure and speed; still nudges coverage so the team is not paper-thin.';
    case 'defense':
      return 'Prioritizes lowering stacked weaknesses and raising bulk; coverage stays relevant but secondary.';
    case 'speed':
      return 'Prioritizes high Speed averages and tempo; still checks that the team can threaten typings.';
    case 'nuzlocke':
      return 'Restricts to non-legendary / non-mythical / non-pseudo species and favors safer defensive profiles.';
    case 'type_coverage':
      return 'Heavily weights how many mono typings your combined STAB can hit for double damage.';
    case 'favorites_first':
      return 'Adds a strong bias toward favorites and typing variety so the roster feels personal.';
    default:
      return '';
  }
}

export function TeamBuilderModal() {
  const reduced = usePrefersReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const open = useTeamBuilderStore((s) => s.open);
  const setOpen = useTeamBuilderStore((s) => s.setOpen);
  const lockedIds = useTeamBuilderStore((s) => s.lockedIds);
  const toggleLock = useTeamBuilderStore((s) => s.toggleLock);
  const clearLocks = useTeamBuilderStore((s) => s.clearLocks);

  const [goal, setGoal] = useState<TeamGoal>('balance');
  const [primaryType, setPrimaryType] = useState<PokemonTypeName | null>(null);
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [generation, setGeneration] = useState<number | null>(9);

  const favoriteIds = useDexListsStore((s) => s.favoriteIds);
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const { chart, pool, poolNote, isLoading, isError, error } = useTeamBuilderData(open, generation, lockedIds);

  const buildInput = useMemo(
    () => ({
      goal,
      primaryType,
      risk,
      generation,
      favoriteIds: favoriteSet,
      lockedIds,
    }),
    [goal, primaryType, risk, generation, favoriteSet, lockedIds],
  );

  const result = useMemo(() => {
    if (!chart || pool.length < 6) return null;
    return buildTeamRecommendation({ pool, chart, input: buildInput, poolNote });
  }, [chart, pool, buildInput, poolNote]);

  const weights = getTeamBuilderGoalWeights(goal);

  const [exportBusy, setExportBusy] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  async function handleExportPng() {
    const node = exportRef.current;
    if (!node || !result) return;
    setExportBusy(true);
    setExportMsg(null);
    try {
      await document.fonts?.ready?.catch(() => undefined);
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#070b14',
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `pokeslider-team-${goal}.png`;
      a.click();
      setExportMsg('Card downloaded as PNG.');
    } catch {
      setExportMsg('Could not render the card. Try again after images finish loading.');
    } finally {
      setExportBusy(false);
    }
  }

  useFocusTrap({
    active: open,
    containerRef: dialogRef,
    initialFocusSelector: '[data-team-builder-initial-focus]',
  });

  const prevTeamOpenRef = useRef(open);
  useEffect(() => {
    if (prevTeamOpenRef.current && !open && lockedIds.length === 6) {
      useJourneyProgressStore.getState().pushTeamSnapshotIfFull(lockedIds);
    }
    prevTeamOpenRef.current = open;
  }, [open, lockedIds]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="team-builder"
          className={`fixed inset-0 z-[1006] flex items-end justify-center p-3 md:items-center ${APP_FULLSCREEN_MODAL_BACKDROP}`}
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
            aria-labelledby="team-builder-title"
            initial={reduced ? { opacity: 0 } : { y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 24, opacity: 0, scale: 0.98 }}
            transition={dialogSpringTransition(reduced)}
            className="flex max-h-[min(92dvh,52rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-white/12 bg-[rgb(8_10_18/0.96)] text-left text-[#f4f4f8] shadow-2xl"
            style={{ boxShadow: 'var(--shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[var(--text-eyebrow)] font-semibold uppercase tracking-[0.12em] text-indigo-200/80">
                  Local assistant
                </p>
                <h2 id="team-builder-title" className="text-xl font-bold tracking-tight text-white [font-family:var(--font-display)]">
                  Team Builder
                </h2>
                <p className="mt-1 max-w-xl text-[var(--text-body-sm)] text-white/70">
                  Rule-based, deterministic scoring — no models, no billing. Type matchups load once from PokéAPI and stay cached.
                </p>
              </div>
              <button
                type="button"
                data-team-builder-initial-focus
                className="app-focus-ring rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <section className="mb-6 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4 text-sm leading-relaxed text-indigo-50/95">
                <p className="font-semibold text-white">How I decide</p>
                <p className="mt-1 text-white/80">{goalDescription(goal)}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-white/55">Active weight mix</p>
                <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/75 sm:grid-cols-3">
                  <li>Coverage {(weights.coverage * 100).toFixed(0)}%</li>
                  <li>Defense {(weights.defense * 100).toFixed(0)}%</li>
                  <li>Offense {(weights.offense * 100).toFixed(0)}%</li>
                  <li>Speed {(weights.speed * 100).toFixed(0)}%</li>
                  <li>Balance {(weights.balance * 100).toFixed(0)}%</li>
                  <li>Diversity {(weights.diversity * 100).toFixed(0)}%</li>
                </ul>
              </section>

              <div className="grid gap-6 lg:grid-cols-2">
                <fieldset className="space-y-3">
                  <legend className="text-sm font-bold text-white">Team goal</legend>
                  <div className="flex flex-col gap-2">
                    {GOALS.map((g) => (
                      <label
                        key={g.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 text-sm transition-colors ${
                          goal === g.id ? 'border-indigo-400/50 bg-indigo-500/15' : 'border-white/10 bg-black/20 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="team-goal"
                          checked={goal === g.id}
                          className="mt-1"
                          onChange={() => setGoal(g.id)}
                        />
                        <span>
                          <span className="font-semibold text-white">{g.label}</span>
                          <span className="mt-0.5 block text-xs text-white/65">{g.hint}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="team-primary-type" className="text-sm font-bold text-white">
                      Primary type preference
                    </label>
                    <select
                      id="team-primary-type"
                      className="app-focus-ring mt-1 w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white"
                      value={primaryType ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setPrimaryType(v === '' ? null : (v as PokemonTypeName));
                      }}
                    >
                      <option value="">Any type</option>
                      {ALL_POKEMON_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <fieldset>
                    <legend className="text-sm font-bold text-white">Risk tolerance</legend>
                    <p className="text-xs text-white/60">Low risk discourages rare box legends; high keeps everything on the table.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(['low', 'medium', 'high'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={`app-focus-ring rounded-full px-4 py-2 text-xs font-semibold capitalize ${
                            risk === r ? 'bg-indigo-500 text-white' : 'border border-white/15 bg-white/5 text-white/80 hover:bg-white/10'
                          }`}
                          onClick={() => setRisk(r)}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <label htmlFor="team-gen" className="text-sm font-bold text-white">
                      Generation preference
                    </label>
                    <select
                      id="team-gen"
                      className="app-focus-ring mt-1 w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm text-white"
                      value={generation === null ? '' : String(generation)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setGeneration(v === '' ? null : Number(v));
                      }}
                    >
                      <option value="">Any (sampled National Dex)</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                        <option key={g} value={g}>
                          Generation {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-white">Locked favorites</p>
                      {lockedIds.length > 0 ? (
                        <button type="button" className="text-xs font-semibold text-indigo-200 hover:underline" onClick={clearLocks}>
                          Clear locks
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-white/60">Up to six species stay fixed; the solver fills around them.</p>
                    {lockedIds.length === 0 ? (
                      <p className="mt-2 text-xs text-white/45">None yet — lock picks from the results grid below.</p>
                    ) : (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {lockedIds.map((id) => (
                          <li key={id}>
                            <button
                              type="button"
                              className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/15"
                              onClick={() => toggleLock(id)}
                            >
                              #{id} ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-white/55">{poolNote}</p>

              {isError ? (
                <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100" role="alert">
                  {error instanceof Error ? error.message : 'Something went wrong loading data.'}
                </p>
              ) : null}

              {isLoading ? (
                <p className="mt-6 text-center text-sm text-white/70">Loading species pool and type chart…</p>
              ) : pool.length < 6 ? (
                <p className="mt-6 text-center text-sm text-amber-100/90" role="status">
                  Not enough Pokémon in the current pool to build six. Try another generation or widen filters.
                </p>
              ) : result ? (
                <div className="mt-8 space-y-8">
                  <section>
                    <h3 className="text-lg font-bold text-white [font-family:var(--font-display)]">Recommended six</h3>
                    <ul className="mt-4 space-y-4">
                      {result.team.map((m, idx) => {
                        const explain = result.picks[idx];
                        return (
                          <li key={m.id} className="rounded-2xl border border-white/10 bg-black/25 p-4 transition-colors">
                            <div className="flex flex-wrap items-start gap-4">
                              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                                {m.image ? (
                                  <img src={m.image} alt="" className="h-full w-full object-contain" width={80} height={80} crossOrigin="anonymous" />
                                ) : m.sprite ? (
                                  <img src={m.sprite} alt="" className="h-full w-full object-contain" width={80} height={80} crossOrigin="anonymous" />
                                ) : (
                                  <span className="text-xs text-white/40">No art</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-base font-bold text-white">{formatPokemonLabel(m.name)}</h4>
                                  <span className="text-xs text-white/45">#{m.id}</span>
                                  {favoriteSet.has(m.id) ? (
                                    <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-100">
                                      Favorite
                                    </span>
                                  ) : null}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {m.types.map((t) => (
                                    <TypeBadge key={t} type={t} />
                                  ))}
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-white/78">{explain?.summary}</p>
                                {explain?.breakdown?.length ? (
                                  <details className="mt-2 text-xs text-white/70">
                                    <summary className="cursor-pointer font-semibold text-indigo-200/90">Scoring lines</summary>
                                    <ul className="mt-2 space-y-2">
                                      {explain.breakdown.map((line) => (
                                        <li key={line.label}>
                                          <span className="font-semibold text-white/85">{line.label}</span>
                                          <span className="text-white/50"> ({line.points >= 0 ? '+' : ''}
                                          {line.points})</span>
                                          <div className="text-white/65">{line.detail}</div>
                                        </li>
                                      ))}
                                    </ul>
                                  </details>
                                ) : null}
                              </div>
                              <button
                                type="button"
                                className="app-focus-ring shrink-0 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
                                onClick={() => toggleLock(m.id)}
                                aria-pressed={lockedIds.includes(m.id)}
                              >
                                {lockedIds.includes(m.id) ? 'Unlock' : 'Lock pick'}
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>

                  <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <h3 className="text-base font-bold text-white">Team readout</h3>
                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wide text-white/50">STAB mono coverage</dt>
                        <dd className="font-semibold text-white">{(result.metrics.stabMonoCoverage * 100).toFixed(0)}%</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wide text-white/50">Worst shared weakness</dt>
                        <dd className="font-semibold text-white">{result.metrics.maxSharedWeaknessCount} Pokémon</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wide text-white/50">Average BST / Speed</dt>
                        <dd className="font-semibold text-white">
                          {result.metrics.averageBst.toFixed(0)} / {result.metrics.averageSpeed.toFixed(0)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wide text-white/50">Typing diversity</dt>
                        <dd className="font-semibold text-white">{(result.metrics.typingDiversity * 100).toFixed(0)}%</dd>
                      </div>
                    </dl>
                    <div className="mt-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-white/50">Roles (heuristic)</p>
                      <p className="mt-1 text-sm text-white/80">
                        Physical {result.metrics.roleCounts.physical}, Special {result.metrics.roleCounts.special}, Mixed{' '}
                        {result.metrics.roleCounts.mixed}, Wall {result.metrics.roleCounts.wall}, Scout {result.metrics.roleCounts.scout}
                      </p>
                    </div>
                    {result.metrics.worstOffensiveThreats.length > 0 ? (
                      <div className="mt-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-white/50">Threat lines (≥2×)</p>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {result.metrics.worstOffensiveThreats.slice(0, 6).map((row) => (
                            <li key={row.attackType} className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/85">
                              <TypeBadge type={row.attackType} />
                              <span className="text-white/55">hits {row.count}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </section>

                  {result.gaps.length > 0 ? (
                    <section>
                      <h3 className="text-base font-bold text-white">Gaps</h3>
                      <ul className="mt-3 space-y-2">
                        {result.gaps.map((g) => (
                          <li
                            key={g.title}
                            className={`rounded-xl border px-3 py-2 text-sm ${
                              g.severity === 'warn' ? 'border-amber-400/30 bg-amber-400/10 text-amber-50' : 'border-white/10 bg-black/25 text-white/80'
                            }`}
                          >
                            <p className="font-semibold text-white">{g.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-white/75">{g.detail}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {result.swaps.length > 0 ? (
                    <section>
                      <h3 className="text-base font-bold text-white">Suggested swaps</h3>
                      <p className="mt-1 text-xs text-white/60">Higher score means a larger lift on the same transparent objective.</p>
                      <ul className="mt-3 space-y-2">
                        {result.swaps
                          .map((s) => {
                            const oldM = result.team.find((m) => m.id === s.replaceId);
                            const newM = pool.find((m) => m.id === s.withId);
                            if (!oldM || !newM) return null;
                            return (
                              <li
                                key={`${s.slotIndex}-${s.withId}`}
                                className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white/85"
                              >
                                <p className="font-semibold text-white">
                                  Slot {s.slotIndex + 1}: {formatPokemonLabel(oldM.name)} → {formatPokemonLabel(newM.name)}
                                  <span className="ml-2 text-xs text-emerald-200/90">+{s.scoreDelta.toFixed(1)} pts</span>
                                </p>
                                <p className="mt-1 text-xs text-white/70">{s.reason}</p>
                              </li>
                            );
                          })
                          .filter(Boolean)}
                      </ul>
                    </section>
                  ) : null}

                  <section className="space-y-3">
                    <h3 className="text-base font-bold text-white">Shareable card</h3>
                    <div
                      ref={exportRef}
                      data-team-export="true"
                      className="overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-[#0c1224] via-[#0a0e18] to-[#111827] p-6"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200/80">PokeSlider · Team Builder</p>
                      <p className="mt-1 text-xs text-white/55">
                        {GOALS.find((g) => g.id === goal)?.label ?? goal} · {risk} risk ·{' '}
                        {generation === null ? 'Any gen sample' : `Gen ${generation}`}
                      </p>
                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {result.team.map((m) => (
                          <div key={m.id} className="rounded-2xl border border-white/10 bg-black/30 p-2 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-black/40">
                              {m.image ? (
                                <img src={m.image} alt="" className="h-full w-full object-contain" width={64} height={64} crossOrigin="anonymous" />
                              ) : null}
                            </div>
                            <p className="mt-2 truncate text-xs font-semibold text-white">{formatPokemonLabel(m.name)}</p>
                            <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                              {m.types.map((t) => (
                                <TypeBadge key={t} type={t} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-4 text-[10px] text-white/45">Built with local rules · {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={exportBusy}
                        className="app-focus-ring rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
                        onClick={() => {
                          void handleExportPng();
                        }}
                      >
                        {exportBusy ? 'Rendering…' : 'Download PNG card'}
                      </button>
                      {exportMsg ? <span className="text-xs text-white/70">{exportMsg}</span> : null}
                    </div>
                  </section>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
