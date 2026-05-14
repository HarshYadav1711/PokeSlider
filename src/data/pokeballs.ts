import type { PokemonTypeName } from '../types/pokemon';

/** How this ball scales in the catch formula for a given battle context */
export type PokeBallMechanic =
  | { kind: 'static'; multiplier: number }
  | { kind: 'master' }
  | { kind: 'net' }
  | { kind: 'dive' }
  | { kind: 'nest' }
  | { kind: 'repeat'; whenRegistered: number }
  | { kind: 'timer' };

export type PokeBallRarityTier = 'volume' | 'premium' | 'elite' | 'specialty' | 'artifact';

/** Canonical Poké Ball catalog — single source of truth for UI, catch engine, and suggestions */
export interface PokeBallDefinition {
  readonly id: string;
  readonly name: string;
  readonly image: string;
  /** Human-readable effectiveness line (marketing / Pokédex-adjacent) */
  readonly catchRate: string;
  readonly description: string;
  /** Types or category tokens used to pick example Pokémon for this ball */
  readonly pokemonTypes: readonly string[];
  readonly rarityTier: PokeBallRarityTier;
  /** 0–100 subjective “collector heat” for card chrome (not gameplay data). */
  readonly collectibilityScore: number;
  /** Short collectible-card tagline — product voice, not raw Pokédex text */
  readonly heritageLine: string;
  readonly mechanic: PokeBallMechanic;
}

export const POKEBALLS: readonly PokeBallDefinition[] = [
  {
    id: 'poke-ball',
    name: 'Poke Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
    catchRate: '1×',
    description:
      'A device for catching wild Pokémon. It is thrown like a ball at a Pokémon, comfortably encapsulating its target.',
    pokemonTypes: ['normal', 'flying', 'bug'],
    rarityTier: 'volume',
    collectibilityScore: 28,
    heritageLine: 'The original field kit — billions thrown, every journey starts here.',
    mechanic: { kind: 'static', multiplier: 1 },
  },
  {
    id: 'great-ball',
    name: 'Great Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
    catchRate: '1.5×',
    description:
      'A good, high-performance Poké Ball that provides a higher success rate for catching Pokémon than a standard Poké Ball.',
    pokemonTypes: ['normal', 'flying', 'bug', 'water'],
    rarityTier: 'premium',
    collectibilityScore: 44,
    heritageLine: 'Blue trim, serious grip — the trainer’s everyday upgrade.',
    mechanic: { kind: 'static', multiplier: 1.5 },
  },
  {
    id: 'ultra-ball',
    name: 'Ultra Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
    catchRate: '2×',
    description:
      'An ultra-high-performance Poké Ball that provides a higher success rate for catching Pokémon than a Great Ball.',
    pokemonTypes: ['normal', 'flying', 'bug', 'water', 'fire', 'electric'],
    rarityTier: 'elite',
    collectibilityScore: 62,
    heritageLine: 'Black and yellow urgency — when you refuse to let the encounter slip away.',
    mechanic: { kind: 'static', multiplier: 2 },
  },
  {
    id: 'master-ball',
    name: 'Master Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
    catchRate: 'Guaranteed',
    description:
      'The best Poké Ball with the ultimate level of performance. It will catch any wild Pokémon without fail.',
    pokemonTypes: ['legendary', 'mythical'],
    rarityTier: 'artifact',
    collectibilityScore: 100,
    heritageLine: 'Silph’s mythic prototype — one shot, zero drama, legend-tier insurance.',
    mechanic: { kind: 'master' },
  },
  {
    id: 'premier-ball',
    name: 'Premier Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/premier-ball.png',
    catchRate: '1×',
    description:
      'A somewhat rare Poké Ball that was made as a commemorative item used to celebrate an event of some sort.',
    pokemonTypes: ['normal', 'flying'],
    rarityTier: 'premium',
    collectibilityScore: 52,
    heritageLine: 'Clean white ceremony shell — performance like a Poké Ball, prestige like a medal.',
    mechanic: { kind: 'static', multiplier: 1 },
  },
  {
    id: 'net-ball',
    name: 'Net Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/net-ball.png',
    catchRate: '3× (Bug / Water)',
    description:
      'A somewhat different Poké Ball that works especially well on Bug- and Water-type Pokémon.',
    pokemonTypes: ['bug', 'water'],
    rarityTier: 'specialty',
    collectibilityScore: 58,
    heritageLine: 'Mesh pattern, surgical focus — surf routes and forests pay extra respect.',
    mechanic: { kind: 'net' },
  },
  {
    id: 'dive-ball',
    name: 'Dive Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dive-ball.png',
    catchRate: '3.5× (Water)',
    description:
      'A somewhat different Poké Ball that works especially well on Pokémon that live underwater.',
    pokemonTypes: ['water'],
    rarityTier: 'specialty',
    collectibilityScore: 60,
    heritageLine: 'Pressure-tested casing — built for mon that call the deep home.',
    mechanic: { kind: 'dive' },
  },
  {
    id: 'nest-ball',
    name: 'Nest Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/nest-ball.png',
    catchRate: 'Up to ~4× (low level)',
    description:
      'A somewhat different Poké Ball that works especially well on weaker Pokémon in the wild.',
    pokemonTypes: ['normal', 'bug', 'flying'],
    rarityTier: 'specialty',
    collectibilityScore: 56,
    heritageLine: 'Gentle taper — rewards patience when the wild partner is still growing.',
    mechanic: { kind: 'nest' },
  },
  {
    id: 'repeat-ball',
    name: 'Repeat Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/repeat-ball.png',
    catchRate: '3× (registered)',
    description:
      'A somewhat different Poké Ball that works especially well on Pokémon species that were previously caught.',
    pokemonTypes: ['normal'],
    rarityTier: 'specialty',
    collectibilityScore: 54,
    heritageLine: 'Dex-linked latch — familiarity stacks the odds for round two.',
    mechanic: { kind: 'repeat', whenRegistered: 3 },
  },
  {
    id: 'timer-ball',
    name: 'Timer Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/timer-ball.png',
    catchRate: 'Up to ~4× (long fight)',
    description:
      'A somewhat different Poké Ball that becomes progressively more effective the more turns that are taken in battle.',
    pokemonTypes: ['normal'],
    rarityTier: 'specialty',
    collectibilityScore: 55,
    heritageLine: 'Clockface tension — the longer the duel breathes, the heavier it lands.',
    mechanic: { kind: 'timer' },
  },
] as const;

export type PokeBallId = (typeof POKEBALLS)[number]['id'];

const byId = new Map<string, PokeBallDefinition>(POKEBALLS.map((b) => [b.id, b]));

export function getPokeBallById(id: string): PokeBallDefinition | undefined {
  return byId.get(id);
}

export function isPokemonTypeToken(token: string): token is PokemonTypeName {
  const types: readonly PokemonTypeName[] = [
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
  ];
  return types.includes(token as PokemonTypeName);
}
