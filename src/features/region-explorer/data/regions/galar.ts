import type { RegionDefinition } from '../regionTypes';

export const GALAR: RegionDefinition = {
  id: 'galar',
  name: 'Galar',
  generation: 8,
  tagline: 'Wild Area winds and stadium lights',
  lore: 'Galar is built for spectacle—expansive wilds, gym stadiums, and curry camps between routes. The weather rolls in fast; the map opens wide, encouraging detours over straight lines.',
  atmosphere: {
    bgFrom: 'rgb(28 22 44)',
    bgVia: 'rgb(44 36 68)',
    bgTo: 'rgb(20 16 36)',
    accent: 'rgb(147 197 253)',
    accentSoft: 'rgb(191 219 254)',
    mist: 'rgb(129 140 248 / 0.12)',
  },
  habitats: [
    { title: 'Rolling fields', tease: 'Weather icons swap overhead; dens pulse like quiet invitations.' },
    { title: 'Glimwood Tangle', tease: 'Bioluminescent mushrooms trade day for storybook night.' },
    { title: 'Hammerlocke vault', tease: 'Stone dragons coil upward—history told in vertical scale.' },
  ],
  routes: [
    {
      id: 'galar-route-1',
      name: 'Route 1',
      map: { x: 26, y: 80 },
      blurb: 'Postwick breeze and low fences—the champion’s house feels like any other, until it doesn’t.',
      encounterSampleIds: [831, 832, 835, 840],
    },
    {
      id: 'galar-slumbering-weald',
      name: 'Slumbering Weald',
      map: { x: 34, y: 58 },
      blurb: 'Mist threads through ancient trees—two wolves of legend still echo here.',
      encounterSampleIds: [810, 813, 816, 827],
    },
    {
      id: 'galar-glimwood-tangle',
      name: 'Glimwood Tangle',
      map: { x: 48, y: 46 },
      blurb: 'Soft glow and twisting roots—Fairy types feel at home in the hush.',
      encounterSampleIds: [856, 858, 860, 868],
    },
    {
      id: 'galar-route-6',
      name: 'Route 6',
      map: { x: 62, y: 56 },
      blurb: 'Construction dust and detours—Galar’s industry hums beside the grass.',
      encounterSampleIds: [834, 838, 848, 850],
    },
    {
      id: 'galar-crown-tundra',
      name: 'Crown Tundra',
      map: { x: 72, y: 34 },
      blurb: 'Snowfields and footprints toward ruins—expedition energy without a clock.',
      encounterSampleIds: [872, 875, 877, 884],
    },
    {
      id: 'galar-victory-road-galar',
      name: 'Victory Road',
      map: { x: 56, y: 18 },
      blurb: 'Final climbs before Rose Tower’s shadow—spotlights and pressure in thin air.',
      encounterSampleIds: [887, 888, 889, 890],
    },
  ],
};
