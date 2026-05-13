import type { Transition } from 'motion/react';

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function overlayBackdropTransition(reduced: boolean): Transition {
  if (reduced) return { duration: 0.01 };
  return { duration: 0.22, ease: easeOut };
}

export function dialogSpringTransition(reduced: boolean): Transition {
  if (reduced) return { duration: 0.12, ease: easeOut };
  return { type: 'spring', stiffness: 380, damping: 32, mass: 0.85 };
}

export function sheetSpringTransition(reduced: boolean): Transition {
  if (reduced) return { duration: 0.12, ease: easeOut };
  return { type: 'spring', stiffness: 420, damping: 34 };
}

export function layoutTransition(reduced: boolean): Transition {
  if (reduced) return { duration: 0.01 };
  return { type: 'spring', stiffness: 520, damping: 40 };
}
