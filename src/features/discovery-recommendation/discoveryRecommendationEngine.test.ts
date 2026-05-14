import { describe, expect, it } from 'vitest';

import type { PokemonSummary } from '../../types/pokemon';
import type { TypeMatchupChart } from '../team-builder/typeMatchupChart';

import { aestheticTypeWeight } from './aestheticTypeAffinity';
import {
  buildDiscoveryRecommendations,
  mulberry32,
  seededShuffle,
} from './discoveryRecommendationEngine';
import { regionKeysToGenerationIds } from './regionToGeneration';

function fakeSummary(partial: Partial<PokemonSummary> & Pick<PokemonSummary, 'id' | 'name'>): PokemonSummary {
  return {
    sprite: null,
    image: null,
    types: ['normal'],
    baseStatTotal: 400,
    baseStats: {
      hp: 70,
      attack: 70,
      defense: 70,
      specialAttack: 70,
      specialDefense: 70,
      speed: 70,
    },
    isLegendary: false,
    isMythical: false,
    isPseudoLegendary: false,
    category: 'regular',
    ...partial,
  };
}

const trivialChart: TypeMatchupChart = {
  moveDamageMultiplier(moveType, defenderTypes) {
    if (defenderTypes.includes('fire') && moveType === 'water') return 2;
    if (defenderTypes.includes('water') && moveType === 'electric') return 2;
    return 1;
  },
};

describe('mulberry32 + seededShuffle', () => {
  it('is deterministic for a fixed seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });

  it('shuffles deterministically', () => {
    const xs = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(seededShuffle(xs, 7)).toEqual(seededShuffle(xs, 7));
    expect(seededShuffle(xs, 7)).not.toEqual(xs);
  });
});

describe('regionKeysToGenerationIds', () => {
  it('maps known regions and ignores any', () => {
    expect(regionKeysToGenerationIds(['kanto', 'any'])).toEqual([1]);
    expect(regionKeysToGenerationIds(['paldea', 'alola'])).toEqual([7, 9]);
  });
  it('returns null when only any', () => {
    expect(regionKeysToGenerationIds(['any'])).toBeNull();
  });
});

describe('aestheticTypeWeight', () => {
  it('returns bounded weights', () => {
    const w = aestheticTypeWeight('cute', 'fairy');
    expect(w).toBeGreaterThan(0.5);
    expect(w).toBeLessThanOrEqual(1);
  });
});

describe('buildDiscoveryRecommendations', () => {
  it('assigns each species to its strongest lane and caps per kind', () => {
    const anchor = fakeSummary({
      id: 4,
      name: 'charmander-line',
      types: ['fire'],
      baseStatTotal: 320,
    });
    const pool: PokemonSummary[] = [
      anchor,
      fakeSummary({
        id: 7,
        name: 'squirtle-like',
        types: ['water'],
        baseStatTotal: 420,
        baseStats: {
          hp: 44,
          attack: 48,
          defense: 65,
          specialAttack: 50,
          specialDefense: 64,
          speed: 43,
        },
      }),
      fakeSummary({
        id: 25,
        name: 'pika',
        types: ['electric'],
        baseStatTotal: 320,
      }),
      fakeSummary({
        id: 500,
        name: 'regular-strong',
        types: ['bug', 'steel'],
        baseStatTotal: 505,
        baseStats: {
          hp: 70,
          attack: 90,
          defense: 90,
          specialAttack: 55,
          specialDefense: 90,
          speed: 95,
        },
      }),
    ];

    const res = buildDiscoveryRecommendations({
      prefs: {
        favoritePokemonIds: [4],
        favoriteTypes: ['fire'],
        favoriteRegionKeys: ['any'],
        playstyle: 'balanced',
        aesthetics: ['sleek'],
      },
      pool,
      anchorSummaries: [anchor],
      chart: trivialChart,
      recentPokemonIds: new Set([25]),
      dexFavoriteIds: new Set(),
      sessionSeed: 99,
    });

    expect(res.picks.length).toBeLessThanOrEqual(20);
    const byKind = new Map<string, number>();
    for (const p of res.picks) {
      byKind.set(p.kind, (byKind.get(p.kind) ?? 0) + 1);
    }
    for (const c of byKind.values()) {
      expect(c).toBeLessThanOrEqual(4);
    }
    expect(res.picks.every((p) => p.pokemonId !== 4)).toBe(true);
    const synergy = res.picks.filter((p) => p.kind === 'synergy');
    expect(synergy.some((p) => p.pokemonId === 7)).toBe(true);
  });
});
