/**
 * Deterministic sampling for “shuffle discovery” without extra RNG state.
 */

export function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Mulberry32 PRNG from seed. */
function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededSampleUniqueIds(
  pool: readonly number[],
  count: number,
  seed: string,
): number[] {
  const uniq = [...new Set(pool)];
  if (uniq.length <= count) return uniq.sort((a, b) => a - b);
  const rand = mulberry32(fnv1a32(seed));
  const copy = [...uniq];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, count).sort((a, b) => a - b);
}
