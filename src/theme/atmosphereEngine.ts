import type { RegionId } from '../features/region-explorer/data/regionTypes';

import type { BattleAtmosphereMode, AtmosphereDomSnapshot } from './atmosphereThemeDom';
import { evolutionIndexToFacet, type EvolutionStageFacet } from './evolutionStageFacet';
import { generationToRegionId } from './generationToRegion';
import type { TimeOfDay } from './timeOfDay';
import { timeOfDayFromLocalDate } from './timeOfDay';

export interface PokemonAtmosphereSlice {
  readonly primaryType: string | null;
  readonly secondaryType: string | null;
  readonly pokemonGeneration: number | null;
  readonly evolutionChain: { readonly index: number; readonly total: number } | null;
}

export interface AtmosphereThemeInputs {
  readonly pokemon: PokemonAtmosphereSlice | null;
  readonly compareModalOpen: boolean;
  readonly timeOfDayOverride: TimeOfDay | null;
  readonly now?: Date;
}

export function buildAtmosphereDomSnapshot(input: AtmosphereThemeInputs): AtmosphereDomSnapshot {
  const battle: BattleAtmosphereMode = input.compareModalOpen ? 'duel' : 'explore';
  const timeOfDay: TimeOfDay = input.timeOfDayOverride ?? timeOfDayFromLocalDate(input.now ?? new Date());

  if (!input.pokemon) {
    return {
      primaryType: null,
      secondaryType: null,
      region: 'unknown',
      battle,
      evolution: 'solo',
      timeOfDay,
    };
  }

  const region: RegionId | 'unknown' =
    input.pokemon.pokemonGeneration === null ? 'unknown' : generationToRegionId(input.pokemon.pokemonGeneration);
  const evolution: EvolutionStageFacet =
    input.pokemon.evolutionChain === null
      ? 'solo'
      : evolutionIndexToFacet(input.pokemon.evolutionChain.index, input.pokemon.evolutionChain.total);

  return {
    primaryType: input.pokemon.primaryType,
    secondaryType: input.pokemon.secondaryType,
    region,
    battle,
    evolution,
    timeOfDay,
  };
}
