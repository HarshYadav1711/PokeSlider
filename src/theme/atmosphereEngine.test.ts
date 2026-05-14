import { describe, expect, it } from 'vitest';

import { buildAtmosphereDomSnapshot } from './atmosphereEngine';
import { applyAtmosphereDomTheme } from './atmosphereThemeDom';
import { evolutionIndexToFacet } from './evolutionStageFacet';
import { generationToRegionId } from './generationToRegion';
import { timeOfDayFromLocalDate } from './timeOfDay';

describe('generationToRegionId', () => {
  it('maps generations to regions', () => {
    expect(generationToRegionId(1)).toBe('kanto');
    expect(generationToRegionId(9)).toBe('paldea');
    expect(generationToRegionId(0)).toBe('unknown');
    expect(generationToRegionId(99)).toBe('unknown');
  });
});

describe('evolutionIndexToFacet', () => {
  it('classifies chain position', () => {
    expect(evolutionIndexToFacet(0, 1)).toBe('solo');
    expect(evolutionIndexToFacet(0, 3)).toBe('base');
    expect(evolutionIndexToFacet(1, 3)).toBe('mid');
    expect(evolutionIndexToFacet(2, 3)).toBe('apex');
  });
});

describe('timeOfDayFromLocalDate', () => {
  it('returns buckets', () => {
    expect(timeOfDayFromLocalDate(new Date('2026-05-15T06:00:00'))).toBe('dawn');
    expect(timeOfDayFromLocalDate(new Date('2026-05-15T12:00:00'))).toBe('day');
    expect(timeOfDayFromLocalDate(new Date('2026-05-15T18:30:00'))).toBe('dusk');
    expect(timeOfDayFromLocalDate(new Date('2026-05-15T23:00:00'))).toBe('night');
  });
});

describe('buildAtmosphereDomSnapshot', () => {
  it('applies global facets without Pokémon context', () => {
    const snap = buildAtmosphereDomSnapshot({
      pokemon: null,
      compareModalOpen: true,
      timeOfDayOverride: 'night',
      now: new Date('2026-05-15T12:00:00'),
    });
    expect(snap.primaryType).toBeNull();
    expect(snap.region).toBe('unknown');
    expect(snap.battle).toBe('duel');
    expect(snap.timeOfDay).toBe('night');
  });

  it('merges Pokémon slice with compare state', () => {
    const snap = buildAtmosphereDomSnapshot({
      pokemon: {
        primaryType: 'fire',
        secondaryType: 'flying',
        pokemonGeneration: 3,
        evolutionChain: { index: 2, total: 3 },
      },
      compareModalOpen: false,
      timeOfDayOverride: null,
      now: new Date('2026-05-15T12:00:00'),
    });
    expect(snap.primaryType).toBe('fire');
    expect(snap.secondaryType).toBe('flying');
    expect(snap.region).toBe('hoenn');
    expect(snap.evolution).toBe('apex');
    expect(snap.battle).toBe('explore');
    expect(snap.timeOfDay).toBe('day');
  });
});

describe('applyAtmosphereDomTheme', () => {
  it('sets and clears data attributes', () => {
    const el = document.createElement('div');
    applyAtmosphereDomTheme(el, {
      primaryType: 'water',
      secondaryType: null,
      region: 'sinnoh',
      battle: 'duel',
      evolution: 'base',
      timeOfDay: 'dusk',
    });
    expect(el.getAttribute('data-atmosphere')).toBe('water');
    expect(el.hasAttribute('data-atmosphere-secondary')).toBe(false);
    expect(el.getAttribute('data-atmo-region')).toBe('sinnoh');
    expect(el.getAttribute('data-atmo-battle')).toBe('duel');
    expect(el.getAttribute('data-atmo-evo')).toBe('base');
    expect(el.getAttribute('data-atmo-tod')).toBe('dusk');

    applyAtmosphereDomTheme(el, null);
    expect(el.hasAttribute('data-atmosphere')).toBe(false);
    expect(el.hasAttribute('data-atmo-tod')).toBe(false);
  });
});
