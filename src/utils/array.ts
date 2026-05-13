/** Fisher–Yates shuffle (copy) */
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j]!;
    copy[j] = tmp!;
  }
  return copy;
}

/** Deterministic shuffle so ball grids stay stable while a query remains fresh. */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  let h = 2166136261;
  for (let k = 0; k < seed.length; k += 1) {
    h = Math.imul(h ^ seed.charCodeAt(k), 16777619);
  }
  let state = h >>> 0;
  const rnd = () => {
    state = Math.imul(state ^ (state >>> 15), state | 1);
    state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
    return (state >>> 0) / 0xffffffff;
  };
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j]!;
    copy[j] = tmp!;
  }
  return copy;
}

export function takeUnique<T>(items: readonly T[], count: number): T[] {
  const out: T[] = [];
  for (const item of items) {
    if (out.length >= count) break;
    out.push(item);
  }
  return out;
}
