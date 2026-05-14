import { motion } from 'motion/react';
import { memo, useMemo, useState } from 'react';

import { InlineRowSkeleton } from '../../components/ui/PanelSkeletons';
import type { DetailedPokemon, EvolutionTimelineStage } from '../../types/pokemon';
import { LoreDocumentCard } from './LoreDocumentCard';
import { LoreProgressiveReveal } from './LoreProgressiveReveal';
import { buildPokemonLoreViewModel, pokeSlugDisplay, type LoreTimelineBeat } from './pokemonLoreViewModel';

import './pokemonLoreSection.css';

export interface PokemonLoreSectionProps {
  pokemon: DetailedPokemon;
  timelineStages: readonly EvolutionTimelineStage[] | undefined;
  extrasPending: boolean;
  extrasError: boolean;
  reduced: boolean;
  onOpenSpecies: (pokemonId: number) => void;
}

const TimelineBeatCard = memo(function TimelineBeatCard({
  beat,
  index,
  total,
  reduced,
  viewingPokemonId,
  onOpenSpecies,
}: {
  beat: LoreTimelineBeat;
  index: number;
  total: number;
  reduced: boolean;
  viewingPokemonId: number;
  onOpenSpecies: (pokemonId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = beat.id === viewingPokemonId;

  return (
    <li className="min-w-[min(100%,18rem)] flex-1 md:min-w-0">
      <div
        className={[
          'rounded-2xl border p-4 transition-[border-color,box-shadow] duration-[var(--duration-normal)] [transition-timing-function:var(--ease-out)]',
          active
            ? 'border-violet-300/45 bg-white/12 shadow-[0_0_0_1px_rgba(167,139,250,0.25)]'
            : 'border-white/12 bg-white/[0.06]',
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[0.6rem] font-black uppercase tracking-[0.18em] text-white/55">
              Chapter {index + 1} / {total}
            </p>
            <p className="mt-1 font-black capitalize text-white [font-family:var(--font-display)]">{beat.displayName}</p>
            <p className="text-xs text-violet-200/85">{beat.genus}</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-white/82">{open ? beat.fullFlavor : beat.teaser}</p>
        {beat.evolutionHints.length > 0 && index > 0 ? (
          <p className="mt-2 border-t border-white/10 pt-2 text-xs font-semibold text-emerald-200/90">
            {beat.evolutionHints.join(' · ')}
          </p>
        ) : null}
        {!reduced ? (
          <motion.div
            aria-hidden
            className="pointer-events-none mt-3 h-1 overflow-hidden rounded-full bg-white/10"
            initial={false}
            animate={{ opacity: open ? 1 : 0.35 }}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-400/80 to-sky-400/70"
              initial={false}
              animate={{ width: open ? '100%' : '38%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="app-focus-ring inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-white/18 bg-white/[0.08] px-3 text-xs font-bold uppercase tracking-wide text-white/88 transition hover:border-white/26 hover:bg-white/12 md:flex-none"
          >
            {open ? 'Collapse entry' : 'Reveal full entry'}
          </button>
          <button
            type="button"
            onClick={() => onOpenSpecies(beat.id)}
            className="app-focus-ring inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-violet-300/35 bg-violet-500/15 px-3 text-xs font-bold uppercase tracking-wide text-violet-100 transition hover:bg-violet-500/25 md:flex-none"
          >
            Open species
          </button>
        </div>
      </div>
    </li>
  );
});

export function PokemonLoreSection({
  pokemon,
  timelineStages,
  extrasPending,
  extrasError,
  reduced,
  onOpenSpecies,
}: PokemonLoreSectionProps) {
  const vm = useMemo(() => buildPokemonLoreViewModel(pokemon, timelineStages), [pokemon, timelineStages]);

  const displayName = pokeSlugDisplay(pokemon.name);
  const beats = vm.timelineBeats;

  return (
    <section
      aria-labelledby="lore-codex-heading"
      className="pokemon-lore-section space-y-5 rounded-[var(--radius-3xl)] border border-white/12 bg-[rgb(6_8_14/0.35)] p-5 backdrop-blur-md md:p-7"
    >
      <div className="space-y-2">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.28em] text-white/50">Field codex</p>
        <h3
          id="lore-codex-heading"
          className="text-2xl font-black text-white [font-family:var(--font-display)] md:text-3xl"
        >
          Lore & mythology
        </h3>
        <p className="max-w-prose text-sm text-white/72">
          Curated from Pokédex entries—treated like a documentary transcript, not a raw data dump.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <LoreDocumentCard
          tone="violet"
          kicker="Species file"
          title={`${displayName} — narrative summary`}
          subtitle="Progressive read · best available English flavor"
          reduced={reduced}
        >
          <p className="text-sm italic text-white/70">{vm.speciesIntro}</p>
          <LoreProgressiveReveal paragraphs={vm.speciesParagraphs} reduced={reduced} />
        </LoreDocumentCard>

        <LoreDocumentCard
          tone="amber"
          kicker="Regional context"
          title="Where the archives situate it"
          subtitle={`Generation ${pokemon.generation} research era`}
          reduced={reduced}
        >
          <p className="text-[0.95rem] leading-relaxed text-white/90 md:text-base">{vm.regionalLine}</p>
        </LoreDocumentCard>

        <LoreDocumentCard
          tone="emerald"
          kicker="Mythology inspirations"
          title="Story DNA (interpretive)"
          subtitle="Heuristic reading—types plus rarity class"
          reduced={reduced}
        >
          <ul className="space-y-3">
            {vm.mythologyLines.map((line) => (
              <li key={line.slice(0, 48)} className="border-l-2 border-emerald-400/45 pl-4 text-sm leading-relaxed text-white/88">
                {line}
              </li>
            ))}
          </ul>
        </LoreDocumentCard>

        <LoreDocumentCard
          tone="sky"
          kicker="Kinship graph"
          title="Species relationships"
          subtitle="Evolution tree · preorder archive layout"
          reduced={reduced}
        >
          {extrasPending ? (
            <div className="space-y-3">
              <InlineRowSkeleton />
              <InlineRowSkeleton />
            </div>
          ) : extrasError ? (
            <p className="text-sm text-rose-200/90">Evolution data failed to load. Retry from the evolution panel.</p>
          ) : (
            <ul className="space-y-2">
              {vm.relationshipBullets.map((b) => (
                <li key={b.slice(0, 40)} className="text-sm leading-relaxed text-white/88">
                  {b}
                </li>
              ))}
            </ul>
          )}
        </LoreDocumentCard>
      </div>

      <LoreDocumentCard
        tone="violet"
        kicker="Evolution chronicle"
        title="Timeline-style progression"
        subtitle="Each beat pairs field triggers with Pokédex voice"
        reduced={reduced}
      >
        {extrasPending ? (
          <div className="space-y-3">
            <InlineRowSkeleton />
            <InlineRowSkeleton />
            <InlineRowSkeleton />
          </div>
        ) : extrasError ? (
          <p className="text-sm text-rose-200/90">Evolution timeline unavailable.</p>
        ) : beats.length === 0 ? (
          <p className="text-sm text-white/70">No staged timeline for this species.</p>
        ) : (
          <>
            <ol className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-3">
              {beats.map((beat, i) => (
                <TimelineBeatCard
                  key={beat.id}
                  beat={beat}
                  index={i}
                  total={beats.length}
                  reduced={reduced}
                  viewingPokemonId={pokemon.id}
                  onOpenSpecies={onOpenSpecies}
                />
              ))}
            </ol>
            {vm.evolutionParagraphs.length > 0 ? (
              <div className="mt-6 border-t border-white/10 pt-6">
                <h4 className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-white/55">
                  Stitched evolution story
                </h4>
                <LoreProgressiveReveal paragraphs={vm.evolutionParagraphs} reduced={reduced} expandLabel="Unfold full chronicle" />
              </div>
            ) : null}
          </>
        )}
      </LoreDocumentCard>
    </section>
  );
}
