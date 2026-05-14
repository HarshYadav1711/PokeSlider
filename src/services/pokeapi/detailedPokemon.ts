import type {
  EvolutionChainResponse,
  PokemonResponse,
  PokemonSpeciesResponse,
} from '../../types/pokeapi';
import type { DetailedPokemon, PokemonStatRow, PokemonTypeName } from '../../types/pokemon';
import { getGeneration, isPseudoLegendary } from '../../utils/pokemonMeta';
import { getOfficialCryUrl, pokeFetch, pokePathFromResourceUrl } from './client';
import { pickEnglishFlavorText } from './evolutionSpeciesLore';
import { fetchMegaEvolutions } from './mega';
import { fetchPokemonLocations } from './locations';

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

function mapTypes(slots: PokemonResponse['types']): PokemonTypeName[] {
  const out: PokemonTypeName[] = [];
  for (const slot of slots) {
    const name = slot.type.name;
    if (TYPE_SET.has(name)) out.push(name as PokemonTypeName);
  }
  return out;
}

function mapStats(stats: PokemonResponse['stats']): PokemonStatRow[] {
  return stats.map((s) => ({
    name: s.stat.name.replaceAll('-', ' '),
    value: s.base_stat,
  }));
}

export async function fetchDetailedPokemon(
  id: number | string,
  signal?: AbortSignal,
): Promise<DetailedPokemon | null> {
  try {
    const data = await pokeFetch<PokemonResponse>(`/pokemon/${id}`, { signal });
    const speciesData = await pokeFetch<PokemonSpeciesResponse>(pokePathFromResourceUrl(data.species.url), {
      signal,
    });
    const evolutionData = await pokeFetch<EvolutionChainResponse>(
      pokePathFromResourceUrl(speciesData.evolution_chain.url),
      { signal },
    );

    const [locations, megaEvolutions] = await Promise.all([
      fetchPokemonLocations(data.id, signal),
      fetchMegaEvolutions(data.id, data.name, speciesData, signal),
    ]);

    const baseStatTotal = data.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
    const pseudo = isPseudoLegendary(data, speciesData, baseStatTotal);

    let cryUrl: string | null = null;
    if (data.cries) {
      cryUrl = data.cries.latest ?? data.cries.legacy ?? null;
    }
    if (!cryUrl) cryUrl = getOfficialCryUrl(data.id);

    const pokedexEntries = speciesData.flavor_text_entries
      .filter((entry) => entry.language.name === 'en')
      .map((entry) => entry.flavor_text.replaceAll('\f', ' '));
    const primaryPokedexFlavor = pickEnglishFlavorText(speciesData.flavor_text_entries);

    const pokemon: DetailedPokemon = {
      id: data.id,
      name: data.name,
      image:
        data.sprites.other?.['official-artwork']?.front_default ??
        data.sprites.other?.home?.front_default ??
        data.sprites.front_default,
      types: mapTypes(data.types),
      stats: mapStats(data.stats),
      baseStatTotal,
      speciesCatchRate: Math.max(1, Math.min(255, speciesData.capture_rate)),
      pokedexEntries,
      primaryPokedexFlavor,
      evolutionData,
      isLegendary: speciesData.is_legendary,
      isMythical: speciesData.is_mythical,
      isPseudoLegendary: pseudo,
      locations,
      generation: getGeneration(data.id),
      habitat: speciesData.habitat?.name ?? 'Unknown',
      megaEvolutions,
      cryUrl,
    };

    return pokemon;
  } catch {
    return null;
  }
}
