export type EvolutionStageFacet = 'solo' | 'base' | 'mid' | 'apex';

export function evolutionIndexToFacet(index: number, total: number): EvolutionStageFacet {
  if (total <= 1) return 'solo';
  if (index <= 0) return 'base';
  if (index >= total - 1) return 'apex';
  return 'mid';
}
