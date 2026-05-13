import type { FlavorTextEntry, PokemonSpeciesResponse } from '../../types/pokeapi';
import type { EvolutionChainPokemon, EvolutionTimelineStage } from '../../types/pokemon';
import { summarizeEvolutionDetails } from '../../utils/evolutionTriggerSummary';
import { pokeFetch } from './client';

const FLAVOR_VERSION_PRIORITY = [
  'scarlet',
  'violet',
  'legends-arceus',
  'sword',
  'shield',
  'ultra-sun',
  'ultra-moon',
  'sun',
  'moon',
  'x',
  'y',
  'black-2',
  'white-2',
  'black',
  'white',
  'heartgold',
  'soulsilver',
  'platinum',
  'pearl',
  'diamond',
  'emerald',
  'ruby',
  'sapphire',
  'firered',
  'leafgreen',
] as const;

function cleanFlavor(raw: string): string {
  return raw.replaceAll('\f', ' ').replaceAll('\n', ' ').replace(/\s+/g, ' ').trim();
}

export function pickEnglishFlavorText(entries: FlavorTextEntry[]): string {
  const en = entries.filter((e) => e.language.name === 'en');
  if (!en.length) return 'No Pokédex entry available.';

  for (const v of FLAVOR_VERSION_PRIORITY) {
    const hit = en.find((e) => e.version?.name === v);
    if (hit) return cleanFlavor(hit.flavor_text);
  }

  const fallback = en[en.length - 1];
  return fallback ? cleanFlavor(fallback.flavor_text) : 'No Pokédex entry available.';
}

export async function fetchSpeciesTimelineLore(
  speciesName: string,
  signal?: AbortSignal,
): Promise<{ genus: string; flavorText: string }> {
  try {
    const data = await pokeFetch<PokemonSpeciesResponse>(`/pokemon-species/${speciesName}`, { signal });
    const rawGenus = data.genus?.trim() ?? 'Pokémon';
    const genus = rawGenus.replace(/\s+Pokémon\s*$/i, '').trim() || 'Pokémon';
    return {
      genus,
      flavorText: pickEnglishFlavorText(data.flavor_text_entries),
    };
  } catch {
    return {
      genus: 'Pokémon',
      flavorText: 'Pokédex entry unavailable for this species.',
    };
  }
}

export async function enrichEvolutionChainWithSpeciesLore(
  chain: EvolutionChainPokemon[],
  signal?: AbortSignal,
): Promise<EvolutionTimelineStage[]> {
  const loreRows = await Promise.all(chain.map((row) => fetchSpeciesTimelineLore(row.name, signal)));

  return chain.map((row, index) => {
    const lore = loreRows[index]!;
    const evolutionHintLines = index === 0 ? [] : summarizeEvolutionDetails(row.evolutionDetails);
    return {
      ...row,
      genus: lore.genus,
      flavorText: lore.flavorText,
      evolutionHintLines,
    };
  });
}
