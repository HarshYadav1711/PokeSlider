import type { PokemonSummary, PokemonTypeName } from '../../types/pokemon';

import { weaknessesFor } from '../team-builder/typeMatchupChart';
import type { TypeMatchupChart } from '../team-builder/typeMatchupChart';

import { aestheticPoolNudge } from './aestheticTypeAffinity';
import type {
  DiscoveryEngineInput,
  DiscoveryEngineResult,
  DiscoveryPlaystyle,
  DiscoveryReasonLine,
  DiscoveryRecommendationKind,
  DiscoveryRelationship,
  DiscoveryScoredPick,
} from './discoveryRecommendationTypes';

const POPULAR_TYPES: ReadonlySet<PokemonTypeName> = new Set([
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'dragon',
  'steel',
  'fairy',
]);

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const t = a[i]!;
    a[i] = a[j]!;
    a[j] = t;
  }
  return a;
}

export function buildDiscoveryRecommendations(input: DiscoveryEngineInput): DiscoveryEngineResult {
  const anchorTypes = collectAnchorTypes(input.prefs, input.anchorSummaries);
  const anchorAvgBst = averageBst(input.anchorSummaries);
  const pool = input.pool.filter((p) => !input.prefs.favoritePokemonIds.includes(p.id));
  const typeFreq = typeFrequencyInPool(pool);

  const byKind: Record<DiscoveryRecommendationKind, DiscoveryScoredPick[]> = {
    similar: [],
    underrated: [],
    hidden_gem: [],
    synergy: [],
    rare_treat: [],
  };

  for (const row of pool) {
    byKind.similar.push(scoreSimilar(row, input, anchorTypes, anchorAvgBst));
    byKind.underrated.push(scoreUnderrated(row, input));
    byKind.hidden_gem.push(scoreHiddenGem(row, input));
    byKind.synergy.push(scoreSynergy(row, input));
    byKind.rare_treat.push(scoreRareTreat(row, input, typeFreq));
  }

  const kinds: DiscoveryRecommendationKind[] = [
    'synergy',
    'similar',
    'hidden_gem',
    'underrated',
    'rare_treat',
  ];

  const perKind = 4;
  const bestKindById = new Map<number, DiscoveryScoredPick>();

  for (const row of pool) {
    const variants = kinds.map((k) => byKind[k].find((x) => x.pokemonId === row.id)).filter(Boolean) as DiscoveryScoredPick[];
    const best = variants.reduce<DiscoveryScoredPick | null>((acc, cur) => {
      if (!acc || cur.score > acc.score) return cur;
      return acc;
    }, null);
    if (best && best.score > 0) bestKindById.set(row.id, best);
  }

  const grouped: Record<DiscoveryRecommendationKind, DiscoveryScoredPick[]> = {
    similar: [],
    underrated: [],
    hidden_gem: [],
    synergy: [],
    rare_treat: [],
  };
  for (const pick of bestKindById.values()) {
    grouped[pick.kind].push(pick);
  }

  const picks: DiscoveryScoredPick[] = [];
  for (const kind of kinds) {
    const slice = grouped[kind]
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, perKind);
    picks.push(...slice);
  }

  return {
    picks,
    sessionSummary: describeSession(input.prefs, picks.length),
  };
}

function describeSession(
  prefs: DiscoveryEngineInput['prefs'],
  count: number,
): string {
  const regions = prefs.favoriteRegionKeys.filter((k) => k !== 'any');
  const r = regions.length ? regions.join(', ') : 'all regions';
  return `Personalized ${count} picks from ${r} with your playstyle (${prefs.playstyle}) — every line is a rule you can inspect.`;
}

function collectAnchorTypes(
  prefs: DiscoveryEngineInput['prefs'],
  anchors: readonly PokemonSummary[],
): PokemonTypeName[] {
  const s = new Set<PokemonTypeName>();
  for (const a of anchors) for (const t of a.types) s.add(t);
  for (const t of prefs.favoriteTypes) s.add(t);
  return [...s];
}

function averageBst(anchors: readonly PokemonSummary[]): number {
  if (anchors.length === 0) return 460;
  return anchors.reduce((sum, a) => sum + a.baseStatTotal, 0) / anchors.length;
}

