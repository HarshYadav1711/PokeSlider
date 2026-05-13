export const qk = {
  pokemon: {
    nationalIndex: () => ['pokeapi', 'pokemon', 'national-index', 1025] as const,
    summary: (id: number) => ['pokeapi', 'pokemon', 'summary', id] as const,
    detail: (id: number) => ['pokeapi', 'pokemon', 'detail', id] as const,
    detailExtras: (id: number) => ['pokeapi', 'pokemon', 'detail-extras', id] as const,
    typeMembers: (type: string) => ['pokeapi', 'type', 'members', type] as const,
    generationMembers: (genId: number) => ['pokeapi', 'generation', 'members', genId] as const,
    pokedexSlugList: () => ['pokeapi', 'pokedex', 'slug-list'] as const,
    pokedexMembers: (slug: string) => ['pokeapi', 'pokedex', 'members', slug] as const,
    abilityMembers: (slug: string) => ['pokeapi', 'ability', 'members', slug] as const,
    abilitySlugList: () => ['pokeapi', 'ability', 'slug-list'] as const,
    pokemonFormSearchIndex: () => ['pokeapi', 'pokemon-form', 'search-index', 'v2'] as const,
    speciesPriorBatch: (batchKey: string) => ['pokeapi', 'species', 'prior-batch', batchKey] as const,
  },
  ball: {
    suggestions: (ballId: string) => ['ball', 'suggestions', ballId] as const,
  },
  discovery: {
    summaryBatch: (batchKey: string) => ['discovery', 'summary-batch', batchKey] as const,
  },
} as const;
