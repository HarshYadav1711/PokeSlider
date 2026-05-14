import { fetchPokemonIdsForGeneration } from './generation';
import { fetchPokemonNationalIndex } from './pokemonListResource';

/** Candidate national dex ids for the discovery engine (union of generations or full dex). */
export async function fetchDiscoveryCandidateIds(
  generationIds: readonly number[] | null,
  signal?: AbortSignal,
): Promise<number[]> {
  if (generationIds === null || generationIds.length === 0) {
    const rows = await fetchPokemonNationalIndex(signal);
    return rows.map((r) => r.id).sort((a, b) => a - b);
  }
  const uniq = new Set<number>();
  for (const gen of generationIds) {
    const part = await fetchPokemonIdsForGeneration(gen, signal);
    for (const id of part) uniq.add(id);
  }
  return [...uniq].sort((a, b) => a - b);
}
