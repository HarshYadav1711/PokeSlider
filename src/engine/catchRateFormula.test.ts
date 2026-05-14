import { describe, expect, it } from 'vitest';

import {
  catchProbabilityFourShakes,
  computeModifiedCatchRate,
  computeShakeThresholdB,
  expectedBallsToCatch,
  statusMultiplier,
} from './catchRateFormula';

describe('catchRateFormula', () => {
  it('computes modified catch rate for a simple scenario', () => {
    const a = computeModifiedCatchRate({
      maxHp: 100,
      currentHp: 45,
      speciesCatchRate: 45,
      ballMultiplier: 2,
      statusMode: 'none',
    });
    expect(a).toBeGreaterThan(40);
    expect(a).toBeLessThan(200);
  });

  it('surges modified rate for fragile targets with high species catch and stronger balls', () => {
    const a = computeModifiedCatchRate({
      maxHp: 40,
      currentHp: 1,
      speciesCatchRate: 255,
      ballMultiplier: 1.5,
      statusMode: 'none',
    });
    expect(a).toBeGreaterThanOrEqual(255);
  });

  it('returns deterministic shake threshold', () => {
    const b1 = computeShakeThresholdB(120);
    const b2 = computeShakeThresholdB(120);
    expect(b1).toBe(b2);
    expect(b1).toBeGreaterThan(0);
    expect(b1).toBeLessThanOrEqual(65535);
  });

  it('derives monotonic catch probability for higher modified rates', () => {
    const pLow = catchProbabilityFourShakes(40, false);
    const pHigh = catchProbabilityFourShakes(120, false);
    expect(pHigh).toBeGreaterThan(pLow);
  });

  it('treats master ball path as guaranteed in probability helper', () => {
    expect(catchProbabilityFourShakes(10, true)).toBe(1);
  });

  it('computes expected throws', () => {
    expect(expectedBallsToCatch(0.25)).toBe(4);
    expect(expectedBallsToCatch(1)).toBe(1);
    expect(Number.isFinite(expectedBallsToCatch(0))).toBe(false);
  });

  it('status multipliers are ordered', () => {
    expect(statusMultiplier('sleep_freeze')).toBeGreaterThan(statusMultiplier('other_status'));
    expect(statusMultiplier('other_status')).toBeGreaterThan(statusMultiplier('none'));
  });
});
