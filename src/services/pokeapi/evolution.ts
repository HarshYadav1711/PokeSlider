import type { ChainLink, EvolutionChainResponse, EvolutionDetail, PokemonResponse } from '../../types/pokeapi';
import type { EvolutionChainPokemon, PokemonStatRow, PokemonTypeName } from '../../types/pokemon';
import { pokeFetch } from './client';

const TYPE_SET = new Set<string>([
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
]);

interface ChainItem {
  name: string;
  level: number;
  evolutionDetails: EvolutionDetail[];
}

function mapTypes(slots: PokemonResponse['types']): PokemonTypeName[] {
  const out: PokemonTypeName[] = [];
  for (const slot of slots) {
    const name = slot.type.name;
    if (TYPE_SET.has(name)) out.push(name as PokemonTypeName);
  }
  return out;
}

function mapStatRows(stats: PokemonResponse['stats']): PokemonStatRow[] {
  return stats.map((s) => ({
    name: s.stat.name.replaceAll('-', ' '),
    value: s.base_stat,
  }));
}

function traverseChain(chainLink: ChainLink, depth = 0): ChainItem[] {
  const evolutionDetails = chainLink.evolution_details ?? [];
  const self: ChainItem = {
    name: chainLink.species.name,
    level: depth,
    evolutionDetails,
  };
  const children = chainLink.evolves_to ?? [];
  if (children.length === 0) return [self];
  return [self, ...children.flatMap((child) => traverseChain(child, depth + 1))];
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
        const evolutionDetails = item.evolutionDetails;
        const details = evolutionDetails[0] ?? null;
        const baseStatTotal = data.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
        return {
          id: data.id,
          name: data.name,
          image:
            data.sprites.other?.['official-artwork']?.front_default ?? data.sprites.front_default,
          level: item.level,
          details,
          evolutionDetails,
          types: mapTypes(data.types),
          stats: mapStatRows(data.stats),
          baseStatTotal,
        } satisfies EvolutionChainPokemon;
      } catch {
        return null;
      }
    }),
  );

  return results.filter((r): r is EvolutionChainPokemon => r !== null);
}
