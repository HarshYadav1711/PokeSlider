import type { ChainLink, EvolutionChainResponse, EvolutionDetail, PokemonResponse } from '../../types/pokeapi';
import type { EvolutionChainPokemon } from '../../types/pokemon';
import { pokeFetch } from './client';

interface ChainItem {
  name: string;
  level: number;
  details: EvolutionDetail | null;
}

function traverseChain(chainLink: ChainLink, level = 0): ChainItem[] {
  const evolutionDetails = chainLink.evolution_details ?? [];
  const self: ChainItem = {
    name: chainLink.species.name,
    level,
    details: evolutionDetails[0] ?? null,
  };
  const children = chainLink.evolves_to ?? [];
  if (children.length === 0) return [self];
  return [self, ...children.flatMap((child) => traverseChain(child, level + 1))];
}

export async function buildEvolutionChain(
  evolutionData: EvolutionChainResponse,
  signal?: AbortSignal,
): Promise<EvolutionChainPokemon[]> {
  const flat = traverseChain(evolutionData.chain);
  const results = await Promise.all(
    flat.map(async (item) => {
      try {
        const data = await pokeFetch<PokemonResponse>(`/pokemon/${item.name}`, { signal });
        return {
          id: data.id,
          name: data.name,
          image:
            data.sprites.other?.['official-artwork']?.front_default ?? data.sprites.front_default,
          level: item.level,
          details: item.details,
        } satisfies EvolutionChainPokemon;
      } catch {
        return null;
      }
    }),
  );

  return results.filter((r): r is EvolutionChainPokemon => r !== null);
}
