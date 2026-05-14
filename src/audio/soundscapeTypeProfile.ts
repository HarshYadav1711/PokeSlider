import type { PokemonTypeName } from '../types/pokemon';

/** Sub-audible carrier anchors (Hz) — used for very quiet beating, not melody. */
export const TYPE_CARRIER_HZ: Readonly<Record<PokemonTypeName, number>> = {
  normal: 196,
  fire: 165,
  water: 174.6,
  electric: 220,
  grass: 185,
  ice: 233,
  fighting: 155,
  poison: 207.65,
  ground: 146.8,
  flying: 246.94,
  psychic: 261.63,
  bug: 174,
  rock: 130.8,
  ghost: 233,
  dragon: 174.6,
  dark: 146.8,
  steel: 277.18,
  fairy: 246.94,
};

export function typeCarrierHz(type: PokemonTypeName | null | undefined): number {
  if (!type) return TYPE_CARRIER_HZ.normal;
  return TYPE_CARRIER_HZ[type];
}
