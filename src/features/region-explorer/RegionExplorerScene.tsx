import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
} from 'react';

import type { PerformanceTier } from '../../hooks/usePerformanceTier';
import { atlasRasterUrls, shouldLoadRegionAtlasRaster } from './data/regionAtlasRasterManifest';
import { resolveRegionMapArt } from './data/regionLayerAtlas';
import type { RegionDefinition, RegionHotspot } from './data/regionTypes';
import {
  computeGuidedViewBox,
  inferGuidedFocusMode,
  type GuidedFocusMode,
} from './regionGuidedZoom';
import { RegionMapAtmosphere } from './RegionMapAtmosphere';
import {
  buildRouteNetworkPath,
  buildRouteNetworkPathThrough,
  buildSmoothedRoutePath,
  REGION_SILHOUETTES,
} from './regionSceneGeometry';
import { useAtlasRasterBreakpoint } from './useAtlasRasterBreakpoint';

interface RegionExplorerSceneProps {
  readonly region: RegionDefinition;
  readonly hotspots: readonly RegionHotspot[];
  readonly performanceTier: PerformanceTier;
  readonly selectedRouteId: string | null;
  readonly selectedHotspotId: string | null;
  readonly onSelectRoute: (id: string) => void;
  readonly onSelectHotspot: (id: string | null) => void;
  readonly timeMood: 'day' | 'dusk' | 'night';
  readonly reducedMotion: boolean;
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
    case 'island':
      return '◇';
    case 'forest':
      return '❧';
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
  reducedMotion,
}: RegionExplorerSceneProps) {
  const labelId = useId();
  const descId = useId();
  const filterGlowId = useId().replaceAll(':', '');
  const gradSea = useId().replaceAll(':', '');
  const gradLand = useId().replaceAll(':', '');

  const atlasBreakpoint = useAtlasRasterBreakpoint();
  const rasterEligible = shouldLoadRegionAtlasRaster(region.id);
  const rasterUrls = useMemo(
    () => (rasterEligible ? atlasRasterUrls(region.id, atlasBreakpoint) : null),
    [atlasBreakpoint, rasterEligible, region.id],
  );

  const [rasterFailed, setRasterFailed] = useState(false);
  const [rasterFormat, setRasterFormat] = useState<'avif' | 'webp'>('avif');
  const [overviewLock, setOverviewLock] = useState(false);

  useEffect(() => {
    setRasterFailed(false);
    setRasterFormat('avif');
  }, [region.id, atlasBreakpoint]);

  useEffect(() => {
    setOverviewLock(false);
  }, [region.id]);

  const mapArt = useMemo(() => resolveRegionMapArt(region), [region]);

  const showForestLayer = performanceTier !== 'low';
  const showWaterRoutes = performanceTier !== 'low';
  const showCoast = performanceTier === 'high';
  const useRouteGlowFilter = performanceTier === 'high' && !reducedMotion;

  const activeHotspot = useMemo(
    () => hotspots.find((h) => h.id === selectedHotspotId) ?? null,
    [hotspots, selectedHotspotId],
  );

  const focusOverlay = useMemo(() => {
    if (overviewLock) return null;
    if (activeHotspot) return activeHotspot.map;
    const r = region.routes.find((x) => x.id === selectedRouteId);
    return r?.map ?? null;
  }, [activeHotspot, overviewLock, region.routes, selectedRouteId]);

  const guidedMode: GuidedFocusMode = useMemo(() => {
    if (overviewLock) return 'overview';
    if (activeHotspot) return inferGuidedFocusMode(activeHotspot);
    return region.routes.some((r) => r.id === selectedRouteId) ? 'route' : 'overview';
  }, [activeHotspot, overviewLock, region.routes, selectedRouteId]);

  const viewBox = useMemo(
    () => computeGuidedViewBox(guidedMode, focusOverlay),
    [focusOverlay, guidedMode],
  );
  const viewBoxAttr = `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`;

  const nightVeilOpacity = timeMood === 'night' ? 0.34 : timeMood === 'dusk' ? 0.18 : 0;

  const routePathSmooth = useMemo(() => buildSmoothedRoutePath(region.routes), [region.routes]);
  const routePathLite = useMemo(() => buildRouteNetworkPath(region.routes), [region.routes]);
  const routePath =
    performanceTier === 'low' || !routePathSmooth ? routePathLite : routePathSmooth;

  const routePathToActive = useMemo(
    () => buildRouteNetworkPathThrough(region.routes, selectedRouteId),
    [region.routes, selectedRouteId],
  );

  const showRasterLayer = Boolean(rasterUrls) && !rasterFailed;
  const showVectorRelief = !showRasterLayer;

  const waterFillRule = mapArt.waterFillRule;
  const silhouette = REGION_SILHOUETTES[region.id];

  const handleHotspotActivate = useCallback(
    (h: RegionHotspot) => {
      setOverviewLock(false);
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

  const weatherTint = region.atmosphere.weatherHint ? 0.42 : 0.32;

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
            Painterly atlas composition with a sharp SVG interaction layer. Motion stays in the atmosphere — the map
            itself stays calm. Use guided framing below; only one region stays mounted at a time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={
              overviewLock
                ? 'app-focus-ring min-h-9 rounded-lg border border-white/22 bg-white/[0.1] px-3 text-xs font-semibold text-white/92'
                : 'app-focus-ring min-h-9 rounded-lg border border-white/14 bg-white/[0.05] px-3 text-xs font-semibold text-white/78 hover:bg-white/[0.09]'
            }
            aria-pressed={overviewLock}
            onClick={() => setOverviewLock(true)}
          >
            Full map
          </button>
          <button
            type="button"
            className="app-focus-ring min-h-9 rounded-lg border border-white/14 bg-white/[0.05] px-3 text-xs font-semibold text-white/78 hover:bg-white/[0.09] disabled:opacity-35"
            disabled={!overviewLock}
            onClick={() => setOverviewLock(false)}
          >
            Focus selection
          </button>
        </div>
      </div>

      <div
        className="relative mx-auto aspect-[5/3] w-full max-w-xl touch-pan-y outline-none"
        data-region-scene-root
        data-time-mood={timeMood}
        tabIndex={0}
        role="application"
        aria-label={`${region.name} atlas. Locations are selectable; use the location list for keyboard navigation.`}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-[rgb(4_8_18/0.55)]">
          <RegionMapAtmosphere
            reducedMotion={reducedMotion}
            performanceTier={performanceTier}
            timeMood={timeMood}
            mistRgb={region.atmosphere.mist}
            weatherHintOpacity={weatherTint}
          />

          <svg className="relative z-[1] block h-full w-full select-none" width="100%" height="100%" role="img" aria-hidden>
            <svg
              width="100%"
              height="100%"
              viewBox={viewBoxAttr}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {useRouteGlowFilter ? (
                  <filter id={filterGlowId} x="-25%" y="-25%" width="150%" height="150%">
                    <feGaussianBlur stdDeviation="0.65" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ) : null}
                <linearGradient id={gradSea} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(96 165 250 / 0.14)" />
                  <stop offset="100%" stopColor="rgb(30 58 95 / 0.35)" />
                </linearGradient>
                <linearGradient id={gradLand} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(255 255 255 / 0.09)" />
                  <stop offset="100%" stopColor="rgb(255 255 255 / 0.03)" />
                </linearGradient>
              </defs>

              {showRasterLayer && rasterUrls ? (
                <image
                  href={rasterFormat === 'avif' ? rasterUrls.avif : rasterUrls.webp}
                  width="100"
                  height="60"
                  preserveAspectRatio="xMidYMid slice"
                  style={{ opacity: 0.98 }}
                  onError={() => {
                    if (rasterFormat === 'avif') setRasterFormat('webp');
                    else setRasterFailed(true);
                  }}
                />
              ) : null}

              <rect x="0" y="0" width="100" height="60" fill={`url(#${gradSea})`} />

              {showVectorRelief && silhouette ? (
                <path
                  d={silhouette}
                  fill="rgb(255 255 255 / 0.04)"
                  stroke="none"
                  style={{ pointerEvents: 'none' }}
                />
              ) : null}

              {showVectorRelief
                ? mapArt.water.map((d, i) => (
                    <path
                      key={`water-${i}`}
                      d={d}
                      fill="rgb(96 165 250 / 0.32)"
                      fillRule={waterFillRule === 'evenodd' ? 'evenodd' : undefined}
                      stroke="none"
                    />
                  ))
                : null}

              {showVectorRelief
                ? mapArt.terrain.map((d, i) => (
                    <path
                      key={`land-${i}`}
                      d={d}
                      fill={`url(#${gradLand})`}
                      stroke="rgb(255 255 255 / 0.12)"
                      strokeWidth="0.45"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))
                : null}

              {showVectorRelief && mapArt.islands
                ? mapArt.islands.map((d, i) => (
                    <path
                      key={`island-${i}`}
                      d={d}
                      fill={`url(#${gradLand})`}
                      stroke="rgb(255 255 255 / 0.14)"
                      strokeWidth="0.4"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))
                : null}

              {showVectorRelief && showForestLayer
                ? mapArt.forests.map((d, i) => (
                    <path
                      key={`forest-${i}`}
                      d={d}
                      fill="rgb(34 197 94 / 0.14)"
                      stroke="rgb(74 222 128 / 0.18)"
                      strokeWidth="0.35"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))
                : null}

              {showVectorRelief && showWaterRoutes && mapArt.waterRoutes
                ? mapArt.waterRoutes.map((d, i) => (
                    <path
                      key={`wr-${i}`}
                      d={d}
                      fill="none"
                      stroke="rgb(125 211 252 / 0.45)"
                      strokeWidth="0.55"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      strokeDasharray="1.8 1.2"
                    />
                  ))
                : null}

              {routePath ? (
                <path
                  d={routePath}
                  fill="none"
                  stroke="rgb(255 255 255 / 0.1)"
                  strokeWidth={performanceTier === 'low' ? '0.5' : '0.65'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={performanceTier === 'low' ? '1.6 1.2' : '2.2 1.4'}
                  style={{ pointerEvents: 'none' }}
                />
              ) : null}

              {routePathToActive ? (
                <path
                  d={routePathToActive}
                  fill="none"
                  stroke="color-mix(in srgb, var(--rex-accent) 55%, white)"
                  strokeWidth={performanceTier === 'low' ? '0.85' : '1.05'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  filter={useRouteGlowFilter ? `url(#${filterGlowId})` : undefined}
                  opacity={showRasterLayer ? 0.95 : 0.88}
                  style={{ pointerEvents: 'none' }}
                />
              ) : null}

              {showVectorRelief && showCoast && mapArt.coast && mapArt.coast.length > 0
                ? mapArt.coast.map((d, i) => (
                    <path
                      key={`coast-${i}`}
                      d={d}
                      fill="none"
                      stroke="rgb(255 255 255 / 0.22)"
                      strokeWidth="0.35"
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                    />
                  ))
                : null}

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
          </svg>

          <div className="pointer-events-none absolute inset-0 z-[2]">
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

          <div className="absolute inset-0 z-[3]">
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

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] flex justify-between gap-2 p-2">
            <span className="rounded-md bg-[rgb(4_6_12/0.55)] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white/45">
              {showRasterLayer
                ? `${atlasBreakpoint} atlas`
                : performanceTier === 'low'
                  ? 'Vector lite'
                  : performanceTier === 'mid'
                    ? 'Vector balanced'
                    : 'Vector full'}
            </span>
            <span className="rounded-md bg-[rgb(4_6_12/0.55)] px-2 py-1 text-[10px] font-medium text-white/40">
              {overviewLock ? 'Overview' : guidedMode === 'overview' ? 'Selection' : guidedMode}
            </span>
          </div>
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
