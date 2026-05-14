import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import { triggerEvolutionSoundPulse } from '../../audio/evolutionSoundPulse';
import { TypeBadge } from '../../components/pokemon/TypeBadge';
import { AsyncFeedback } from '../../components/ui/AsyncFeedback';
import { InlineRowSkeleton } from '../../components/ui/PanelSkeletons';
import { dialogSpringTransition } from '../../motion/motionPrefs';
import type { EvolutionTimelineStage } from '../../types/pokemon';

const STAT_CAP = 255;

function displayName(slug: string): string {
  return slug.replaceAll('-', ' ');
}

interface PokemonEvolutionTimelineProps {
  stages: EvolutionTimelineStage[] | undefined;
  viewingPokemonId: number;
  reduced: boolean;
  isExtrasPending: boolean;
  isExtrasError: boolean;
  extrasErrorMessage: string;
  onOpenPokemon: (id: number) => void;
}

export function PokemonEvolutionTimeline({
  stages,
  viewingPokemonId,
  reduced,
  isExtrasPending,
  isExtrasError,
  extrasErrorMessage,
  onOpenPokemon,
}: PokemonEvolutionTimelineProps) {
  const stripRef = useRef<HTMLOListElement>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [compareIndex, setCompareIndex] = useState<number | null>(null);

  const list = useMemo(() => stages ?? [], [stages]);

  const evolutionSoundMountRef = useRef(false);
  useEffect(() => {
    if (!list.length || reduced) return;
    if (!evolutionSoundMountRef.current) {
      evolutionSoundMountRef.current = true;
      return;
    }
    triggerEvolutionSoundPulse();
  }, [focusIndex, list.length, reduced]);

  const defaultCompare = useMemo(() => {
    if (list.length < 2) return null;
    const at = list.findIndex((s) => s.id === viewingPokemonId);
    const anchor = at >= 0 ? at : focusIndex;
    if (anchor > 0) return anchor - 1;
    return Math.min(1, list.length - 1);
  }, [list, viewingPokemonId, focusIndex]);

  useEffect(() => {
    if (!list.length) return;
    const idx = list.findIndex((s) => s.id === viewingPokemonId);
    setFocusIndex(idx >= 0 ? idx : 0);
  }, [viewingPokemonId, list]);

  useEffect(() => {
    if (list.length < 2) {
      setCompareIndex(null);
      return;
    }
    setCompareIndex((prev) => {
      if (prev != null && prev >= 0 && prev < list.length && prev !== focusIndex) return prev;
      const d = defaultCompare;
      if (d == null || d === focusIndex) return null;
      return d;
    });
  }, [list.length, focusIndex, defaultCompare, list]);

  const focus = list[focusIndex];
  const compare =
    compareIndex != null && compareIndex >= 0 && compareIndex < list.length ? list[compareIndex] : null;

  const goStage = useCallback(
    (next: number) => {
      if (!list.length) return;
      const clamped = Math.max(0, Math.min(list.length - 1, next));
      setFocusIndex(clamped);
      const row = list[clamped];
      if (row) onOpenPokemon(row.id);
    },
    [list, onOpenPokemon],
  );

  const onKeyNav = useCallback(
    (e: KeyboardEvent) => {
      if (!list.length) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goStage(focusIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goStage(focusIndex - 1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        goStage(focusIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        goStage(focusIndex - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goStage(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goStage(list.length - 1);
      }
    },
    [list.length, focusIndex, goStage],
  );

  useEffect(() => {
    if (!focus || !stripRef.current) return;
    const node = stripRef.current.querySelector<HTMLElement>(`[data-stage-index="${focusIndex}"]`);
    node?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  }, [focusIndex, focus, reduced]);

  if (isExtrasPending) {
    return (
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-center">
        <InlineRowSkeleton className="h-36 w-28" />
        <InlineRowSkeleton className="h-36 w-28" />
        <InlineRowSkeleton className="h-36 w-28" />
      </div>
    );
  }

  if (isExtrasError) {
    return (
      <AsyncFeedback
        title="Evolution explorer unavailable"
        description={extrasErrorMessage || 'Could not load evolution data.'}
      />
    );
  }

  if (!list.length) {
    return <p className="text-center text-white/70">Evolution data not available.</p>;
  }

  const transition = dialogSpringTransition(reduced);

  return (
    <div
      className="space-y-8 outline-none"
      tabIndex={0}
      role="region"
      aria-label="Evolution timeline explorer"
      onKeyDown={onKeyNav}
    >
      <div className="relative overflow-hidden rounded-[var(--radius-3xl)] border border-white/14 bg-gradient-to-br from-white/[0.09] via-white/[0.05] to-violet-500/[0.07] p-1 shadow-[var(--shadow-md)] backdrop-blur-md">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(167,139,250,0.35), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(56,189,248,0.12), transparent 45%)',
          }}
          aria-hidden
        />
        <div className="relative px-3 pb-4 pt-5 md:px-6 md:pb-6 md:pt-7">
          <div className="mb-4 flex flex-col gap-2 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <div>
              <p className="text-[0.65rem] font-black uppercase tracking-[0.28em] text-violet-200/90">
                Evolution timeline
              </p>
              <h4 className="mt-1 text-xl font-black text-white [font-family:var(--font-display)] md:text-2xl">
                {list.length === 1 ? 'Solo form' : `${list.length}-stage line`}
              </h4>
              <p className="mt-1 max-w-prose text-sm text-white/75">
                Follow the line from base to final form. Focus this region, then use arrow keys (← → or ↑ ↓) to move
                between stages.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
              <button
                type="button"
                className="app-focus-ring min-h-11 rounded-full border border-white/18 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/16 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={focusIndex <= 0}
                onClick={() => goStage(focusIndex - 1)}
              >
                ← Prior stage
              </button>
              <button
                type="button"
                className="app-focus-ring min-h-11 rounded-full border border-white/18 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/16 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={focusIndex >= list.length - 1}
                onClick={() => goStage(focusIndex + 1)}
              >
                Next stage →
              </button>
            </div>
          </div>

          <ol
            ref={stripRef}
            className="flex snap-y snap-mandatory flex-col items-center gap-1 overflow-y-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:snap-x md:flex-row md:justify-center md:gap-3 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden"
            aria-label="Evolution stages"
          >
            {list.map((stage, index) => {
              const active = index === focusIndex;
              const isLast = index === list.length - 1;
              return (
                <li
                  key={stage.id}
                  className="flex snap-center flex-col items-center gap-2 md:flex-row md:items-stretch"
                >
                  <button
                    type="button"
                    data-stage-index={index}
                    aria-current={active ? 'step' : undefined}
                    aria-label={`${displayName(stage.name)}, stage ${index + 1} of ${list.length}`}
                    onClick={() => goStage(index)}
                    className={[
                      'app-focus-ring group relative flex w-[7.25rem] shrink-0 flex-col overflow-hidden rounded-2xl border text-left transition-[transform,border-color,box-shadow] duration-[var(--duration-normal)] [transition-timing-function:var(--ease-out)] md:w-[8.5rem]',
                      active
                        ? 'border-violet-300/55 bg-white/14 shadow-[0_0_0_1px_rgba(167,139,250,0.35),var(--shadow-carousel-active)]'
                        : 'border-white/12 bg-white/[0.07] hover:-translate-y-0.5 hover:border-white/22 hover:bg-white/11',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'absolute left-2 top-2 z-[1] rounded-full px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-wide',
                        active ? 'bg-violet-500/90 text-white' : 'bg-black/35 text-white/85',
                      ].join(' ')}
                    >
                      {index + 1}/{list.length}
                    </span>
                    {stage.image ? (
                      <img
                        src={stage.image}
                        alt=""
                        aria-hidden
                        className="mx-auto mt-8 size-24 object-contain px-2 md:size-28"
                      />
                    ) : (
                      <div className="mx-auto mt-10 size-24 rounded-xl bg-white/5 md:size-28" />
                    )}
                    <div className="border-t border-white/10 bg-black/20 px-2 py-2 text-center">
                      <span className="block truncate text-xs font-black capitalize text-white">
                        {displayName(stage.name)}
                      </span>
                        {index > 0 && stage.evolutionHintLines.length > 0 ? (
                          <span className="mt-1 line-clamp-2 text-[0.65rem] leading-tight text-emerald-200/95">
                            {stage.evolutionHintLines[0]}
                          </span>
                        ) : index > 0 ? (
                          <span className="mt-1 text-[0.65rem] text-white/60">See Pokédex / games</span>
                        ) : (
                          <span className="mt-1 text-[0.65rem] text-white/55">Base</span>
                        )}
                    </div>
                  </button>
                  {!isLast ? (
                    <>
                      <div
                        className="h-5 w-0.5 shrink-0 rounded-full bg-gradient-to-b from-white/25 to-violet-300/40 md:hidden"
                        aria-hidden
                      />
                      <div
                        className="hidden h-0.5 w-6 shrink-0 self-center rounded-full bg-gradient-to-r from-white/25 to-violet-300/40 md:block"
                        aria-hidden
                      />
                    </>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {focus ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <AnimatePresence mode="wait">
            <motion.article
              key={focus.id}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={transition}
              className="relative overflow-hidden rounded-[var(--radius-3xl)] border border-white/14 bg-white/[0.08] p-6 shadow-[var(--shadow-md)] backdrop-blur-md"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-violet-500/15 blur-3xl"
                aria-hidden
              />
              <div className="relative flex flex-col items-center gap-4 text-center md:flex-row md:items-start md:text-left">
                {focus.image ? (
                  <motion.img
                    src={focus.image}
                    alt={focus.name}
                    className="size-40 shrink-0 rounded-2xl border border-white/15 bg-white/10 object-contain p-3 md:size-44"
                  />
                ) : null}
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-violet-200/90">{focus.genus}</p>
                    <h3 className="text-2xl font-black capitalize text-white [font-family:var(--font-display)] md:text-3xl">
                      {displayName(focus.name)}
                    </h3>
                    <p className="text-sm font-semibold text-white/60">#{String(focus.id).padStart(4, '0')}</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                    {focus.types.map((t) => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                  <div className="rounded-2xl border-l-4 border-sky-400/60 bg-sky-500/10 px-4 py-3 text-left">
                    <p className="text-[0.65rem] font-black uppercase tracking-wider text-sky-200/90">Pokédex</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/95">{focus.flavorText}</p>
                  </div>
                  {focus.evolutionHintLines.length > 0 ? (
                    <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-left">
                      <p className="text-[0.65rem] font-black uppercase tracking-wider text-emerald-200/90">
                        How this form appears
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-emerald-50/95">
                        {focus.evolutionHintLines.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.article>
          </AnimatePresence>

          <div className="space-y-4 rounded-[var(--radius-3xl)] border border-white/12 bg-white/[0.06] p-6 backdrop-blur-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h4 className="text-lg font-black text-white [font-family:var(--font-display)]">Stat growth</h4>
                <p className="text-sm text-white/70">Bars use {STAT_CAP} as the visual cap. Deltas compare to your baseline pick.</p>
              </div>
              {list.length > 1 ? (
                <label className="flex min-w-0 flex-col gap-1 text-sm text-white/80">
                  <span className="font-bold text-white/90">Compare baseline</span>
                  <select
                    className="app-focus-ring min-h-11 w-full min-w-[12rem] rounded-xl border border-white/18 bg-black/25 px-3 py-2 font-semibold text-white sm:w-auto"
                    value={compareIndex ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCompareIndex(v === '' ? null : Number(v));
                    }}
                  >
                    <option value="">None (totals only)</option>
                    {list.map((s, i) => (
                      <option key={s.id} value={i} disabled={i === focusIndex}>
                        {displayName(s.name)} (#{s.id})
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>

            <div className="space-y-3">
              {focus.stats.map((row) => {
                const otherVal = compare?.stats.find((s) => s.name === row.name)?.value;
                const delta = otherVal != null ? row.value - otherVal : null;
                const maxForBar = Math.max(
                  STAT_CAP,
                  row.value,
                  otherVal ?? 0,
                );
                const pct = Math.min(100, (row.value / maxForBar) * 100);
                return (
                  <div key={row.name} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="capitalize text-white/85">{row.name}</span>
                      <span className="font-mono text-xs text-white/90">
                        <span className="font-bold text-white">{row.value}</span>
                        {delta != null && delta !== 0 ? (
                          <span className={delta > 0 ? ' text-emerald-300' : ' text-rose-300'}>
                            {' '}
                            ({delta > 0 ? '+' : ''}
                            {delta})
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-black/35">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-400/90 to-sky-400/85"
                        initial={false}
                        animate={{ width: `${pct}%` }}
                        transition={transition}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm">
              <div className="font-bold text-white/90">
                BST{' '}
                <span className="text-lg text-white">
                  {focus.baseStatTotal}
                  {compare && compare.id !== focus.id ? (
                    <span className="text-base font-semibold text-white/75">
                      {' '}
                      <span className="text-white/50">vs</span> {compare.baseStatTotal}
                      <span
                        className={
                          focus.baseStatTotal - compare.baseStatTotal > 0
                            ? ' text-emerald-300'
                            : focus.baseStatTotal - compare.baseStatTotal < 0
                              ? ' text-rose-300'
                              : ' text-white/60'
                        }
                      >
                        {' '}
                        (
                        {focus.baseStatTotal - compare.baseStatTotal > 0 ? '+' : ''}
                        {focus.baseStatTotal - compare.baseStatTotal})
                      </span>
                    </span>
                  ) : null}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpenPokemon(focus.id)}
                className="app-focus-ring rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/16"
              >
                Open full detail
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
