import type { PokemonResponse, PokemonSpeciesResponse } from '../types/pokeapi';

const KNOWN_PSEUDO_IDS = new Set<number>([
  149, 248, 373, 376, 445, 635, 706, 784, 884,
]);

export function isPseudoLegendary(
  pokemon: Pick<PokemonResponse, 'id'>,
  species: Pick<PokemonSpeciesResponse, 'is_legendary' | 'is_mythical'>,
  baseStatTotal: number,
): boolean {
  if (baseStatTotal !== 600) return false;
  if (species.is_legendary || species.is_mythical) return false;
  return KNOWN_PSEUDO_IDS.has(pokemon.id);
}

export function getGeneration(pokemonId: number): number {
  if (pokemonId <= 151) return 1;
  if (pokemonId <= 251) return 2;
  if (pokemonId <= 386) return 3;
  if (pokemonId <= 493) return 4;
  if (pokemonId <= 649) return 5;
  if (pokemonId <= 721) return 6;
  if (pokemonId <= 809) return 7;
  if (pokemonId <= 905) return 8;
  return 9;
}
