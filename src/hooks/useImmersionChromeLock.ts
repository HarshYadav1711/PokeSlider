import { useEffect } from 'react';

import type { AppExperienceSurface } from '../experience/appExperienceTypes';

/**
 * When any non-home experience is active: lock document scroll and publish the surface on
 * `<html data-app-experience-surface>` for styling hooks. Cleans up on exit.
 */
export function useImmersionChromeLock(surface: AppExperienceSurface): void {
  useEffect(() => {
    if (surface === 'home') {
      document.documentElement.removeAttribute('data-app-experience-surface');
      return;
    }

    document.documentElement.setAttribute('data-app-experience-surface', surface);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.removeAttribute('data-app-experience-surface');
    };
  }, [surface]);
}
