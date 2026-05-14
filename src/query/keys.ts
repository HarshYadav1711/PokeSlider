export const qk = {
  pokemon: {
    nationalIndex: () => ['pokeapi', 'pokemon', 'national-index', 'paginated-v1'] as const,
    summary: (id: number) => ['pokeapi', 'pokemon', 'summary', 'v2', id] as const,
    detail: (id: number) => ['pokeapi', 'pokemon', 'detail', id] as const,
    comparisonProfile: (id: number) => ['pokeapi', 'pokemon', 'compare-profile', id] as const,
    detailExtras: (id: number) => ['pokeapi', 'pokemon', 'detail-extras', id] as const,
    typeMembers: (type: string) => ['pokeapi', 'type', 'members', type] as const,
    generationMembers: (genId: number) => ['pokeapi', 'generation', 'members', 'v2', genId] as const,
    pokedexSlugList: () => ['pokeapi', 'pokedex', 'slug-list'] as const,
    pokedexMembers: (slug: string) => ['pokeapi', 'pokedex', 'members', 'v2', slug] as const,
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
    recommendationCandidates: (genKey: string) => ['discovery', 'reco-candidates', genKey] as const,
    recommendationSummaries: (batchKey: string) => ['discovery', 'reco-summaries', batchKey] as const,
  },
  teamBuilder: {
    typeMatchup: () => ['pokeapi', 'team-builder', 'type-matchup'] as const,
    poolSummaries: (batchKey: string) => ['team-builder', 'pool', batchKey] as const,
  },
} as const;
