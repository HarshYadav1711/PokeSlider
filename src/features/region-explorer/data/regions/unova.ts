import type { RegionDefinition } from '../regionTypes';

export const UNOVA: RegionDefinition = {
  id: 'unova',
  name: 'Unova',
  generation: 5,
  tagline: 'Urban sprawl meets stark wilds',
  lore: 'Unova contrasts glass towers with ruined castles and desert bridges. Routes double as statements—bridges of light, storm-washed beaches, and industrial edges where nature pushes back.',
  atmosphere: {
    bgFrom: 'rgb(24 20 36)',
    bgVia: 'rgb(40 32 56)',
    bgTo: 'rgb(16 14 28)',
    accent: 'rgb(251 191 36)',
    accentSoft: 'rgb(253 224 71)',
    mist: 'rgb(244 114 182 / 0.08)',
  },
  habitats: [
    { title: 'Skyarrow shade', tease: 'Giant shadows sweep the water as wings pass overhead.' },
    { title: 'Desert resort', tease: 'Heat shimmer and buried relics—patience rewards the curious.' },
    { title: 'P2 Laboratory pier', tease: 'Salt rust and quiet machinery at the map’s lonely edge.' },
  ],
  routes: [
    {
      id: 'unova-route-1',
      name: 'Route 1',
      map: { x: 30, y: 80 },
      blurb: 'Leaving Accumula: tidy paths, early trainers, city skyline ahead.',
      encounterSampleIds: [495, 498, 501, 504],
    },
    {
      id: 'unova-pinwheel-forest',
      name: 'Pinwheel Forest',
      map: { x: 38, y: 56 },
      blurb: 'Mossy ruins and Team Plasma echoes—roots reclaim old stone.',
      encounterSampleIds: [511, 513, 515, 543],
    },
    {
      id: 'unova-desert-resort',
      name: 'Desert Resort',
      map: { x: 62, y: 62 },
      blurb: 'Sand waves and castle silhouettes—sun discipline and careful water.',
      encounterSampleIds: [551, 554, 556, 561],
    },
    {
      id: 'unova-celestial-tower',
      name: 'Celestial Tower',
      map: { x: 52, y: 36 },
      blurb: 'Bell floors and drifting mist—each landing feels like a pause for grief and resolve.',
      encounterSampleIds: [605, 607, 608, 610],
    },
    {
      id: 'unova-village-bridge',
      name: 'Village Bridge',
      map: { x: 70, y: 44 },
      blurb: 'Shops on planks above the river—life, commerce, and battles mid-span.',
      encounterSampleIds: [520, 521, 581, 582],
    },
    {
      id: 'unova-giant-chasm',
      name: 'Giant Chasm',
      map: { x: 76, y: 24 },
      blurb: 'Crater mist and uneasy quiet—something vast sleeps under the leaves.',
      encounterSampleIds: [591, 593, 601, 635],
    },
  ],
};
