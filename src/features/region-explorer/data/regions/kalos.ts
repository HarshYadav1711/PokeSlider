import type { RegionDefinition } from '../regionTypes';

export const KALOS: RegionDefinition = {
  id: 'kalos',
  name: 'Kalos',
  generation: 6,
  tagline: 'Boutique beauty and megawatt flair',
  lore: 'Kalos frames adventure like fashion—cafés, plazas, and battle châteaus. Yet the wild corners are sharp: thorn mazes, reflective caves, and routes that climb toward snowfields with cinematic grace.',
  atmosphere: {
    bgFrom: 'rgb(36 20 40)',
    bgVia: 'rgb(52 32 56)',
    bgTo: 'rgb(28 16 36)',
    accent: 'rgb(244 114 182)',
    accentSoft: 'rgb(251 207 232)',
    mist: 'rgb(192 132 252 / 0.1)',
  },
  habitats: [
    { title: 'Parfum Palace gardens', tease: 'Maze hedges and polished gravel—encounters feel curated.' },
    { title: 'Reflection Cave', tease: 'Crystal facets duplicate light until depth feels uncertain.' },
    { title: 'Frost cavern shelves', tease: 'Blue ice shelves and careful footing on narrow spans.' },
  ],
  routes: [
    {
      id: 'kalos-route-2',
      name: 'Route 2',
      map: { x: 26, y: 76 },
      blurb: 'Avignon breeze through gate towns—stylish fences, tidy trainers.',
      encounterSampleIds: [659, 661, 664, 650],
    },
    {
      id: 'kalos-santalune-forest',
      name: 'Santalune Forest',
      map: { x: 34, y: 54 },
      blurb: 'Spiderwebs catch morning dew; the first gym’s lesson starts in the shade.',
      encounterSampleIds: [664, 665, 667, 688],
    },
    {
      id: 'kalos-reflection-cave',
      name: 'Reflection Cave',
      map: { x: 48, y: 42 },
      blurb: 'Faceted walls and soft echoes—your team’s colors scatter in shards.',
      encounterSampleIds: [704, 708, 710, 714],
    },
    {
      id: 'kalos-route-13',
      name: 'Route 13',
      map: { x: 64, y: 58 },
      blurb: 'Brownouts and wind farms—industrial silhouettes against bruised skies.',
      encounterSampleIds: [694, 695, 702, 714],
    },
    {
      id: 'kalos-frost-cavern',
      name: 'Frost Cavern',
      map: { x: 58, y: 28 },
      blurb: 'Icicles drip in slow rhythm; Abomasnow weather presses the whole cavern.',
      encounterSampleIds: [698, 699, 712, 713],
    },
    {
      id: 'kalos-victory-road-kalos',
      name: 'Victory Road',
      map: { x: 72, y: 18 },
      blurb: 'Water terraces and elite duels—Kalos ends with a runway, not a whisper.',
      encounterSampleIds: [701, 706, 714, 715],
    },
  ],
};
