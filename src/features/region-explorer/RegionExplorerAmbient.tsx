import './regionExplorerAmbient.css';

import { memo } from 'react';

interface RegionExplorerAmbientProps {
  readonly reducedMotion: boolean;
  readonly mistColor: string;
}

export const RegionExplorerAmbient = memo(function RegionExplorerAmbient({
  reducedMotion,
  mistColor,
}: RegionExplorerAmbientProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -inset-[12%] rounded-full opacity-40 blur-3xl"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${mistColor}, transparent 55%)`,
        }}
      />
      {!reducedMotion ? (
        <div
          className="region-explorer-ambient__mist absolute -inset-[8%] rounded-[40%] blur-2xl"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 70% 80%, ${mistColor}, transparent 60%)`,
          }}
        />
      ) : null}
      <div
        className={
          reducedMotion
            ? 'absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgb(255_255_255/0.04)_50%,transparent_60%)]'
            : 'region-explorer-ambient__shimmer absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgb(255_255_255/0.05)_50%,transparent_60%)]'
        }
      />
    </div>
  );
});
