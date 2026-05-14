import { useEffect, useMemo, useState } from 'react';

import { BallCollectibleCard } from '../../components/pokeballs/BallCollectibleCard';
import { CinematicBallPreview } from '../../components/pokeballs/CinematicBallPreview';
import type { PokeBallDefinition } from '../../data/pokeballs';
import { POKEBALLS } from '../../data/pokeballs';
import type { CatchStatusMode } from '../../engine/catchRateFormula';
import { buildBallCatchSnapshot, rankPokeBallsForScenario } from '../../engine/pokeballCatchSnapshot';
import type { BallBonusContext } from '../../engine/pokeballContextualBonus';
import { estimateMaxHpAtLevel } from '../../engine/pokemonHpEstimate';
import type { PokemonSummary } from '../../types/pokemon';

function formatPercent01(p: number): string {
  if (p >= 1) return '100%';
  if (p <= 0) return '0%';
  return `${(p * 100).toFixed(1)}%`;
}

function formatExpected(n: number): string {
  if (!Number.isFinite(n)) return 'many throws';
  if (n >= 50) return `${Math.round(n)}+ throws (avg.)`;
  return `${n.toFixed(1)} throws (avg.)`;
}

interface BallCatchLaboratoryProps {
  ball: PokeBallDefinition;
  practicePool: readonly PokemonSummary[];
  reducedMotion: boolean;
}

