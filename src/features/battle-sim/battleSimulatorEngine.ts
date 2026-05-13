import { ALL_POKEMON_TYPES } from '../../data/pokemonTypes';
import type { PokemonComparisonProfile, PokemonStatRow, PokemonTypeName } from '../../types/pokemon';
import type { TypeMatchupChart } from '../team-builder/typeMatchupChart';

import type {
  BattleFighterSnapshot,
  BattlePriority,
  BattleSide,
  BattleSimulatorAssumptions,
  BattleSimulatorResult,
  BattleTurnLog,
} from './battleSimulatorTypes';

const MAX_ROUNDS = 36;

export function snapshotFromComparisonProfile(row: PokemonComparisonProfile): BattleFighterSnapshot {
  return {
    id: row.id,
    name: row.name,
    image: row.image,
    types: row.types,
    hp: statFromRows(row.stats, 'hp'),
    attack: statFromRows(row.stats, 'attack'),
    defense: statFromRows(row.stats, 'defense'),
    specialAttack: statFromRows(row.stats, 'special attack'),
    specialDefense: statFromRows(row.stats, 'special defense'),
    speed: statFromRows(row.stats, 'speed'),
    baseStatTotal: row.baseStatTotal,
  };
}

export function statFromRows(rows: readonly PokemonStatRow[], key: string): number {
  const needle = key.trim().toLowerCase();
  for (const r of rows) {
    if (r.name.trim().toLowerCase() === needle) return r.value;
  }
  return 0;
}

function offenseScore(f: BattleFighterSnapshot, p: BattlePriority): number {
  const { attack: atk, specialAttack: spa, speed: spe, hp } = f;
  switch (p) {
    case 'speed':
      return 0.42 * atk + 0.42 * spa + 0.16 * spe;
    case 'bulk':
      return 0.45 * atk + 0.45 * spa + 0.1 * (hp / 4);
    default:
      return 0.5 * atk + 0.5 * spa;
  }
}

function defenseScore(f: BattleFighterSnapshot, p: BattlePriority): number {
  const { defense: def, specialDefense: spd, hp } = f;
  switch (p) {
    case 'bulk':
      return 0.45 * def + 0.45 * spd + 0.1 * (hp / 4);
    default:
      return 0.5 * def + 0.5 * spd;
  }
}

export interface BestMovePick {
  moveType: PokemonTypeName;
  typeMultiplier: number;
  stab: boolean;
}

/**
 * Deterministic "best single hit" for the simplified preview: maximizes type chart × STAB,
 * with stable tie-breaks on multiplier, STAB, then move type name.
 */
function moveKey(score: number, stab: boolean, moveType: PokemonTypeName): readonly [number, number, string] {
  return [score, stab ? 1 : 0, moveType] as const;
}

function isBetterMove(
  cand: readonly [number, number, string],
  prev: readonly [number, number, string] | null,
): boolean {
  if (prev === null) return true;
  const [cs, cstab, cn] = cand;
  const [ps, pstab, pn] = prev;
  if (cs !== ps) return cs > ps;
  if (cstab !== pstab) return cstab > pstab;
  return cn < pn;
}

export function pickBestMove(
  chart: TypeMatchupChart,
  attackerTypes: readonly PokemonTypeName[],
  defenderTypes: readonly PokemonTypeName[],
): BestMovePick {
  const stabSet = new Set(attackerTypes);
  let best: BestMovePick | null = null;
  let bestKey: readonly [number, number, string] | null = null;

  for (const moveType of ALL_POKEMON_TYPES) {
    const typeMultiplier = chart.moveDamageMultiplier(moveType, defenderTypes);
    const stab = stabSet.has(moveType);
    const score = typeMultiplier * (stab ? 1.5 : 1);
    const key = moveKey(score, stab, moveType);
    if (isBetterMove(key, bestKey)) {
      best = { moveType, typeMultiplier, stab };
      bestKey = key;
    }
  }

  return best ?? { moveType: 'normal', typeMultiplier: 1, stab: false };
}

