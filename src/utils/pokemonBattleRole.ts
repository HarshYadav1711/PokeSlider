import type { PokemonSummary } from '../types/pokemon';

export type PokemonBattleRoleBucket = 'physical' | 'special' | 'mixed' | 'wall' | 'scout';

/** Rule-based battle role from base stats — shared by Team Builder + discovery filters. */
export function inferPokemonBattleRole(
  p: Pick<PokemonSummary, 'baseStats'>,
): PokemonBattleRoleBucket {
  const s = p.baseStats;
  const bulk = s.hp + s.defense + s.specialDefense;
  if (s.speed >= 100) return 'scout';
  if (bulk >= 300 && s.speed < 90) return 'wall';
  if (s.attack >= s.specialAttack + 28) return 'physical';
  if (s.specialAttack >= s.attack + 28) return 'special';
  return 'mixed';
}
