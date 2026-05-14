import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { useFocusTrap } from '../../a11y/useFocusTrap';
import { JOURNEY_REGIONS } from '../../data/journeyRegions';
import { JOURNEY_STARTER_TRIPLETS } from '../../data/journeyStarters';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { dialogSpringTransition, overlayBackdropTransition } from '../../motion/motionPrefs';
import { APP_FULLSCREEN_MODAL_BACKDROP } from '../../ui/appModalChrome';
import { useJourneyTrainerStore } from '../../store/journeyTrainerStore';
import { useJourneyUiStore } from '../../store/journeyUiStore';
import { journeyPokemonSpriteUrl } from './journeySpriteUrl';

const STEPS = ['Name', 'Partner', 'Region', 'Review'] as const;

export function JourneyOnboardingDialog() {
  const reduced = usePrefersReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId().replaceAll(':', '');
  const descId = `${titleId}-desc`;

  const open = useJourneyUiStore((s) => s.onboardingOpen);
  const editMode = useJourneyUiStore((s) => s.onboardingEditMode);
  const setOnboardingOpen = useJourneyUiStore((s) => s.setOnboardingOpen);

  const completeOnboarding = useJourneyTrainerStore((s) => s.completeOnboarding);
  const updateTrainerProfile = useJourneyTrainerStore((s) => s.updateTrainerProfile);
  const deferOnboarding = useJourneyTrainerStore((s) => s.deferOnboarding);
  const onboardingComplete = useJourneyTrainerStore((s) => s.onboardingComplete);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [starterId, setStarterId] = useState<number | null>(null);
  const [regionKey, setRegionKey] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const tr = useJourneyTrainerStore.getState();
    if (editMode) {
      setName(tr.displayName);
      setStarterId(tr.starterPokemonId);
      setRegionKey(tr.favoriteRegionKey);
    } else {
      setName(tr.onboardingComplete ? tr.displayName : '');
      setStarterId(tr.onboardingComplete ? tr.starterPokemonId : null);
      setRegionKey(tr.onboardingComplete ? tr.favoriteRegionKey : null);
    }
    setStep(0);
  }, [open, editMode]);

  useFocusTrap({
    active: open,
    containerRef: dialogRef,
    initialFocusSelector: '[data-journey-onboard-focus]',
  });

  const canNext = useMemo(() => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return starterId !== null;
    if (step === 2) return regionKey !== null;
    return true;
  }, [step, name, starterId, regionKey]);

  function handlePrimary() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    if (starterId === null || regionKey === null) return;
    const payload = {
      displayName: name.trim(),
      starterPokemonId: starterId,
      favoriteRegionKey: regionKey,
    };
    if (editMode) {
      updateTrainerProfile(payload);
    } else {
      completeOnboarding(payload);
    }
    setOnboardingOpen(false);
  }

  function handleLater() {
    if (!editMode && !onboardingComplete) {
      deferOnboarding();
    }
    setOnboardingOpen(false);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="journey-onboard"
          className={`fixed inset-0 z-[1012] flex items-end justify-center p-3 md:items-center ${APP_FULLSCREEN_MODAL_BACKDROP}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayBackdropTransition(reduced)}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleLater();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            initial={reduced ? { opacity: 0 } : { y: 36, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 20, opacity: 0, scale: 0.98 }}
            transition={dialogSpringTransition(reduced)}
            className="flex max-h-[min(92dvh,44rem)] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-white/12 bg-[rgb(8_10_18/0.97)] text-left text-[#f4f4f8] shadow-2xl"
            style={{ boxShadow: 'var(--shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="shrink-0 border-b border-white/10 px-5 py-4">
              <p className="text-[var(--text-eyebrow)] font-semibold uppercase tracking-[0.12em] text-indigo-200/80">
                {editMode ? 'Profile' : 'Welcome'}
              </p>
              <h2 id={titleId} className="mt-1 text-xl font-bold tracking-tight text-white [font-family:var(--font-display)]">
                {editMode ? 'Refine your trainer card' : 'Begin your journey'}
              </h2>
              <p id={descId} className="mt-2 text-[var(--text-body-sm)] leading-relaxed text-white/70">
                {editMode
                  ? 'Update how you appear on your card. Nothing leaves this browser.'
                  : 'A gentle, local trainer profile — discoveries and milestones collect here over time.'}
              </p>
              <ol className="mt-4 flex gap-2" aria-label="Onboarding progress">
                {STEPS.map((label, i) => (
                  <li key={label} className="flex-1">
                    <div
                      className={[
                        'h-1 rounded-full transition-colors duration-[var(--duration-fast)]',
                        i <= step ? 'bg-indigo-400/80' : 'bg-white/10',
                      ].join(' ')}
                      title={label}
                    />
                    <span className="sr-only">
                      {label}
                      {i < step ? ' completed' : i === step ? ' current' : ''}
                    </span>
                  </li>
                ))}
              </ol>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={step}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, x: -10 }}
                  transition={{ duration: reduced ? 0.01 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  {step === 0 ? (
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-white" htmlFor={`${titleId}-name`}>
                        Trainer name
                      </label>
                      <input
                        id={`${titleId}-name`}
                        data-journey-onboard-focus
                        maxLength={24}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="nickname"
                        className="app-focus-ring w-full rounded-xl border border-white/14 bg-black/30 px-4 py-3 text-[var(--text-body)] text-white outline-none placeholder:text-white/35"
                        placeholder="e.g. Lyra"
                      />
                      <p className="text-xs text-white/55">Shown on your trainer card. Max 24 characters.</p>
                    </div>
                  ) : null}

                  {step === 1 ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-white">Choose a partner Pokémon</p>
                      <p className="text-xs text-white/60">Classic starters — you can still explore every species in My Dex.</p>
                      <div className="grid max-h-[min(52vh,22rem)] gap-3 overflow-y-auto pr-1 sm:max-h-[min(48vh,20rem)]">
                        {JOURNEY_STARTER_TRIPLETS.map((t) => (
                          <div
                            key={t.generation}
                            className="rounded-xl border border-white/10 bg-black/20 p-3"
                            role="group"
                            aria-label={`Generation ${t.generation} starters`}
                          >
                            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-white/55">
                              Generation {t.generation}
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {[t.grass, t.fire, t.water].map((id) => {
                                const active = starterId === id;
                                return (
                                  <button
                                    key={id}
                                    type="button"
                                    onClick={() => setStarterId(id)}
                                    className={[
                                      'app-focus-ring flex flex-col items-center gap-2 rounded-xl border px-2 py-3 transition-colors',
                                      active
                                        ? 'border-indigo-400/55 bg-indigo-500/20 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]'
                                        : 'border-white/10 bg-white/5 hover:border-white/22 hover:bg-white/10',
                                    ].join(' ')}
                                  >
                                    <img
                                      src={journeyPokemonSpriteUrl(id)}
                                      alt=""
                                      width={72}
                                      height={72}
                                      className="object-contain"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                    <span className="sr-only">National dex #{id}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-white">Favorite region</p>
                      <p className="text-xs text-white/60">Purely for your card — pick what feels like home.</p>
                      <div className="flex flex-wrap gap-2">
                        {JOURNEY_REGIONS.map((r, i) => {
                          const active = regionKey === r.key;
                          return (
                            <button
                              key={r.key}
                              type="button"
                              {...(step === 2 && i === 0 ? { 'data-journey-onboard-focus': '' } : {})}
                              onClick={() => setRegionKey(r.key)}
                              className={[
                                'app-focus-ring min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                                active
                                  ? 'border-indigo-400/55 bg-indigo-500/25 text-white'
                                  : 'border-white/12 bg-white/5 text-white/82 hover:border-white/22 hover:bg-white/10',
                              ].join(' ')}
                            >
                              {r.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {step === 3 ? (
                    <div className="space-y-4 text-sm text-white/78">
                      <p className="font-semibold text-white">Review</p>
                      <ul className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-4 text-[var(--text-body-sm)]">
                        <li>
                          <span className="text-white/55">Name · </span>
                          {name.trim() || '—'}
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="text-white/55">Partner · </span>
                          {starterId !== null ? (
                            <img
                              src={journeyPokemonSpriteUrl(starterId)}
                              alt=""
                              width={40}
                              height={40}
                              className="rounded-lg bg-white/5 p-0.5"
                            />
                          ) : (
                            '—'
                          )}
                          <span className="text-white/70">#{starterId ?? '—'}</span>
                        </li>
                        <li>
                          <span className="text-white/55">Region · </span>
                          {JOURNEY_REGIONS.find((x) => x.key === regionKey)?.label ?? '—'}
                        </li>
                      </ul>
                      <p className="text-xs leading-relaxed text-white/55">
                        Progress, badges, and history stay in local storage on this device only.
                      </p>
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-white/10 px-5 py-4">
              {!editMode ? (
                <button
                  type="button"
                  className="app-focus-ring mr-auto min-h-11 rounded-xl px-3 text-sm font-semibold text-white/65 hover:text-white/90"
                  onClick={handleLater}
                >
                  Maybe later
                </button>
              ) : (
                <button
                  type="button"
                  className="app-focus-ring mr-auto min-h-11 rounded-xl px-3 text-sm font-semibold text-white/65 hover:text-white/90"
                  onClick={() => setOnboardingOpen(false)}
                >
                  Cancel
                </button>
              )}
              {step > 0 ? (
                <button
                  type="button"
                  className="app-focus-ring min-h-11 rounded-xl border border-white/14 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  Back
                </button>
              ) : null}
              <button
                type="button"
                disabled={!canNext}
                className="app-focus-ring min-h-11 rounded-xl border border-indigo-400/40 bg-indigo-500/25 px-4 py-2 text-sm font-semibold text-indigo-50 shadow-[var(--shadow-sm)] hover:bg-indigo-500/35 disabled:pointer-events-none disabled:opacity-40"
                onClick={handlePrimary}
              >
                {step === STEPS.length - 1 ? (editMode ? 'Save changes' : 'Start journey') : 'Continue'}
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
