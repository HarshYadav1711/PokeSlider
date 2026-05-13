import { describe, expect, it } from 'vitest';

import { addRotation, angleStepForCount, angleToSnapIndexToFront } from './carouselAngle';

describe('angleStepForCount', () => {
  it('returns 360 for non-positive counts', () => {
    expect(angleStepForCount(0)).toBe(360);
    expect(angleStepForCount(-3)).toBe(360);
  });

  it('splits the circle evenly', () => {
    expect(angleStepForCount(4)).toBe(90);
    expect(angleStepForCount(9)).toBe(40);
  });
});

describe('addRotation', () => {
  it('sums angles', () => {
    expect(addRotation(10, -5)).toBe(5);
  });
});

describe('angleToSnapIndexToFront', () => {
  it('normalizes negative indices', () => {
    const n = 4;
    expect(angleToSnapIndexToFront(-1, n)).toBe(angleToSnapIndexToFront(3, n));
  });

  it('puts index 0 at front when angle is 0 convention', () => {
    expect(angleToSnapIndexToFront(0, 9)).toBe(0);
  });

  it('offsets by one step per index', () => {
    expect(angleToSnapIndexToFront(1, 4)).toBe(-90);
    expect(angleToSnapIndexToFront(2, 4)).toBe(-180);
  });
});
