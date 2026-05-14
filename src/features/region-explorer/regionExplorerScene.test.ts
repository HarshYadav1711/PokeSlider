import { describe, expect, it } from 'vitest';

import { resolveRegionMapArt } from './data/regionLayerAtlas';
import { KANTO } from './data/regions/kanto';
import { ALOLA } from './data/regions/alola';
import { buildRegionHotspots } from './regionHotspots';
import { buildRouteNetworkPath, buildSmoothedRoutePath, REGION_SILHOUETTES } from './regionSceneGeometry';

describe('regionSceneGeometry', () => {
  it('buildRouteNetworkPath joins route order', () => {
    const d = buildRouteNetworkPath(KANTO.routes);
    expect(d).toContain('M');
    expect(d).toContain('L');
  });

  it('buildSmoothedRoutePath uses cubic segments for multi-point routes', () => {
    const d = buildSmoothedRoutePath(KANTO.routes);
    expect(d).toContain('M');
    expect(d).toContain('C');
  });

  it('has a silhouette per canonical region id', () => {
    expect(REGION_SILHOUETTES.kanto.length).toBeGreaterThan(20);
    expect(REGION_SILHOUETTES.paldea.startsWith('M')).toBe(true);
  });
});

describe('regionLayerAtlas', () => {
  it('resolves layered art for every region', () => {
    const kantoArt = resolveRegionMapArt(KANTO);
    expect(kantoArt.terrain.length).toBeGreaterThan(0);
    expect(kantoArt.water.length).toBeGreaterThan(0);

    const alolaArt = resolveRegionMapArt(ALOLA);
    expect((alolaArt.islands?.length ?? 0) + alolaArt.terrain.length).toBeGreaterThan(0);
  });
});

describe('buildRegionHotspots', () => {
  it('dedupes route pins when a landmark claims the same linked route', () => {
    const hs = buildRegionHotspots(KANTO);
    const routePins = hs.filter((h) => h.kind === 'route' && h.linkedRouteId === 'kanto-route-1');
    expect(routePins.length).toBe(0);
    const pallet = hs.find((h) => h.id === 'kanto-pallet');
    expect(pallet?.linkedRouteId).toBe('kanto-route-1');
  });
});
