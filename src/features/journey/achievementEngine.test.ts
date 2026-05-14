import { describe, expect, it } from 'vitest';

import { evaluateNewJourneyAchievements } from './achievementEngine';

describe('evaluateNewJourneyAchievements', () => {
  it('returns first_light on first discovery', () => {
    const out = evaluateNewJourneyAchievements(
      {
        uniqueDiscoveredCount: 1,
        favoriteEventsCount: 0,
        compareSessionsCount: 0,
        teamSnapshotsCount: 0,
      },
      new Set(),
    );
    expect(out).toContain('first_light');
  });

  it('does not duplicate unlocked ids', () => {
    const out = evaluateNewJourneyAchievements(
      {
        uniqueDiscoveredCount: 100,
        favoriteEventsCount: 12,
        compareSessionsCount: 8,
        teamSnapshotsCount: 5,
      },
      new Set(['first_light', 'wandering', 'horizon', 'warm_glow', 'keepsakes', 'duelist', 'rivalry', 'full_bench', 'travel_log']),
    );
    expect(out).toEqual([]);
  });

  it('returns multiple new achievements in catalog order', () => {
    const out = evaluateNewJourneyAchievements(
      {
        uniqueDiscoveredCount: 100,
        favoriteEventsCount: 12,
        compareSessionsCount: 8,
        teamSnapshotsCount: 5,
      },
      new Set(),
    );
    expect(out[0]).toBe('first_light');
    expect(out).toEqual(
      expect.arrayContaining([
        'first_light',
        'wandering',
        'horizon',
        'warm_glow',
        'keepsakes',
        'duelist',
        'rivalry',
        'full_bench',
        'travel_log',
      ]),
    );
    expect(out.length).toBe(9);
  });
});
