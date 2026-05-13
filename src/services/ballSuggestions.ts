import type { PokeBallDefinition } from '../data/pokeballs';
import { isPokemonTypeToken } from '../data/pokeballs';
import type { PokemonSummary } from '../types/pokemon';
import { shuffle, takeUnique } from '../utils/array';

export interface PokemonCatalogPartition {
  readonly all: readonly PokemonSummary[];
  readonly legendary: readonly PokemonSummary[];
  readonly mythical: readonly PokemonSummary[];
  readonly pseudoLegendary: readonly PokemonSummary[];
  readonly regular: readonly PokemonSummary[];
}

export function partitionCatalog(all: readonly PokemonSummary[]): PokemonCatalogPartition {
  const legendary = all.filter((p) => p.isLegendary && !p.isMythical);
  const mythical = all.filter((p) => p.isMythical);
  const pseudoLegendary = all.filter((p) => p.isPseudoLegendary);
  const regular = all.filter((p) => !p.isLegendary && !p.isMythical && !p.isPseudoLegendary);
  return { all, legendary, mythical, pseudoLegendary, regular };
}

export function pickPokemonForBall(
  ball: PokeBallDefinition,
  partition: PokemonCatalogPartition,
): PokemonSummary[] {
  const { legendary, mythical, pseudoLegendary, regular, all } = partition;

  if (ball.name === 'Master Ball') {
    const mix = shuffle([...legendary, ...mythical]);
    return takeUnique(mix, 30);
  }

  if (ball.name === 'Ultra Ball') {
    const ultraMix = shuffle([
      ...pseudoLegendary,
      ...regular.filter((p) => p.baseStatTotal >= 500).slice(0, 20),
      ...legendary.slice(0, 5),
    ]);
    return takeUnique(ultraMix, 25);
  }

  if (ball.name === 'Great Ball') {
    const greatMix = shuffle([
      ...regular.filter((p) => p.baseStatTotal >= 400 && p.baseStatTotal < 500).slice(0, 30),
      ...pseudoLegendary.slice(0, 3),
    ]);
    return takeUnique(greatMix, 20);
  }

  const typeFilters = ball.pokemonTypes.filter(isPokemonTypeToken);

  if (ball.name === 'Net Ball' || ball.name === 'Dive Ball') {
    const typePokemon = all.filter((p) => p.types.some((t) => typeFilters.includes(t)));
    return takeUnique(shuffle(typePokemon), 25);
  }

  const typePokemon = all.filter((p) => p.types.some((t) => typeFilters.includes(t)));
  const regularSample = regular.slice(0, 10);
  const mix = shuffle([...typePokemon, ...regularSample]);
  return takeUnique(mix, 20);
}