export function BallCatchLaboratory({ ball, practicePool, reducedMotion }: BallCatchLaboratoryProps) {
  const [targetId, setTargetId] = useState<number>(() => practicePool[0]?.id ?? 0);
  const [level, setLevel] = useState(28);
  const [hpPercent, setHpPercent] = useState(35);
  const [turns, setTurns] = useState(4);
  const [repeatOn, setRepeatOn] = useState(true);
  const [statusMode, setStatusMode] = useState<CatchStatusMode>('none');
  const [compareId, setCompareId] = useState<string>('ultra-ball');

  useEffect(() => {
    if (practicePool.length === 0) return;
    if (!practicePool.some((p) => p.id === targetId)) {
      setTargetId(practicePool[0]!.id);
    }
  }, [practicePool, targetId]);

  const target = useMemo(
    () => practicePool.find((p) => p.id === targetId) ?? practicePool[0] ?? null,
    [practicePool, targetId],
  );

  const bonusContext: BallBonusContext | null = useMemo(() => {
    if (!target) return null;
    return {
      pokemonTypes: target.types,
      pokemonLevel: level,
      wildTurnsElapsed: turns,
      speciesPreviouslyRegistered: repeatOn,
    };
  }, [target, level, turns, repeatOn]);

  const { maxHp, currentHp } = useMemo(() => {
    if (!target) return { maxHp: 1, currentHp: 1 };
    const max = estimateMaxHpAtLevel(target.baseStats.hp, level);
    const cur = Math.max(1, Math.min(max, Math.round((max * hpPercent) / 100)));
    return { maxHp: max, currentHp: cur };
  }, [target, level, hpPercent]);

  const primarySnapshot = useMemo(() => {
    if (!target || !bonusContext) return null;
    return buildBallCatchSnapshot(ball, {
      maxHp,
      currentHp,
      speciesCatchRate: target.speciesCatchRate,
      statusMode,
      context: bonusContext,
    });
  }, [ball, bonusContext, currentHp, maxHp, statusMode, target]);

  const compareBall = useMemo((): PokeBallDefinition => {
    return POKEBALLS.find((b) => b.id === compareId) ?? POKEBALLS[0]!;
  }, [compareId]);

  const compareSnapshot = useMemo(() => {
    if (!target || !bonusContext) return null;
    return buildBallCatchSnapshot(compareBall, {
      maxHp,
      currentHp,
      speciesCatchRate: target.speciesCatchRate,
      statusMode,
      context: bonusContext,
    });
  }, [compareBall, bonusContext, currentHp, maxHp, statusMode, target]);

  const ranking = useMemo(() => {
    if (!target || !bonusContext) return [];
    return rankPokeBallsForScenario({
      maxHp,
      currentHp,
      speciesCatchRate: target.speciesCatchRate,
      statusMode,
      context: bonusContext,
    }).slice(0, 6);
  }, [bonusContext, currentHp, maxHp, statusMode, target]);

  if (practicePool.length === 0 || !target || !bonusContext || !primarySnapshot || !compareSnapshot) {
    return (
      <p className="rounded-[var(--radius-xl)] border border-white/12 bg-white/8 p-4 text-sm text-white/75">
        Catch Lab unlocks once suggestion data is available. Retry loading or pick another ball.
      </p>
    );
  }

  return (
    <section className="space-y-8" aria-labelledby="ball-catch-lab-heading">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-col items-center gap-4">
          <CinematicBallPreview ball={ball} reducedMotion={reducedMotion} label={`${ball.name} cinematic preview`} />
        </div>
        <div className="min-w-0 flex-[1.4] space-y-5">
          <BallCollectibleCard ball={ball} badge="Featured" />
          <div className="rounded-[var(--radius-2xl)] border border-white/12 bg-white/8 p-5 backdrop-blur-md">
            <h3 id="ball-catch-lab-heading" className="text-lg font-bold text-white [font-family:var(--font-display)]">
              Catch Lab
            </h3>
            <p className="mt-2 text-[var(--text-body-sm)] leading-snug text-white/72">
              Deterministic Gen III–IV style shake estimate — tweak the encounter, watch the math respond. Numbers are
              local approximations for feel, not a competitive RNG oracle.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-white/85">
                Practice target
                <select
                  value={target.id}
                  onChange={(e) => setTargetId(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-white/18 bg-black/30 px-3 py-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
                >
                  {practicePool.slice(0, 12).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · CR {p.speciesCatchRate}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-white/85">
                Compare vs.
                <select
                  value={compareBall.id}
                  onChange={(e) => setCompareId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/18 bg-black/30 px-3 py-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
                >
                  {POKEBALLS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-white/85">
                Wild level ({level})
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="mt-2 w-full accent-indigo-400"
                />
              </label>
              <label className="block text-sm font-semibold text-white/85">
                Current HP% ({hpPercent}% of est. max)
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={hpPercent}
                  onChange={(e) => setHpPercent(Number(e.target.value))}
                  className="mt-2 w-full accent-sky-400"
                />
              </label>
              <label className="block text-sm font-semibold text-white/85">
                Turns elapsed ({turns})
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={turns}
                  onChange={(e) => setTurns(Number(e.target.value))}
                  className="mt-2 w-full accent-emerald-400"
                />
              </label>
              <fieldset className="rounded-xl border border-white/12 bg-black/20 p-3">
                <legend className="text-sm font-semibold text-white/85">Status</legend>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/85">
                  {(
                    [
                      ['none', 'Healthy'],
                      ['sleep_freeze', 'Sleep / freeze'],
                      ['other_status', 'Burn / poison / para'],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value} className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="catch-status"
                        value={value}
                        checked={statusMode === value}
                        onChange={() => setStatusMode(value)}
                        className="accent-indigo-400"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm font-semibold text-white/85">
              <input
                type="checkbox"
                checked={repeatOn}
                onChange={(e) => setRepeatOn(e.target.checked)}
                className="size-4 accent-indigo-400"
              />
              Species already registered (Repeat Ball path)
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[var(--radius-2xl)] border border-indigo-400/25 bg-gradient-to-br from-indigo-500/15 to-slate-900/40 p-5">
          <h4 className="text-sm font-bold uppercase tracking-wide text-indigo-100/90">This ball — snapshot</h4>
          <dl className="mt-4 space-y-2 text-sm text-white/88">
            <div className="flex justify-between gap-4">
              <dt>Est. catch chance</dt>
              <dd className="font-mono font-bold text-white">{formatPercent01(primarySnapshot.catchChance)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Modified catch rate</dt>
              <dd className="font-mono font-bold text-white">{primarySnapshot.modifiedCatchRate}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Avg. throws (geometric)</dt>
              <dd className="font-mono font-bold text-white">{formatExpected(primarySnapshot.expectedBallsApprox)}</dd>
            </div>
          </dl>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-[var(--text-body-sm)] text-white/72">
            {primarySnapshot.explainers.slice(0, 4).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-[var(--radius-2xl)] border border-white/14 bg-white/8 p-5 backdrop-blur-md">
          <h4 className="text-sm font-bold uppercase tracking-wide text-white/80">Visual compare</h4>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
            <div className="text-center">
              <img src={ball.image} alt="" className="mx-auto size-20 object-contain" />
              <p className="mt-2 text-xs font-semibold text-white/80">{ball.name}</p>
              <p className="font-mono text-sm text-white">{formatPercent01(primarySnapshot.catchChance)}</p>
            </div>
            <div className="text-2xl text-white/40" aria-hidden>
              VS
            </div>
            <div className="text-center">
              <img src={compareBall.image} alt="" className="mx-auto size-20 object-contain" />
              <p className="mt-2 text-xs font-semibold text-white/80">{compareBall.name}</p>
              <p className="font-mono text-sm text-white">{formatPercent01(compareSnapshot.catchChance)}</p>
            </div>
          </div>
          <p className="mt-4 text-center text-[var(--text-body-sm)] text-white/65">
            Same HP curve, same status — only the ball changes. Swapping the compare control updates both columns.
          </p>
        </div>
      </div>

      <div className="rounded-[var(--radius-2xl)] border border-white/12 bg-black/25 p-5 backdrop-blur-md">
        <h4 className="text-lg font-bold text-white [font-family:var(--font-display)]">Best balls for this moment</h4>
        <p className="mt-1 text-[var(--text-body-sm)] text-white/70">
          Ranked by estimated catch chance. Master Ball stays honest: best odds, rarest inventory.
        </p>
        <ol className="mt-4 space-y-3">
          {ranking.map((row, idx) => (
            <li
              key={row.ball.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/6 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-sm font-black text-white/50">#{idx + 1}</span>
                <img src={row.ball.image} alt="" className="size-10 shrink-0 object-contain" loading="lazy" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{row.ball.name}</p>
                  <p className="truncate text-xs text-white/60">{row.explainers[0]}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-emerald-200">{formatPercent01(row.catchChance)}</p>
                <p className="text-[10px] uppercase tracking-wide text-white/50">mod {row.modifiedCatchRate}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
