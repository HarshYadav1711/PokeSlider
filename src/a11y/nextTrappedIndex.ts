/** Circular index for focus trap Tab / Shift+Tab without DOM walking in tests. */
export function nextTrappedIndex(currentIndex: number, length: number, backwards: boolean): number {
  if (length <= 0) return 0;
  if (backwards) {
    return currentIndex <= 0 ? length - 1 : currentIndex - 1;
  }
  return currentIndex >= length - 1 ? 0 : currentIndex + 1;
}