function typeFrequencyInPool(pool: readonly PokemonSummary[]): Map<PokemonTypeName, number> {
  const m = new Map<PokemonTypeName, number>();
  for (const p of pool) {
    for (const t of p.types) m.set(t, (m.get(t) ?? 0) + 1);
  }
  return m;
}

function playstyleNudge(p: PokemonSummary, style: DiscoveryPlaystyle): number {
  const { hp, attack, defense, specialAttack, specialDefense, speed } = p.baseStats;
  const off = (attack + specialAttack) / 2;
  const bulk = (hp / 2 + defense + specialDefense) / 3;
  switch (style) {
    case 'aggressive':
      return normalize(off, 55, 130) * 0.55 + normalize(speed, 40, 120) * 0.45;
    case 'bulky':
      return normalize(bulk, 45, 115) * 0.65 + normalize(hp, 35, 115) * 0.35;
    case 'balanced':
      return 1 - Math.abs(p.baseStatTotal - 480) / 180;
    case 'speedy':
      return normalize(speed, 50, 130) * 0.85 + normalize(off, 40, 110) * 0.15;
    case 'wallbreaker':
      return normalize(off, 70, 140) * 0.7 + normalize(speed, 35, 100) * 0.15 + normalize(p.baseStatTotal, 420, 620) * 0.15;
    case 'trickster':
      return normalize(speed, 55, 125) * 0.45 + normalize(Math.abs(attack - specialAttack), 0, 60) * 0.35 + normalize(off, 45, 110) * 0.2;
    default:
      return 0.5;
  }
}

function normalize(v: number, lo: number, hi: number): number {
  if (hi <= lo) return 0.5;
  return Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
}

function typeJaccard(a: readonly PokemonTypeName[], b: readonly PokemonTypeName[]): number {
  const sa = new Set(a);
  const sb = new Set(b);
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  const uni = sa.size + sb.size - inter;
  return uni === 0 ? 0 : inter / uni;
}

function scoreSimilar(
  p: PokemonSummary,
  input: DiscoveryEngineInput,
  anchorTypes: PokemonTypeName[],
  anchorAvgBst: number,
): DiscoveryScoredPick {
  const reasons: DiscoveryReasonLine[] = [];
  const rels: DiscoveryRelationship[] = [];

  const tjRaw = typeJaccard(p.types, anchorTypes);
  if (anchorTypes.length > 0 && tjRaw <= 0) {
    return { pokemonId: p.id, kind: 'similar', score: 0, reasons: [], relationships: [] };
  }

  const bstDiff = Math.abs(p.baseStatTotal - anchorAvgBst);
  const bstSim = 1 - Math.min(1, bstDiff / 130);
  const play = playstyleNudge(p, input.prefs.playstyle);
  const aes = aestheticPoolNudge(input.prefs.aesthetics, p.types);

  const tjBlend = anchorTypes.length > 0 ? tjRaw : 0.22 + play * 0.12;
  let score = tjBlend * 3.2 + bstSim * 1.8 + play * 0.85 + aes * 0.55;
  if (anchorTypes.length === 0) score *= 0.72;

  reasons.push({
    code: 'similar.jaccard',
    text:
      anchorTypes.length > 0
        ? `Typing overlap with your anchors scores ${(tjRaw * 100).toFixed(0)}% on a Jaccard index (shared types ÷ union).`
        : `No anchor typings yet — similarity leans on total stats and playstyle fit.`,
  });
  reasons.push({
    code: 'similar.bst',
    text: `Total base stats (${p.baseStatTotal}) sit ${bstDiff.toFixed(0)} points from your roster average (${anchorAvgBst.toFixed(0)}).`,
  });
  reasons.push({
    code: 'similar.playstyle',
    text: `Playstyle "${input.prefs.playstyle}" nudges stats using fixed curves (no random model).`,
  });

  rels.push({ kind: 'type_overlap', label: 'Typing overlap', strength: anchorTypes.length > 0 ? tjRaw : tjBlend });
  rels.push({ kind: 'stat_resonance', label: 'BST proximity', strength: bstSim });

  return { pokemonId: p.id, kind: 'similar', score, reasons, relationships: rels };
}

