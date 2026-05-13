/** 3D carousel uses continuous angle; one ball is "front" when its orbit angle is near 0° (mod 360). */

export function angleStepForCount(ballCount: number): number {
  if (ballCount <= 0) return 360;
  return 360 / ballCount;
}

/** Add rotation delta in degrees (any float). */
export function addRotation(angle: number, delta: number): number {
  return angle + delta;
}

/**
 * Angle such that ball at `index` faces the viewer (same convention as usePokeBallCarousel transforms).
 */
export function angleToSnapIndexToFront(index: number, ballCount: number): number {
  if (ballCount <= 0) return 0;
  const step = angleStepForCount(ballCount);
  const i = ((index % ballCount) + ballCount) % ballCount;
  if (i === 0) return 0;
  return -i * step;
}
