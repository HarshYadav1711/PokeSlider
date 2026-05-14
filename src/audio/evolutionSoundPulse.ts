let pulseStartMs = 0;
const FADE_MS = 3200;

export function triggerEvolutionSoundPulse(): void {
  pulseStartMs = performance.now();
}

/** 0 = idle, 1 = just pulsed, eases out over a few seconds. */
export function evolutionPulseLinear01(nowMs = performance.now()): number {
  if (!pulseStartMs) return 0;
  const age = nowMs - pulseStartMs;
  if (age >= FADE_MS) return 0;
  const t = 1 - age / FADE_MS;
  return t * t;
}
