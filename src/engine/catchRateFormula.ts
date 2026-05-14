/**
 * Deterministic catch math inspired by Gen III–IV shake checks (Bulbapedia: modified catch rate + b threshold).
 * Not a perfect port of every modern generation nuance — tuned for explainable UI estimates.
 */

export type CatchStatusMode = 'none' | 'sleep_freeze' | 'other_status';

export function statusMultiplier(mode: CatchStatusMode): number {
  if (mode === 'sleep_freeze') return 2.5;
  if (mode === 'other_status') return 1.5;
  return 1;
}

export interface ModifiedCatchRateInput {
  readonly maxHp: number;
  readonly currentHp: number;
  readonly speciesCatchRate: number;
  /** Ball × situational bonuses (Nest/Timer/Net/…). */
  readonly ballMultiplier: number;
  readonly statusMode: CatchStatusMode;
}

/**
 * Integer modified catch rate `a` before shake checks. At ≥255 (non-master paths), games treat capture as certain.
 */
export function computeModifiedCatchRate(input: ModifiedCatchRateInput): number {
  const maxHp = Math.max(1, Math.floor(input.maxHp));
  const cur = Math.max(1, Math.min(maxHp, Math.floor(input.currentHp)));
  const rate = Math.max(1, Math.min(255, Math.floor(input.speciesCatchRate)));
  const ball = Math.max(0, input.ballMultiplier);
  const status = statusMultiplier(input.statusMode);

  const hpFactor = 3 * maxHp - 2 * cur;
  let a = (hpFactor * rate * ball) / (3 * maxHp);
  a = Math.floor(a * status);
  if (!Number.isFinite(a) || a < 0) return 0;
  return a;
}

/**
 * Shake threshold `b` from modified rate `n` (Gen III–IV style).
 */
export function computeShakeThresholdB(modifiedCatchRate: number): number {
  const n = Math.max(1, Math.min(254, Math.floor(modifiedCatchRate)));
  const inner = 16711680 / n;
  return Math.floor(1048560 / Math.sqrt(Math.sqrt(inner)));
}

/**
 * Approximate probability all four shake checks succeed (common pre–Gen V presentation).
 */
export function catchProbabilityFourShakes(modifiedCatchRate: number, isMasterBall: boolean): number {
  if (isMasterBall) return 1;
  if (modifiedCatchRate >= 255) return 1;
  const b = Math.min(65535, computeShakeThresholdB(modifiedCatchRate));
  const p = b / 65536;
  return p * p * p * p;
}

export function expectedBallsToCatch(probabilityOneThrow: number): number {
  if (probabilityOneThrow >= 1) return 1;
  if (probabilityOneThrow <= 0) return Number.POSITIVE_INFINITY;
  return 1 / probabilityOneThrow;
}
