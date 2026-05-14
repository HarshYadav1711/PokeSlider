import type { DetailedPokemon, EvolutionTimelineStage, PokemonTypeName } from '../../types/pokemon';

export type LoreCardTone = 'violet' | 'amber' | 'emerald' | 'sky';

const GENERATION_REGION: Record<number, string> = {
  1: 'Kanto',
  2: 'Johto',
  3: 'Hoenn',
  4: 'Sinnoh',
  5: 'Unova',
  6: 'Kalos',
  7: 'Alola',
  8: 'Galar',
  9: 'Paldea',
};

export function pokeSlugDisplay(slug: string): string {
  return slug.replaceAll('-', ' ');
}

/** Split flavor text into readable beats for progressive disclosure. */
export function flavorToParagraphs(text: string, maxParagraphs = 4): string[] {
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return [];
  const sentences = t
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length <= 1) return [t];

  const out: string[] = [];
  let buf = '';
  for (const s of sentences) {
    const next = buf ? `${buf} ${s}` : s;
    if (next.length > 220 && buf) {
      out.push(buf);
      buf = s;
    } else {
      buf = next;
    }
  }
  if (buf) out.push(buf);
  return out.slice(0, maxParagraphs);
}

function findStageIndex(stages: readonly EvolutionTimelineStage[], pokemonId: number): number {
  const i = stages.findIndex((s) => s.id === pokemonId);
  return i >= 0 ? i : 0;
}

/** Nearest ancestor in preorder flattening (correct for branched trees). */
export function findParentStage(
  stages: readonly EvolutionTimelineStage[],
  index: number,
): EvolutionTimelineStage | null {
  const cur = stages[index];
  if (!cur || cur.level === 0) return null;
  for (let i = index - 1; i >= 0; i--) {
    const row = stages[i]!;
    if (row.level === cur.level - 1) return row;
  }
  return null;
}

/** Direct children in preorder block (handles Eevee-style forks). */
export function findDirectChildStages(
  stages: readonly EvolutionTimelineStage[],
  index: number,
): EvolutionTimelineStage[] {
  const cur = stages[index];
  if (!cur) return [];
  const kids: EvolutionTimelineStage[] = [];
  for (let j = index + 1; j < stages.length; j++) {
    const row = stages[j]!;
    if (row.level <= cur.level) break;
    if (row.level === cur.level + 1) kids.push(row);
  }
  return kids;
}

function typeMythNotes(types: readonly PokemonTypeName[]): string[] {
  const notes: string[] = [];
  const set = new Set(types);
  const push = (line: string) => {
    if (!notes.includes(line)) notes.push(line);
  };
  if (set.has('dragon')) push('Dragon myths love thresholds—storms, caves, and vows spoken too late.');
  if (set.has('ghost')) push('Ghost folklore trades in memory: what lingers after the body moves on.');
  if (set.has('psychic')) push('Oracles and visions echo here—intuition turned into legend.');
  if (set.has('fairy')) push('Fairy tales warn of bargains with beautiful teeth and hidden costs.');
  if (set.has('dark')) push('Trickster shadows show up in old stories as tests of nerve, not malice alone.');
  if (set.has('steel')) push('Iron-age imagery sneaks in: armor, bells, and the comfort of something forged.');
  if (set.has('water')) push('River and tide myths map neatly onto anything that flows and returns.');
  if (set.has('fire')) push('Fire myths carry both hearth and hazard—creation and consequence in one flame.');
  if (set.has('electric')) push('Sky-splitting moments in folklore feel electrically charged—awe before science.');
  return notes.slice(0, 2);
}

export function buildMythologyInspirationLines(pokemon: DetailedPokemon): string[] {
  const lines: string[] = [];
  if (pokemon.isMythical) {
    lines.push(
      'Mythical registers read like rare constellations: glimpsed once, debated forever, never quite domesticated.',
    );
  } else if (pokemon.isLegendary) {
    lines.push(
      'Legendary folktones often paint singular forces—closer to weather and omen than to everyday ecology.',
    );
  } else if (pokemon.isPseudoLegendary) {
    lines.push(
      'Pseudo-legendary arcs borrow the pacing of epics: a long road, a late bloom, then myth-scale presence.',
    );
  } else {
    lines.push(
      'Field mythographers read this line as “creature tale”—grounded wonder, not cosmic mandate.',
    );
  }
  lines.push(...typeMythNotes(pokemon.types));
  return lines.slice(0, 3);
}

export function buildRegionalLoreLine(pokemon: DetailedPokemon): string {
  const region = GENERATION_REGION[pokemon.generation] ?? 'its home region';
  const habitat = pokeSlugDisplay(pokemon.habitat);
  return `Archivists tie this species to the ${region} era—notes often return to ${habitat === 'Unknown' ? 'unsettled habitats' : `${habitat} habitats`} as a stage for its behavior.`;
}

