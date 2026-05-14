import { motion } from 'motion/react';

import type { PokeBallDefinition } from '../../data/pokeballs';
import { dialogSpringTransition } from '../../motion/motionPrefs';

interface CinematicBallPreviewProps {
  ball: PokeBallDefinition;
  reducedMotion: boolean;
  /** Optional label for SR context */
  label?: string;
}

export function CinematicBallPreview({ ball, reducedMotion, label }: CinematicBallPreviewProps) {
  return (
    <motion.div
      layout
      className="relative mx-auto flex max-w-[220px] flex-col items-center"
      initial={reducedMotion ? false : { opacity: 0.85, scale: 0.94 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={dialogSpringTransition(reducedMotion)}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_50%_30%,rgb(255_255_255/0.22),transparent_55%)] blur-2xl"
        aria-hidden
      />
      <div
        className="relative aspect-square w-full max-w-[200px] rounded-full border border-white/18 bg-gradient-to-b from-white/14 to-white/6 p-6 shadow-[var(--shadow-lg)] [box-shadow:var(--shadow-inset-soft),var(--shadow-lg)] [perspective:900px]"
        aria-label={label ?? `${ball.name} preview`}
      >
        <motion.img
          src={ball.image}
          alt=""
          className="mx-auto size-full max-h-[160px] object-contain drop-shadow-[0_12px_24px_rgb(0_0_0/0.45)]"
          animate={
            reducedMotion
              ? undefined
              : {
                  rotateY: [0, 6, -4, 0],
                  y: [0, -3, 0],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : { duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }
          }
        />
      </div>
      <p className="mt-4 text-center text-[var(--text-body-sm)] font-semibold tracking-wide text-white/80">
        {ball.name}
      </p>
    </motion.div>
  );
}
