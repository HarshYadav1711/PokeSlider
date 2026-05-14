import { describe, expect, it } from 'vitest';

import { computeGuidedViewBox, inferGuidedFocusMode, viewBoxOverview } from './regionGuidedZoom';
import { overlayPercentToSvg } from './regionSvgCoords';

describe('overlayPercentToSvg', () => {
  it('maps overlay y percent into 0–60 svg vertical space', () => {
    expect(overlayPercentToSvg({ x: 50, y: 50 })).toEqual({ x: 50, y: 30 });
    expect(overlayPercentToSvg({ x: 0, y: 100 })).toEqual({ x: 0, y: 60 });
  });
});

describe('regionGuidedZoom', () => {
  it('overview is full atlas frame', () => {
    expect(viewBoxOverview()).toEqual({ minX: 0, minY: 0, width: 100, height: 60 });
  });

  it('clamps guided frames inside the viewBox', () => {
    const topLeft = computeGuidedViewBox('landmark', { x: 2, y: 4 });
    expect(topLeft.minX).toBeGreaterThanOrEqual(0);
    expect(topLeft.minY).toBeGreaterThanOrEqual(0);
    expect(topLeft.minX + topLeft.width).toBeLessThanOrEqual(100);
    expect(topLeft.minY + topLeft.height).toBeLessThanOrEqual(60);

    const bottomRight = computeGuidedViewBox('city', { x: 99, y: 99 });
    expect(bottomRight.minX + bottomRight.width).toBeLessThanOrEqual(100);
    expect(bottomRight.minY + bottomRight.height).toBeLessThanOrEqual(60);
  });

  it('infers route vs city vs landmark focus modes', () => {
    expect(inferGuidedFocusMode(null)).toBe('overview');
    expect(
      inferGuidedFocusMode({
        id: 'r',
        kind: 'route',
        label: 'Route',
        map: { x: 1, y: 1 },
        lore: '',
      }),
    ).toBe('route');
    expect(
      inferGuidedFocusMode({
        id: 'c',
        kind: 'city',
        label: 'City',
        map: { x: 50, y: 50 },
        lore: '',
      }),
    ).toBe('city');
    expect(
      inferGuidedFocusMode({
        id: 'g',
        kind: 'gym',
        label: 'Gym',
        map: { x: 50, y: 50 },
        lore: '',
      }),
    ).toBe('landmark');
  });
});
