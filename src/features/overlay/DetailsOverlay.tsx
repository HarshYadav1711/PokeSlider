import { AnimatePresence, motion } from 'motion/react';

import { POKEBALLS } from '../../data/pokeballs';
import { useUiStore } from '../../store/uiStore';
import { BallDetailPanel } from './BallDetailPanel';
import { PokemonDetailPanel } from './PokemonDetailPanel';

export function DetailsOverlay() {
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
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/92 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeOverlay();
          }}
        >
          <motion.div
            initial={{ y: 80, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[25px] border-2 border-white/10 bg-gradient-to-br from-[#1e3c72]/95 via-[#2a5298]/95 to-[#533483]/95 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.6)] md:max-w-5xl"
            role="dialog"
            aria-modal
            aria-label={panel === 'ball' ? ball.name : 'Pokémon details'}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-6 top-6 z-[1001] flex size-12 items-center justify-center rounded-full border-2 border-white/30 bg-white/15 text-3xl leading-none text-white transition hover:rotate-90 hover:bg-white/25"
              aria-label="Close"
              onClick={closeOverlay}
            >
              ×
            </button>
            {panel === 'pokemon' ? (
              <button
                type="button"
                className="absolute left-6 top-6 z-[1001] rounded-full border-2 border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
                onClick={backToBall}
              >
                ← Back
              </button>
            ) : null}

            {panel === 'ball' ? (
              <>
                <h2 className="mb-6 pr-14 text-3xl font-bold tracking-wide text-white [font-family:var(--font-display)] md:text-4xl">
                  {ball.name}
                </h2>
                <BallDetailPanel ball={ball} />
              </>
            ) : selectedPokemonId !== null ? (
              <PokemonDetailPanel pokemonId={selectedPokemonId} />
            ) : (
              <p className="text-white/80">Select a Pokémon to view details.</p>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
