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

export function takeUnique<T>(items: readonly T[], count: number): T[] {
  const out: T[] = [];
  for (const item of items) {
    if (out.length >= count) break;
    out.push(item);
  }
  return out;
}
