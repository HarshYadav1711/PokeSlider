import type { RegionId } from './regionTypes';

/** Lightweight tab metadata — no scene data (keeps selector in the main chunk). */
export interface RegionTabMeta {
  readonly id: RegionId;
  readonly name: string;
}

export const REGION_TABS: readonly RegionTabMeta[] = [
  { id: 'kanto', name: 'Kanto' },
  { id: 'johto', name: 'Johto' },
  { id: 'hoenn', name: 'Hoenn' },
  { id: 'sinnoh', name: 'Sinnoh' },
  { id: 'unova', name: 'Unova' },
  { id: 'kalos', name: 'Kalos' },
  { id: 'alola', name: 'Alola' },
  { id: 'galar', name: 'Galar' },
  { id: 'paldea', name: 'Paldea' },
];