function scoreUnderrated(p: PokemonSummary, input: DiscoveryEngineInput): DiscoveryScoredPick {
  const reasons: DiscoveryReasonLine[] = [];
  const rels: DiscoveryRelationship[] = [];

  if (p.category !== 'regular') {
    return { pokemonId: p.id, kind: 'underrated', score: 0, reasons: [], relationships: [] };
  }
  if (p.baseStatTotal < 395 || p.baseStatTotal > 530) {
    return { pokemonId: p.id, kind: 'underrated', score: 0, reasons: [], relationships: [] };
  }

  let score = 1.4 + playstyleNudge(p, input.prefs.playstyle) * 0.9 + aestheticPoolNudge(input.prefs.aesthetics, p.types) * 0.5;
  if (p.id > 320) score += 0.15;
  reasons.push({
    code: 'underrated.rule',
    text: `Filtered to non-mythical / non-legendary species with total stats between 395–530 — strong but rarely poster-child picks.`,
  });
  reasons.push({
    code: 'underrated.bst',
    text: `BST ${p.baseStatTotal} sits in the “reliable teammate” band instead of chase rares.`,
  });
  rels.push({ kind: 'rarity_curve', label: 'Off-meta band', strength: 0.55 });
  return { pokemonId: p.id, kind: 'underrated', score, reasons, relationships: rels };
}

function scoreHiddenGem(p: PokemonSummary, input: DiscoveryEngineInput): DiscoveryScoredPick {
  const reasons: DiscoveryReasonLine[] = [];
  const rels: DiscoveryRelationship[] = [];

  if (p.category !== 'regular') {
    return { pokemonId: p.id, kind: 'hidden_gem', score: 0, reasons: [], relationships: [] };
  }

  const offbeatTypes = p.types.every((t) => !POPULAR_TYPES.has(t));
  const bulkySpeed = p.baseStats.speed <= 102;
  const power = p.baseStatTotal >= 500 || (p.baseStatTotal >= 470 && offbeatTypes);

  if (!power || !bulkySpeed) {
    return { pokemonId: p.id, kind: 'hidden_gem', score: 0, reasons: [], relationships: [] };
  }

  let score = 1.5 + aestheticPoolNudge(input.prefs.aesthetics, p.types) * 0.6;
  if (offbeatTypes) score += 0.35;
  if (p.baseStatTotal >= 520) score += 0.2;

  reasons.push({
    code: 'hidden.power',
    text: `High practical BST (${p.baseStatTotal}) while keeping Speed ≤ 102 — rewards patient teams over pure sweep fantasy.`,
  });
  if (offbeatTypes) {
    reasons.push({
      code: 'hidden.offbeat',
      text: `Typing steers away from the usual “billboard” typings, so it shows up less in generic lists.`,
    });
  }
  rels.push({ kind: 'rarity_curve', label: 'Quiet power', strength: 0.62 });
  return { pokemonId: p.id, kind: 'hidden_gem', score, reasons, relationships: rels };
}

function synergyAgainstAnchors(chart: TypeMatchupChart, p: PokemonSummary, anchors: readonly PokemonSummary[]): number {
  if (anchors.length === 0) return 0;
  let sum = 0;
  for (const a of anchors) {
    let best = 0;
    for (const t of p.types) {
      best = Math.max(best, chart.moveDamageMultiplier(t, a.types));
    }
    sum += best;
  }
  return sum / anchors.length;
}

function synergyAgainstTypePrefs(chart: TypeMatchupChart, p: PokemonSummary, types: readonly PokemonTypeName[]): number {
  if (types.length === 0) return 0;
  let sum = 0;
  for (const mono of types) {
    let best = 0;
    for (const t of p.types) {
      best = Math.max(best, chart.moveDamageMultiplier(t, [mono]));
    }
    sum += best;
  }
  return sum / types.length;
}

