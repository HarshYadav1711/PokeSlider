import type { RegionDefinition, RegionId } from './regionTypes';

/**
 * Lazy-load exactly one region chunk. Only call while the explorer is open
 * so inactive regions never download or execute.
 */
export async function loadRegionDefinition(id: RegionId): Promise<RegionDefinition> {
  switch (id) {
    case 'kanto':
      return (await import('./regions/kanto')).KANTO;
    case 'johto':
      return (await import('./regions/johto')).JOHTO;
    case 'hoenn':
      return (await import('./regions/hoenn')).HOENN;
    case 'sinnoh':
      return (await import('./regions/sinnoh')).SINNOH;
    case 'unova':
      return (await import('./regions/unova')).UNOVA;
    case 'kalos':
      return (await import('./regions/kalos')).KALOS;
    case 'alola':
      return (await import('./regions/alola')).ALOLA;
    case 'galar':
      return (await import('./regions/galar')).GALAR;
    case 'paldea':
      return (await import('./regions/paldea')).PALDEA;
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}
