import type { RegionDefinition } from '../regionTypes';

export const JOHTO: RegionDefinition = {
  id: 'johto',
  name: 'Johto',
  generation: 2,
  tagline: 'Shinto calm and seasonal routes',
  lore: 'Johto favors rhythm over rush: bell towers, lakeside towns, and routes that curve with the land. Legends feel closer here—stories told in murals, festivals, and mist over the water.',
  atmosphere: {
    bgFrom: 'rgb(22 36 34)',
    bgVia: 'rgb(30 52 48)',
    bgTo: 'rgb(16 28 30)',
    accent: 'rgb(167 243 208)',
    accentSoft: 'rgb(209 250 229)',
    mist: 'rgb(52 211 153 / 0.1)',
  },
  habitats: [
    { title: 'Lake margins', tease: 'Slow ripples and wide skies frame quiet encounters.' },
    { title: 'Ilex edges', tease: 'Dense shade and golden leaves hide skittish species.' },
    { title: 'Alpine trails', tease: 'Thin air, pine scent, and sturdy climbers on the ridges.' },
  ],
  routes: [
    {
      id: 'johto-route-29',
      name: 'Route 29',
      map: { x: 24, y: 76 },
      blurb: 'Leaving New Bark: wide fields, a winding path, and your first real horizon.',
      encounterSampleIds: [161, 163, 165, 187],
    },
    {
      id: 'johto-ilex',
      name: 'Ilex Forest',
      map: { x: 32, y: 54 },
      blurb: 'A green maze where sunlight speckles the floor and footsteps soften.',
      encounterSampleIds: [165, 166, 167, 214],
    },
    {
      id: 'johto-route-34',
      name: 'Route 34',
      map: { x: 52, y: 48 },
      blurb: 'Surf lanes and shoreline trainers—Goldenrod’s bustle just up the road.',
      encounterSampleIds: [170, 171, 183, 194],
    },
    {
      id: 'johto-ice-path',
      name: 'Ice Path',
      map: { x: 70, y: 32 },
      blurb: 'Sliding puzzles and crisp echoes—winter pressed into stone corridors.',
      encounterSampleIds: [220, 221, 225, 215],
    },
    {
      id: 'johto-mt-silver',
      name: 'Mt. Silver',
      map: { x: 58, y: 16 },
      blurb: 'High peaks, biting wind, and the sense that only prepared teams belong.',
      encounterSampleIds: [217, 221, 208, 250],
    },
    {
      id: 'johto-lake-of-rage',
      name: 'Lake of Rage',
      map: { x: 78, y: 58 },
      blurb: 'Storm stories and red water—tension in the air, curiosity on the shore.',
      encounterSampleIds: [194, 195, 211, 192],
    },
  ],
};