function startingHp(f: BattleFighterSnapshot): number {
  return Math.round(f.hp * 1.35) + 8;
}

function fieldDamageMultiplier(assumptions: BattleSimulatorAssumptions): number {
  return assumptions.neutralBattlefield ? 1 : 1.06;
}

function damageForHit(params: {
  attacker: BattleFighterSnapshot;
  defender: BattleFighterSnapshot;
  move: BestMovePick;
  assumptions: BattleSimulatorAssumptions;
}): number {
  const { attacker, defender, move, assumptions } = params;
  if (move.typeMultiplier === 0) return 0;

  const power = 34 + Math.floor(attacker.baseStatTotal / 18);
  const off = offenseScore(attacker, assumptions.priority);
  const def = Math.max(1, defenseScore(defender, assumptions.priority));
  const ratio = off / def;
  const stabMult = move.stab ? 1.5 : 1;
  const raw = power * ratio * move.typeMultiplier * stabMult * fieldDamageMultiplier(assumptions);
  const dmg = Math.floor(raw);
  return Math.max(1, dmg);
}

function speedTiebreakOrder(a: BattleFighterSnapshot, b: BattleFighterSnapshot): readonly [BattleSide, BattleSide] {
  if (a.speed !== b.speed) return a.speed > b.speed ? (['a', 'b'] as const) : (['b', 'a'] as const);
  return a.id < b.id ? (['a', 'b'] as const) : (['b', 'a'] as const);
}

function fighter(side: BattleSide, a: BattleFighterSnapshot, b: BattleFighterSnapshot): BattleFighterSnapshot {
  return side === 'a' ? a : b;
}

function noteForTurn(params: {
  attacker: BattleSide;
  move: BestMovePick;
  damage: number;
  nameA: string;
  nameB: string;
}): string {
  const { attacker, move, damage, nameA, nameB } = params;
  const atkName = attacker === 'a' ? nameA : nameB;
  const defName = attacker === 'a' ? nameB : nameA;
  const stab = move.stab ? 'STAB ' : '';
  const mult =
    move.typeMultiplier === 0
      ? 'immune'
      : move.typeMultiplier === 1
        ? 'neutral'
        : move.typeMultiplier > 1
          ? `${move.typeMultiplier}×`
          : `${move.typeMultiplier}×`;
  if (move.typeMultiplier === 0) {
    return `${atkName} finds no effective hit this turn (${move.moveType} is ${mult} vs ${defName}).`;
  }
  return `${atkName} swings with ${stab}${move.moveType} (${mult}) for ${damage}.`;
}

function buildReasons(input: {
  a: BattleFighterSnapshot;
  b: BattleFighterSnapshot;
  chart: TypeMatchupChart;
  assumptions: BattleSimulatorAssumptions;
  winner: BattleSide | 'tie';
  stalemate: boolean;
}): string[] {
  const { a, b, chart, assumptions, winner, stalemate } = input;
  const nameA = formatSpeciesName(a.name);
  const nameB = formatSpeciesName(b.name);
  const order = speedTiebreakOrder(a, b);
  const first = order[0] === 'a' ? nameA : nameB;
  const second = order[1] === 'a' ? nameA : nameB;
  const speedLine =
    a.speed === b.speed
      ? `Speed is tied at ${a.speed}; ${first} is modeled first ahead of ${second} when speeds match (lower National Dex number wins the order).`
      : `${a.speed > b.speed ? nameA : nameB} moves first every round (${Math.max(a.speed, b.speed)} vs ${Math.min(a.speed, b.speed)} Speed).`;

  const bestA = pickBestMove(chart, a.types, b.types);
  const bestB = pickBestMove(chart, b.types, a.types);
  const typeLineA =
    bestA.typeMultiplier === 0
      ? `${nameA}'s strongest charted hit into ${nameB} is fully blocked (${bestA.moveType}).`
      : `${nameA}'s best charted hit into ${nameB} is ${bestA.moveType}${bestA.stab ? ' with STAB' : ''} at ${bestA.typeMultiplier}× before other modifiers.`;
  const typeLineB =
    bestB.typeMultiplier === 0
      ? `${nameB}'s strongest charted hit into ${nameA} is fully blocked (${bestB.moveType}).`
      : `${nameB}'s best charted hit into ${nameA} is ${bestB.moveType}${bestB.stab ? ' with STAB' : ''} at ${bestB.typeMultiplier}× before other modifiers.`;

  const prio =
    assumptions.priority === 'speed'
      ? 'Priority mode blends more Speed into the offensive stat mix.'
      : assumptions.priority === 'bulk'
        ? 'Bulk mode blends HP into offensive/defensive blends so sustained trades favor thicker profiles.'
        : 'Balanced mode uses even physical/special blends.';

  const field = assumptions.neutralBattlefield
    ? 'Neutral battlefield leaves type math untouched beyond STAB and the stat blend.'
    : 'Volatile battlefield applies a small symmetric outgoing damage bump so exchanges end faster—still fully deterministic.';

  const outcome = stalemate
    ? 'Neither side reached zero HP before the safety turn cap; treated as a modeled stalemate (not a real timer).'
    : `${winner === 'a' ? nameA : nameB} is the projected survivor under these transparent rules.`;

  return [speedLine, typeLineA, typeLineB, prio, field, outcome];
}

