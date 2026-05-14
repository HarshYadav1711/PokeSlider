export interface JourneyRegionOption {
  readonly key: string;
  readonly label: string;
  readonly shortLabel: string;
}

/** Thematic regions for trainer profile (not tied to PokéAPI dex slugs). */
export const JOURNEY_REGIONS: readonly JourneyRegionOption[] = [
  { key: 'kanto', label: 'Kanto', shortLabel: 'Kanto' },
  { key: 'johto', label: 'Johto', shortLabel: 'Johto' },
  { key: 'hoenn', label: 'Hoenn', shortLabel: 'Hoenn' },
  { key: 'sinnoh', label: 'Sinnoh', shortLabel: 'Sinnoh' },
  { key: 'unova', label: 'Unova', shortLabel: 'Unova' },
  { key: 'kalos', label: 'Kalos', shortLabel: 'Kalos' },
  { key: 'alola', label: 'Alola', shortLabel: 'Alola' },
  { key: 'galar', label: 'Galar', shortLabel: 'Galar' },
  { key: 'paldea', label: 'Paldea', shortLabel: 'Paldea' },
  { key: 'any', label: 'No single favorite', shortLabel: 'All regions' },
] as const;

export function journeyRegionLabel(key: string | null | undefined): string {
  if (!key) return 'Unknown region';
  const row = JOURNEY_REGIONS.find((r) => r.key === key);
  return row?.label ?? key;
}
