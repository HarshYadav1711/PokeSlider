import { describe, expect, it } from 'vitest';

import { linesForEvolutionDetail, summarizeEvolutionDetails } from './evolutionTriggerSummary';

describe('summarizeEvolutionDetails', () => {
  it('merges level and friendship hints', () => {
    const lines = summarizeEvolutionDetails([
      {
        min_level: 16,
        min_happiness: 220,
        item: null,
        trigger: { name: 'level-up', url: '' },
      },
    ]);
    expect(lines).toContain('Reach level 16');
    expect(lines).toContain('High friendship (220+)');
  });

  it('dedupes repeated lines across alternate detail rows', () => {
    const lines = summarizeEvolutionDetails([
      {
        min_level: 32,
        item: null,
        trigger: { name: 'level-up', url: '' },
      },
      {
        min_level: 32,
        item: null,
        trigger: { name: 'level-up', url: '' },
      },
    ]);
    expect(lines.filter((l) => l === 'Reach level 32').length).toBe(1);
  });
});

describe('linesForEvolutionDetail', () => {
  it('describes item-based evolution', () => {
    const lines = linesForEvolutionDetail({
      min_level: null,
      item: { name: 'fire-stone', url: '' },
      trigger: { name: 'use-item', url: '' },
    });
    expect(lines.some((l) => l.toLowerCase().includes('fire stone'))).toBe(true);
  });
});
