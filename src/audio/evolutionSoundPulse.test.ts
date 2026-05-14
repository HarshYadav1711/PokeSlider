import { describe, expect, it } from 'vitest';

import { evolutionPulseLinear01, triggerEvolutionSoundPulse } from './evolutionSoundPulse';

describe('evolutionSoundPulse', () => {
  it('starts near full strength then decays to zero', () => {
    triggerEvolutionSoundPulse();
    const now = performance.now();
    expect(evolutionPulseLinear01(now)).toBeGreaterThan(0.99);
    expect(evolutionPulseLinear01(now + 5000)).toBe(0);
  });
});
