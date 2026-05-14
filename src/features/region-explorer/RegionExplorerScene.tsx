import { memo, useCallback, useId, useMemo, type KeyboardEvent } from 'react';

import type { PerformanceTier } from '../../hooks/usePerformanceTier';
import type { RegionDefinition, RegionHotspot } from './data/regionTypes';
import { buildRouteNetworkPath, REGION_SILHOUETTES } from './regionSceneGeometry';

interface RegionExplorerSceneProps {
  readonly region: RegionDefinition;
  readonly hotspots: readonly RegionHotspot[];
  readonly performanceTier: PerformanceTier;
  readonly selectedRouteId: string | null;
  readonly selectedHotspotId: string | null;
  readonly onSelectRoute: (id: string) => void;
  readonly onSelectHotspot: (id: string | null) => void;
  readonly timeMood: 'day' | 'dusk' | 'night';
}

function hotspotKindGlyph(kind: RegionHotspot['kind']): string {
  switch (kind) {
    case 'city':
      return '⌂';
    case 'gym':
      return '⚔';
    case 'cave':
      return '◆';
    case 'legendary':
      return '✦';
    case 'landmark':
      return '◎';
    case 'route':
    default:
      return '○';
  }
}

export const RegionExplorerScene = memo(function RegionExplorerScene({
  region,
  hotspots,
  performanceTier,
  selectedRouteId,
  selectedHotspotId,
  onSelectRoute,
  onSelectHotspot,
  timeMood,
}: RegionExplorerSceneProps) {
  const labelId = useId();
  const descId = useId();
  const gradLand = useId().replaceAll(':', '');
  const gradSea = useId().replaceAll(':', '');
  const silhouette = REGION_SILHOUETTES[region.id];
  const routePath = useMemo(() => buildRouteNetworkPath(region.routes), [region.routes]);

  const showRouteFibers = performanceTier !== 'low';
  const nightVeilOpacity = timeMood === 'night' ? 0.34 : timeMood === 'dusk' ? 0.18 : 0;

  const handleHotspotActivate = useCallback(
    (h: RegionHotspot) => {
      onSelectHotspot(h.id);
      if (h.linkedRouteId) onSelectRoute(h.linkedRouteId);
    },
    [onSelectHotspot, onSelectRoute],
  );

  const onRadioGroupKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (hotspots.length === 0) return;
      let idx = hotspots.findIndex((h) => h.id === selectedHotspotId);
      if (idx < 0) idx = 0;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = hotspots[(idx + 1) % hotspots.length]!;
        handleHotspotActivate(next);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = hotspots[(idx - 1 + hotspots.length) % hotspots.length]!;
        handleHotspotActivate(prev);
      } else if (e.key === 'Home') {
        e.preventDefault();
        const first = hotspots[0]!;
        handleHotspotActivate(first);
      } else if (e.key === 'End') {
        e.preventDefault();
        const last = hotspots[hotspots.length - 1]!;
        handleHotspotActivate(last);
      }
    },
    [handleHotspotActivate, hotspots, selectedHotspotId],
  );

  return (
    <section
      className="relative rounded-[var(--radius-xl)] border border-white/10 bg-[rgb(6_8_14/0.45)] p-3 md:p-4"
      aria-labelledby={labelId}
    >
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id={labelId} className="text-sm font-semibold text-white/90">
            Region atlas
          </h3>
          <p id={descId} className="text-[var(--text-body-sm)] text-white/62">
            SVG scene — tap a marker or focus the location list (Tab) and use arrows. Cities, routes, and landmarks
            link into encounters when a route is attached.
          </p>
        </div>
      </div>

      <div
        className="relative mx-auto aspect-[5/3] w-full max-w-xl touch-pan-y"
        data-region-scene-root
        data-time-mood={timeMood}
      >
        <svg
          className="h-full w-full select-none"
          viewBox="0 0 100 60"
          role="img"
          aria-label={`Stylized layered map of ${region.name}`}
        >
          <defs>
            <linearGradient id={gradSea} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(255 255 255 / 0.05)" />
              <stop offset="100%" stopColor="rgb(255 255 255 / 0.01)" />
            </linearGradient>
            <linearGradient id={gradLand} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(255 255 255 / 0.07)" />
              <stop offset="100%" stopColor="rgb(255 255 255 / 0.02)" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="100" height="60" fill={`url(#${gradSea})`} />

          <path
            d={silhouette}
            fill={`url(#${gradLand})`}
            stroke="rgb(255 255 255 / 0.14)"
            strokeWidth="0.55"
            vectorEffect="non-scaling-stroke"
          />

          {showRouteFibers && routePath ? (
            <path
              d={routePath}
              fill="none"
              stroke="rgb(255 255 255 / 0.14)"
              strokeWidth="0.85"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="2.2 1.4"
            />
          ) : null}

          {nightVeilOpacity > 0 ? (
            <rect
              x="0"
              y="0"
              width="100"
              height="60"
              fill="rgb(8 12 28)"
              opacity={nightVeilOpacity}
              style={{ pointerEvents: 'none' }}
            />
          ) : null}
        </svg>

        <div className="pointer-events-none absolute inset-0">
          {hotspots.map((h) => {
            const active = h.id === selectedHotspotId || h.linkedRouteId === selectedRouteId;
            return (
              <div
                key={h.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${h.map.x}%`, top: `${h.map.y}%` }}
              >
                <div
                  className={
                    active
                      ? 'flex h-9 min-h-9 w-9 min-w-9 items-center justify-center rounded-full border text-[11px] font-bold text-white/95 shadow-[var(--shadow-sm)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out md:h-10 md:min-h-10 md:w-10 md:min-w-10'
                      : 'flex h-9 min-h-9 w-9 min-w-9 items-center justify-center rounded-full border border-white/18 bg-[rgb(6_8_14/0.35)] text-[11px] font-semibold text-white/80 motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-out md:h-10 md:min-h-10 md:w-10 md:min-w-10'
                  }
                  style={
                    active
                      ? {
                          borderColor: 'color-mix(in srgb, var(--rex-accent) 55%, white)',
                          backgroundColor: 'color-mix(in srgb, var(--rex-accent) 22%, rgb(6 8 14 / 0.55))',
                          transform: 'scale(1.06)',
                          pointerEvents: 'none',
                        }
                      : { pointerEvents: 'none' }
                  }
                  aria-hidden
                >
                  {hotspotKindGlyph(h.kind)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute inset-0">
          {hotspots.map((h) => {
            const active = h.id === selectedHotspotId || h.linkedRouteId === selectedRouteId;
            return (
              <button
                key={`hit-${h.id}`}
                type="button"
                tabIndex={-1}
                className="app-focus-ring absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-transparent bg-transparent opacity-25 hover:opacity-75 motion-safe:transition-opacity motion-safe:duration-150 md:h-12 md:min-h-12 md:w-12 md:min-w-12"
                style={{
                  left: `${h.map.x}%`,
                  top: `${h.map.y}%`,
                  width: '2.75rem',
                  height: '2.75rem',
                }}
                aria-label={`${h.label} — ${h.kind}`}
                aria-pressed={active}
                onClick={() => handleHotspotActivate(h)}
              />
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end p-2">
          <span className="rounded-md bg-[rgb(4_6_12/0.55)] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white/45">
            {performanceTier === 'low' ? 'Lite scene' : 'Vector scene'}
          </span>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label={`Locations in ${region.name}`}
        aria-describedby={descId}
        tabIndex={0}
        className="app-focus-ring mt-3 grid gap-2 rounded-xl outline-offset-2 sm:grid-cols-2"
        onKeyDown={onRadioGroupKeyDown}
        data-region-scene-radiogroup
      >
        {hotspots.map((h) => {
          const checked = h.id === selectedHotspotId;
          return (
            <button
              key={h.id}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={-1}
              className={
                checked
                  ? 'app-focus-ring rounded-xl border px-3 py-2.5 text-left text-sm font-medium motion-safe:transition-opacity motion-safe:duration-150 md:min-h-11'
                  : 'app-focus-ring rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5 text-left text-sm font-medium text-white/78 hover:bg-white/[0.06] motion-safe:transition-opacity motion-safe:duration-150 md:min-h-11'
              }
              style={
                checked
                  ? {
                      borderColor: 'color-mix(in srgb, var(--rex-accent) 50%, white)',
                      backgroundColor: 'color-mix(in srgb, var(--rex-accent) 12%, rgb(6 8 14 / 0.55))',
                      color: 'var(--rex-accent-soft)',
                    }
                  : undefined
              }
              onClick={() => handleHotspotActivate(h)}
            >
              <span className="mr-1.5 inline-block w-4 text-center text-xs text-white/55" aria-hidden>
                {hotspotKindGlyph(h.kind)}
              </span>
              {h.label}
            </button>
          );
        })}
      </div>
    </section>
  );
});
