import type { RegionDefinition } from '../regionTypes';

export const PALDEA: RegionDefinition = {
  id: 'paldea',
  name: 'Paldea',
  generation: 9,
  tagline: 'Open world ridges and academy life',
  lore: 'Paldea wraps school life around a vast open cradle—mesas, olive groves, and titan legends. Terastal light refracts battles; every horizon invites a detour on the way to class.',
  atmosphere: {
    bgFrom: 'rgb(32 24 28)',
    bgVia: 'rgb(52 36 44)',
    bgTo: 'rgb(24 18 26)',
    accent: 'rgb(251 113 133)',
    accentSoft: 'rgb(254 202 202)',
    mist: 'rgb(244 63 94 / 0.1)',
  },
  habitats: [
    { title: 'Asado desert', tease: 'Heat shimmer and sparse shade—sandwich stops taste better here.' },
    { title: 'Tagtree Thicket', tease: 'Charms hang from branches like quiet wishes on the wind.' },
    { title: 'Glaseado peaks', tease: 'Thin air and ski-town warmth at the roof of the region.' },
  ],
  routes: [
    {
      id: 'paldea-poco-path',
      name: 'Poco Path',
      map: { x: 30, y: 78 },
      blurb: 'Cabrera olive light and your first sandwich picnic—Naranja or Uva, the sky is wide.',
      encounterSampleIds: [915, 916, 918, 921],
    },
    {
      id: 'paldea-south-province-1',
      name: 'South Province (Area One)',
      map: { x: 42, y: 62 },
      blurb: 'Low cliffs and early teams—Lechonk rustles in hedges more than you expect.',
      encounterSampleIds: [906, 909, 912, 922],
    },
    {
      id: 'paldea-east-province-1',
      name: 'East Province (Area One)',
      map: { x: 68, y: 54 },
      blurb: 'Windmills and long sightlines—where picnics become strategy sessions.',
      encounterSampleIds: [931, 932, 935, 940],
    },
    {
      id: 'paldea-tagtree-thicket',
      name: 'Tagtree Thicket',
      map: { x: 52, y: 42 },
      blurb: 'Dappled paths and hanging charms—fairy lights without the wires.',
      encounterSampleIds: [943, 944, 948, 952],
    },
    {
      id: 'paldea-glaseado-mountain',
      name: 'Glaseado Mountain',
      map: { x: 58, y: 24 },
      blurb: 'Snowline silence and ski-lift rhythm—ice teams test their edges.',
      encounterSampleIds: [997, 999, 1000, 961],
    },
    {
      id: 'paldea-area-zero',
      name: 'Area Zero',
      map: { x: 48, y: 14 },
      blurb: 'Biome bubbles and violet/scarlet hum—gravity feels negotiable past the lab.',
      encounterSampleIds: [978, 982, 984, 989],
    },
  ],
};
