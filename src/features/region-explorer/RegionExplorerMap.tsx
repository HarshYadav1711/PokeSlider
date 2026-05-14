import { memo, useCallback, useId } from 'react';

import type { RegionRoute } from './data/regionTypes';

interface RegionExplorerMapProps {
  readonly routes: readonly RegionRoute[];
  readonly selectedId: string | null;
  readonly onSelectRoute: (id: string) => void;
  readonly regionLabel: string;
}

export const RegionExplorerMap = memo(function RegionExplorerMap({
  routes,
  selectedId,
  onSelectRoute,
  regionLabel,
}: RegionExplorerMapProps) {
  const labelId = useId();
  const descId = useId();
  const landGradId = useId().replaceAll(':', '');

  const handleKeyNav = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = routes[(index + 1) % routes.length];
        if (next) onSelectRoute(next.id);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = routes[(index - 1 + routes.length) % routes.length];
        if (prev) onSelectRoute(prev.id);
      }
    },
    [onSelectRoute, routes],
  );

  return (
    <section
      className="relative rounded-[var(--radius-xl)] border border-white/10 bg-[rgb(6_8_14/0.45)] p-3 md:p-4"
      aria-labelledby={labelId}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 id={labelId} className="text-sm font-semibold text-white/90">
            Region map
          </h3>
          <p id={descId} className="text-[var(--text-body-sm)] text-white/62">
            Tap a point to focus a route in {regionLabel}.
          </p>
        </div>
      </div>

      <div className="relative mx-auto aspect-[5/3] w-full max-w-xl touch-pan-y">
        <svg
          className="h-full w-full select-none"
          viewBox="0 0 100 60"
          role="img"
          aria-label={`Stylized map of ${regionLabel}`}
        >
          <defs>
            <linearGradient id={landGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(255 255 255 / 0.06)" />
              <stop offset="100%" stopColor="rgb(255 255 255 / 0.02)" />
            </linearGradient>
          </defs>
          <path
            d="M8 42 C18 18, 38 12, 58 16 C78 20, 92 28, 94 44 C88 56, 62 58, 40 54 C22 50, 10 48, 8 42 Z"
            fill={`url(#${landGradId})`}
            stroke="rgb(255 255 255 / 0.12)"
            strokeWidth="0.6"
            vectorEffect="non-scaling-stroke"
          />
          {routes.map((r) => {
            const active = r.id === selectedId;
            const { x, y } = r.map;
            return (
              <g
                key={r.id}
                className="cursor-pointer outline-none"
                onClick={() => onSelectRoute(r.id)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={8}
                  fill="rgb(255 255 255 / 0.05)"
                  stroke="rgb(255 255 255 / 0.14)"
                  strokeWidth="0.35"
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={active ? 3.4 : 2.8}
                  fill={active ? 'var(--rex-accent)' : 'rgb(255 255 255 / 0.38)'}
                  stroke={active ? 'rgb(255 255 255 / 0.55)' : 'rgb(255 255 255 / 0.22)'}
                  strokeWidth="0.45"
                  className="pointer-events-none"
                  style={{ vectorEffect: 'non-scaling-stroke' }}
                />
              </g>
            );
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-2">
          <span className="rounded-md bg-[rgb(4_6_12/0.55)] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white/45 backdrop-blur-sm">
            Abstract
          </span>
        </div>
      </div>

      <div
        className="mt-3 grid gap-2 sm:grid-cols-2"
        role="radiogroup"
        aria-describedby={descId}
      >
        {routes.map((r, index) => {
          const active = r.id === selectedId;
          return (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              data-region-route-focus={active ? '' : undefined}
              className={
                active
                  ? 'app-focus-ring rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors md:min-h-11'
                  : 'app-focus-ring rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5 text-left text-sm font-medium text-white/78 hover:bg-white/[0.06] md:min-h-11'
              }
              style={
                active
                  ? {
                      borderColor: 'color-mix(in srgb, var(--rex-accent) 50%, white)',
                      backgroundColor: 'color-mix(in srgb, var(--rex-accent) 12%, rgb(6 8 14 / 0.55))',
                      color: 'var(--rex-accent-soft)',
                    }
                  : undefined
              }
              onClick={() => onSelectRoute(r.id)}
              onKeyDown={(e) => handleKeyNav(e, index)}
            >
              {r.name}
            </button>
          );
        })}
      </div>
    </section>
  );
});
