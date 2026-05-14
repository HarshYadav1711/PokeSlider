import { describe, expect, it } from 'vitest';

import type { AppExperienceFlags } from './appExperienceTypes';
import { selectAppExperienceSurface } from './selectAppExperienceSurface';

const allFalse: AppExperienceFlags = {
  journeyBlocking: false,
  overlayOpen: false,
  dexOpen: false,
  compareOpen: false,
  battleOpen: false,
  teamBuilderOpen: false,
  regionOpen: false,
  discoveryRecoOpen: false,
  soundscapeSettingsOpen: false,
};

describe('selectAppExperienceSurface', () => {
  it('returns home when nothing blocks', () => {
    expect(selectAppExperienceSurface(allFalse)).toBe('home');
  });

  it('prioritizes journey over other surfaces', () => {
    expect(
      selectAppExperienceSurface({
        ...allFalse,
        journeyBlocking: true,
        overlayOpen: true,
        dexOpen: true,
      }),
    ).toBe('journey');
  });

  it('uses soundscape only when it is the sole blocker', () => {
    expect(
      selectAppExperienceSurface({
        ...allFalse,
        soundscapeSettingsOpen: true,
      }),
    ).toBe('soundscape');
  });

  it('orders modal-ish surfaces before soundscape', () => {
    expect(
      selectAppExperienceSurface({
        ...allFalse,
        teamBuilderOpen: true,
        soundscapeSettingsOpen: true,
      }),
    ).toBe('team_builder');
  });
});
