import type { RegionId, RegionRoute } from './data/regionTypes';

/**
 * Smooth corridor through ordered route anchors (Catmull-Rom → cubic Bézier).
 * Keeps polyline order for narrative flow without jagged zig-zags.
 */
export function buildSmoothedRoutePath(routes: readonly RegionRoute[]): string | null {
  if (routes.length < 2) return null;
  const pts = routes.map((r) => r.map);
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[Math.max(0, i - 1)]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[Math.min(pts.length - 1, i + 2)]!;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

/**
 * Stylized land silhouettes (normalized viewBox 0 0 100 60).
 * Kept as lightweight paths — no raster, no filters.
 */
export const REGION_SILHOUETTES: Record<RegionId, string> = {
  kanto:
    'M8 44 C16 20, 34 14, 54 18 C74 22, 92 30, 94 46 C88 56, 64 58, 42 54 C24 50, 10 50, 8 44 Z',
  johto:
    'M10 40 C22 16, 48 12, 62 20 C80 28, 92 36, 90 50 C84 58, 52 56, 34 50 C18 46, 8 48, 10 40 Z',
  hoenn:
    'M6 46 C20 18, 46 10, 66 16 C86 24, 96 34, 92 48 C86 58, 58 56, 36 52 C18 48, 4 52, 6 46 Z',
  sinnoh:
    'M12 48 C24 22, 50 14, 70 20 C88 28, 96 38, 90 52 C82 58, 54 56, 32 50 C16 46, 8 48, 12 48 Z',
  unova:
    'M4 42 C18 18, 44 12, 72 18 C90 26, 96 40, 88 52 C78 58, 48 56, 26 50 C12 46, 2 48, 4 42 Z',
  kalos:
    'M8 46 C22 20, 48 12, 68 18 C88 26, 94 38, 88 50 C80 58, 52 56, 30 50 C14 46, 6 48, 8 46 Z',
  alola:
    'M18 52 C28 28, 44 22, 58 26 C74 32, 86 40, 84 52 C78 58, 48 56, 32 52 C22 50, 14 52, 18 52 Z',
  galar:
    'M6 44 C20 18, 48 12, 70 18 C90 26, 96 40, 90 52 C82 58, 50 56, 28 50 C12 46, 4 48, 6 44 Z',
  paldea:
    'M8 46 C22 20, 50 12, 72 20 C90 30, 96 42, 88 54 C78 60, 48 58, 28 52 C12 48, 4 50, 8 46 Z',
};

export function buildRouteNetworkPath(routes: readonly RegionRoute[]): string | null {
  if (routes.length === 0) return null;
  const first = routes[0]!;
  let d = `M ${first.map.x} ${first.map.y}`;
  for (let i = 1; i < routes.length; i++) {
    const p = routes[i]!.map;
    d += ` L ${p.x} ${p.y}`;
  }
  return d;
}
