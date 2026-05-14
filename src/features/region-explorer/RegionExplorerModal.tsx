import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useMemo, useRef, type CSSProperties } from 'react';

import { useFocusTrap } from '../../a11y/useFocusTrap';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { dialogSpringTransition, overlayBackdropTransition } from '../../motion/motionPrefs';
import { APP_FULLSCREEN_MODAL_BACKDROP } from '../../ui/appModalChrome';
import { useRegionExplorerStore } from '../../store/regionExplorerStore';
import { useUiStore } from '../../store/uiStore';
import { REGIONS, getRegionDefinition } from './data/regions';
import { RegionExplorerAmbient } from './RegionExplorerAmbient';
import { RegionExplorerMap } from './RegionExplorerMap';
import { RegionExplorerPokemonRow } from './RegionExplorerPokemonRow';
import { RegionExplorerSelector } from './RegionExplorerSelector';
import { useRegionExplorerPokemon } from './useRegionExplorerPokemon';

export default function RegionExplorerModal() {
  const reduced = usePrefersReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId().replaceAll(':', '');
  const loreId = useId().replaceAll(':', '');

  const open = useRegionExplorerStore((s) => s.open);
  const setOpen = useRegionExplorerStore((s) => s.setOpen);
  const regionId = useRegionExplorerStore((s) => s.regionId);
  const setRegionId = useRegionExplorerStore((s) => s.setRegionId);
  const routeId = useRegionExplorerStore((s) => s.routeId);
  const setRouteId = useRegionExplorerStore((s) => s.setRouteId);

  const region = useMemo(() => getRegionDefinition(regionId), [regionId]);

  useEffect(() => {
    const first = region.routes[0]?.id;
    if (!first) return;
    if (!routeId || !region.routes.some((r) => r.id === routeId)) {
      setRouteId(first);
    }
  }, [region.routes, regionId, routeId, setRouteId]);

  const activeRoute = useMemo(() => {
    const r = region.routes;
    if (r.length === 0) return null;
    if (!routeId) return r[0]!;
    return r.find((x) => x.id === routeId) ?? r[0]!;
  }, [region.routes, routeId]);

  const pokemon = useRegionExplorerPokemon(open, region, activeRoute);

  useFocusTrap({
    active: open,
    containerRef: dialogRef,
    initialFocusSelector: '[data-region-explorer-focus]',
  });

  const shellStyle = useMemo(
    () =>
      ({
        '--rex-accent': region.atmosphere.accent,
        '--rex-accent-soft': region.atmosphere.accentSoft,
      }) as CSSProperties,
    [region.atmosphere.accent, region.atmosphere.accentSoft],
  );

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
            <div
              className="absolute inset-0 -z-10"
              style={{
                background: `linear-gradient(155deg, ${region.atmosphere.bgFrom} 0%, ${region.atmosphere.bgVia} 46%, ${region.atmosphere.bgTo} 100%)`,
              }}
            />
            <RegionExplorerAmbient reducedMotion={reduced} mistColor={region.atmosphere.mist} />

            <header className="relative flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-4 py-4 md:px-5">
              <div>
                <p className="text-[var(--text-eyebrow)] font-semibold uppercase tracking-[0.12em] text-white/55">
                  Region explorer
                </p>
                <h2
                  id={titleId}
                  className="text-xl font-bold tracking-tight text-white [font-family:var(--font-display)] md:text-2xl"
                >
                  {region.name}
                </h2>
                <p className="mt-1 max-w-2xl text-[var(--text-body-sm)] text-white/70">{region.tagline}</p>
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

            <RegionExplorerSelector regions={REGIONS} value={regionId} onChange={setRegionId} />

            <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5 md:py-5">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
                <div className="space-y-4">
                  <RegionExplorerMap
                    routes={region.routes}
                    selectedId={activeRoute?.id ?? null}
                    onSelectRoute={setRouteId}
                    regionLabel={region.name}
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
                    <h3 className="text-sm font-semibold text-white/90">Region lore</h3>
                    <p className="mt-2 text-[var(--text-body)] leading-relaxed text-white/78">{region.lore}</p>
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
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
