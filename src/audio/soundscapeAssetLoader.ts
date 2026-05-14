/**
 * Optional decoded loops for future file-based beds (lazy `fetch` + `decodeAudioData`).
 * Not wired into the procedural engine yet — keeps bundle free of audio assets.
 */
const cache = new Map<string, Promise<AudioBuffer | null>>();

export function loadAmbientBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
  let pending = cache.get(url);
  if (!pending) {
    pending = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const raw = await res.arrayBuffer();
        const copy = raw.slice(0);
        return await ctx.decodeAudioData(copy);
      } catch {
        return null;
      }
    })();
    cache.set(url, pending);
  }
  return pending;
}

export function clearAmbientBufferCache(): void {
  cache.clear();
}
