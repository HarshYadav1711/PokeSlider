import type { PokemonTypeName } from '../../types/pokemon';

export type BattleSide = 'a' | 'b';

export type BattlePriority = 'speed' | 'bulk' | 'balanced';

export interface BattleSimulatorAssumptions {
  /** How offensive/defensive stats are blended for the toy damage model. */
  priority: BattlePriority;
  /** When false, a small symmetric damage uplift models a scrappier exchange (still deterministic). */
  neutralBattlefield: boolean;
}

export interface BattleFighterSnapshot {
  id: number;
  name: string;
  image: string | null;
  types: readonly PokemonTypeName[];
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  baseStatTotal: number;
}

export interface BattleTurnLog {
  round: number;
  /** 1 = first strike in the round, 2 = retaliation if still alive. */
  step: 1 | 2;
  attacker: BattleSide;
  defender: BattleSide;
  moveType: PokemonTypeName;
  typeMultiplier: number;
  stab: boolean;
  damage: number;
  hpA: number;
  hpB: number;
  note: string;
}

export interface BattleSimulatorResult {
  winner: BattleSide | 'tie';
  turns: BattleTurnLog[];
  fighterA: BattleFighterSnapshot;
  fighterB: BattleFighterSnapshot;
  startHpA: number;
  startHpB: number;
  /** High-level, user-facing factors (no hidden randomness). */
  reasons: readonly string[];
  assumptions: BattleSimulatorAssumptions;
}