function scoreSynergy(p: PokemonSummary, input: DiscoveryEngineInput): DiscoveryScoredPick {
  const reasons: DiscoveryReasonLine[] = [];
  const rels: DiscoveryRelationship[] = [];

  if (!input.chart) {
    return {
      pokemonId: p.id,
      kind: 'synergy',
      score: 0,
      reasons: [
        {
          code: 'synergy.unavailable',
          text: 'Type matrix still loading — synergy needs the matchup chart from PokéAPI.',
        },
      ],
      relationships: [],
    };
  }

  const chart = input.chart;
  const anchorScore = synergyAgainstAnchors(chart, p, input.anchorSummaries);
  const prefScore = synergyAgainstTypePrefs(chart, p, input.prefs.favoriteTypes);
  const blend =
    input.anchorSummaries.length > 0
      ? anchorScore * 0.78 + prefScore * 0.22
      : prefScore > 0
        ? prefScore
        : anchorScore;

  if (blend < 1.01) {
    return { pokemonId: p.id, kind: 'synergy', score: 0, reasons: [], relationships: [] };
  }

  const reasonsExtra: DiscoveryReasonLine[] = [];
  if (input.anchorSummaries.length) {
    const weakSets = input.anchorSummaries.map((a) => weaknessesFor(chart, a.types));
    const uniq = [...new Set(weakSets.flat())].slice(0, 4);
    reasonsExtra.push({
      code: 'synergy.weak',
      text: `Weakness pressure for your anchors includes ${uniq.join(', ') || 'balanced typings'} — STAB coverage is averaged per favorite.`,
    });
  }

  const score = (blend - 1) * 2.4 + playstyleNudge(p, input.prefs.playstyle) * 0.35;

  reasons.push({
    code: 'synergy.stab',
    text: `STAB coverage score ${blend.toFixed(2)}× — best attacking type into each anchor’s typings, averaged (games-style chart).`,
  });
  reasons.push(...reasonsExtra);

  rels.push({
    kind: 'coverage',
    label: 'STAB pressure',
    strength: Math.min(1, (blend - 1) / 1.5),
  });

  return { pokemonId: p.id, kind: 'synergy', score, reasons, relationships: rels };
}

function scoreRareTreat(
  p: PokemonSummary,
  input: DiscoveryEngineInput,
  typeFreq: ReadonlyMap<PokemonTypeName, number>,
): DiscoveryScoredPick {
  const rng = mulberry32((input.sessionSeed ^ p.id * 2654435761) >>> 0);
  const reasons: DiscoveryReasonLine[] = [];
  const rels: DiscoveryRelationship[] = [];

  let novelty = 0.55 + rng() * 0.25;
  if (input.recentPokemonIds.has(p.id)) novelty -= 0.35;
  if (input.dexFavoriteIds.has(p.id)) novelty -= 0.2;

  let rarity = 0.4;
  for (const t of p.types) {
    const f = typeFreq.get(t) ?? 1;
    rarity += 1 / Math.sqrt(1 + f);
  }
  rarity /= Math.max(1, p.types.length);

  const aes = aestheticPoolNudge(input.prefs.aesthetics, p.types);
  const score = novelty * 1.4 + rarity * 1.1 + aes * 0.45 + rng() * 0.15;

  reasons.push({
    code: 'rare.novelty',
    text: input.recentPokemonIds.has(p.id)
      ? `Lower novelty because it is in recent My Dex views — we bias away from repeats.`
      : `Boosted novelty — not in your recent My Dex trail for this session.`,
  });
  reasons.push({
    code: 'rare.typefreq',
    text: `Typing rarity uses inverse √(frequency) inside the sampled pool so common typings sink slightly.`,
  });
  reasons.push({
    code: 'rare.seed',
    text: `Session seed ${input.sessionSeed} feeds a deterministic PRNG (Mulberry32) for tie breaks — hit refresh to re-roll.`,
  });

  rels.push({ kind: 'session_explorer', label: 'Session novelty', strength: Math.max(0, Math.min(1, novelty)) });
  rels.push({ kind: 'rarity_curve', label: 'Pool rarity', strength: Math.max(0, Math.min(1, rarity)) });

  return { pokemonId: p.id, kind: 'rare_treat', score, reasons, relationships: rels };
}