export function formatSpeciesName(raw: string): string {
  return raw
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function simulateBattle(
  profileA: PokemonComparisonProfile,
  profileB: PokemonComparisonProfile,
  chart: TypeMatchupChart,
  assumptions: BattleSimulatorAssumptions,
): BattleSimulatorResult {
  const fighterA = snapshotFromComparisonProfile(profileA);
  const fighterB = snapshotFromComparisonProfile(profileB);
  const nameA = formatSpeciesName(fighterA.name);
  const nameB = formatSpeciesName(fighterB.name);

  const startHpA = startingHp(fighterA);
  const startHpB = startingHp(fighterB);
  let hpA = startHpA;
  let hpB = startHpB;
  const turns: BattleTurnLog[] = [];

  let round = 1;
  let stalemate = false;

  outer: while (hpA > 0 && hpB > 0 && round <= MAX_ROUNDS) {
    const order = speedTiebreakOrder(fighterA, fighterB);

    for (let s = 0; s < 2; s += 1) {
      const attackerSide = order[s]!;
      const defenderSide: BattleSide = attackerSide === 'a' ? 'b' : 'a';
      const hpAttacker = attackerSide === 'a' ? hpA : hpB;
      if (hpAttacker <= 0) break outer;

      const atkF = fighter(attackerSide, fighterA, fighterB);
      const defF = fighter(defenderSide, fighterA, fighterB);
      const move = pickBestMove(chart, atkF.types, defF.types);
      const dmg = damageForHit({ attacker: atkF, defender: defF, move, assumptions });

      if (defenderSide === 'a') hpA = Math.max(0, hpA - dmg);
      else hpB = Math.max(0, hpB - dmg);

      turns.push({
        round,
        step: s === 0 ? 1 : 2,
        attacker: attackerSide,
        defender: defenderSide,
        moveType: move.moveType,
        typeMultiplier: move.typeMultiplier,
        stab: move.stab,
        damage: dmg,
        hpA,
        hpB,
        note: noteForTurn({ attacker: attackerSide, move, damage: dmg, nameA, nameB }),
      });

      if ((defenderSide === 'a' ? hpA : hpB) <= 0) break outer;
    }

    round += 1;
  }

  if (hpA > 0 && hpB > 0) {
    stalemate = true;
  }

  let winner: BattleSide | 'tie';
  if (hpA > 0 && hpB > 0) winner = 'tie';
  else if (hpA <= 0 && hpB <= 0) winner = 'tie';
  else if (hpA <= 0) winner = 'b';
  else winner = 'a';

  const reasons = buildReasons({
    a: fighterA,
    b: fighterB,
    chart,
    assumptions,
    winner,
    stalemate,
  });

  return {
    winner,
    turns,
    fighterA,
    fighterB,
    startHpA,
    startHpB,
    reasons,
    assumptions: { ...assumptions },
  };
}
