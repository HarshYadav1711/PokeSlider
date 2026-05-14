import type { RegionHotspot, RegionHotspotKind } from './data/regionTypes';
import { overlayPercentToSvg } from './regionSvgCoords';

export type GuidedFocusMode = 'overview' | 'city' | 'route' | 'landmark';

export interface GuidedViewBox {
  readonly minX: number;
  readonly minY: number;
  readonly width: number;
  readonly height: number;
}

const VB_W = 100;
const VB_H = 60;

const FRAME: Record<Exclude<GuidedFocusMode, 'overview'>, { w: number; h: number }> = {
  route: { w: 62, h: 37.2 },
  city: { w: 48, h: 28.8 },
  landmark: { w: 38, h: 22.8 },
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function viewBoxOverview(): GuidedViewBox {
  return { minX: 0, minY: 0, width: VB_W, height: VB_H };
}

export function computeGuidedViewBox(mode: GuidedFocusMode, focusOverlay: { x: number; y: number } | null): GuidedViewBox {
  if (mode === 'overview' || !focusOverlay) return viewBoxOverview();

  const p = overlayPercentToSvg(focusOverlay);
  const { w, h } = FRAME[mode];
  const minX = clamp(p.x - w / 2, 0, VB_W - w);
  const minY = clamp(p.y - h / 2, 0, VB_H - h);
  return { minX, minY, width: w, height: h };
}

export function inferGuidedFocusMode(hotspot: RegionHotspot | null): GuidedFocusMode {
  if (!hotspot) return 'overview';
  const k: RegionHotspotKind = hotspot.kind;
  if (k === 'route') return 'route';
  if (k === 'city' || k === 'island') return 'city';
  return 'landmark';
}
