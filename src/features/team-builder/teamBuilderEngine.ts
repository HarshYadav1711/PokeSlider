import { ALL_POKEMON_TYPES } from '../../data/pokemonTypes';
import type { PokemonSummary, PokemonTypeName } from '../../types/pokemon';
import { inferPokemonBattleRole } from '../../utils/pokemonBattleRole';

import type {
  RiskTolerance,
  ScoreBreakdownLine,
  TeamBuildResult,
  TeamBuilderInput,
  TeamGap,
  TeamGoal,
  TeamMetrics,
  TeamPickExplanation,
  TeamSwapSuggestion,
} from './teamBuilderTypes';
import type { TypeMatchupChart } from './typeMatchupChart';
import { weaknessesFor } from './typeMatchupChart';

const TEAM_SIZE = 6;

/** Relative weights per goal — transparent tuning table (not learned). */
const GOAL_WEIGHTS: Record<
  TeamGoal,
  { coverage: number; defense: number; offense: number; speed: number; balance: number; diversity: number }
> = {
  balance: { coverage: 0.22, defense: 0.22, offense: 0.22, speed: 0.12, balance: 0.14, diversity: 0.08 },
  offense: { coverage: 0.18, defense: 0.1, offense: 0.42, speed: 0.18, balance: 0.06, diversity: 0.06 },
  defense: { coverage: 0.14, defense: 0.42, offense: 0.12, speed: 0.08, balance: 0.16, diversity: 0.08 },
  speed: { coverage: 0.16, defense: 0.12, offense: 0.2, speed: 0.38, balance: 0.08, diversity: 0.06 },
  nuzlocke: { coverage: 0.2, defense: 0.28, offense: 0.18, speed: 0.12, balance: 0.14, diversity: 0.08 },
  type_coverage: { coverage: 0.52, defense: 0.12, offense: 0.12, speed: 0.08, balance: 0.08, diversity: 0.08 },
  favorites_first: { coverage: 0.18, defense: 0.16, offense: 0.18, speed: 0.12, balance: 0.16, diversity: 0.2 },
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function uniqSortedIds(ids: readonly number[]): number[] {
  return [...new Set(ids)].sort((a, b) => a - b);
}

function formatName(name: string): string {
  return name
    .split('-')
    .map((w) => (w.length === 0 ? w : w[0]!.toUpperCase() + w.slice(1)))
    .join(' ');
}

export function filterPoolForBuilder(
  pool: readonly PokemonSummary[],
  input: Pick<TeamBuilderInput, 'goal' | 'risk'>,
): PokemonSummary[] {
  let r = [...pool];
  if (input.goal === 'nuzlocke') {
    r = r.filter((p) => p.category === 'regular');
  }
  if (input.risk === 'low') {
    r = r.filter((p) => !p.isLegendary && !p.isMythical);
  }
  return r.sort((a, b) => a.id - b.id);
}

function offensiveStat(p: PokemonSummary): number {
  const s = p.baseStats;
  return Math.max(s.attack, s.specialAttack) + p.baseStatTotal * 0.02;
}

function defensiveStat(p: PokemonSummary): number {
  const s = p.baseStats;
  return s.hp + s.defense + s.specialDefense + s.speed * 0.15;
}

function stabCoversMonoType(chart: TypeMatchupChart, team: readonly PokemonSummary[], mono: PokemonTypeName): boolean {
  for (const m of team) {
    for (const stab of m.types) {
      if (chart.moveDamageMultiplier(stab, [mono]) >= 2) return true;
    }
  }
  return false;
}

function monoStabCoverageRatio(chart: TypeMatchupChart, team: readonly PokemonSummary[]): number {
  let hit = 0;
  for (const mono of ALL_POKEMON_TYPES) {
    if (stabCoversMonoType(chart, team, mono)) hit++;
  }
  return hit / ALL_POKEMON_TYPES.length;
}

function sharedWeaknessHistogram(
  chart: TypeMatchupChart,
  team: readonly PokemonSummary[],
): Map<PokemonTypeName, number> {
  const hist = new Map<PokemonTypeName, number>();
  for (const atk of ALL_POKEMON_TYPES) hist.set(atk, 0);
  for (const m of team) {
    const weak = weaknessesFor(chart, m.types, 2);
    for (const w of weak) {
      hist.set(w, (hist.get(w) ?? 0) + 1);
    }
  }
  return hist;
}

function computeMetrics(chart: TypeMatchupChart, team: readonly PokemonSummary[]): TeamMetrics {
  const stabMonoCoverage = monoStabCoverageRatio(chart, team);
  const hist = sharedWeaknessHistogram(chart, team);
  let maxShared = 0;
  const worst: { attackType: PokemonTypeName; count: number }[] = [];
  for (const [, c] of hist) {
    if (c > maxShared) maxShared = c;
  }
  for (const [atk, c] of hist) {
    if (c >= 2) worst.push({ attackType: atk, count: c });
  }
  worst.sort((a, b) => b.count - a.count || a.attackType.localeCompare(b.attackType));

  const roleCounts: TeamMetrics['roleCounts'] = {
    physical: 0,
    special: 0,
    mixed: 0,
    wall: 0,
    scout: 0,
  };
  let speedSum = 0;
  let bstSum = 0;
  const typingKeys = new Set<string>();
  for (const m of team) {
    roleCounts[inferPokemonBattleRole(m)]++;
    speedSum += m.baseStats.speed;
    bstSum += m.baseStatTotal;
    typingKeys.add([...m.types].sort().join('|'));
  }

  return {
    stabMonoCoverage,
    maxSharedWeaknessCount: maxShared,
    worstOffensiveThreats: worst.slice(0, 8),
    averageBst: team.length ? bstSum / team.length : 0,
    roleCounts,
    averageSpeed: team.length ? speedSum / team.length : 0,
    typingDiversity: team.length ? typingKeys.size / team.length : 0,
  };
}

function balanceEntropy(metrics: TeamMetrics): number {
  const buckets = Object.values(metrics.roleCounts);
  const total = buckets.reduce((a, b) => a + b, 0) || 1;
  let h = 0;
  for (const c of buckets) {
    const p = c / total;
    if (p > 0) h -= p * Math.log(p + 1e-9);
  }
  return h / Math.log(5); // normalize ~0–1
}

function objectiveFromMetrics(
  metrics: TeamMetrics,
  goal: TeamGoal,
  teamSize: number,
): { score: number; parts: Record<string, number> } {
  const w = GOAL_WEIGHTS[goal];
  const defenseCluster = clamp(1 - metrics.maxSharedWeaknessCount / Math.max(1, teamSize), 0, 1);
  const offense = clamp(metrics.averageBst / 620, 0, 1) * 0.55 + clamp(metrics.averageSpeed / 110, 0, 1) * 0.45;
  const speed = clamp(metrics.averageSpeed / 105, 0, 1);
  const balance = balanceEntropy(metrics);
  const diversity = clamp(metrics.typingDiversity, 0, 1);
  const parts = {
    coverage: metrics.stabMonoCoverage * w.coverage,
    defense: defenseCluster * w.defense,
    offense: offense * w.offense,
    speed: speed * w.speed,
    balance: balance * w.balance,
    diversity: diversity * w.diversity,
  };
  const score = 100 * (parts.coverage + parts.defense + parts.offense + parts.speed + parts.balance + parts.diversity);
  return { score, parts };
}

function riskRarityPenalty(p: PokemonSummary, risk: RiskTolerance): number {
  if (risk === 'high') return 0;
  if (p.isMythical) return risk === 'low' ? 80 : 35;
  if (p.isLegendary) return risk === 'low' ? 60 : 25;
  if (p.isPseudoLegendary) return risk === 'medium' ? 8 : risk === 'low' ? 18 : 0;
  return 0;
}

function primaryTypeBonus(p: PokemonSummary, primary: PokemonTypeName | null): number {
  if (!primary) return 0;
  return p.types.includes(primary) ? 14 : 0;
}

function favoriteBonus(p: PokemonSummary, favorites: ReadonlySet<number>, goal: TeamGoal): number {
  if (!favorites.has(p.id)) return 0;
  return goal === 'favorites_first' ? 26 : 10;
}

function individualAppeal(p: PokemonSummary, chart: TypeMatchupChart, input: TeamBuilderInput): number {
  let s = 0;
  s += offensiveStat(p) * 0.35;
  s += defensiveStat(p) * 0.22;
  s += p.baseStats.speed * 0.25;
  s -= riskRarityPenalty(p, input.risk);
  s += primaryTypeBonus(p, input.primaryType);
  s += favoriteBonus(p, input.favoriteIds, input.goal);
  // STAB breadth: dual types cover more mono targets on average — tiny proxy
  s += p.types.length * 3;
  // Self-coverage: can this mon threaten its own weaknesses?
  const weak = weaknessesFor(chart, p.types, 2);
  let selfCover = 0;
  for (const w of weak) {
    for (const stab of p.types) {
      if (chart.moveDamageMultiplier(stab, [w]) >= 2) {
        selfCover += 2;
        break;
      }
    }
  }
  s += selfCover;
  return s;
}

function marginalObjective(
  chart: TypeMatchupChart,
  current: PokemonSummary[],
  candidate: PokemonSummary,
  input: TeamBuilderInput,
): number {
  const before = objectiveFromMetrics(computeMetrics(chart, current), input.goal, TEAM_SIZE).score;
  const after = objectiveFromMetrics(computeMetrics(chart, [...current, candidate]), input.goal, TEAM_SIZE).score;
  return after - before;
}

function diversityPenalty(team: PokemonSummary[], candidate: PokemonSummary): number {
  let pen = 0;
  const ct = new Map<PokemonTypeName, number>();
  for (const m of team) {
    for (const t of m.types) ct.set(t, (ct.get(t) ?? 0) + 1);
  }
  for (const t of candidate.types) {
    const c = ct.get(t) ?? 0;
    pen += c * 4;
  }
  return pen;
}

function explainMarginalPick(
  chart: TypeMatchupChart,
  teamBefore: PokemonSummary[],
  pick: PokemonSummary,
  input: TeamBuilderInput,
): TeamPickExplanation {
  const metricsBefore = computeMetrics(chart, teamBefore);
  const metricsAfter = computeMetrics(chart, [...teamBefore, pick]);
  const objBefore = objectiveFromMetrics(metricsBefore, input.goal, TEAM_SIZE);
  const objAfter = objectiveFromMetrics(metricsAfter, input.goal, TEAM_SIZE);
  const lines: ScoreBreakdownLine[] = [];

  const dCov = metricsAfter.stabMonoCoverage - metricsBefore.stabMonoCoverage;
  lines.push({
    label: 'STAB mono coverage',
    points: Math.round(dCov * 100 * GOAL_WEIGHTS[input.goal].coverage),
    detail:
      dCov >= 0.02
        ? `Covered ${Math.round(metricsAfter.stabMonoCoverage * 18)}/18 mono typings with team STAB (up from ${Math.round(metricsBefore.stabMonoCoverage * 18)}).`
        : 'Coverage unchanged at this step — other stats carried the pick.',
  });

  const dWeak = metricsBefore.maxSharedWeaknessCount - metricsAfter.maxSharedWeaknessCount;
  lines.push({
    label: 'Shared weakness pressure',
    points: Math.round(dWeak * 12 * GOAL_WEIGHTS[input.goal].defense),
    detail:
      dWeak > 0
        ? `Reduced the worst "how many Pokémon share a weakness" cluster by ${dWeak}.`
        : `Worst-case shared weakness count is still ${metricsAfter.maxSharedWeaknessCount} (lower is safer).`,
  });

  lines.push({
    label: 'Speed & pressure',
    points: Math.round((metricsAfter.averageSpeed - metricsBefore.averageSpeed) * 0.35 * GOAL_WEIGHTS[input.goal].speed),
    detail: `Adds ${pick.baseStats.speed} Speed (team avg ${metricsAfter.averageSpeed.toFixed(0)}). Offense proxy uses max(ATK, SPA)=${Math.max(pick.baseStats.attack, pick.baseStats.specialAttack)}.`,
  });

  const entBefore = balanceEntropy(metricsBefore);
  const entAfter = balanceEntropy(metricsAfter);
  lines.push({
    label: 'Role balance',
    points: Math.round((entAfter - entBefore) * 40 * GOAL_WEIGHTS[input.goal].balance),
    detail: `Role bucket: ${inferPokemonBattleRole(pick)} — counts now ${JSON.stringify(metricsAfter.roleCounts)}.`,
  });

  if (input.primaryType && pick.types.includes(input.primaryType)) {
    lines.push({
      label: 'Primary type preference',
      points: Math.round(8 * GOAL_WEIGHTS[input.goal].offense + 8 * GOAL_WEIGHTS[input.goal].coverage),
      detail: `Matches your ${input.primaryType} preference on typings.`,
    });
  }
  if (input.favoriteIds.has(pick.id)) {
    lines.push({
      label: 'Favorite weighting',
      points: input.goal === 'favorites_first' ? 18 : 8,
      detail: 'This species is in your favorites list — the builder biased toward it when ties were close.',
    });
  }

  lines.sort((a, b) => Math.abs(b.points) - Math.abs(a.points));

  const summary = `${formatName(pick.name)} improved the ${input.goal.replaceAll('_', ' ')} score from ${objBefore.score.toFixed(1)} → ${objAfter.score.toFixed(1)} (Δ ${(objAfter.score - objBefore.score).toFixed(1)}).`;

  return { pokemonId: pick.id, breakdown: lines.slice(0, 5), summary };
}

function buildGaps(chart: TypeMatchupChart, team: PokemonSummary[], metrics: TeamMetrics): TeamGap[] {
  const gaps: TeamGap[] = [];
  const uncovered: PokemonTypeName[] = [];
  for (const mono of ALL_POKEMON_TYPES) {
    if (!stabCoversMonoType(chart, team, mono)) uncovered.push(mono);
  }
  if (uncovered.length > 0) {
    gaps.push({
      severity: uncovered.length > 6 ? 'warn' : 'info',
      title: 'STAB coverage gaps',
      detail: `No team STAB moves hit these typings for ≥2× on a mono target: ${uncovered.map((t) => formatName(t)).join(', ')}.`,
    });
  }
  if (metrics.maxSharedWeaknessCount >= 3) {
    gaps.push({
      severity: 'warn',
      title: 'Stacked defensive risk',
      detail: `Up to ${metrics.maxSharedWeaknessCount} Pokémon share a single weakness line — consider a resist pivot or immunity.`,
    });
  }
  if (metrics.roleCounts.physical + metrics.roleCounts.special < 2) {
    gaps.push({
      severity: 'info',
      title: 'Damage profile',
      detail: 'You have few dedicated physical or special attackers — fine for stall, weaker for breaking past walls.',
    });
  }
  if (metrics.averageSpeed < 75) {
    gaps.push({
      severity: 'info',
      title: 'Tempo',
      detail: 'Average Speed is modest — fine for bulkier plans, but watch faster sweepers.',
    });
  }
  return gaps;
}

function suggestSwaps(
  chart: TypeMatchupChart,
  team: PokemonSummary[],
  pool: PokemonSummary[],
  input: TeamBuilderInput,
  lockedIds: readonly number[],
): TeamSwapSuggestion[] {
  const byId = new Map(pool.map((p) => [p.id, p] as const));
  const baseScore = objectiveFromMetrics(computeMetrics(chart, team), input.goal, TEAM_SIZE).score;
  const suggestions: TeamSwapSuggestion[] = [];
  const lockedSet = new Set(lockedIds);

  for (let i = 0; i < team.length; i++) {
    if (lockedSet.has(team[i]!.id)) continue;
    let best: TeamSwapSuggestion | null = null;
    for (const alt of pool) {
      if (team.some((m) => m.id === alt.id)) continue;
      const next = team.slice();
      next[i] = alt;
      const sc = objectiveFromMetrics(computeMetrics(chart, next), input.goal, TEAM_SIZE).score;
      const delta = sc - baseScore;
      if (delta > 0.35 && (!best || delta > best.scoreDelta)) {
        const old = team[i]!;
        best = {
          slotIndex: i,
          replaceId: old.id,
          withId: alt.id,
          scoreDelta: delta,
          reason: `Objective +${delta.toFixed(1)} — usually better coverage or fewer stacked weaknesses than ${formatName(old.name)}.`,
        };
      }
    }
    if (best) suggestions.push(best);
  }

  // Fill reason with one concrete metric diff when possible
  for (const sug of suggestions) {
    const oldM = byId.get(sug.replaceId);
    const newM = byId.get(sug.withId);
    if (!oldM || !newM) continue;
    const teamA = team.map((m, idx) => (idx === sug.slotIndex ? newM : m));
    const metOld = computeMetrics(chart, team);
    const metNew = computeMetrics(chart, teamA);
    if (metNew.stabMonoCoverage > metOld.stabMonoCoverage) {
      sug.reason = `Raises STAB mono coverage ${(metOld.stabMonoCoverage * 100).toFixed(0)}% → ${(metNew.stabMonoCoverage * 100).toFixed(0)}% vs ${formatName(oldM.name)}.`;
    } else if (metNew.maxSharedWeaknessCount < metOld.maxSharedWeaknessCount) {
      sug.reason = `Lowers worst shared-weakness cluster ${metOld.maxSharedWeaknessCount} → ${metNew.maxSharedWeaknessCount} compared with ${formatName(oldM.name)}.`;
    }
  }

  return suggestions.sort((a, b) => b.scoreDelta - a.scoreDelta).slice(0, 5);
}

export function buildTeamRecommendation(args: {
  pool: readonly PokemonSummary[];
  chart: TypeMatchupChart;
  input: TeamBuilderInput;
  poolNote: string;
}): TeamBuildResult {
  const { chart, input, poolNote } = args;
  const pool = filterPoolForBuilder(args.pool, input);
  const byId = new Map(pool.map((p) => [p.id, p] as const));

  const locked = uniqSortedIds(input.lockedIds).slice(0, TEAM_SIZE);
  const team: PokemonSummary[] = [];
  const used = new Set<number>();

  for (const id of locked) {
    const row = byId.get(id);
    if (row) {
      team.push(row);
      used.add(id);
    }
  }

  // If locked mons missing from pool, widen pool by adding them (still need summaries from caller)
  for (const id of locked) {
    if (!used.has(id)) {
      const orphan = args.pool.find((p) => p.id === id);
      if (orphan) {
        team.push(orphan);
        used.add(id);
        byId.set(id, orphan);
      }
    }
  }

  while (team.length < TEAM_SIZE) {
    let best: PokemonSummary | null = null;
    let bestKey: number = -Infinity;
    for (const p of pool) {
      if (used.has(p.id)) continue;
      const marg = marginalObjective(chart, team, p, input);
      const tie = individualAppeal(p, chart, input);
      const divPen = diversityPenalty(team, p);
      const key = marg * 3 + tie * 0.08 - divPen;
      if (key > bestKey) {
        bestKey = key;
        best = p;
      }
    }
    if (!best) break;
    team.push(best);
    used.add(best.id);
  }

  // Trim / pad failure
  const finalTeam = team.slice(0, TEAM_SIZE);
  const metrics = computeMetrics(chart, finalTeam);
  const uncoveredMonoTypes: PokemonTypeName[] = [];
  for (const mono of ALL_POKEMON_TYPES) {
    if (!stabCoversMonoType(chart, finalTeam, mono)) uncoveredMonoTypes.push(mono);
  }

  const picks: TeamPickExplanation[] = [];
  const acc: PokemonSummary[] = [];
  const lockedSet = new Set(locked);
  for (const m of finalTeam) {
    if (lockedSet.has(m.id)) {
      picks.push({
        pokemonId: m.id,
        summary: `${formatName(m.name)} is locked — the builder kept it as an anchor.`,
        breakdown: [
          {
            label: 'User lock',
            points: 0,
            detail: 'Locked picks skip marginal scoring so favorites stay on the team.',
          },
        ],
      });
    } else {
      picks.push(explainMarginalPick(chart, acc, m, input));
    }
    acc.push(m);
  }

  const gaps = buildGaps(chart, finalTeam, metrics);
  const swaps = suggestSwaps(
    chart,
    finalTeam,
    [...new Map([...pool, ...finalTeam].map((p) => [p.id, p] as const)).values()],
    input,
    locked,
  );

  return {
    team: finalTeam,
    metrics,
    uncoveredMonoTypes,
    picks,
    gaps,
    swaps,
    poolNote,
  };
}

export function getTeamBuilderGoalWeights(goal: TeamGoal) {
  return GOAL_WEIGHTS[goal];
}

export function formatPokemonLabel(name: string): string {
  return formatName(name);
}
