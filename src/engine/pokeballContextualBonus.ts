import type { PokeBallDefinition, PokeBallMechanic } from '../data/pokeballs';

import type { PokemonTypeName } from '../types/pokemon';

export interface BallBonusContext {
  readonly pokemonTypes: readonly PokemonTypeName[];
  readonly pokemonLevel: number;
  /** Turns elapsed since battle start (0 = first turn). */
  readonly wildTurnsElapsed: number;
  readonly speciesPreviouslyRegistered: boolean;
}

export interface BallBonusResult {
  readonly multiplier: number;
  /** Explainability lines for UI — deterministic from inputs */
  readonly reasons: readonly string[];
}

function nestMultiplier(level: number): number {
  const lv = Math.max(1, Math.min(100, Math.floor(level)));
  // Classic Nest Ball curve: stronger on very low-level wild Pokémon.
  const raw = (41 - lv) / 10;
  return Math.max(1, Math.min(4, raw));
}

function timerMultiplier(turns: number): number {
  const t = Math.max(0, Math.min(120, Math.floor(turns)));
  return Math.min(4, (10 + t) / 10);
}

function resolveMechanic(mechanic: PokeBallMechanic, ctx: BallBonusContext): BallBonusResult {
  switch (mechanic.kind) {
    case 'master':
      return { multiplier: 1, reasons: ['Master Ball ignores math — capture is guaranteed.'] };
    case 'static':
      return {
        multiplier: mechanic.multiplier,
        reasons:
          mechanic.multiplier === 1
            ? ['Standard ball modifier (1×).']
            : [`Standard ball modifier (${mechanic.multiplier}×).`],
      };
    case 'net': {
      const hit = ctx.pokemonTypes.some((t) => t === 'bug' || t === 'water');
      if (hit) {
        return {
          multiplier: 3,
          reasons: ['Net Ball grants 3× when the species is Bug-type and/or Water-type.'],
        };
      }
      return {
        multiplier: 1,
        reasons: ['Net Ball is 1× here — neither Bug nor Water typing is present.'],
      };
    }
    case 'dive': {
      const hit = ctx.pokemonTypes.includes('water');
      if (hit) {
        return {
          multiplier: 3.5,
          reasons: ['Dive Ball grants 3.5× on Water-type species (underwater encounter flavor).'],
        };
      }
      return {
        multiplier: 1,
        reasons: ['Dive Ball is 1× without Water typing — save it for the surf line.'],
      };
    }
    case 'nest': {
      const m = nestMultiplier(ctx.pokemonLevel);
      return {
        multiplier: m,
        reasons: [
          `Nest Ball scales with wild level (${ctx.pokemonLevel}). Current modifier ≈${m.toFixed(2)}× (low level = stronger).`,
        ],
      };
    }
    case 'repeat': {
      if (ctx.speciesPreviouslyRegistered) {
        return {
          multiplier: mechanic.whenRegistered,
          reasons: ['Repeat Ball is 3× when the species is already registered in your Pokédex.'],
        };
      }
      return {
        multiplier: 1,
        reasons: ['Repeat Ball is 1× until that species is registered — fill the Dex entry first.'],
      };
    }
    case 'timer': {
      const m = timerMultiplier(ctx.wildTurnsElapsed);
      return {
        multiplier: m,
        reasons: [
          `Timer Ball ramps with turns in battle (${ctx.wildTurnsElapsed}). Current modifier ≈${m.toFixed(2)}× (caps near 4×).`,
        ],
      };
    }
  }
}

export function resolveContextualBallBonus(ball: PokeBallDefinition, ctx: BallBonusContext): BallBonusResult {
  return resolveMechanic(ball.mechanic, ctx);
}
