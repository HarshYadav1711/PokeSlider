import type { PokemonTypeName } from '../types/pokemon';

/** Canonical Poké Ball catalog — single source of truth for UI + suggestion filters */
export interface PokeBallDefinition {
  readonly id: string;
  readonly name: string;
  readonly image: string;
  readonly catchRate: string;
  readonly description: string;
  /** Types or category tokens used to pick example Pokémon for this ball */
  readonly pokemonTypes: readonly string[];
}

export const POKEBALLS: readonly PokeBallDefinition[] = [
  {
    id: 'poke-ball',
    name: 'Poke Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
    catchRate: '1x',
    description:
      'A device for catching wild Pokémon. It is thrown like a ball at a Pokémon, comfortably encapsulating its target.',
    pokemonTypes: ['normal', 'flying', 'bug'],
  },
  {
    id: 'great-ball',
    name: 'Great Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
    catchRate: '1.5x',
    description:
      'A good, high-performance Poké Ball that provides a higher success rate for catching Pokémon than a standard Poké Ball.',
    pokemonTypes: ['normal', 'flying', 'bug', 'water'],
  },
  {
    id: 'ultra-ball',
    name: 'Ultra Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
    catchRate: '2x',
    description:
      'An ultra-high-performance Poké Ball that provides a higher success rate for catching Pokémon than a Great Ball.',
    pokemonTypes: ['normal', 'flying', 'bug', 'water', 'fire', 'electric'],
  },
  {
    id: 'master-ball',
    name: 'Master Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
    catchRate: '255x (100%)',
    description:
      'The best Poké Ball with the ultimate level of performance. It will catch any wild Pokémon without fail.',
    pokemonTypes: ['legendary', 'mythical'],
  },
  {
    id: 'premier-ball',
    name: 'Premier Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/premier-ball.png',
    catchRate: '1x',
    description:
      'A somewhat rare Poké Ball that was made as a commemorative item used to celebrate an event of some sort.',
    pokemonTypes: ['normal', 'flying'],
  },
  {
    id: 'net-ball',
    name: 'Net Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/net-ball.png',
    catchRate: '3x (Bug/Water)',
    description:
      'A somewhat different Poké Ball that works especially well on Bug- and Water-type Pokémon.',
    pokemonTypes: ['bug', 'water'],
  },
  {
    id: 'dive-ball',
    name: 'Dive Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dive-ball.png',
    catchRate: '3.5x (Water)',
    description:
      'A somewhat different Poké Ball that works especially well on Pokémon that live underwater.',
    pokemonTypes: ['water'],
  },
  {
    id: 'nest-ball',
    name: 'Nest Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/nest-ball.png',
    catchRate: 'Up to 4x (lower level)',
    description:
      'A somewhat different Poké Ball that works especially well on weaker Pokémon in the wild.',
    pokemonTypes: ['normal', 'bug', 'flying'],
  },
  {
    id: 'repeat-ball',
    name: 'Repeat Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/repeat-ball.png',
    catchRate: '3x (if already caught)',
    description:
      'A somewhat different Poké Ball that works especially well on Pokémon species that were previously caught.',
    pokemonTypes: ['normal'],
  },
  {
    id: 'timer-ball',
    name: 'Timer Ball',
    image:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/timer-ball.png',
    catchRate: 'Up to 4x (after 10 turns)',
    description:
      'A somewhat different Poké Ball that becomes progressively more effective the more turns that are taken in battle.',
    pokemonTypes: ['normal'],
  },
] as const;

export type PokeBallId = (typeof POKEBALLS)[number]['id'];

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
