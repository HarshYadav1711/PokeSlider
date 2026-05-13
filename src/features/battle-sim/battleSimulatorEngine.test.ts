import { describe, expect, it } from 'vitest';

import type { PokemonComparisonProfile } from '../../types/pokemon';
import type { TypeMatchupChart } from '../team-builder/typeMatchupChart';

import {
  pickBestMove,
  simulateBattle,
  snapshotFromComparisonProfile,
  statFromRows,
} from './battleSimulatorEngine';
import type { BattleSimulatorAssumptions } from './battleSimulatorTypes';

function profile(overrides: Partial<PokemonComparisonProfile>): PokemonComparisonProfile {
  return {
    id: 1,
    name: 'bulbasaur',
    image: null,
    types: ['grass', 'poison'],
    stats: [
      { name: 'hp', value: 45 },
      { name: 'attack', value: 49 },
      { name: 'defense', value: 49 },
      { name: 'special attack', value: 65 },
      { name: 'special defense', value: 65 },
      { name: 'speed', value: 45 },
    ],
    baseStatTotal: 318,
    heightM: 0.7,
    weightKg: 6.9,
    abilities: [],
    hasPriorEvolution: false,
    ...overrides,
  };
}

/** Tiny deterministic chart for tests (not full PokéAPI accuracy). */
function toyChart(): TypeMatchupChart {
  return {
    moveDamageMultiplier(moveType, defenderTypes) {
      const key = [...defenderTypes].slice().sort().join('|');
      if (key === 'fire') {
        if (moveType === 'water') return 2;
        if (moveType === 'fire') return 0.5;
      }
      if (key === 'grass|poison' || key === 'grass') {
        if (moveType === 'fire') return 2;
        if (moveType === 'flying') return 2;
        if (moveType === 'ice') return 2;
      }
      return 1;
    },
  };
}

describe('battleSimulatorEngine', () => {
  it('reads stats from comparison rows', () => {
    const p = profile({});
    expect(statFromRows(p.stats, 'speed')).toBe(45);
    expect(snapshotFromComparisonProfile(p).specialAttack).toBe(65);
  });

  it('picks STAB super-effective over stronger off-type neutral', () => {
    const chart: TypeMatchupChart = {
      moveDamageMultiplier(moveType, defenderTypes) {
        const def = defenderTypes[0];
        if (def === 'grass') {
          if (moveType === 'fire') return 2; // non-STAB for water attacker
          if (moveType === 'water') return 0.5;
        }
        return 1;
      },
    };
    // Water mon: STAB water 0.5 vs grass = 0.75 score; fire 2x = 2 score — fire wins
    const best = pickBestMove(chart, ['water'], ['grass']);
    expect(best.moveType).toBe('fire');
    expect(best.typeMultiplier).toBe(2);
    expect(best.stab).toBe(false);
  });

  it('breaks ties with lexicographic move type when score and STAB match', () => {
    const chart: TypeMatchupChart = {
      moveDamageMultiplier(moveType, defenderTypes) {
        if (defenderTypes[0] !== 'rock') return 1;
        if (moveType === 'water' || moveType === 'ice') return 2;
        return 1;
      },
    };
    const best = pickBestMove(chart, ['water', 'ice'], ['rock']);
    expect(best.typeMultiplier).toBe(2);
    expect(best.stab).toBe(true);
    expect(best.moveType).toBe('ice');
  });

  it('runs a short deterministic duel with speed + damage ordering', () => {
    const squirtle = profile({
      id: 7,
      name: 'squirtle',
      types: ['water'],
      stats: [
        { name: 'hp', value: 44 },
        { name: 'attack', value: 48 },
        { name: 'defense', value: 65 },
        { name: 'special attack', value: 50 },
        { name: 'special defense', value: 64 },
        { name: 'speed', value: 43 },
      ],
      baseStatTotal: 314,
    });
    const charmander = profile({
      id: 4,
      name: 'charmander',
      types: ['fire'],
      stats: [
        { name: 'hp', value: 39 },
        { name: 'attack', value: 52 },
        { name: 'defense', value: 43 },
        { name: 'special attack', value: 60 },
        { name: 'special defense', value: 50 },
        { name: 'speed', value: 65 },
      ],
      baseStatTotal: 309,
    });
    const assumptions: BattleSimulatorAssumptions = {
      priority: 'balanced',
      neutralBattlefield: true,
    };
    const res = simulateBattle(charmander, squirtle, toyChart(), assumptions);
    expect(res.turns.length).toBeGreaterThan(0);
    expect(res.turns[0]?.attacker).toBe('a'); // charmander faster
    expect(['a', 'b', 'tie']).toContain(res.winner);
    expect(res.reasons.length).toBeGreaterThan(3);
  });
});
