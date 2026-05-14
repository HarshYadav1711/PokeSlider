import { describe, expect, it } from 'vitest';

import { TYPE_CARRIER_HZ, typeCarrierHz } from './soundscapeTypeProfile';

describe('typeCarrierHz', () => {
  it('maps known types to stable anchors', () => {
    expect(typeCarrierHz('fire')).toBe(TYPE_CARRIER_HZ.fire);
    expect(typeCarrierHz('water')).toBe(TYPE_CARRIER_HZ.water);
  });

  it('falls back to normal for nullish', () => {
    expect(typeCarrierHz(null)).toBe(TYPE_CARRIER_HZ.normal);
    expect(typeCarrierHz(undefined)).toBe(TYPE_CARRIER_HZ.normal);
  });
});
