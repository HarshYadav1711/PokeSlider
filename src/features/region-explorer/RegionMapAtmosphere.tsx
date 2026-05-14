import './regionMapAtmosphere.css';

import { memo } from 'react';

import type { PerformanceTier } from '../../hooks/usePerformanceTier';

interface RegionMapAtmosphereProps {
  readonly reducedMotion: boolean;
  readonly performanceTier: PerformanceTier;
  readonly timeMood: 'day' | 'dusk' | 'night';
  readonly mistRgb: string;
  readonly weatherHintOpacity?: number;
}

export const RegionMapAtmosphere = memo(function RegionMapAtmosphere({
  reducedMotion,
  performanceTier,
  timeMood,
  mistRgb,
  weatherHintOpacity = 0.35,
}: RegionMapAtmosphereProps) {
  const lite = reducedMotion || performanceTier === 'low';
  const clouds = !lite && performanceTier === 'high';

  const vignette =
    timeMood === 'night'
      ? 'radial-gradient(ellipse 85% 75% at 50% 55%, transparent 40%, rgb(4 6 14 / 0.55) 100%)'
      : timeMood === 'dusk'
        ? 'radial-gradient(ellipse 90% 80% at 50% 58%, transparent 45%, rgb(8 10 22 / 0.38) 100%)'
        : 'radial-gradient(ellipse 95% 85% at 50% 62%, transparent 50%, rgb(6 8 18 / 0.22) 100%)';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: vignette,
        }}
      />
      {clouds ? (
        <>
          <div
            className="region-map-atmosphere__cloud-a absolute -left-[18%] top-[8%] h-[42%] w-[70%] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(ellipse at 40% 40%, ${mistRgb}, transparent 62%)`,
              opacity: weatherHintOpacity,
            }}
          />
          <div
            className="region-map-atmosphere__cloud-b absolute -right-[12%] bottom-[6%] h-[38%] w-[65%] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(ellipse at 60% 55%, ${mistRgb}, transparent 65%)`,
              opacity: weatherHintOpacity * 0.85,
            }}
          />
        </>
      ) : !lite ? (
        <div
          className="absolute inset-0 opacity-25 blur-2xl"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 30% 30%, ${mistRgb}, transparent 58%)`,
          }}
        />
      ) : null}
      <div
        className="absolute inset-0 bg-[linear-gradient(125deg,transparent_42%,rgb(255_255_255/0.03)_50%,transparent_58%)] opacity-70"
        style={{ mixBlendMode: 'soft-light' }}
      />
    </div>
  );
});
