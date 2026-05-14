import type { RegionId } from '../features/region-explorer/data/regionTypes';

/** Maps Pokédex generation (1–9) to a canonical region id for atmosphere tokens. */
export function generationToRegionId(generation: number): RegionId | 'unknown' {
  if (generation === 1) return 'kanto';
  if (generation === 2) return 'johto';
  if (generation === 3) return 'hoenn';
  if (generation === 4) return 'sinnoh';
  if (generation === 5) return 'unova';
  if (generation === 6) return 'kalos';
  if (generation === 7) return 'alola';
  if (generation === 8) return 'galar';
  if (generation === 9) return 'paldea';
  return 'unknown';
}
