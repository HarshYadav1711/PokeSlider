import type { PokeBallDefinition } from '../data/pokeballs';
import { POKEBALLS } from '../data/pokeballs';

import {
  catchProbabilityFourShakes,
  computeModifiedCatchRate,
  expectedBallsToCatch,
  type CatchStatusMode,
} from './catchRateFormula';
import type { BallBonusContext } from './pokeballContextualBonus';
import { resolveContextualBallBonus } from './pokeballContextualBonus';

export interface BallCatchSnapshot {
  readonly ball: PokeBallDefinition;
  readonly modifiedCatchRate: number;
  readonly catchChance: number;
  readonly expectedBallsApprox: number;
  readonly explainers: readonly string[];
}

export function buildBallCatchSnapshot(
  ball: PokeBallDefinition,
  params: {
    readonly maxHp: number;
    readonly currentHp: number;
    readonly speciesCatchRate: number;
    readonly statusMode: CatchStatusMode;
    readonly context: BallBonusContext;
  },
): BallCatchSnapshot {
  if (ball.mechanic.kind === 'master') {
    return {
      ball,
      modifiedCatchRate: 255,
      catchChance: 1,
      expectedBallsApprox: 1,
      explainers: [
        'Master Ball bypasses catch checks — treat it as a once-in-a-campaign artifact.',
        'Silph Co. prototype lore: zero shake drama, maximum narrative weight.',
      ],
    };
  }

  const bonus = resolveContextualBallBonus(ball, params.context);
  const modifiedCatchRate = computeModifiedCatchRate({
    maxHp: params.maxHp,
    currentHp: params.currentHp,
    speciesCatchRate: params.speciesCatchRate,
    ballMultiplier: bonus.multiplier,
    statusMode: params.statusMode,
  });

  const catchChance = catchProbabilityFourShakes(modifiedCatchRate, false);
  const expected = expectedBallsToCatch(catchChance);

  const explainers = [
    ...bonus.reasons,
    `Species catch rate (PokéAPI): ${params.speciesCatchRate}/255.`,
    `HP factor uses ${params.currentHp}/${params.maxHp} HP — lower current HP increases the modifier.`,
    `Status mode: ${params.statusMode === 'none' ? 'healthy (1× status term)' : params.statusMode === 'sleep_freeze' ? 'sleep/freeze-style (2.5× status term)' : 'burn/poison/paralysis-style (1.5× status term)'}.`,
  ];

  return {
    ball,
    modifiedCatchRate,
    catchChance,
    expectedBallsApprox: expected,
    explainers,
  };
}

export function rankPokeBallsForScenario(params: {
  readonly maxHp: number;
  readonly currentHp: number;
  readonly speciesCatchRate: number;
  readonly statusMode: CatchStatusMode;
  readonly context: BallBonusContext;
}): BallCatchSnapshot[] {
  const rows = POKEBALLS.map((ball) => buildBallCatchSnapshot(ball, params));
  return [...rows].sort((a, b) => {
    if (b.catchChance !== a.catchChance) return b.catchChance - a.catchChance;
    return b.modifiedCatchRate - a.modifiedCatchRate;
  });
}
