import type { RegionDefinition } from '../regionTypes';

export const SINNOH: RegionDefinition = {
  id: 'sinnoh',
  name: 'Sinnoh',
  generation: 4,
  tagline: 'Mythic peaks and diamond-bright cold',
  lore: 'Sinnoh’s geography reads like a thesis on time and space—mountains that scrape clouds, lakes with quiet legends, and towns that respect winter. Routes tighten near snowline; discovery feels deliberate.',
  atmosphere: {
    bgFrom: 'rgb(20 24 40)',
    bgVia: 'rgb(36 40 64)',
    bgTo: 'rgb(14 18 34)',
    accent: 'rgb(196 181 253)',
    accentSoft: 'rgb(221 214 254)',
    mist: 'rgb(139 92 246 / 0.1)',
  },
  habitats: [
    { title: 'Boreal forest', tease: 'Needle litter and pale light—tracks vanish under fresh snow.' },
    { title: 'Marsh boards', tease: 'Fog clings to planks; cries feel close but directionless.' },
    { title: 'Oreburgh tunnels', tease: 'Coal dust, headlamps, and the rumble of carts below grade.' },
  ],
  routes: [
    {
      id: 'sinnoh-route-201',
      name: 'Route 201',
      map: { x: 28, y: 78 },
      blurb: 'Twinleaf’s doorstep—wide sky, soft wind, and your first footprints east.',
      encounterSampleIds: [396, 399, 401, 403],
    },
    {
      id: 'sinnoh-eterna-forest',
      name: 'Eterna Forest',
      map: { x: 36, y: 52 },
      blurb: 'Old growth and mossy quiet—moonlight would feel at home here.',
      encounterSampleIds: [415, 417, 421, 426],
    },
    {
      id: 'sinnoh-route-216',
      name: 'Route 216',
      map: { x: 54, y: 34 },
      blurb: 'Blizzard curtains and slow climbs—every step costs warmth.',
      encounterSampleIds: [459, 460, 471, 478],
    },
    {
      id: 'sinnoh-wayward-cave',
      name: 'Wayward Cave',
      map: { x: 44, y: 62 },
      blurb: 'Pitch black without flash; bike grooves echo off unseen walls.',
      encounterSampleIds: [443, 444, 449, 472],
    },
    {
      id: 'sinnoh-sendoff-spring',
      name: 'Sendoff Spring',
      map: { x: 72, y: 48 },
      blurb: 'A hushed bowl of water and story—legend-grade stillness.',
      encounterSampleIds: [425, 426, 429, 442],
    },
    {
      id: 'sinnoh-victory-road-sinnoh',
      name: 'Victory Road',
      map: { x: 62, y: 16 },
      blurb: 'Waterfalls and boulder gates—the League’s silhouette at the exit.',
      encounterSampleIds: [448, 452, 464, 475],
    },
  ],
};
