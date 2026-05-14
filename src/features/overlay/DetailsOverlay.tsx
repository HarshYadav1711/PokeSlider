import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';

import { useFocusTrap } from '../../a11y/useFocusTrap';
import { POKEBALLS } from '../../data/pokeballs';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { dialogSpringTransition, overlayBackdropTransition } from '../../motion/motionPrefs';
import { APP_FULLSCREEN_MODAL_BACKDROP } from '../../ui/appModalChrome';
import { useUiStore } from '../../store/uiStore';
import { BallDetailPanel } from './BallDetailPanel';
import { PokemonDetailPanel } from './PokemonDetailPanel';

export function DetailsOverlay() {
  const reduced = usePrefersReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayOpen = useUiStore((s) => s.overlayOpen);
  const panel = useUiStore((s) => s.panel);
  const selectedBallId = useUiStore((s) => s.selectedBallId);
  const selectedPokemonId = useUiStore((s) => s.selectedPokemonId);
  const closeOverlay = useUiStore((s) => s.closeOverlay);
  const backToBall = useUiStore((s) => s.backToBall);

  const ball = POKEBALLS.find((b) => b.id === selectedBallId);

  const trapActive = overlayOpen && Boolean(ball);
  useFocusTrap({
    active: trapActive,
    containerRef: dialogRef,
    initialFocusSelector: '[data-overlay-initial-focus]',
  });

  const prevPanelFocusKey = useRef<{ panel: typeof panel; id: typeof selectedPokemonId } | null>(null);
  useEffect(() => {
    if (!trapActive) {
      prevPanelFocusKey.current = null;
      return;
    }
    if (prevPanelFocusKey.current === null) {
      prevPanelFocusKey.current = { panel, id: selectedPokemonId };
      return;
    }
    const prev = prevPanelFocusKey.current;
    const changed = prev.panel !== panel || prev.id !== selectedPokemonId;
    prevPanelFocusKey.current = { panel, id: selectedPokemonId };
    if (!changed) return;
    queueMicrotask(() => {
      dialogRef.current?.querySelector<HTMLElement>('[data-overlay-initial-focus]')?.focus();
    });
  }, [trapActive, panel, selectedPokemonId]);

  return (
    <AnimatePresence>
      {overlayOpen && ball ? (
        <motion.div
          key="overlay"
          className={`fixed inset-0 z-[1000] flex items-center justify-center p-[var(--space-4)] sm:p-[var(--space-6)] ${APP_FULLSCREEN_MODAL_BACKDROP}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayBackdropTransition(reduced)}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeOverlay();
          }}
        >
          <motion.div
            ref={dialogRef}
            initial={reduced ? { opacity: 0 } : { y: 48, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 28, scale: 0.98, opacity: 0 }}
            transition={dialogSpringTransition(reduced)}
            className="app-surface-glass relative max-h-[min(90dvh,920px)] w-full max-w-4xl overflow-y-auto rounded-[var(--radius-3xl)] border border-white/12 p-[var(--space-6)] sm:p-[var(--space-8)] md:max-w-5xl"
            role="dialog"
            aria-modal="true"
            aria-label={panel === 'ball' ? `${ball.name} details` : 'Pokémon details'}
            onClick={(e) => e.stopPropagation()}
          >
            {panel === 'pokemon' ? (
              <button
                type="button"
                className="app-focus-ring absolute left-[var(--space-4)] top-[var(--space-4)] z-[1001] min-h-11 rounded-[var(--radius-pill)] border border-white/18 bg-white/8 px-[var(--space-4)] py-2 text-[var(--text-body-sm)] font-semibold text-white transition-[background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:border-white/28 hover:bg-white/14 active:scale-[0.99] sm:left-[var(--space-6)] sm:top-[var(--space-6)]"
                aria-label={`Back to ${ball.name}`}
                onClick={backToBall}
              >
                ← Back
              </button>
            ) : null}

            {panel === 'ball' ? (
              <>
                <h2
                  tabIndex={-1}
                  data-overlay-initial-focus
                  className="mb-[var(--space-6)] pr-12 text-[var(--text-title)] font-bold leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-white [font-family:var(--font-display)] outline-none sm:pr-14"
                >
                  {ball.name}
                </h2>
                <BallDetailPanel ball={ball} />
              </>
            ) : selectedPokemonId !== null ? (
              <PokemonDetailPanel pokemonId={selectedPokemonId} />
            ) : (
              <p className="text-white/80" role="status">
                Select a Pokémon to view details.
              </p>
            )}

            <button
              type="button"
              className="app-focus-ring absolute right-[var(--space-4)] top-[var(--space-4)] z-[1001] flex size-11 min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-pill)] border border-white/18 bg-white/8 text-xl leading-none text-white transition-[transform,background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:border-white/28 hover:bg-white/14 active:scale-[0.97] sm:right-[var(--space-6)] sm:top-[var(--space-6)]"
              aria-label="Close details dialog"
              onClick={closeOverlay}
            >
              <span aria-hidden>×</span>
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
