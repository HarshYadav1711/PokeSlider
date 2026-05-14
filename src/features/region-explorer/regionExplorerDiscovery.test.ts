import { describe, expect, it } from 'vitest';

import { fnv1a32, seededSampleUniqueIds } from './regionExplorerDiscovery';

describe('regionExplorerDiscovery', () => {
  it('fnv1a32 is stable for a fixed string', () => {
    expect(fnv1a32('kanto:route-1')).toBe(fnv1a32('kanto:route-1'));
    expect(fnv1a32('kanto:route-1')).not.toBe(fnv1a32('kanto:route-2'));
  });

  it('seededSampleUniqueIds is deterministic and bounded', () => {
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const a = seededSampleUniqueIds(pool, 4, 'seed-a');
    const b = seededSampleUniqueIds(pool, 4, 'seed-a');
    const c = seededSampleUniqueIds(pool, 4, 'seed-b');
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(4);
    expect(a.every((id) => pool.includes(id))).toBe(true);
    expect(c).not.toEqual(a);
  });

  it('returns full sorted pool when count exceeds unique pool', () => {
    expect(seededSampleUniqueIds([3, 1, 2], 10, 'x')).toEqual([1, 2, 3]);
  });
});
