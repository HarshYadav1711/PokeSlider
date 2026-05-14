import { ALL_POKEMON_TYPES } from '../../data/pokemonTypes';
import type { PokemonTypeName } from '../../types/pokemon';

import type { DiscoveryAesthetic } from './discoveryRecommendationTypes';

/** Fixed 0–1 weights per aesthetic × type — fully transparent, editable design table. */
export function aestheticTypeWeight(aesthetic: DiscoveryAesthetic, type: PokemonTypeName): number {
  const row = TABLE[aesthetic];
  return row[type] ?? 0.35;
}

export function aestheticPoolNudge(
  aesthetics: readonly DiscoveryAesthetic[],
  types: readonly PokemonTypeName[],
): number {
  if (aesthetics.length === 0) return 0.5;
  let sum = 0;
  let n = 0;
  for (const a of aesthetics) {
    for (const t of types) {
      sum += aestheticTypeWeight(a, t);
      n++;
    }
  }
  return n > 0 ? sum / n : 0.5;
}

type Row = Readonly<Record<PokemonTypeName, number>>;

const BASE = 0.28;
const MID = 0.55;
const HIGH = 0.82;

function fill(partial: Partial<Record<PokemonTypeName, number>>): Row {
  const out = {} as Record<PokemonTypeName, number>;
  for (const t of ALL_POKEMON_TYPES) {
    out[t] = partial[t] ?? BASE;
  }
  return out;
}

const TABLE: Readonly<Record<DiscoveryAesthetic, Row>> = {
  cute: fill({
    fairy: HIGH,
    normal: MID,
    grass: MID,
    water: MID,
    electric: MID,
    psychic: MID,
    bug: MID,
    ice: 0.45,
    dragon: 0.4,
    dark: 0.42,
    fighting: 0.42,
  }),
  cool: fill({
    dragon: HIGH,
    dark: HIGH,
    steel: HIGH,
    fire: MID,
    electric: MID,
    ice: MID,
    flying: MID,
    ghost: MID,
  }),
  elegant: fill({
    psychic: HIGH,
    fairy: HIGH,
    grass: HIGH,
    water: MID,
    ghost: MID,
    flying: MID,
    dragon: MID,
  }),
  mysterious: fill({
    ghost: HIGH,
    psychic: HIGH,
    dark: HIGH,
    poison: MID,
    fairy: 0.48,
    bug: 0.46,
  }),
  fierce: fill({
    fighting: HIGH,
    fire: HIGH,
    dragon: HIGH,
    dark: MID,
    poison: MID,
    ground: MID,
  }),
  sleek: fill({
    steel: HIGH,
    electric: HIGH,
    ice: MID,
    water: MID,
    dark: MID,
    psychic: 0.48,
    normal: 0.42,
  }),
};
