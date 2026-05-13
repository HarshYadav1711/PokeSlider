import { ALL_POKEMON_TYPES } from '../../data/pokemonTypes';
import type { TypeResponse } from '../../types/pokeapi';
import type { PokemonTypeName } from '../../types/pokemon';

/** Move type vs defending Pokémon (1–2 types). Multipliers match main-series games (PokéAPI). */
export interface TypeMatchupChart {
  moveDamageMultiplier(moveType: PokemonTypeName, defenderTypes: readonly PokemonTypeName[]): number;
}

/**
 * Builds a chart from 18 `/type/{name}` responses in the same order as `ALL_POKEMON_TYPES`.
 * Pure + deterministic given the API payloads.
 */
export function buildTypeMatchupChart(responses: readonly TypeResponse[]): TypeMatchupChart {
  const rows = new Map<PokemonTypeName, ReadonlyMap<PokemonTypeName, number>>();

  for (let i = 0; i < ALL_POKEMON_TYPES.length; i++) {
    const defenderMono = ALL_POKEMON_TYPES[i]!;
    const dr = responses[i]?.damage_relations;
    const m = new Map<PokemonTypeName, number>();
    for (const t of ALL_POKEMON_TYPES) m.set(t, 1);
    if (dr) {
      for (const atk of ALL_POKEMON_TYPES) {
        let mult = 1;
        if (dr.double_damage_from.some((r) => r.name === atk)) mult *= 2;
        if (dr.half_damage_from.some((r) => r.name === atk)) mult *= 0.5;
        if (dr.no_damage_from.some((r) => r.name === atk)) mult *= 0;
        m.set(atk, mult);
      }
    }
    rows.set(defenderMono, m);
  }

  return {
    moveDamageMultiplier(moveType: PokemonTypeName, defenderTypes: readonly PokemonTypeName[]): number {
      let mult = 1;
      for (const d of defenderTypes) {
        const row = rows.get(d);
        mult *= row?.get(moveType) ?? 1;
      }
      return mult;
    },
  };
}

/** Attack types that deal at least `minMult`× to this defender typing. */
export function weaknessesFor(
  chart: TypeMatchupChart,
  defenderTypes: readonly PokemonTypeName[],
  minMult = 2,
): PokemonTypeName[] {
  const out: PokemonTypeName[] = [];
  for (const atk of ALL_POKEMON_TYPES) {
    if (chart.moveDamageMultiplier(atk, defenderTypes) >= minMult) out.push(atk);
  }
  return out;
}
