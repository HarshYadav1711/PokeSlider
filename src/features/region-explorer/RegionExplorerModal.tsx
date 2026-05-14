import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';

import { useFocusTrap } from '../../a11y/useFocusTrap';
import { usePerformanceTier } from '../../hooks/usePerformanceTier';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { dialogSpringTransition, overlayBackdropTransition } from '../../motion/motionPrefs';
import { APP_FULLSCREEN_MODAL_BACKDROP } from '../../ui/appModalChrome';
import { useRegionExplorerStore } from '../../store/regionExplorerStore';
import { useUiStore } from '../../store/uiStore';
import { loadRegionDefinition, REGION_TABS } from './data/regions';
import type { RegionDefinition } from './data/regionTypes';
import type { RegionHotspot } from './data/regionTypes';
import { RegionExplorerAmbient } from './RegionExplorerAmbient';
import { RegionExplorerPokemonRow } from './RegionExplorerPokemonRow';
import { RegionExplorerScene } from './RegionExplorerScene';
import { RegionExplorerSelector } from './RegionExplorerSelector';
import { buildRegionHotspots } from './regionHotspots';
import { useRegionExplorerPokemon } from './useRegionExplorerPokemon';

export default function RegionExplorerModal() {
  const reduced = usePrefersReducedMotion();
  const performanceTier = usePerformanceTier();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId().replaceAll(':', '');
  const loreId = useId().replaceAll(':', '');

  const open = useRegionExplorerStore((s) => s.open);
  const setOpen = useRegionExplorerStore((s) => s.setOpen);
  const regionId = useRegionExplorerStore((s) => s.regionId);
  const setRegionId = useRegionExplorerStore((s) => s.setRegionId);
  const routeId = useRegionExplorerStore((s) => s.routeId);
  const setRouteId = useRegionExplorerStore((s) => s.setRouteId);
  const hotspotId = useRegionExplorerStore((s) => s.hotspotId);
  const setHotspotId = useRegionExplorerStore((s) => s.setHotspotId);

  const [region, setRegion] = useState<RegionDefinition | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [timeMood, setTimeMood] = useState<'day' | 'dusk' | 'night'>('day');

  useEffect(() => {
    if (!open) {
      setRegion(null);
      setLoadError(false);
      return;
    }
    let cancelled = false;
    setRegion(null);
    setLoadError(false);
    void loadRegionDefinition(regionId)
      .then((r) => {
        if (!cancelled) setRegion(r);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, regionId]);

  const hotspots = useMemo(() => (region ? buildRegionHotspots(region) : []), [region]);

  useEffect(() => {
    if (!region) return;
    const first = region.routes[0]?.id;
    if (!first) return;
    const valid = Boolean(routeId && region.routes.some((r) => r.id === routeId));
    if (!valid) {
      setRouteId(first);
      const hs = buildRegionHotspots(region);
      const match = hs.find((h) => h.linkedRouteId === first);
      setHotspotId(match?.id ?? `route:${first}`);
    }
  }, [region, regionId, routeId, setRouteId, setHotspotId]);

  const activeRoute = useMemo(() => {
    if (!region) return null;
    const r = region.routes;
    if (r.length === 0) return null;
    if (!routeId) return r[0]!;
    return r.find((x) => x.id === routeId) ?? r[0]!;
  }, [region, routeId]);

  const activeHotspot: RegionHotspot | null = useMemo(() => {
    if (!hotspotId) return null;
    return hotspots.find((h) => h.id === hotspotId) ?? null;
  }, [hotspotId, hotspots]);

  const pokemon = useRegionExplorerPokemon(open, region, activeRoute);

  useFocusTrap({
    active: open,
    containerRef: dialogRef,
    initialFocusSelector: '[data-region-explorer-focus]',
  });

  const shellStyle = useMemo(
    () =>
      region
        ? ({
            '--rex-accent': region.atmosphere.accent,
            '--rex-accent-soft': region.atmosphere.accentSoft,
          } as CSSProperties)
        : undefined,
    [region],
  );

  const handleTimeKey = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setTimeMood((m) => (m === 'day' ? 'dusk' : m === 'dusk' ? 'night' : 'day'));
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setTimeMood((m) => (m === 'night' ? 'dusk' : m === 'dusk' ? 'day' : 'night'));
    }
  }, []);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="region-explorer"
          className={`fixed inset-0 z-[1010] flex items-end justify-center p-3 md:items-center ${APP_FULLSCREEN_MODAL_BACKDROP}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayBackdropTransition(reduced)}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={loreId}
            initial={reduced ? { opacity: 0 } : { y: 36, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 22, opacity: 0, scale: 0.985 }}
            transition={dialogSpringTransition(reduced)}
            style={shellStyle}
            className="relative flex max-h-[min(94dvh,52rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-white/12 text-left text-[#f4f4f8] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {region ? (
              <div
                className="absolute inset-0 -z-10"
                style={{
                  background: `linear-gradient(155deg, ${region.atmosphere.bgFrom} 0%, ${region.atmosphere.bgVia} 46%, ${region.atmosphere.bgTo} 100%)`,
                }}
              />
            ) : (
              <div className="absolute inset-0 -z-10 bg-[rgb(12_16_28)]" />
            )}

            {region ? (
              <RegionExplorerAmbient
                reducedMotion={reduced}
                mistColor={region.atmosphere.mist}
                performanceTier={performanceTier}
              />
            ) : null}

            <header className="relative flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-4 md:px-5">
              <div>
                <p className="text-[var(--text-eyebrow)] font-semibold uppercase tracking-[0.12em] text-white/55">
                  Region explorer
                </p>
                <h2
                  id={titleId}
                  className="text-xl font-bold tracking-tight text-white [font-family:var(--font-display)] md:text-2xl"
                >
                  {region?.name ?? 'Regions'}
                </h2>
                <p className="mt-1 max-w-2xl text-[var(--text-body-sm)] text-white/70">
                  {region?.tagline ?? 'Loading atlas…'}
                </p>
              </div>
              <button
                type="button"
                data-region-explorer-focus
                className="app-focus-ring min-h-11 shrink-0 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </header>

            <RegionExplorerSelector tabs={REGION_TABS} value={regionId} onChange={setRegionId} />

            {region ? (
              <div
                className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 px-4 py-2 md:px-5"
                role="group"
                aria-label="Scene lighting"
                onKeyDown={handleTimeKey}
              >
                <span className="text-[var(--text-eyebrow)] font-semibold uppercase tracking-[0.12em] text-white/45">
                  Mood
                </span>
                {(['day', 'dusk', 'night'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={
                      timeMood === m
                        ? 'app-focus-ring rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-xs font-semibold capitalize text-white/95'
                        : 'app-focus-ring rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold capitalize text-white/70 hover:bg-white/[0.08]'
                    }
                    aria-pressed={timeMood === m}
                    onClick={() => setTimeMood(m)}
                  >
                    {m}
                  </button>
                ))}
                <span className="sr-only">Use left and right arrow keys to cycle mood.</span>
              </div>
            ) : null}

            <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-5">
              {loadError ? (
                <p className="text-[var(--text-body)] text-rose-200/90" role="alert">
                  Could not load this region. Close and try again.
                </p>
              ) : !region ? (
                <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-live="polite">
                  <div className="h-56 animate-pulse rounded-[var(--radius-xl)] bg-white/[0.06]" />
                  <div className="h-56 animate-pulse rounded-[var(--radius-xl)] bg-white/[0.06]" />
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
                  <div className="space-y-4">
                    <RegionExplorerScene
                      region={region}
                      hotspots={hotspots}
                      performanceTier={performanceTier}
                      selectedRouteId={activeRoute?.id ?? null}
                      selectedHotspotId={hotspotId}
                      onSelectRoute={setRouteId}
                      onSelectHotspot={setHotspotId}
                      timeMood={timeMood}
                    />
                    <div className="rounded-[var(--radius-xl)] border border-white/10 bg-[rgb(6_8_14/0.45)] p-4">
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-white/90">Route discovery</h3>
                          <p className="text-[var(--text-body-sm)] text-white/62">
                            {activeRoute ? activeRoute.blurb : 'Select a route to preview encounters.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="app-focus-ring min-h-11 rounded-xl border border-white/14 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-white/88 hover:bg-white/[0.09] disabled:opacity-40"
                          disabled={!activeRoute || pokemon.genLoading}
                          onClick={() => pokemon.reshuffle()}
                        >
                          Shuffle picks
                        </button>
                      </div>
                      <div className="mt-3">
                        <RegionExplorerPokemonRow
                          summaries={pokemon.summaries}
                          loading={pokemon.loadingSummaries || pokemon.genLoading}
                          onOpenPokemon={(id) => {
                            setOpen(false);
                            useUiStore.getState().showPokemon(id);
                          }}
                        />
                      </div>
                      {pokemon.genError ? (
                        <p className="mt-2 text-[var(--text-body-sm)] text-rose-200/90" role="alert">
                          Could not load this generation roster. Try again in a moment.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <article
                      id={loreId}
                      className="rounded-[var(--radius-xl)] border border-white/10 bg-[rgb(6_8_14/0.45)] p-4 md:p-5"
                    >
                      <h3 className="text-sm font-semibold text-white/90">
                        {activeHotspot ? activeHotspot.label : 'Region lore'}
                      </h3>
                      {activeHotspot ? (
                        <div className="mt-2 space-y-2 text-[var(--text-body)] leading-relaxed text-white/78">
                          <p>{activeHotspot.lore}</p>
                          {activeHotspot.progressionTease ? (
                            <p className="text-[var(--text-body-sm)] text-white/65">
                              <span className="font-semibold text-white/80">Progression — </span>
                              {activeHotspot.progressionTease}
                            </p>
                          ) : null}
                          {activeHotspot.habitatTease ? (
                            <p className="text-[var(--text-body-sm)] text-white/65">
                              <span className="font-semibold text-white/80">Habitat — </span>
                              {activeHotspot.habitatTease}
                            </p>
                          ) : null}
                          {activeHotspot.atmosphereTease ? (
                            <p className="text-[var(--text-body-sm)] text-white/65">
                              <span className="font-semibold text-white/80">Atmosphere — </span>
                              {activeHotspot.atmosphereTease}
                            </p>
                          ) : null}
                          {activeHotspot.weatherHint ? (
                            <p className="text-[var(--text-body-sm)] text-white/65">
                              <span className="font-semibold text-white/80">Weather — </span>
                              {activeHotspot.weatherHint}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="mt-2 text-[var(--text-body)] leading-relaxed text-white/78">{region.lore}</p>
                      )}
                    </article>

                    <section className="rounded-[var(--radius-xl)] border border-white/10 bg-[rgb(6_8_14/0.45)] p-4 md:p-5">
                      <h3 className="text-sm font-semibold text-white/90">Habitat previews</h3>
                      <ul className="mt-3 space-y-3">
                        {region.habitats.map((h) => (
                          <li
                            key={h.title}
                            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5"
                          >
                            <p className="text-sm font-semibold text-white/88">{h.title}</p>
                            <p className="mt-1 text-[var(--text-body-sm)] text-white/65">{h.tease}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
