/**
 * Neutral IV/EV max HP at level (Gen III+), for local catch simulations without stored EVs.
 */
export function estimateMaxHpAtLevel(baseHp: number, level: number): number {
  const lv = Math.max(1, Math.min(100, Math.floor(level)));
  const hp = Math.max(1, Math.floor(baseHp));
  return Math.floor((2 * hp * lv) / 100) + lv + 10;
}
