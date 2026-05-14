import type { RegionDefinition } from '../regionTypes';

export const KANTO: RegionDefinition = {
  id: 'kanto',
  name: 'Kanto',
  generation: 1,
  tagline: 'Indigo plateaus and seaside routes',
  lore: 'Kanto is where many trainers begin: tidy routes, busy cities, and the long climb toward the Pokémon League. The land feels lived-in—cafés, labs, and quiet patches of tall grass between milestones.',
  atmosphere: {
    bgFrom: 'rgb(18 32 52)',
    bgVia: 'rgb(28 44 72)',
    bgTo: 'rgb(14 22 40)',
    accent: 'rgb(248 113 113)',
    accentSoft: 'rgb(252 165 165)',
    mist: 'rgb(96 165 250 / 0.12)',
  },
  habitats: [
    { title: 'Tall grass belts', tease: 'Early-route rustling lines the paths out of Pallet and Viridian.' },
    { title: 'Caves and tunnels', tease: 'Cool stone corridors hide sturdy species and echoing footfalls.' },
    { title: 'Coastal surf', tease: 'Seafoam edges trade wind for salt spray and slower afternoons.' },
  ],
  routes: [
    {
      id: 'kanto-route-1',
      name: 'Route 1',
      map: { x: 22, y: 78 },
      blurb: 'A gentle introduction—short grass, soft hills, and the sound of Pallet behind you.',
      encounterSampleIds: [16, 19, 21, 13],
    },
    {
      id: 'kanto-viridian-forest',
      name: 'Viridian Forest',
      map: { x: 28, y: 52 },
      blurb: 'Filtered green light and winding boardwalks; bugs hum in the canopy.',
      encounterSampleIds: [10, 13, 14, 11],
    },
    {
      id: 'kanto-route-5',
      name: 'Route 5',
      map: { x: 48, y: 38 },
      blurb: 'A busy connector under Saffron’s shadow—trainers, fences, and quick battles.',
      encounterSampleIds: [16, 17, 23, 52],
    },
    {
      id: 'kanto-rock-tunnel',
      name: 'Rock Tunnel',
      map: { x: 72, y: 44 },
      blurb: 'Flashlight pools on rough walls; every corner feels closer to Lavender’s hush.',
      encounterSampleIds: [74, 95, 41, 66],
    },
    {
      id: 'kanto-seafoam',
      name: 'Seafoam Islands',
      map: { x: 18, y: 28 },
      blurb: 'Slippery ice floors and tide puzzles—cold air, careful steps, patient exploration.',
      encounterSampleIds: [86, 87, 91, 144],
    },
    {
      id: 'kanto-victory-road',
      name: 'Victory Road',
      map: { x: 58, y: 14 },
      blurb: 'The final gauntlet: narrow ledges, elite teams, and the League’s glow ahead.',
      encounterSampleIds: [68, 75, 95, 142],
    },
  ],
};
