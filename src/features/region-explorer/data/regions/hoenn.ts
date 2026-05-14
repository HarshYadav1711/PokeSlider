import type { RegionDefinition } from '../regionTypes';

export const HOENN: RegionDefinition = {
  id: 'hoenn',
  name: 'Hoenn',
  generation: 3,
  tagline: 'Sea routes and ancient weather',
  lore: 'Hoenn is a ring of ocean punctuated by dramatic biomes—volcano, desert, rainforest—where ancient myths still shape the weather. Exploration rewards curiosity: dive spots, secret bases, and long surf lines.',
  atmosphere: {
    bgFrom: 'rgb(18 28 48)',
    bgVia: 'rgb(32 40 72)',
    bgTo: 'rgb(12 24 44)',
    accent: 'rgb(125 211 252)',
    accentSoft: 'rgb(186 230 253)',
    mist: 'rgb(56 189 248 / 0.12)',
  },
  habitats: [
    { title: 'Mangrove shallows', tease: 'Brine and roots hide darting silhouettes.' },
    { title: 'Volcanic ash routes', tease: 'Warm grit underfoot and tougher encounters downslope.' },
    { title: 'Coral trenches', tease: 'Dive pressure swaps the soundscape for slow, drifting life.' },
  ],
  routes: [
    {
      id: 'hoenn-route-101',
      name: 'Route 101',
      map: { x: 26, y: 74 },
      blurb: 'Rusturf’s rumble in the distance—short grass, bright air, a new map unfolding.',
      encounterSampleIds: [261, 263, 265, 252],
    },
    {
      id: 'hoenn-petalburg-woods',
      name: 'Petalburg Woods',
      map: { x: 34, y: 56 },
      blurb: 'Dappled shade and zigzag paths; bugs scatter in synchronized bursts.',
      encounterSampleIds: [265, 266, 285, 287],
    },
    {
      id: 'hoenn-granite-cave',
      name: 'Granite Cave',
      map: { x: 22, y: 40 },
      blurb: 'Cool stone and echoing steps—flash reveals glittering seams in the walls.',
      encounterSampleIds: [296, 304, 307, 322],
    },
    {
      id: 'hoenn-route-119',
      name: 'Route 119',
      map: { x: 58, y: 44 },
      blurb: 'Weather institute storms and tall grass that hides more than it shows.',
      encounterSampleIds: [264, 271, 274, 313],
    },
    {
      id: 'hoenn-meteor-falls',
      name: 'Meteor Falls',
      map: { x: 48, y: 28 },
      blurb: 'Waterfalls veil caverns where star-stories feel almost literal.',
      encounterSampleIds: [371, 318, 338, 334],
    },
    {
      id: 'hoenn-victory-road-hoenn',
      name: 'Victory Road',
      map: { x: 68, y: 18 },
      blurb: 'Water bridges and boulder puzzles—the Elite Four waits past the mist.',
      encounterSampleIds: [297, 306, 330, 376],
    },
  ],
};
