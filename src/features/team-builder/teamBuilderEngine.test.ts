import { describe, expect, it } from 'vitest';

import type { PokemonSummary } from '../../types/pokemon';

import { buildTeamRecommendation, filterPoolForBuilder } from './teamBuilderEngine';
import type { TeamBuilderInput } from './teamBuilderTypes';
import type { TypeMatchupChart } from './typeMatchupChart';

function fakeSummary(
  partial: Partial<PokemonSummary> & Pick<PokemonSummary, 'id' | 'name' | 'types'>,
): PokemonSummary {
  const bst = partial.baseStatTotal ?? 420;
  const per = Math.max(1, Math.floor(bst / 6));
  return {
    id: partial.id,
    name: partial.name,
    speciesId: partial.speciesId ?? partial.id,
    generation: partial.generation ?? 9,
    habitatSlug: partial.habitatSlug ?? 'unknown',
    genus: partial.genus ?? null,
    dexOrder: partial.dexOrder ?? partial.id,
    isBaby: partial.isBaby ?? false,
    isDefaultVariety: partial.isDefaultVariety ?? true,
    sprite: null,
    image: null,
    types: partial.types,
    baseStatTotal: bst,
    baseStats: partial.baseStats ?? {
      hp: per,
      attack: per,
      defense: per,
      specialAttack: per,
      specialDefense: per,
      speed: per,
    },
    isLegendary: partial.isLegendary ?? false,
    isMythical: partial.isMythical ?? false,
    isPseudoLegendary: partial.isPseudoLegendary ?? false,
    category: partial.category ?? 'regular',
    speciesCatchRate: partial.speciesCatchRate ?? 100,
  };
}

/** Trivial chart: every matchup is neutral except Fire→Grass (2×). */
const stubChart: TypeMatchupChart = {
  moveDamageMultiplier(moveType, defenderTypes) {
    if (defenderTypes.includes('grass') && moveType === 'fire') {
      let m = 1;
      for (const d of defenderTypes) {
        if (d === 'grass') m *= 2;
      }
      return m;
    }
    return 1;
  },
};

describe('filterPoolForBuilder', () => {
  it('removes legendary species when risk is low', () => {
    const pool = [
      fakeSummary({ id: 1, name: 'a', types: ['normal'], isLegendary: true }),
      fakeSummary({ id: 2, name: 'b', types: ['water'] }),
    ];
    const out = filterPoolForBuilder(pool, { goal: 'balance', risk: 'low' });
    expect(out.map((p) => p.id)).toEqual([2]);
  });

  it('keeps only regular category for nuzlocke goal', () => {
    const pool = [
      fakeSummary({ id: 1, name: 'pseudo', types: ['dragon'], category: 'pseudoLegendary', isPseudoLegendary: true }),
      fakeSummary({ id: 2, name: 'norm', types: ['bug'], category: 'regular' }),
    ];
    const out = filterPoolForBuilder(pool, { goal: 'nuzlocke', risk: 'high' });
    expect(out.map((p) => p.id)).toEqual([2]);
  });
});

describe('buildTeamRecommendation', () => {
  it('returns six Pokémon and respects locks', () => {
    const pool = Array.from({ length: 24 }, (_, i) =>
      fakeSummary({
        id: i + 1,
        name: `species-${i + 1}`,
        types: i % 3 === 0 ? ['fire', 'flying'] : i % 3 === 1 ? ['water'] : ['grass'],
        baseStatTotal: 400 + i,
        baseStats: {
          hp: 70,
          attack: 80 + i,
          defense: 70,
          specialAttack: 75,
          specialDefense: 70,
          speed: 80,
        },
      }),
    );

    const input: TeamBuilderInput = {
      goal: 'balance',
      primaryType: null,
      risk: 'high',
      generation: 9,
      favoriteIds: new Set<number>(),
      lockedIds: [3, 1],
    };

    const res = buildTeamRecommendation({
      pool,
      chart: stubChart,
      input,
      poolNote: 'test pool',
    });

    expect(res.team).toHaveLength(6);
    expect(res.team[0]!.id).toBe(1);
    expect(res.team[1]!.id).toBe(3);
    const ids = new Set(res.team.map((p) => p.id));
    expect(ids.size).toBe(6);
  });
});
