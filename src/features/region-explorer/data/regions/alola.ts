import type { RegionDefinition } from '../regionTypes';

export const ALOLA: RegionDefinition = {
  id: 'alola',
  name: 'Alola',
  generation: 7,
  tagline: 'Island trials and volcanic hospitality',
  lore: 'Alola trades badges for trials—totems, dances, and elders who read the wind. Each island has its own temperament: lazy surf, jungle humidity, or ash trails down the volcano’s shoulder.',
  atmosphere: {
    bgFrom: 'rgb(18 36 40)',
    bgVia: 'rgb(28 56 60)',
    bgTo: 'rgb(12 28 34)',
    accent: 'rgb(251 146 60)',
    accentSoft: 'rgb(254 215 170)',
    mist: 'rgb(45 212 191 / 0.1)',
  },
  habitats: [
    { title: 'Melemele meadows', tease: 'Bright flowers and tame surf—tutorial skies, real warmth.' },
    { title: 'Lush jungle', tease: 'Humid green layers where totems feel one breath away.' },
    { title: 'Wela volcano park', tease: 'Heat shimmer and drumbeats—fire trials under open sky.' },
  ],
  routes: [
    {
      id: 'alola-route-1',
      name: 'Hau’oli Outskirts',
      map: { x: 28, y: 78 },
      blurb: 'Beachside paths and curious wilds—Rotom Dex chatter in your ear.',
      encounterSampleIds: [731, 734, 736, 742],
    },
    {
      id: 'alola-verdant-cavern',
      name: 'Verdant Cavern',
      map: { x: 36, y: 58 },
      blurb: 'Cool stone mouth and trial glow—your first totem silhouette.',
      encounterSampleIds: [741, 742, 744, 745],
    },
    {
      id: 'alola-brooklet-hill',
      name: 'Brooklet Hill',
      map: { x: 52, y: 52 },
      blurb: 'Stepping stones and mist—water trial rhythm in every puddle.',
      encounterSampleIds: [751, 752, 753, 754],
    },
    {
      id: 'alola-lush-jungle',
      name: 'Lush Jungle',
      map: { x: 44, y: 38 },
      blurb: 'Canopy green so thick it feels like dusk at noon.',
      encounterSampleIds: [753, 755, 756, 761],
    },
    {
      id: 'alola-mount-lanakila',
      name: 'Mount Lanakila',
      map: { x: 62, y: 22 },
      blurb: 'Ice wind and final approaches—the League summit above the clouds.',
      encounterSampleIds: [740, 760, 764, 775],
    },
    {
      id: 'alola-ultra-space',
      name: 'Ultra Crater',
      map: { x: 78, y: 34 },
      blurb: 'Unreal geometry and soft neon—encounters that feel borrowed from another sky.',
      encounterSampleIds: [793, 794, 795, 796],
    },
  ],
};
