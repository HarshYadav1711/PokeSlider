import type { PokemonResponse, PokemonSpeciesResponse } from '../../types/pokeapi';
import type { MegaFormSummary, PokemonStatRow, PokemonTypeName } from '../../types/pokemon';
import { pokeFetch, pokePathFromResourceUrl } from './client';

const MEGA_FORM_MAP: Readonly<Record<number, readonly string[]>> = {
  3: ['venusaur-mega'],
  6: ['charizard-mega-x', 'charizard-mega-y'],
  9: ['blastoise-mega'],
  15: ['beedrill-mega'],
  18: ['pidgeot-mega'],
  65: ['alakazam-mega'],
  80: ['slowbro-mega'],
  94: ['gengar-mega'],
  115: ['kangaskhan-mega'],
  127: ['pinsir-mega'],
  130: ['gyarados-mega'],
  142: ['aerodactyl-mega'],
  150: ['mewtwo-mega-x', 'mewtwo-mega-y'],
  181: ['ampharos-mega'],
  208: ['steelix-mega'],
  212: ['scizor-mega'],
  229: ['houndoom-mega'],
  248: ['tyranitar-mega'],
  254: ['sceptile-mega'],
  257: ['blaziken-mega'],
  260: ['swampert-mega'],
  282: ['gardevoir-mega'],
  303: ['mawile-mega'],
  306: ['aggron-mega'],
  308: ['medicham-mega'],
  310: ['manectric-mega'],
  319: ['sharpedo-mega'],
  323: ['camerupt-mega'],
  334: ['altaria-mega'],
  354: ['banette-mega'],
  359: ['absol-mega'],
  362: ['glalie-mega'],
  373: ['salamence-mega'],
  376: ['metagross-mega'],
  380: ['latias-mega'],
  381: ['latios-mega'],
  384: ['rayquaza-mega'],
  445: ['garchomp-mega'],
  448: ['lucario-mega'],
  460: ['abomasnow-mega'],
};

const SPECIAL_STONES: Readonly<Record<string, string>> = {
  'mewtwo-mega-x': 'Mewtwonite X',
  'mewtwo-mega-y': 'Mewtwonite Y',
  'charizard-mega-x': 'Charizardite X',
  'charizard-mega-y': 'Charizardite Y',
  'rayquaza-mega': 'Rayquazite (Dragon Ascent)',
  'venusaur-mega': 'Venusaurite',
  'blastoise-mega': 'Blastoisinite',
  'beedrill-mega': 'Beedrillite',
  'pidgeot-mega': 'Pidgeotite',
  'alakazam-mega': 'Alakazite',
  'slowbro-mega': 'Slowbronite',
  'gengar-mega': 'Gengarite',
  'kangaskhan-mega': 'Kangaskhanite',
  'pinsir-mega': 'Pinsirite',
  'gyarados-mega': 'Gyaradosite',
  'aerodactyl-mega': 'Aerodactylite',
  'ampharos-mega': 'Ampharosite',
  'steelix-mega': 'Steelixite',
  'scizor-mega': 'Scizorite',
  'houndoom-mega': 'Houndoominite',
  'tyranitar-mega': 'Tyranitarite',
  'sceptile-mega': 'Sceptilite',
  'blaziken-mega': 'Blazikenite',
  'swampert-mega': 'Swampertite',
  'gardevoir-mega': 'Gardevoirite',
  'mawile-mega': 'Mawilite',
  'aggron-mega': 'Aggronite',
  'medicham-mega': 'Medichamite',
  'manectric-mega': 'Manectite',
  'sharpedo-mega': 'Sharpedonite',
  'camerupt-mega': 'Cameruptite',
  'altaria-mega': 'Altarianite',
  'banette-mega': 'Banettite',
  'absol-mega': 'Absolite',
  'glalie-mega': 'Glalitite',
  'salamence-mega': 'Salamencite',
  'metagross-mega': 'Metagrossite',
  'latias-mega': 'Latiasite',
  'latios-mega': 'Latiosite',
  'garchomp-mega': 'Garchompite',
  'lucario-mega': 'Lucarionite',
  'abomasnow-mega': 'Abomasnowite',
};

function getMegaStoneName(formName: string, baseName: string): string {
  const special = SPECIAL_STONES[formName];
  if (special) return special;

  const base = baseName.charAt(0).toUpperCase() + baseName.slice(1);
  if (formName.includes('-x')) return `${base}ite X`;
  if (formName.includes('-y')) return `${base}ite Y`;

  const cleanName = formName.replace('mega-', '').replace(/-/g, ' ');
  const words = cleanName.split(' ');
  const capitalized = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return `${capitalized}ite`;
}

function mapMegaForm(formData: PokemonResponse, megaStone: string): MegaFormSummary {
  const stats: PokemonStatRow[] = formData.stats.map((s) => ({
    name: s.stat.name.replaceAll('-', ' '),
    value: s.base_stat,
  }));
  const types = formData.types.map((t) => t.type.name as PokemonTypeName);
  return {
    id: formData.id,
    name: formData.name,
    formName: formData.forms?.[0]?.name ?? formData.name,
    image: formData.sprites.other?.['official-artwork']?.front_default ?? formData.sprites.front_default,
    types,
    stats,
    baseStatTotal: formData.stats.reduce((sum, st) => sum + st.base_stat, 0),
    megaStone,
    isMega: true,
  };
}

async function tryFetchMegaForm(formName: string, baseName: string, signal?: AbortSignal): Promise<MegaFormSummary | null> {
  try {
    const formData = await pokeFetch<PokemonResponse>(`/pokemon/${formName}`, { signal });
    if (!formData.name.toLowerCase().includes('mega')) return null;
    const megaStone = getMegaStoneName(formData.name.toLowerCase(), baseName);
    return mapMegaForm(formData, megaStone);
  } catch {
    try {
      const alt = formName.replaceAll('-', '');
      const formData = await pokeFetch<PokemonResponse>(`/pokemon/${alt}`, { signal });
      if (!formData.name.toLowerCase().includes('mega')) return null;
      const megaStone = getMegaStoneName(formData.name.toLowerCase(), baseName);
      return mapMegaForm(formData, megaStone);
    } catch {
      return null;
    }
  }
}

export async function fetchMegaEvolutions(
  baseId: number,
  baseName: string,
  speciesData: PokemonSpeciesResponse,
  signal?: AbortSignal,
): Promise<MegaFormSummary[]> {
  const megaForms: MegaFormSummary[] = [];
  const known = MEGA_FORM_MAP[baseId] ?? [];

  for (const formName of known) {
    const row = await tryFetchMegaForm(formName, baseName, signal);
    if (row) megaForms.push(row);
  }

  if (megaForms.length === 0) {
    for (const variety of speciesData.varieties ?? []) {
      if (variety.is_default) continue;
      try {
        const formData = await pokeFetch<PokemonResponse>(pokePathFromResourceUrl(variety.pokemon.url), {
          signal,
        });
        if (!formData.name.toLowerCase().includes('mega')) continue;
        const megaStone = getMegaStoneName(formData.name.toLowerCase(), baseName);
        megaForms.push(mapMegaForm(formData, megaStone));
      } catch {
        // ignore
      }
    }
  }

  return megaForms;
}
