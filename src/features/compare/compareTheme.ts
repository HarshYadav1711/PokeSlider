import type { PokemonTypeName } from '../../types/pokemon';

/** Solid accents for VS chrome (paired with type badges). */
export const TYPE_ACCENT: Readonly<Record<PokemonTypeName, string>> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

export function duelBackground(typesA: readonly PokemonTypeName[], typesB: readonly PokemonTypeName[]): string {
  const a = typesA[0] ? TYPE_ACCENT[typesA[0]] : '#334155';
  const b = typesB[0] ? TYPE_ACCENT[typesB[0]] : '#334155';
  return `radial-gradient(120% 80% at 0% 0%, ${a}33 0%, transparent 55%), radial-gradient(120% 80% at 100% 100%, ${b}33 0%, transparent 55%), #0b1220`;
}
