import type { PokeBallDefinition } from '../data/pokeballs';
import { POKEBALLS } from '../data/pokeballs';
import type { PokemonSummary } from '../types/pokemon';

/** Subset of `PokemonSummary` used by thematic ball lens scoring (keeps overlays light). */
export type BallLensPokemonInput = Pick<
  PokemonSummary,
  | 'types'
  | 'speciesCatchRate'
  | 'habitatSlug'
  | 'genus'
  | 'isLegendary'
  | 'isMythical'
  | 'isPseudoLegendary'
  | 'category'
  | 'isBaby'
  | 'baseStatTotal'
>;

export type BallLensKind = 'practical' | 'thematic' | 'visual' | 'collector';

export interface BallLensRecommendation {
  readonly lens: BallLensKind;
  readonly ball: PokeBallDefinition;
  readonly reasons: readonly string[];
}

function hasType(p: Pick<BallLensPokemonInput, 'types'>, t: BallLensPokemonInput['types'][number]): boolean {
  return p.types.includes(t);
}

function scoreBall(ball: PokeBallDefinition, p: BallLensPokemonInput): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  const catchN = p.speciesCatchRate;
  const h = p.habitatSlug;
  const genus = (p.genus ?? '').toLowerCase();

  switch (ball.id) {
    case 'master-ball':
      if (p.isLegendary || p.isMythical) {
        score += 120;
        reasons.push('Legendary or mythical encounter — the canonical “no risk” answer.');
      }
      break;
    case 'ultra-ball':
      if (p.isLegendary || p.isMythical) {
        score += 55;
        reasons.push('High-pressure catch tier — matches rare encounter stakes.');
      }
      if (catchN <= 45) {
        score += 40;
        reasons.push(`Low species catch rate (${catchN}/255) rewards a premium multiplier.`);
      } else if (catchN <= 90) {
        score += 18;
        reasons.push('Catch rate sits in the “worth upgrading” band.');
      }
      break;
    case 'great-ball':
      if (catchN > 45 && catchN <= 120) {
        score += 35;
        reasons.push('Mid catch rate — a strong everyday upgrade over basics.');
      }
      if (p.category === 'regular' && p.baseStatTotal >= 400 && p.baseStatTotal < 520) {
        score += 12;
        reasons.push('Solid BST tier where Great Balls feel narratively honest.');
      }
      break;
    case 'poke-ball':
      score += 8;
      reasons.push('Always valid baseline — good when odds are already forgiving.');
      if (catchN >= 150) {
        score += 22;
        reasons.push('High catch rate makes the baseline ball a rational pick.');
      }
      break;
    case 'net-ball':
      if (hasType(p, 'bug') || hasType(p, 'water')) {
        score += 70;
        reasons.push('Bug / Water typing aligns with the Net Ball’s specialty.');
      }
      if (h === 'waters-edge' || h === 'sea') {
        score += 18;
        reasons.push('Aquatic-adjacent habitat reinforces a Net Ball story.');
      }
      break;
    case 'dive-ball':
      if (hasType(p, 'water')) {
        score += 72;
        reasons.push('Water typing maps cleanly to Dive Ball fantasy.');
      }
      if (h === 'sea') {
        score += 28;
        reasons.push('Open-water habitat makes the Dive Ball feel canonical.');
      }
      break;
    case 'nest-ball':
      if (p.isBaby || p.baseStatTotal <= 360) {
        score += 45;
        reasons.push('Lower BST / baby species fits the Nest Ball’s “early route” niche.');
      }
      if (h === 'grassland' || h === 'forest') {
        score += 14;
        reasons.push('Field or forest habitat pairs with gentle capture fantasy.');
      }
      break;
    case 'repeat-ball':
      score += 10;
      reasons.push('Strong when you’re re-encountering a registered line — great for collection loops.');
      break;
    case 'timer-ball':
      if (hasType(p, 'ghost') || hasType(p, 'dark')) {
        score += 26;
        reasons.push('Ghost / Dark typing nods to drawn-out, tense encounters.');
      }
      if (catchN <= 60) {
        score += 34;
        reasons.push('Stubborn catch rates reward patience mechanics.');
      }
      break;
    case 'premier-ball':
      if (p.isMythical || p.isPseudoLegendary) {
        score += 38;
        reasons.push('Ceremony-forward shell suits trophy-tier species.');
      }
      if (genus.includes('dragon') || genus.includes('royal') || genus.includes('elegant')) {
        score += 22;
        reasons.push('Genus flavor leans premium — Premier reads as intentional.');
      }
      if (p.category === 'regular' && p.baseStatTotal >= 520) {
        score += 12;
        reasons.push('High BST “showpiece” catches photograph well in Premier chrome.');
      }
      break;
    default:
      break;
  }

  score += ball.collectibilityScore * 0.04;
  return { score, reasons };
}

function pickBest(balls: readonly PokeBallDefinition[], p: BallLensPokemonInput): PokeBallDefinition {
  const first = balls[0];
  if (!first) return POKEBALLS[0]!;
  let best = first;
  let bestScore = -Infinity;
  for (const b of balls) {
    const { score } = scoreBall(b, p);
    if (score > bestScore || (score === bestScore && b.id.localeCompare(best.id) < 0)) {
      bestScore = score;
      best = b;
    }
  }
  return best;
}

function pickForLens(kind: BallLensKind, p: BallLensPokemonInput): BallLensRecommendation {
  const all = [...POKEBALLS];
  const nonMaster = all.filter((b) => b.mechanic.kind !== 'master' || p.isLegendary || p.isMythical);

  let pool = nonMaster;
  if (kind === 'practical') {
    pool = nonMaster.filter((b) =>
      ['poke-ball', 'great-ball', 'ultra-ball', 'net-ball', 'dive-ball', 'nest-ball', 'repeat-ball', 'timer-ball'].includes(
        b.id,
      ),
    );
  } else if (kind === 'thematic') {
    pool = nonMaster.filter((b) =>
      ['net-ball', 'dive-ball', 'nest-ball', 'timer-ball', 'repeat-ball'].includes(b.id),
    );
  } else if (kind === 'visual') {
    pool = nonMaster.filter((b) => ['premier-ball', 'great-ball', 'ultra-ball'].includes(b.id));
  } else {
    pool = nonMaster.filter((b) => ['premier-ball', 'ultra-ball', 'master-ball', 'great-ball'].includes(b.id));
  }

  const ball = pickBest(pool.length > 0 ? pool : nonMaster, p);
  const { reasons } = scoreBall(ball, p);
  const reasonOut = reasons.length > 0 ? reasons : ['Balanced pick from the canonical ball catalog.'];
  return { lens: kind, ball, reasons: reasonOut.slice(0, 2) };
}

/** Deterministic, explainable lens picks — complements numeric catch-rate ranking. */
export function buildBallLensRecommendations(p: BallLensPokemonInput): BallLensRecommendation[] {
  return [
    pickForLens('practical', p),
    pickForLens('thematic', p),
    pickForLens('visual', p),
    pickForLens('collector', p),
  ];
}
