import { AnimatePresence, motion } from 'motion/react';

import { POKEBALLS } from '../../data/pokeballs';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { dialogSpringTransition, overlayBackdropTransition } from '../../motion/motionPrefs';
import { useUiStore } from '../../store/uiStore';
import { BallDetailPanel } from './BallDetailPanel';
import { PokemonDetailPanel } from './PokemonDetailPanel';

export function DetailsOverlay() {
  const reduced = usePrefersReducedMotion();
  const overlayOpen = useUiStore((s) => s.overlayOpen);
  const panel = useUiStore((s) => s.panel);
  const selectedBallId = useUiStore((s) => s.selectedBallId);
  const selectedPokemonId = useUiStore((s) => s.selectedPokemonId);
  const closeOverlay = useUiStore((s) => s.closeOverlay);
  const backToBall = useUiStore((s) => s.backToBall);

  const ball = POKEBALLS.find((b) => b.id === selectedBallId);

  return (
    <AnimatePresence>
      {overlayOpen && ball ? (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgb(4_6_12/0.88)] p-[var(--space-4)] backdrop-blur-[var(--blur-overlay)] sm:p-[var(--space-6)]"
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
            initial={reduced ? { opacity: 0 } : { y: 48, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 28, scale: 0.98, opacity: 0 }}
            transition={dialogSpringTransition(reduced)}
            className="app-surface-glass relative max-h-[min(90dvh,920px)] w-full max-w-4xl overflow-y-auto rounded-[var(--radius-3xl)] border border-white/12 p-[var(--space-6)] sm:p-[var(--space-8)] md:max-w-5xl"
            role="dialog"
            aria-modal
            aria-label={panel === 'ball' ? ball.name : 'Pokémon details'}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="app-focus-ring absolute right-[var(--space-4)] top-[var(--space-4)] z-[1001] flex size-11 items-center justify-center rounded-[var(--radius-pill)] border border-white/18 bg-white/8 text-xl leading-none text-white transition-[transform,background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:border-white/28 hover:bg-white/14 active:scale-[0.97] sm:right-[var(--space-6)] sm:top-[var(--space-6)]"
              aria-label="Close"
              onClick={closeOverlay}
            >
              ×
            </button>
            {panel === 'pokemon' ? (
              <button
                type="button"
                className="app-focus-ring absolute left-[var(--space-4)] top-[var(--space-4)] z-[1001] rounded-[var(--radius-pill)] border border-white/18 bg-white/8 px-[var(--space-4)] py-2 text-[var(--text-body-sm)] font-semibold text-white transition-[background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:border-white/28 hover:bg-white/14 active:scale-[0.99] sm:left-[var(--space-6)] sm:top-[var(--space-6)]"
                onClick={backToBall}
              >
                ← Back
              </button>
            ) : null}

            {panel === 'ball' ? (
              <>
                <h2 className="mb-[var(--space-6)] pr-12 text-[var(--text-title)] font-bold leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-white [font-family:var(--font-display)] sm:pr-14">
                  {ball.name}
                </h2>
                <BallDetailPanel ball={ball} />
              </>
            ) : selectedPokemonId !== null ? (
              <PokemonDetailPanel pokemonId={selectedPokemonId} />
            ) : (
              <p className="text-white/75">Select a Pokémon to view details.</p>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