export function buildEvolutionStory(stages: readonly EvolutionTimelineStage[]): string {
  if (stages.length === 0) return '';
  if (stages.length === 1) {
    const s = stages[0]!;
    return `${pokeSlugDisplay(s.name)} stands alone in its recorded line—no staged metamorphosis on file, only its own story.`;
  }
  const parts: string[] = [];
  for (let i = 0; i < stages.length; i++) {
    const s = stages[i]!;
    const label = pokeSlugDisplay(s.name);
    if (i === 0) {
      parts.push(`The line opens with ${label}, the ${s.genus} Pokémon. ${s.flavorText}`);
      continue;
    }
    const hint =
      s.evolutionHintLines.length > 0
        ? `Researchers mark the shift when ${s.evolutionHintLines.join('; ').toLowerCase()}.`
        : 'Archives mark a transformation—details vary by observer.';
    parts.push(`Then comes ${label}. ${hint} ${s.flavorText}`);
  }
  return parts.join(' ');
}

export interface LoreTimelineBeat {
  readonly id: number;
  readonly name: string;
  readonly displayName: string;
  readonly genus: string;
  readonly teaser: string;
  readonly fullFlavor: string;
  readonly evolutionHints: readonly string[];
  readonly depth: number;
}

export function buildTimelineBeats(stages: readonly EvolutionTimelineStage[]): LoreTimelineBeat[] {
  return stages.map((s) => ({
    id: s.id,
    name: s.name,
    displayName: pokeSlugDisplay(s.name),
    genus: s.genus,
    teaser: s.flavorText.length > 120 ? `${s.flavorText.slice(0, 117)}…` : s.flavorText,
    fullFlavor: s.flavorText,
    evolutionHints: s.evolutionHintLines,
    depth: s.level,
  }));
}

export interface PokemonLoreViewModel {
  readonly speciesIntro: string;
  readonly speciesParagraphs: readonly string[];
  readonly evolutionNarrative: string;
  readonly evolutionParagraphs: readonly string[];
  readonly mythologyLines: readonly string[];
  readonly regionalLine: string;
  readonly timelineBeats: readonly LoreTimelineBeat[];
  readonly relationshipBullets: readonly string[];
}

export function buildPokemonLoreViewModel(
  pokemon: DetailedPokemon,
  stages: readonly EvolutionTimelineStage[] | undefined,
): PokemonLoreViewModel {
  const flavor = pokemon.primaryPokedexFlavor || pokemon.pokedexEntries[0] || '';
  const speciesIntro = `The Pokédex frames ${pokeSlugDisplay(pokemon.name)} as a story first—data second.`;
  const speciesParagraphs = flavorToParagraphs(flavor, 5);
  const mythologyLines = buildMythologyInspirationLines(pokemon);
  const regionalLine = buildRegionalLoreLine(pokemon);

  const timelineBeats = stages?.length ? buildTimelineBeats(stages) : [];
  const evolutionNarrative = stages?.length ? buildEvolutionStory(stages) : '';
  const evolutionParagraphs = flavorToParagraphs(evolutionNarrative, 6);

  const relationshipBullets: string[] = [];
  if (stages?.length) {
    const idx = findStageIndex(stages, pokemon.id);
    const self = stages[idx]!;
    const parent = findParentStage(stages, idx);
    const children = findDirectChildStages(stages, idx);
    if (parent) {
      relationshipBullets.push(
        `Evolves from ${pokeSlugDisplay(parent.name)}—same chain, earlier chapter (${parent.genus}).`,
      );
    } else {
      relationshipBullets.push('Anchor species for this evolution archive—no prior stage on record.');
    }
    if (children.length === 1) {
      relationshipBullets.push(`Documented next stage: ${pokeSlugDisplay(children[0]!.name)} (${children[0]!.genus}).`);
    } else if (children.length > 1) {
      const names = children.map((c) => pokeSlugDisplay(c.name)).join(', ');
      relationshipBullets.push(`Branching line: from here the file splinters toward ${names}.`);
    } else {
      relationshipBullets.push('Terminal form in this chain—no further filed evolutions from this node.');
    }
    const branchPeers: EvolutionTimelineStage[] = [];
    if (stages?.length && parent) {
      for (let si = 0; si < stages.length; si++) {
        const s = stages[si]!;
        if (s.id === self.id || s.level !== self.level) continue;
        const p = findParentStage(stages, si);
        if (p?.id === parent.id) branchPeers.push(s);
      }
    }
    if (branchPeers.length > 0) {
      const peerNames = branchPeers.map((p) => pokeSlugDisplay(p.name)).join(', ');
      relationshipBullets.push(`Parallel routes on the same parent: ${peerNames}.`);
    }
  } else {
    relationshipBullets.push('Load evolution data to map kinship and branch lines for this species.');
  }

  return {
    speciesIntro,
    speciesParagraphs,
    evolutionNarrative,
    evolutionParagraphs,
    mythologyLines,
    regionalLine,
    timelineBeats,
    relationshipBullets,
  };
}
