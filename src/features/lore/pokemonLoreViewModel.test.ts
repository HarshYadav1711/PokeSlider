import { describe, expect, it } from 'vitest';

import type { EvolutionTimelineStage } from '../../types/pokemon';
import {
  buildEvolutionStory,
  findDirectChildStages,
  findParentStage,
  flavorToParagraphs,
} from './pokemonLoreViewModel';

function stage(
  partial: Pick<EvolutionTimelineStage, 'id' | 'name' | 'level'> &
    Partial<Omit<EvolutionTimelineStage, 'id' | 'name' | 'level'>>,
): EvolutionTimelineStage {
  return {
    id: partial.id,
    name: partial.name,
    image: null,
    level: partial.level,
    details: null,
    evolutionDetails: partial.evolutionDetails ?? [],
    types: ['normal'],
    stats: [],
    baseStatTotal: 300,
    genus: partial.genus ?? 'Test',
    flavorText: partial.flavorText ?? 'Flavor.',
    evolutionHintLines: partial.evolutionHintLines ?? [],
  };
}

describe('flavorToParagraphs', () => {
  it('returns single block for short text', () => {
    expect(flavorToParagraphs('Short.')).toEqual(['Short.']);
  });

  it('groups multiple sentences', () => {
    const t = 'One. Two. Three.';
    const p = flavorToParagraphs(t, 10);
    expect(p.length).toBeGreaterThanOrEqual(1);
    expect(p.join(' ')).toContain('One.');
  });
});

describe('tree-aware evolution helpers', () => {
  it('finds parent across sibling block', () => {
    const stages = [
      stage({ id: 1, name: 'eevee', level: 0, flavorText: 'A.', evolutionHintLines: [] }),
      stage({ id: 2, name: 'vaporeon', level: 1, flavorText: 'B.', evolutionHintLines: ['Use water stone'] }),
      stage({ id: 3, name: 'jolteon', level: 1, flavorText: 'C.', evolutionHintLines: ['Use thunder stone'] }),
    ];
    expect(findParentStage(stages, 1)?.name).toBe('eevee');
    expect(findParentStage(stages, 2)?.name).toBe('eevee');
    expect(findDirectChildStages(stages, 0).map((s) => s.name)).toEqual(['vaporeon', 'jolteon']);
    expect(findDirectChildStages(stages, 1)).toEqual([]);
  });
});

describe('buildEvolutionStory', () => {
  it('handles singleton', () => {
    const s = buildEvolutionStory([stage({ id: 10, name: 'ditto', level: 0 })]);
    expect(s).toContain('alone');
  });
});
