import { useMemo, useState } from 'react';

import { BallCollectibleCard } from '../../components/pokeballs/BallCollectibleCard';
import { CinematicBallPreview } from '../../components/pokeballs/CinematicBallPreview';
import { POKEBALLS } from '../../data/pokeballs';
import type { CatchStatusMode } from '../../engine/catchRateFormula';
import { buildBallCatchSnapshot, rankPokeBallsForScenario } from '../../engine/pokeballCatchSnapshot';
import type { BallBonusContext } from '../../engine/pokeballContextualBonus';
import { estimateMaxHpAtLevel } from '../../engine/pokemonHpEstimate';
import type { DetailedPokemon } from '../../types/pokemon';

function formatPercent01(p: number): string {
  if (p >= 1) return '100%';
  if (p <= 0) return '0%';
  return `${(p * 100).toFixed(1)}%`;
}

function hpBaseFromDetail(pokemon: DetailedPokemon): number {
  const row = pokemon.stats.find((s) => s.name === 'hp');
  return row?.value ?? 40;
}

interface PokemonBallFitSectionProps {
  pokemon: DetailedPokemon;
  reducedMotion: boolean;
}

export function PokemonBallFitSection({ pokemon, reducedMotion }: PokemonBallFitSectionProps) {
  const [level, setLevel] = useState(50);
  const [hpPercent, setHpPercent] = useState(40);
  const [turns, setTurns] = useState(6);
  const [repeatOn, setRepeatOn] = useState(true);
  const [statusMode, setStatusMode] = useState<CatchStatusMode>('none');
  const [focusBallId, setFocusBallId] = useState<string>('ultra-ball');

  const maxHp = useMemo(() => estimateMaxHpAtLevel(hpBaseFromDetail(pokemon), level), [pokemon, level]);
  const currentHp = useMemo(
    () => Math.max(1, Math.min(maxHp, Math.round((maxHp * hpPercent) / 100))),
    [maxHp, hpPercent],
  );

  const context: BallBonusContext = useMemo(
    () => ({
      pokemonTypes: pokemon.types,
      pokemonLevel: level,
      wildTurnsElapsed: turns,
      speciesPreviouslyRegistered: repeatOn,
    }),
    [pokemon.types, level, turns, repeatOn],
  );

  const ranking = useMemo(
    () =>
      rankPokeBallsForScenario({
        maxHp,
        currentHp,
        speciesCatchRate: pokemon.speciesCatchRate,
        statusMode,
        context,
      }),
    [context, currentHp, maxHp, pokemon.speciesCatchRate, statusMode],
  );

  const top = ranking[0];
  const focusBall = useMemo(
    () => POKEBALLS.find((b) => b.id === focusBallId) ?? POKEBALLS[2]!,
    [focusBallId],
  );

  const focusSnap = useMemo(
    () =>
      buildBallCatchSnapshot(focusBall, {
        maxHp,
        currentHp,
        speciesCatchRate: pokemon.speciesCatchRate,
        statusMode,
        context,
      }),
    [focusBall, maxHp, currentHp, pokemon.speciesCatchRate, statusMode, context],
  );

  return (
    <section
      className="space-y-6 rounded-[var(--radius-2xl)] border border-white/12 bg-gradient-to-br from-violet-500/12 to-slate-950/55 p-6 backdrop-blur-md"
      aria-labelledby="pokemon-ball-fit-heading"
    >
      <h3 id="pokemon-ball-fit-heading" className="text-xl font-bold text-white [font-family:var(--font-display)]">
        Poké Ball fit
      </h3>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex flex-1 flex-col items-center">
          <CinematicBallPreview ball={focusBall} reducedMotion={reducedMotion} label={`${focusBall.name} preview`} />
          <label className="mt-4 w-full max-w-xs text-sm font-semibold text-white/85">
            Inspect ball
            <select
              value={focusBall.id}
              onChange={(e) => setFocusBallId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/18 bg-black/35 px-3 py-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70"
            >
              {POKEBALLS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="min-w-0 flex-[1.35] space-y-4">
          <div>
            <p className="text-[var(--text-body-sm)] leading-snug text-white/75">
              Type-aware bonuses (Net, Dive, …), level-scaled Nest, turn-based Timer, and Repeat pathing — all computed
              locally from your sliders plus PokéAPI catch rate ({pokemon.speciesCatchRate}/255).
            </p>
          </div>

          <BallCollectibleCard ball={focusBall} />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-white/85">
              Assumed wild level ({level})
              <input
                type="range"
                min={1}
                max={100}
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="mt-2 w-full accent-violet-400"
              />
            </label>
            <label className="text-sm font-semibold text-white/85">
              Current HP% ({hpPercent}%)
              <input
                type="range"
                min={1}
                max={100}
                value={hpPercent}
                onChange={(e) => setHpPercent(Number(e.target.value))}
                className="mt-2 w-full accent-sky-400"
              />
            </label>
            <label className="text-sm font-semibold text-white/85">
              Turns ({turns})
              <input
                type="range"
                min={0}
                max={40}
                value={turns}
                onChange={(e) => setTurns(Number(e.target.value))}
                className="mt-2 w-full accent-emerald-400"
              />
            </label>
            <fieldset className="rounded-xl border border-white/12 bg-black/25 p-3">
              <legend className="text-sm font-semibold text-white/85">Status</legend>
              <div className="mt-2 flex flex-col gap-2 text-sm text-white/85">
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
                      name="pokemon-ball-fit-status"
                      value={value}
                      checked={statusMode === value}
                      onChange={() => setStatusMode(value)}
                      className="accent-violet-400"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-white/85">
            <input
              type="checkbox"
              checked={repeatOn}
              onChange={(e) => setRepeatOn(e.target.checked)}
              className="size-4 accent-violet-400"
            />
            Treat species as already registered (Repeat Ball)
          </label>

          <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-100/90">Top recommendation</p>
            {top ? (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <img src={top.ball.image} alt="" className="size-12 object-contain" />
                <div>
                  <p className="font-bold text-white">{top.ball.name}</p>
                  <p className="text-sm text-emerald-100/90">
                    {formatPercent01(top.catchChance)} chance · mod {top.modifiedCatchRate}
                  </p>
                  <p className="mt-1 text-xs text-white/70">{top.explainers[0]}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <h4 className="text-sm font-bold text-white/90">Full ranking</h4>
            <ol className="mt-3 space-y-2">
              {ranking.map((row, idx) => (
                <li
                  key={row.ball.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/6 px-3 py-2 text-sm"
                >
                  <span className="font-mono text-white/45">#{idx + 1}</span>
                  <span className="flex-1 truncate font-medium text-white">{row.ball.name}</span>
                  <span className="font-mono text-emerald-200">{formatPercent01(row.catchChance)}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-white/60">Why {focusSnap.ball.name}?</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--text-body-sm)] text-white/72">
              {focusSnap.explainers.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
