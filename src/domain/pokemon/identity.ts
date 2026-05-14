import type { PokemonSummary } from '../../types/pokemon';

/** True when two summaries share the same PokéAPI `pokemon-species` id (all varieties match). */
export function sameSpecies(
  a: Pick<PokemonSummary, 'speciesId'>,
  b: Pick<PokemonSummary, 'speciesId'>,
): boolean {
  return a.speciesId === b.speciesId;
}
