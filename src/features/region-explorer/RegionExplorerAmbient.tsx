import './regionExplorerAmbient.css';

import { memo } from 'react';

import type { PerformanceTier } from '../../hooks/usePerformanceTier';

interface RegionExplorerAmbientProps {
  readonly reducedMotion: boolean;
  readonly mistColor: string;
  readonly performanceTier: PerformanceTier;
  readonly timeMood: 'day' | 'dusk' | 'night';
}

export const RegionExplorerAmbient = memo(function RegionExplorerAmbient({
  reducedMotion,
  mistColor,
  performanceTier,
  timeMood,
}: RegionExplorerAmbientProps) {
  const lite = performanceTier === 'low' || reducedMotion;
  const mid = performanceTier === 'mid';
  const halo =
    timeMood === 'night' ? 'circle at 72% 18%' : timeMood === 'dusk' ? 'circle at 38% 22%' : 'circle at 30% 20%';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className={
          lite
            ? 'absolute -inset-[10%] rounded-full opacity-35 motion-safe:transition-opacity motion-safe:duration-300'
            : 'absolute -inset-[12%] rounded-full opacity-40 blur-3xl motion-safe:transition-opacity motion-safe:duration-300'
        }
        style={{
          background: `radial-gradient(${halo}, ${mistColor}, transparent 55%)`,
        }}
      />
      {!lite && !mid ? (
        <div
          className="region-explorer-ambient__mist absolute -inset-[8%] rounded-[40%] blur-2xl"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 70% 80%, ${mistColor}, transparent 60%)`,
          }}
        />
      ) : null}
      {!lite && mid ? (
        <div
          className="absolute -inset-[8%] rounded-[40%] opacity-45 blur-xl"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 70% 80%, ${mistColor}, transparent 60%)`,
          }}
        />
      ) : null}
      <div
        className={
          lite
            ? 'absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgb(255_255_255/0.04)_50%,transparent_60%)]'
            : 'region-explorer-ambient__shimmer absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgb(255_255_255/0.05)_50%,transparent_60%)]'
        }
      />
    </div>
  );
});
