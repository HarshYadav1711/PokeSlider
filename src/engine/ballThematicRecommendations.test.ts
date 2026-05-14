import { describe, expect, it } from 'vitest';

import type { PokemonSummary } from '../types/pokemon';

import { buildBallLensRecommendations } from './ballThematicRecommendations';

function minimalSummary(partial: Partial<PokemonSummary> & Pick<PokemonSummary, 'id'>): PokemonSummary {
  const per = 70;
  return {
    id: partial.id,
    name: partial.name ?? 'test-mon',
    speciesId: partial.speciesId ?? partial.id,
    generation: partial.generation ?? 1,
    habitatSlug: partial.habitatSlug ?? 'unknown',
    genus: partial.genus ?? null,
    dexOrder: partial.dexOrder ?? partial.id,
    isBaby: partial.isBaby ?? false,
    isDefaultVariety: partial.isDefaultVariety ?? true,
    sprite: null,
    image: null,
    types: partial.types ?? ['water'],
    baseStatTotal: partial.baseStatTotal ?? 420,
    baseStats: partial.baseStats ?? {
      hp: per,
      attack: per,
      defense: per,
      specialAttack: per,
      specialDefense: per,
      speed: per,
    },
    speciesCatchRate: partial.speciesCatchRate ?? 100,
    isLegendary: partial.isLegendary ?? false,
    isMythical: partial.isMythical ?? false,
    isPseudoLegendary: partial.isPseudoLegendary ?? false,
    category: partial.category ?? 'regular',
  };
}

describe('buildBallLensRecommendations', () => {
  it('prefers Dive Ball for pure water + sea habitat', () => {
    const p = minimalSummary({
      id: 7,
      types: ['water'],
      habitatSlug: 'sea',
      speciesCatchRate: 120,
    });
    const thematic = buildBallLensRecommendations(p).find((x) => x.lens === 'thematic');
    expect(thematic?.ball.id).toBe('dive-ball');
  });

  it('is deterministic for the same input', () => {
    const p = minimalSummary({ id: 25, types: ['electric'], speciesCatchRate: 190 });
    const a = buildBallLensRecommendations(p).map((x) => x.ball.id).join('|');
    const b = buildBallLensRecommendations(p).map((x) => x.ball.id).join('|');
    expect(a).toBe(b);
  });
});
