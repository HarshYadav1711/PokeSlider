import type { RegionDefinition, RegionHotspot } from './data/regionTypes';

import { REGION_LANDMARK_HOTSPOTS } from './regionLandmarks';

/**
 * Cities / gyms / story beats take precedence over a duplicate route pin
 * when they declare the same linked route id.
 */
export function buildRegionHotspots(region: RegionDefinition): readonly RegionHotspot[] {
  const extras = REGION_LANDMARK_HOTSPOTS[region.id] ?? [];
  const claimedRoutes = new Set(
    extras.map((h) => h.linkedRouteId).filter((x): x is string => Boolean(x)),
  );

  const out: RegionHotspot[] = [...extras];

  for (const r of region.routes) {
    if (claimedRoutes.has(r.id)) continue;
    out.push({
      id: `route:${r.id}`,
      kind: 'route',
      label: r.name,
      map: r.map,
      lore: r.blurb,
      linkedRouteId: r.id,
      progressionTease: 'Follow this corridor to bias encounter pulls toward this stretch of the map.',
      habitatTease: 'Habitats shift with elevation, season, and water — previews stay curated, not exhaustive.',
    });
  }

  return out;
}
