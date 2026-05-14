import { useEffect, useMemo } from 'react';

import { useMediaQuery } from './useMediaQuery';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export type PerformanceTier = 'high' | 'mid' | 'low';

function pickDeviceMemoryGb(): number | null {
  if (typeof navigator === 'undefined') return null;
  const dm = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return typeof dm === 'number' && Number.isFinite(dm) ? dm : null;
}

function pickHardwareConcurrency(): number | null {
  if (typeof navigator === 'undefined') return null;
  const n = navigator.hardwareConcurrency;
  return typeof n === 'number' && n > 0 ? n : null;
}

/**
 * Adaptive rendering quality: sets `data-performance-tier` on `<html>` for CSS
 * and returns the tier for JS (carousel density, motion cost).
 */
export function usePerformanceTier(): PerformanceTier {
  const narrow = useMediaQuery('(max-width: 768px)');
  const coarsePointer = useMediaQuery('(pointer: coarse)');
  const reducedMotion = usePrefersReducedMotion();

  const tier = useMemo((): PerformanceTier => {
    if (reducedMotion) return 'low';
    if (!narrow) return 'high';
    const mem = pickDeviceMemoryGb();
    const cores = pickHardwareConcurrency();
    const lowMem = mem !== null && mem <= 4;
    const lowCores = cores !== null && cores <= 4;
    if (coarsePointer && (lowMem || lowCores)) return 'low';
    if (coarsePointer || lowMem || lowCores) return 'mid';
    return 'mid';
  }, [narrow, coarsePointer, reducedMotion]);

  useEffect(() => {
    document.documentElement.dataset.performanceTier = tier;
    return () => {
      delete document.documentElement.dataset.performanceTier;
    };
  }, [tier]);

  return tier;
}
