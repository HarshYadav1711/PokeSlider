import type {
  PokemonComparisonProfile,
  PokemonTypeName,
  TypeEffectivenessResult,
} from '../../types/pokemon';

/** How many of `attackerTypes` appear among typings that are super-effective vs `defender` combined typing. */
export function countStabSuperEffectiveOverlap(
  attackerTypes: readonly PokemonTypeName[],
  defenderEffectiveness: TypeEffectivenessResult,
): number {
  const se = new Set(defenderEffectiveness.superEffective);
  return attackerTypes.filter((t) => se.has(t)).length;
}

/** How many of `incomingTypes` are listed as super-effective against `defender` combined typing (incoming threats). */
export function countIncomingSuperEffectiveFromTypes(
  incomingTypes: readonly PokemonTypeName[],
  defenderEffectiveness: TypeEffectivenessResult,
): number {
  const se = new Set(defenderEffectiveness.superEffective);
  return incomingTypes.filter((t) => se.has(t)).length;
}

export type ComparisonSide = 'a' | 'b' | 'tie';
export interface ComparisonCategoryResult {
  readonly id: string;
  readonly title: string;
  /** One-sentence rule shown in the UI — no hidden logic. */
  readonly rule: string;
  readonly winner: ComparisonSide;
  readonly detailA: string;
  readonly detailB: string;
  readonly pointsA: number;
  readonly pointsB: number;
}

export interface ComparisonReport {
  readonly categories: readonly ComparisonCategoryResult[];
  readonly pointsA: number;
  readonly pointsB: number;
}

function nearEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-6;
}

function statRowsByName(rows: readonly { name: string; value: number }[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.name.toLowerCase(), r.value);
  return m;
}

export function buildComparisonReport(
  a: PokemonComparisonProfile,
  b: PokemonComparisonProfile,
  effDefenderA: TypeEffectivenessResult,
  effDefenderB: TypeEffectivenessResult,
): ComparisonReport {
  const categories: ComparisonCategoryResult[] = [];

  // 1) Total BST
  let wBst: ComparisonSide = 'tie';
  let paBst = 0.5;
  let pbBst = 0.5;
  if (a.baseStatTotal > b.baseStatTotal) {
    wBst = 'a';
    paBst = 1;
    pbBst = 0;
  } else if (b.baseStatTotal > a.baseStatTotal) {
    wBst = 'b';
    paBst = 0;
    pbBst = 1;
  }
  categories.push({
    id: 'bst_total',
    title: 'Total base stats',
    rule: 'Sum of the six official base stats (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed). Higher wins 1 point.',
    winner: wBst,
    detailA: String(a.baseStatTotal),
    detailB: String(b.baseStatTotal),
    pointsA: paBst,
    pointsB: pbBst,
  });

  // 2) Stat duel (six stats by name)
  const ma = statRowsByName(a.stats);
  const mb = statRowsByName(b.stats);
  const names = [...new Set([...ma.keys(), ...mb.keys()])].sort();
  let winsA = 0;
  let winsB = 0;
  for (const n of names) {
    const va = ma.get(n) ?? 0;
    const vb = mb.get(n) ?? 0;
    if (va > vb) winsA += 1;
    else if (vb > va) winsB += 1;
  }
  let wStat: ComparisonSide = 'tie';
  let paS = 0.5;
  let pbS = 0.5;
  if (winsA > winsB) {
    wStat = 'a';
    paS = 1;
    pbS = 0;
  } else if (winsB > winsA) {
    wStat = 'b';
    paS = 0;
    pbS = 1;
  }
  categories.push({
    id: 'stat_duel',
    title: 'Stat line duel',
    rule: 'Each of the six stats is compared by name; the Pokémon winning more stats takes the category (3–3 is a tie).',
    winner: wStat,
    detailA: `${winsA} stats higher`,
    detailB: `${winsB} stats higher`,
    pointsA: paS,
    pointsB: pbS,
  });

  // 3) Physical scalar
  const physA = a.heightM * a.weightKg;
  const physB = b.heightM * b.weightKg;
  let wPhys: ComparisonSide = 'tie';
  let paP = 0.5;
  let pbP = 0.5;
  if (physA > physB && !nearEqual(physA, physB)) {
    wPhys = 'a';
    paP = 1;
    pbP = 0;
  } else if (physB > physA && !nearEqual(physA, physB)) {
    wPhys = 'b';
    paP = 0;
    pbP = 1;
  }
  categories.push({
    id: 'physical_scalar',
    title: 'Physical profile',
    rule: 'Raw product of height (m) × weight (kg) from PokéAPI. Higher product wins 1 point (ties split 0.5).',
    winner: wPhys,
    detailA: `${a.heightM.toFixed(2)} m × ${a.weightKg.toFixed(1)} kg`,
    detailB: `${b.heightM.toFixed(2)} m × ${b.weightKg.toFixed(1)} kg`,
    pointsA: paP,
    pointsB: pbP,
  });

  // 4) Incoming threats from opponent typings (fewer is better)
  const incomingA = countIncomingSuperEffectiveFromTypes(b.types, effDefenderA);
  const incomingB = countIncomingSuperEffectiveFromTypes(a.types, effDefenderB);
  let wInc: ComparisonSide = 'tie';
  let paI = 0.5;
  let pbI = 0.5;
  if (incomingA < incomingB) {
    wInc = 'a';
    paI = 1;
    pbI = 0;
  } else if (incomingB < incomingA) {
    wInc = 'b';
    paI = 0;
    pbI = 1;
  }
  categories.push({
    id: 'incoming_threats',
    title: 'Incoming STAB pressure',
    rule: 'Count how many of the opponent’s typings appear in the standard “super-effective vs this Pokémon” list for your combined typing. Fewer overlaps wins 1 point.',
    winner: wInc,
    detailA: `${incomingA} overlap${incomingA === 1 ? '' : 's'}`,
    detailB: `${incomingB} overlap${incomingB === 1 ? '' : 's'}`,
    pointsA: paI,
    pointsB: pbI,
  });

  // 5) Offensive STAB overlap vs opponent (more is better)
  const offA = countStabSuperEffectiveOverlap(a.types, effDefenderB);
  const offB = countStabSuperEffectiveOverlap(b.types, effDefenderA);
  let wOff: ComparisonSide = 'tie';
  let paO = 0.5;
  let pbO = 0.5;
  if (offA > offB) {
    wOff = 'a';
    paO = 1;
    pbO = 0;
  } else if (offB > offA) {
    wOff = 'b';
    paO = 0;
    pbO = 1;
  }
  categories.push({
    id: 'stab_overlap',
    title: 'STAB coverage vs opponent',
    rule: 'Count how many of your typings are super-effective against the opponent’s combined typing (standard chart). More overlaps wins 1 point.',
    winner: wOff,
    detailA: `${offA} overlap${offA === 1 ? '' : 's'}`,
    detailB: `${offB} overlap${offB === 1 ? '' : 's'}`,
    pointsA: paO,
    pointsB: pbO,
  });

  const pointsA = categories.reduce((s, c) => s + c.pointsA, 0);
  const pointsB = categories.reduce((s, c) => s + c.pointsB, 0);

  return { categories, pointsA, pointsB };
}
