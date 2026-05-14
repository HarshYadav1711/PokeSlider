/**
 * Hotspot / route pins use overlay percentages (0–100 for both axes).
 * SVG atlas geometry uses width 0–100 and height 0–60 (5:3 viewBox).
 */
export function overlayPercentToSvg(map: { readonly x: number; readonly y: number }): {
  readonly x: number;
  readonly y: number;
} {
  return { x: map.x, y: (map.y / 100) * 60 };
}
