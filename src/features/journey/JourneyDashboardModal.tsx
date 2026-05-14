import { AnimatePresence, motion } from 'motion/react';
import { useId, useMemo, useRef } from 'react';

import { useFocusTrap } from '../../a11y/useFocusTrap';
import { JOURNEY_ACHIEVEMENTS } from './journeyAchievementCatalog';
import type { JourneyAchievementTier } from './journeyAchievementTypes';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { dialogSpringTransition, overlayBackdropTransition } from '../../motion/motionPrefs';
import { APP_FULLSCREEN_MODAL_BACKDROP } from '../../ui/appModalChrome';
import { useJourneyProgressStore } from '../../store/journeyProgressStore';
import { useJourneyTrainerStore } from '../../store/journeyTrainerStore';
import { useJourneyUiStore } from '../../store/journeyUiStore';
import { journeyPokemonSpriteUrl } from './journeySpriteUrl';
import { TrainerCard } from './TrainerCard';

function tierRing(tier: JourneyAchievementTier): string {
  switch (tier) {
    case 'rare':
      return 'border-amber-400/35 shadow-[0_0_0_1px_rgb(251_191_36/0.12)]';
    case 'notable':
      return 'border-indigo-400/40';
    default:
      return 'border-white/12';
  }
}

export function JourneyDashboardModal() {
  const reduced = usePrefersReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId().replaceAll(':', '');

  const open = useJourneyUiStore((s) => s.dashboardOpen);
  const setDashboardOpen = useJourneyUiStore((s) => s.setDashboardOpen);
  const openOnboarding = useJourneyUiStore((s) => s.openOnboarding);

  const displayName = useJourneyTrainerStore((s) => s.displayName);
  const starterPokemonId = useJourneyTrainerStore((s) => s.starterPokemonId);
  const favoriteRegionKey = useJourneyTrainerStore((s) => s.favoriteRegionKey);
  const onboardingComplete = useJourneyTrainerStore((s) => s.onboardingComplete);

  const discoveredIds = useJourneyProgressStore((s) => s.discoveredIds);
  const favoriteEvents = useJourneyProgressStore((s) => s.favoriteEvents);
  const teamSnapshots = useJourneyProgressStore((s) => s.teamSnapshots);
  const compareSessionsCount = useJourneyProgressStore((s) => s.compareSessionsCount);
  const unlockedAchievementIds = useJourneyProgressStore((s) => s.unlockedAchievementIds);

  const unlockedSet = useMemo(() => new Set(unlockedAchievementIds), [unlockedAchievementIds]);

  useFocusTrap({
    active: open,
    containerRef: dialogRef,
    initialFocusSelector: '[data-journey-dash-focus]',
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="journey-dash"
          className={`fixed inset-0 z-[1011] flex items-end justify-center p-3 md:items-center ${APP_FULLSCREEN_MODAL_BACKDROP}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayBackdropTransition(reduced)}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDashboardOpen(false);
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={reduced ? { opacity: 0 } : { y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 24, opacity: 0, scale: 0.98 }}
            transition={dialogSpringTransition(reduced)}
            className="flex max-h-[min(92dvh,52rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-white/12 bg-[rgb(8_10_18/0.97)] text-left text-[#f4f4f8] shadow-2xl"
            style={{ boxShadow: 'var(--shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[var(--text-eyebrow)] font-semibold uppercase tracking-[0.12em] text-indigo-200/80">
                  Journey
                </p>
                <h2 id={titleId} className="text-xl font-bold tracking-tight text-white [font-family:var(--font-display)]">
                  Dashboard
                </h2>
                <p className="mt-1 max-w-lg text-[var(--text-body-sm)] text-white/70">
                  Your private trainer log — discoveries, favorites, teams, and quiet milestones.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                {onboardingComplete ? (
                  <button
                    type="button"
                    className="app-focus-ring min-h-11 rounded-xl border border-white/14 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
                    onClick={() => {
                      setDashboardOpen(false);
                      openOnboarding({ edit: true });
                    }}
                  >
                    Edit profile
                  </button>
                ) : null}
                <button
                  type="button"
                  data-journey-dash-focus
                  className="app-focus-ring min-h-11 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
                  onClick={() => setDashboardOpen(false)}
                >
                  Close
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div className="space-y-8">
                <TrainerCard
                  displayName={displayName}
                  starterPokemonId={starterPokemonId}
                  favoriteRegionKey={favoriteRegionKey}
                />

                {!onboardingComplete ? (
                  <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-50/95">
                    <p className="font-semibold text-white">Finish your trainer card</p>
                    <p className="mt-1 text-white/75">A name, partner, and region unlock the full journey view.</p>
                    <button
                      type="button"
                      className="app-focus-ring mt-3 min-h-11 rounded-lg border border-amber-400/40 bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-50 hover:bg-amber-500/30"
                      onClick={() => {
                        setDashboardOpen(false);
                        openOnboarding();
                      }}
                    >
                      Continue setup
                    </button>
                  </div>
                ) : null}

                <section aria-labelledby={`${titleId}-stats`}>
                  <h3 id={`${titleId}-stats`} className="text-sm font-bold uppercase tracking-wide text-white/55">
                    Progress
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: 'Discovered', value: discoveredIds.length },
                      { label: 'Favorite moments', value: favoriteEvents.length },
                      { label: 'Comparisons', value: compareSessionsCount },
                      { label: 'Teams saved', value: teamSnapshots.length },
                    ].map((cell) => (
                      <div
                        key={cell.label}
                        className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-center shadow-inner"
                      >
                        <p className="text-2xl font-bold tabular-nums text-white">{cell.value}</p>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/55">{cell.label}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section aria-labelledby={`${titleId}-badges`}>
                  <h3 id={`${titleId}-badges`} className="text-sm font-bold uppercase tracking-wide text-white/55">
                    Achievements
                  </h3>
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                    {JOURNEY_ACHIEVEMENTS.map((a) => {
                      const earned = unlockedSet.has(a.id);
                      return (
                        <li
                          key={a.id}
                          className={[
                            'rounded-xl border bg-black/25 px-4 py-3',
                            tierRing(a.tier),
                            earned ? 'opacity-100' : 'opacity-55',
                          ].join(' ')}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-white">{a.title}</p>
                            <span
                              className={[
                                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                                earned ? 'bg-emerald-500/20 text-emerald-100' : 'bg-white/10 text-white/55',
                              ].join(' ')}
                              aria-label={earned ? 'Earned' : 'Locked'}
                            >
                              {earned ? 'Earned' : 'Locked'}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-white/70">{a.description}</p>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section aria-labelledby={`${titleId}-fav`}>
                  <h3 id={`${titleId}-fav`} className="text-sm font-bold uppercase tracking-wide text-white/55">
                    Favorite history
                  </h3>
                  {favoriteEvents.length === 0 ? (
                    <p className="mt-2 text-sm text-white/60">Star Pokémon in My Dex or the detail panel — each star adds a keepsake here.</p>
                  ) : (
                    <ul className="mt-3 flex flex-wrap gap-2" aria-label="Recent starred Pokémon">
                      {favoriteEvents.slice(0, 24).map((ev) => (
                        <li key={`${ev.pokemonId}-${ev.at}`} className="rounded-lg border border-white/10 bg-white/5 p-1">
                          <img
                            src={journeyPokemonSpriteUrl(ev.pokemonId)}
                            alt=""
                            width={48}
                            height={48}
                            className="object-contain"
                            loading="lazy"
                            decoding="async"
                          />
                          <span className="sr-only">Pokémon {ev.pokemonId}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section aria-labelledby={`${titleId}-teams`}>
                  <h3 id={`${titleId}-teams`} className="text-sm font-bold uppercase tracking-wide text-white/55">
                    Team history
                  </h3>
                  {teamSnapshots.length === 0 ? (
                    <p className="mt-2 text-sm text-white/60">
                      Close Team Builder with six Pokémon locked — the roster is archived automatically.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {teamSnapshots.map((snap, idx) => (
                        <li
                          key={`${snap.savedAt}-${idx}`}
                          className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2"
                        >
                          {snap.ids.map((id) => (
                            <img
                              key={id}
                              src={journeyPokemonSpriteUrl(id)}
                              alt=""
                              width={40}
                              height={40}
                              className="rounded-md bg-white/5 p-0.5"
                              loading="lazy"
                              decoding="async"
                            />
                          ))}
                          <span className="ml-auto text-[11px] font-medium uppercase tracking-wide text-white/45">
                            {new Date(snap.savedAt).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
