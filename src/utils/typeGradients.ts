import type { PokemonTypeName } from '../types/pokemon';

export const TYPE_GRADIENT: Readonly<Record<PokemonTypeName, string>> = {
  normal: 'linear-gradient(135deg, #A8A878 0%, #8a8a6a 100%)',
  fire: 'linear-gradient(135deg, #F08030 0%, #d06010 100%)',
  water: 'linear-gradient(135deg, #6890F0 0%, #4870d0 100%)',
  electric: 'linear-gradient(135deg, #F8D030 0%, #d8b010 100%)',
  grass: 'linear-gradient(135deg, #78C850 0%, #58a830 100%)',
  ice: 'linear-gradient(135deg, #98D8D8 0%, #78b8b8 100%)',
  fighting: 'linear-gradient(135deg, #C03028 0%, #a01008 100%)',
  poison: 'linear-gradient(135deg, #A040A0 0%, #802080 100%)',
  ground: 'linear-gradient(135deg, #E0C068 0%, #c0a048 100%)',
  flying: 'linear-gradient(135deg, #A890F0 0%, #8870d0 100%)',
  psychic: 'linear-gradient(135deg, #F85888 0%, #d83868 100%)',
  bug: 'linear-gradient(135deg, #A8B820 0%, #889800 100%)',
  rock: 'linear-gradient(135deg, #B8A038 0%, #988018 100%)',
  ghost: 'linear-gradient(135deg, #705898 0%, #503878 100%)',
  dragon: 'linear-gradient(135deg, #7038F8 0%, #5018d8 100%)',
  dark: 'linear-gradient(135deg, #705848 0%, #503828 100%)',
  steel: 'linear-gradient(135deg, #B8B8D0 0%, #9898b0 100%)',
  fairy: 'linear-gradient(135deg, #EE99AC 0%, #ce798c 100%)',
};
