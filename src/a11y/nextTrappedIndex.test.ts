import { describe, expect, it } from 'vitest';

import { nextTrappedIndex } from './nextTrappedIndex';

describe('nextTrappedIndex', () => {
  it('wraps forward from last to first', () => {
    expect(nextTrappedIndex(2, 3, false)).toBe(0);
  });

  it('wraps backward from first to last', () => {
    expect(nextTrappedIndex(0, 3, true)).toBe(2);
  });

  it('steps forward inside range', () => {
    expect(nextTrappedIndex(0, 4, false)).toBe(1);
  });

  it('returns 0 for empty', () => {
    expect(nextTrappedIndex(0, 0, false)).toBe(0);
  });
});
