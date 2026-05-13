import type { TypeResponse } from '../../types/pokeapi';
import type { PokemonTypeName } from '../../types/pokemon';
import type { TypeEffectivenessResult } from '../../types/pokemon';
import { pokeFetch } from './client';

const ALL_TYPES: readonly PokemonTypeName[] = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

const cache = new Map<string, TypeEffectivenessResult>();

export async function getTypeEffectiveness(
  types: readonly PokemonTypeName[],
  signal?: AbortSignal,
): Promise<TypeEffectivenessResult> {
  const cacheKey = [...types].slice().sort().join(',');
  const hit = cache.get(cacheKey);
  if (hit) return hit;

  const typeData = await Promise.all(
    types.map((type) => pokeFetch<TypeResponse>(`/type/${type}`, { signal })),
  );

  const effectiveness: Record<PokemonTypeName, number> = {} as Record<PokemonTypeName, number>;

  for (const attackType of ALL_TYPES) {
    let multiplier = 1;
    for (const typeInfo of typeData) {
      const damageRelation = typeInfo.damage_relations;
      if (damageRelation.double_damage_from.some((t) => t.name === attackType)) {
        multiplier *= 2;
      } else if (damageRelation.half_damage_from.some((t) => t.name === attackType)) {
        multiplier *= 0.5;
      }
      if (damageRelation.no_damage_from.some((t) => t.name === attackType)) {
        multiplier *= 0;
      }
    }
    effectiveness[attackType] = multiplier;
  }

  const result: TypeEffectivenessResult = {
    superEffective: Object.entries(effectiveness)
      .filter(([, mult]) => mult > 1)
      .map(([type]) => type as PokemonTypeName),
    notVeryEffective: Object.entries(effectiveness)
      .filter(([, mult]) => mult > 0 && mult < 1)
      .map(([type]) => type as PokemonTypeName),
    noEffect: Object.entries(effectiveness)
      .filter(([, mult]) => mult === 0)
      .map(([type]) => type as PokemonTypeName),
  };

  cache.set(cacheKey, result);
  return result;
}
