/**
 * Maps thematic region keys (aligned with `JOURNEY_REGIONS`) to main-series generation ids.
 * `any` / unknown keys → null (no filter).
 */
export function regionKeysToGenerationIds(keys: readonly string[]): number[] | null {
  const gens = new Set<number>();
  for (const k of keys) {
    if (k === 'any' || !k) continue;
    const g = REGION_TO_GEN[k];
    if (g) gens.add(g);
  }
  if (gens.size === 0) return null;
  return [...gens].sort((a, b) => a - b);
}

const REGION_TO_GEN: Readonly<Record<string, number>> = {
  kanto: 1,
  johto: 2,
  hoenn: 3,
  sinnoh: 4,
  unova: 5,
  kalos: 6,
  alola: 7,
  galar: 8,
  paldea: 9,
};
