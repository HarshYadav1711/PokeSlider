/** Persists carousel orbit angle across unmount/remount when leaving full-screen experiences. */
let lastCarouselAngleDeg = 0;

export function takeInitialCarouselAngle(): number {
  return lastCarouselAngleDeg;
}

export function persistCarouselAngle(degrees: number): void {
  lastCarouselAngleDeg = degrees;
}
