import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useFocusTrap } from '../../a11y/useFocusTrap';
import { TypeBadge } from '../../components/pokemon/TypeBadge';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { dialogSpringTransition, overlayBackdropTransition } from '../../motion/motionPrefs';
import { qk } from '../../query/keys';
import { STALE_POKEMON_DETAIL_MS, STALE_TYPE_MATCHUP_MATRIX_MS } from '../../query/staleTimes';
import { fetchPokemonComparisonProfile } from '../../services/pokeapi/comparisonProfile';
import { fetchTypeResponsesForAllTypes } from '../../services/pokeapi/typeMatchupChart';
import { useBattleSimulatorStore } from '../../store/battleSimulatorStore';
import type { PokemonTypeName } from '../../types/pokemon';
import { buildTypeMatchupChart } from '../team-builder/typeMatchupChart';

import { formatSpeciesName, simulateBattle } from './battleSimulatorEngine';
import type { BattlePriority, BattleSimulatorAssumptions } from './battleSimulatorTypes';

const PLAYBACK_MS = 520;

export function BattleSimulatorModal() {
  const reduced = usePrefersReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const open = useBattleSimulatorStore((s) => s.open);
  const close = useBattleSimulatorStore((s) => s.close);
  const idA = useBattleSimulatorStore((s) => s.idA);
  const idB = useBattleSimulatorStore((s) => s.idB);

  const [priority, setPriority] = useState<BattlePriority>('balanced');
  const [neutralBattlefield, setNeutralBattlefield] = useState(true);
  const [visibleTurns, setVisibleTurns] = useState(0);
  const [playbackSeq, setPlaybackSeq] = useState(0);

  const assumptions: BattleSimulatorAssumptions = useMemo(
    () => ({ priority, neutralBattlefield }),
    [priority, neutralBattlefield],
  );

  const profileA = useQuery({
    queryKey: idA === null ? ['pokeapi', 'pokemon', 'compare-profile', 'battle-idle-a'] : qk.pokemon.comparisonProfile(idA),
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
    queryKey: idB === null ? ['pokeapi', 'pokemon', 'compare-profile', 'battle-idle-b'] : qk.pokemon.comparisonProfile(idB),
    queryFn: async ({ signal }) => {
      const row = await fetchPokemonComparisonProfile(idB!, signal);
      if (!row) throw new Error('Missing Pokémon B');
      return row;
    },
    enabled: open && idB !== null,
    staleTime: STALE_POKEMON_DETAIL_MS,
    gcTime: 1000 * 60 * 60 * 12,
  });

  const chartQuery = useQuery({
    queryKey: qk.teamBuilder.typeMatchup(),
    queryFn: async ({ signal }) => {
      const rows = await fetchTypeResponsesForAllTypes(signal);
      return buildTypeMatchupChart(rows);
    },
    enabled: open,
    staleTime: STALE_TYPE_MATCHUP_MATRIX_MS,
    gcTime: 1000 * 60 * 60 * 24 * 90,
  });

  const battle = useMemo(() => {
    if (!profileA.data || !profileB.data || !chartQuery.data) return null;
    return simulateBattle(profileA.data, profileB.data, chartQuery.data, assumptions);
  }, [profileA.data, profileB.data, chartQuery.data, assumptions]);

  useEffect(() => {
    if (!open || !battle) return undefined;
    if (reduced) {
      setVisibleTurns(battle.turns.length);
      return undefined;
    }
    setVisibleTurns(0);
    const id = window.setInterval(() => {
      setVisibleTurns((n) => Math.min(battle.turns.length, n + 1));
    }, PLAYBACK_MS);
    return () => clearInterval(id);
  }, [open, battle, reduced, playbackSeq]);

  const ready = Boolean(battle && profileA.data && profileB.data);
  const turnsShown = battle ? battle.turns.slice(0, visibleTurns) : [];
  const lastTurn = turnsShown.length === 0 ? null : (turnsShown[turnsShown.length - 1] ?? null);

  const hpA = lastTurn ? lastTurn.hpA : battle?.startHpA ?? 0;
  const hpB = lastTurn ? lastTurn.hpB : battle?.startHpB ?? 0;

  useFocusTrap({
    active: open,
    containerRef: dialogRef,
    initialFocusSelector: '[data-battle-initial-focus]',
  });

  const winnerLabel = useMemo(() => {
    if (!battle || !profileA.data || !profileB.data) return null;
    const a = formatSpeciesName(profileA.data.name);
    const b = formatSpeciesName(profileB.data.name);
    if (battle.winner === 'tie') return 'Modeled outcome: stalemate under the safety cap';
    return battle.winner === 'a' ? `Projected winner: ${a}` : `Projected winner: ${b}`;
  }, [battle, profileA.data, profileB.data]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="battle-sim"
          className="fixed inset-0 z-[1010] flex items-end justify-center bg-[rgb(4_6_12/0.82)] p-3 backdrop-blur-[var(--blur-overlay)] md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayBackdropTransition(reduced)}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            ref={dialogRef}
            initial={reduced ? { opacity: 0 } : { y: 36, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 22, opacity: 0, scale: 0.985 }}
            transition={dialogSpringTransition(reduced)}
            role="dialog"
            aria-modal="true"
            aria-label="Pokémon battle preview"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[94dvh] w-full max-w-4xl overflow-y-auto rounded-t-[var(--radius-3xl)] border border-white/12 bg-[radial-gradient(circle_at_20%_0%,rgb(99_102_241/0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgb(236_72_153/0.12),transparent_42%),rgb(7_9_16/0.96)] shadow-[var(--shadow-lg)] md:max-h-[92dvh] md:rounded-[var(--radius-3xl)]"
          >
            <div className="sticky top-0 z-[1] flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[rgb(6_8_14/0.55)] px-4 py-3 backdrop-blur-[var(--blur-glass)] md:px-6">
              <div>
                <h2
                  tabIndex={-1}
                  data-battle-initial-focus
                  className="text-[var(--text-title-sm)] font-bold tracking-[var(--tracking-tight)] text-white outline-none [font-family:var(--font-display)]"
                >
                  Battle preview
                </h2>
                <p className="mt-1 max-w-xl text-[11px] leading-snug text-white/60">
                  Simplified, deterministic sparring model. It does not model abilities, items, EVs, levels, accuracy,
                  or switch dynamics — only type chart math, base stats, a transparent turn order, and the assumptions
                  you toggle below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => close()}
                className="app-focus-ring flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-pill)] border border-white/18 bg-white/8 text-lg text-white transition-[background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:border-white/26 hover:bg-white/14"
                aria-label="Close battle preview dialog"
              >
                <span aria-hidden>×</span>
              </button>
            </div>

            <div className="space-y-6 p-4 md:p-6">
              {!idA || !idB ? (
                <p className="rounded-2xl border border-white/15 bg-black/30 p-5 text-sm text-white/80">
                  Pick two Pokémon first (for example from My Dex compare slots), then reopen the preview.
                </p>
              ) : null}

              {idA && idB && (profileA.isPending || profileB.isPending || chartQuery.isPending) ? (
                <p className="py-8 text-center text-sm text-white/70">Loading battle data…</p>
              ) : null}

              {idA && idB && (profileA.isError || profileB.isError || chartQuery.isError) ? (
                <div className="space-y-3 rounded-2xl border border-red-400/25 bg-red-500/10 p-5 text-sm text-red-100" role="alert">
                  <p>Could not load everything needed for the preview.</p>
                  <div className="flex flex-wrap gap-2">
                    {profileA.isError ? (
                      <button
                        type="button"
                        className="app-focus-ring rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white"
                        onClick={() => void profileA.refetch()}
                      >
                        Retry Pokémon A
                      </button>
                    ) : null}
                    {profileB.isError ? (
                      <button
                        type="button"
                        className="app-focus-ring rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white"
                        onClick={() => void profileB.refetch()}
                      >
                        Retry Pokémon B
                      </button>
                    ) : null}
                    {chartQuery.isError ? (
                      <button
                        type="button"
                        className="app-focus-ring rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white"
                        onClick={() => void chartQuery.refetch()}
                      >
                        Retry type chart
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {ready && battle && profileA.data && profileB.data ? (
                <>
                  <fieldset className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <legend className="px-1 text-xs font-bold uppercase tracking-wide text-white/70">Assumptions</legend>
                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/55">Stat blend</p>
                        <div className="flex flex-col gap-2">
                          <AssumptionRadio
                            checked={priority === 'speed'}
                            onChange={() => setPriority('speed')}
                            label="Prioritize speed"
                            hint="More Speed in the offensive blend; tempo-first trades."
                            name="battle-priority"
                          />
                          <AssumptionRadio
                            checked={priority === 'bulk'}
                            onChange={() => setPriority('bulk')}
                            label="Prioritize bulk"
                            hint="HP folds into offense/defense blends for longer exchanges."
                            name="battle-priority"
                          />
                          <AssumptionRadio
                            checked={priority === 'balanced'}
                            onChange={() => setPriority('balanced')}
                            label="Balanced"
                            hint="Even physical / special mix."
                            name="battle-priority"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/55">Battlefield</p>
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                          <input
                            type="checkbox"
                            className="app-focus-ring mt-1 size-4 rounded border-white/30 bg-black/40"
                            checked={neutralBattlefield}
                            onChange={(e) => setNeutralBattlefield(e.target.checked)}
                          />
                          <span>
                            <span className="block text-sm font-semibold text-white">Neutral battlefield</span>
                            <span className="mt-1 block text-xs leading-snug text-white/65">
                              Off when you want a slightly faster, scrappier exchange — both sides gain the same small
                              outgoing damage bump (+6%), still deterministic.
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </fieldset>

                  <div className="grid gap-4 md:grid-cols-2">
                    <BattleCard
                      sideLabel="Combatant A"
                      name={formatSpeciesName(profileA.data.name)}
                      image={profileA.data.image}
                      types={profileA.data.types}
                      hp={hpA}
                      hpMax={battle.startHpA}
                      accent="emerald"
                      active={lastTurn?.attacker === 'a'}
                    />
                    <BattleCard
                      sideLabel="Combatant B"
                      name={formatSpeciesName(profileB.data.name)}
                      image={profileB.data.image}
                      types={profileB.data.types}
                      hp={hpB}
                      hpMax={battle.startHpB}
                      accent="sky"
                      active={lastTurn?.attacker === 'b'}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="app-focus-ring rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/14 disabled:opacity-40"
                        disabled={!battle.turns.length}
                        onClick={() => setVisibleTurns(battle.turns.length)}
                      >
                        Show full exchange
                      </button>
                      <button
                        type="button"
                        className="app-focus-ring rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/14 disabled:opacity-40"
                        disabled={!battle.turns.length}
                        onClick={() => setPlaybackSeq((s) => s + 1)}
                      >
                        Reset playback
                      </button>
                    </div>
                    <p className="text-[11px] text-white/55" aria-live="polite">
                      Round-robin turns: faster Pokémon strikes first each round; the slower Pokémon retaliates if it
                      is still standing.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-white/70">Turn log</h3>
                      <span className="text-[11px] text-white/50">
                        Showing {Math.min(visibleTurns, battle.turns.length)} / {battle.turns.length}
                      </span>
                    </div>
                    <div className="space-y-2" role="list" aria-label="Turn-by-turn exchange">
                      <AnimatePresence initial={false}>
                        {turnsShown.map((t, idx) => (
                          <motion.div
                            key={`${idx}-${t.round}-${t.step}-${t.attacker}-${t.damage}-${t.hpA}-${t.hpB}`}
                            role="listitem"
                            layout={!reduced}
                            initial={reduced ? false : { opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: reduced ? 0 : 0.22, ease: 'easeOut' }}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
                          >
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
                              R{t.round} · step {t.step}
                            </span>
                            <p className="mt-1 leading-snug">{t.note}</p>
                            <p className="mt-1 text-[11px] text-white/55">
                              HP — A: {t.hpA} / B: {t.hpB}
                            </p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {visibleTurns >= battle.turns.length ? (
                    <motion.div
                      layout={!reduced}
                      initial={reduced ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-white/12 bg-gradient-to-br from-white/10 via-transparent to-transparent p-5"
                    >
                      <p className="text-lg font-black text-white [font-family:var(--font-display)]">{winnerLabel}</p>
                      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/80">
                        {battle.reasons.map((r) => (
                          <li key={r} className="flex gap-2">
                            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-300/80" aria-hidden />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : null}
                </>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function AssumptionRadio({
  checked,
  onChange,
  label,
  hint,
  name,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  hint: string;
  name: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[rgb(129_140_248/0.9)]">
      <input type="radio" className="app-focus-ring mt-1" name={name} checked={checked} onChange={onChange} />
      <span>
        <span className="block text-sm font-semibold text-white">{label}</span>
        <span className="mt-1 block text-xs leading-snug text-white/65">{hint}</span>
      </span>
    </label>
  );
}

function BattleCard({
  sideLabel,
  name,
  image,
  types,
  hp,
  hpMax,
  accent,
  active,
}: {
  sideLabel: string;
  name: string;
  image: string | null;
  types: readonly PokemonTypeName[];
  hp: number;
  hpMax: number;
  accent: 'emerald' | 'sky';
  active: boolean;
}) {
  const pct = hpMax > 0 ? Math.max(0, Math.min(100, Math.round((hp / hpMax) * 100))) : 0;
  const ring = accent === 'emerald' ? 'border-emerald-400/45 shadow-[0_0_0_1px_rgb(52_211_153/0.35)]' : 'border-sky-400/45 shadow-[0_0_0_1px_rgb(56_189_248/0.35)]';
  const bar = accent === 'emerald' ? 'from-emerald-400/90 to-emerald-300/70' : 'from-sky-400/90 to-sky-300/70';
  return (
    <div
      className={[
        'rounded-2xl border bg-black/30 p-4 transition-[border-color,box-shadow] duration-[var(--duration-fast)]',
        active ? ring : 'border-white/10',
      ].join(' ')}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-white/55">{sideLabel}</p>
      <div className="mt-3 flex items-center gap-3">
        <img
          src={image ?? ''}
          alt=""
          className="size-20 rounded-xl border border-white/12 bg-black/40 object-contain p-1"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-black text-white [font-family:var(--font-display)]">{name}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex items-baseline justify-between gap-2 text-xs text-white/70">
          <span>Modeled HP</span>
          <span className="font-semibold text-white">
            {hp} / {hpMax}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className={['h-full rounded-full bg-gradient-to-r', bar].join(' ')}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          />
        </div>
      </div>
    </div>
  );
}
