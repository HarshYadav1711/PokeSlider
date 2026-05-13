export const qk = {
  pokemon: {
    nationalDexIds: () => ['pokeapi', 'pokemon', 'national-dex-ids', 1025] as const,
    summary: (id: number) => ['pokeapi', 'pokemon', 'summary', id] as const,
    detail: (id: number) => ['pokeapi', 'pokemon', 'detail', id] as const,
    detailExtras: (id: number) => ['pokeapi', 'pokemon', 'detail-extras', id] as const,
    typeMembers: (type: string) => ['pokeapi', 'type', 'members', type] as const,
  },
  ball: {
    suggestions: (ballId: string) => ['ball', 'suggestions', ballId] as const,
  },
} as const;
