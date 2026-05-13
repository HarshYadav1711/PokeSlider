import { AnimatePresence, motion } from 'motion/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { TypeBadge } from '../../components/pokemon/TypeBadge';
import { AsyncFeedback } from '../../components/ui/AsyncFeedback';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { dialogSpringTransition, overlayBackdropTransition } from '../../motion/motionPrefs';
import { InlineRowSkeleton, PokemonDetailSkeleton } from '../../components/ui/PanelSkeletons';
import { usePokemonCry } from '../../hooks/usePokemonCry';
import { qk } from '../../query/keys';
import { STALE_POKEMON_DETAIL_EXTRAS_MS, STALE_POKEMON_DETAIL_MS } from '../../query/staleTimes';
import { buildEvolutionChain } from '../../services/pokeapi/evolution';
import { fetchDetailedPokemon } from '../../services/pokeapi/detailedPokemon';
import { getTypeEffectiveness } from '../../services/pokeapi/typeEffectiveness';
import { useComparisonStore } from '../../store/comparisonStore';
import { useDexListsStore } from '../../store/dexListsStore';
import { useUiStore } from '../../store/uiStore';
import type {
  DetailedPokemon,
  MegaFormSummary,
  PokemonEncounterLocation,
  PokemonTypeName,
} from '../../types/pokemon';

interface PokemonDetailPanelProps {
  pokemonId: number;
}

export function PokemonDetailPanel({ pokemonId }: PokemonDetailPanelProps) {
  const reduced = usePrefersReducedMotion();
  const qc = useQueryClient();
  const showPokemon = useUiStore((s) => s.showPokemon);
  const { play, status: cryStatus } = usePokemonCry();

  const assignCompareSlot = useComparisonStore((s) => s.assignSlot);
  const toggleFavorite = useDexListsStore((s) => s.toggleFavorite);
  const favoriteIds = useDexListsStore((s) => s.favoriteIds);
  const isFav = useMemo(() => favoriteIds.includes(pokemonId), [favoriteIds, pokemonId]);

  const [megaModal, setMegaModal] = useState<MegaFormSummary | null>(null);

  const detailQuery = useQuery({
    queryKey: qk.pokemon.detail(pokemonId),
    queryFn: async ({ signal }) => {
      const row = await fetchDetailedPokemon(pokemonId, signal);
      if (!row) throw new Error('Could not load Pokémon details.');
      return row;
    },
    staleTime: STALE_POKEMON_DETAIL_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const extrasQuery = useQuery({
    queryKey: qk.pokemon.detailExtras(pokemonId),
    enabled: detailQuery.isSuccess && detailQuery.data?.id === pokemonId,
    queryFn: async ({ signal }) => {
      const p = qc.getQueryData<DetailedPokemon>(qk.pokemon.detail(pokemonId));
      if (!p) throw new Error('Missing Pokémon detail');
      const [effectiveness, chain] = await Promise.all([
        getTypeEffectiveness(p.types, signal),
        buildEvolutionChain(p.evolutionData, signal),
      ]);
      return { effectiveness, chain };
    },
    staleTime: STALE_POKEMON_DETAIL_EXTRAS_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const pokemon = detailQuery.data;
  const chain = extrasQuery.data?.chain ?? [];
  const effectiveness = extrasQuery.data?.effectiveness ?? null;

  useEffect(() => {
    if (!detailQuery.isSuccess || !detailQuery.data) return;
    const p = detailQuery.data;
    void play({ id: p.id, cryUrl: p.cryUrl });
  }, [detailQuery.isSuccess, detailQuery.data?.id, detailQuery.data?.cryUrl, play, detailQuery.data]);

  const categoryLabel = useMemo(() => {
    if (!pokemon) return '';
    const bits: string[] = [];
    if (pokemon.isLegendary) bits.push('Legendary');
    if (pokemon.isMythical) bits.push('Mythical');
    if (pokemon.isPseudoLegendary) bits.push('Pseudo-Legendary');
    if (bits.length === 0) bits.push('Regular');
    return bits.join(', ');
  }, [pokemon]);

  if (detailQuery.isPending) {
    return <PokemonDetailSkeleton />;
  }

  if (detailQuery.isError || !pokemon) {
    return (
      <div className="space-y-4 text-center">
        <AsyncFeedback
          title="Something went wrong"
          description={
            detailQuery.error instanceof Error ? detailQuery.error.message : 'Unable to load this Pokémon.'
          }
        />
        <button
          type="button"
          onClick={() => void detailQuery.refetch()}
          className="app-focus-ring rounded-[var(--radius-pill)] border border-white/22 bg-white/10 px-6 py-2 font-semibold text-white transition-[background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:border-white/30 hover:bg-white/16"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasMega = pokemon.megaEvolutions.length > 0;
  const finalEvo = chain[chain.length - 1];
  const canShowMega = hasMega && finalEvo && finalEvo.id === pokemon.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 rounded-3xl border-2 border-white/10 bg-white/10 p-6 backdrop-blur-md md:flex-row md:items-center">
        <img
          src={pokemon.image ?? ''}
          alt={pokemon.name}
          className="mx-auto size-48 rounded-3xl border-[3px] border-white/20 bg-white/10 object-contain p-4 md:mx-0 md:size-52"
        />
        <div className="flex-1 space-y-3 text-center md:text-left">
          <h2 className="text-3xl font-black capitalize tracking-wide text-white [font-family:var(--font-display)] md:text-4xl">
            {pokemon.name}
          </h2>
          <div className="text-lg font-semibold text-white/80 [font-family:var(--font-display)]">
            #{String(pokemon.id).padStart(3, '0')}
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <button
              type="button"
              onClick={() => void play({ id: pokemon.id, cryUrl: pokemon.cryUrl })}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/15 px-5 py-2 font-bold text-white transition hover:bg-white/25"
            >
              {cryStatus === 'playing' ? '🔊 Playing…' : cryStatus === 'unavailable' ? '🔇 Cry unavailable' : '🔊 Play Cry'}
            </button>
            <button
              type="button"
              onClick={() => assignCompareSlot('a', pokemon.id)}
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-violet-400/50 bg-violet-500/15 px-4 text-sm font-bold text-violet-100 transition hover:bg-violet-500/25"
              aria-label="Use in compare slot A"
            >
              Compare A
            </button>
            <button
              type="button"
              onClick={() => assignCompareSlot('b', pokemon.id)}
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-sky-400/50 bg-sky-500/15 px-4 text-sm font-bold text-sky-100 transition hover:bg-sky-500/25"
              aria-label="Use in compare slot B"
            >
              Compare B
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(pokemon.id)}
              aria-pressed={isFav}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 border-amber-300/40 bg-amber-400/15 px-4 text-lg font-bold text-amber-200 transition hover:bg-amber-400/25"
            >
              {isFav ? '★' : '☆'}
            </button>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-sm text-white/90">
            <strong>Category:</strong> {categoryLabel} | <strong>Generation:</strong> {pokemon.generation} |{' '}
            <strong>Habitat:</strong> {pokemon.habitat}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border-l-4 border-white/30 bg-white/10 p-6 backdrop-blur-md">
        <h3 className="mb-3 text-xl font-bold text-white">Pokédex Entry</h3>
        <p className="leading-relaxed text-white/95">{pokemon.pokedexEntries[0] ?? 'No description available.'}</p>
      </section>

      <section className="rounded-2xl bg-white/10 p-6 backdrop-blur-md">
        <h3 className="mb-4 text-xl font-bold text-white">Base Stats</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
          {pokemon.stats.map((s) => (
            <div
              key={s.name}
              className="rounded-xl border-2 border-white/10 bg-white/10 p-4 text-center backdrop-blur-md"
            >
              <div className="text-sm capitalize text-white/90">{s.name}</div>
              <div className="mt-2 text-2xl font-black text-white">{s.value}</div>
            </div>
          ))}
          <div className="rounded-xl border-2 border-white/10 bg-white/10 p-4 text-center backdrop-blur-md">
            <div className="text-sm text-white/90">Total</div>
            <div className="mt-2 text-2xl font-black text-white">{pokemon.baseStatTotal}</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white/10 p-6 backdrop-blur-md">
        <h3 className="mb-4 text-xl font-bold text-white">Evolution Chain</h3>
        {extrasQuery.isPending ? (
          <div className="flex flex-col flex-wrap items-center justify-center gap-4 md:flex-row">
            <InlineRowSkeleton className="h-40 w-32" />
            <InlineRowSkeleton className="h-40 w-32" />
            <InlineRowSkeleton className="h-40 w-32" />
          </div>
        ) : null}
        {extrasQuery.isError ? (
          <AsyncFeedback
            title="Evolution unavailable"
            description={
              extrasQuery.error instanceof Error ? extrasQuery.error.message : 'Could not load evolution data.'
            }
          />
        ) : null}
        {extrasQuery.isSuccess && chain.length === 1 && !hasMega ? (
          <p className="text-center text-white/70">This Pokémon does not evolve.</p>
        ) : null}
        {extrasQuery.isSuccess && (chain.length > 1 || hasMega) ? (
          <div className="flex flex-col flex-wrap items-center justify-center gap-4 md:flex-row">
            {chain.map((evo, index) => (
              <div key={evo.id} className="flex flex-col items-center gap-2 md:flex-row">
                <button
                  type="button"
                  onClick={() => showPokemon(evo.id)}
                  className={[
                    'app-focus-ring rounded-[var(--radius-3xl)] border border-white/12 bg-white/8 p-4 text-center transition-[transform,border-color,background-color] duration-[var(--duration-normal)] [transition-timing-function:var(--ease-out)] hover:-translate-y-0.5 hover:border-white/24 hover:bg-white/12',
                    evo.id === pokemon.id ? 'border-white/35 shadow-[var(--shadow-carousel-active)]' : '',
                  ].join(' ')}
                >
                  {evo.image ? (
                    <img src={evo.image} alt={evo.name} className="mx-auto size-28 object-contain md:size-32" />
                  ) : null}
                  <p className="mt-2 font-bold capitalize text-white">{evo.name}</p>
                  {evo.details && index > 0 ? (
                    <div className="mt-2 text-xs text-white/80">
                      {[
                        evo.details.min_level ? `Level ${evo.details.min_level}` : null,
                        evo.details.item ? evo.details.item.name.replaceAll('-', ' ') : null,
                        evo.details.trigger && evo.details.trigger.name !== 'level-up'
                          ? evo.details.trigger.name.replaceAll('-', ' ')
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' • ') || 'Evolves'}
                    </div>
                  ) : null}
                </button>
                {index < chain.length - 1 ? (
                  <div className="rotate-90 text-3xl text-white/70 md:rotate-0">→</div>
                ) : null}
              </div>
            ))}
            {canShowMega ? (
              <div className="w-full border-t border-amber-400/30 pt-6">
                <h4 className="mb-4 text-center text-lg font-black text-amber-300">Mega Evolutions</h4>
                <div className="flex flex-wrap justify-center gap-4">
                  {pokemon.megaEvolutions.map((mega) => (
                    <button
                      key={mega.id}
                      type="button"
                      onClick={() => setMegaModal(mega)}
                      className="app-focus-ring relative rounded-[var(--radius-3xl)] border border-amber-400/45 bg-gradient-to-br from-amber-400/18 to-orange-500/14 p-4 shadow-[var(--shadow-md)] transition-[transform,border-color] duration-[var(--duration-normal)] [transition-timing-function:var(--ease-out)] hover:-translate-y-0.5 active:scale-[0.99]"
                    >
                      <span className="absolute -right-2 -top-2 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 px-2 py-1 text-[10px] font-black text-black">
                        MEGA
                      </span>
                      {mega.image ? (
                        <img src={mega.image} alt={mega.name} className="mx-auto size-28 object-contain" />
                      ) : null}
                      <p className="mt-2 font-bold capitalize text-white">{mega.name.replaceAll('-', ' ')}</p>
                      <p className="mt-1 text-xs text-white/80">
                        <strong>Requires:</strong> {mega.megaStone}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border-b-2 border-white/20 pb-6">
        <h3 className="mb-4 text-xl font-bold text-white">Location & Encounters</h3>
        {pokemon.locations.length === 0 ? (
          <p className="text-white/70">Location data not available for this Pokémon.</p>
        ) : (
          <div className="space-y-3">
            {Object.values(
              pokemon.locations.reduce<Record<string, PokemonEncounterLocation[]>>((acc, loc) => {
                const key = `${loc.game}-${loc.location}`;
                const bucket = acc[key] ?? [];
                bucket.push(loc);
                acc[key] = bucket;
                return acc;
              }, {}),
            ).map((group) => (
              <div
                key={`${group[0]!.game}-${group[0]!.location}`}
                className="rounded-xl border-l-4 border-white/30 bg-white/10 p-4 text-sm leading-relaxed backdrop-blur-md"
              >
                <strong className="uppercase">{group[0]!.game.replaceAll('-', ' ')}</strong> — {group[0]!.location}
                <div className="mt-2 text-white/90">
                  {group.map((e) => `${e.method} (Lv. ${e.minLevel}-${e.maxLevel})`).join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white/10 p-6 backdrop-blur-md">
        <h3 className="mb-4 text-xl font-bold text-white">Type Effectiveness</h3>
        {extrasQuery.isPending ? (
          <div className="space-y-4">
            <InlineRowSkeleton />
            <InlineRowSkeleton />
            <InlineRowSkeleton />
          </div>
        ) : null}
        {extrasQuery.isError ? (
          <AsyncFeedback
            title="Matchups unavailable"
            description={
              extrasQuery.error instanceof Error ? extrasQuery.error.message : 'Could not load type chart.'
            }
          />
        ) : null}
        {extrasQuery.isSuccess && effectiveness ? (
          <div className="space-y-6">
            <MatchupRow title="Super Effective (2×)" types={effectiveness.superEffective} />
            <MatchupRow title="Not Very Effective (0.5×)" types={effectiveness.notVeryEffective} />
            <MatchupRow title="No Effect (0×)" types={effectiveness.noEffect} />
          </div>
        ) : null}
      </section>

      <AnimatePresence>
        {megaModal ? (
          <MegaComparisonModal mega={megaModal} base={pokemon} reduced={reduced} onClose={() => setMegaModal(null)} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MatchupRow({ title, types }: { title: string; types: readonly PokemonTypeName[] }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-bold text-white/95">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {types.length === 0 ? <span className="text-white/60">None</span> : null}
        {types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
    </div>
  );
}

function MegaComparisonModal({
  mega,
  base,
  onClose,
  reduced,
}: {
  mega: MegaFormSummary;
  base: DetailedPokemon;
  onClose: () => void;
  reduced: boolean;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-[rgb(4_6_12/0.92)] p-4 backdrop-blur-[var(--blur-overlay)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={overlayBackdropTransition(reduced)}
      role="dialog"
      aria-modal
      aria-label="Mega Evolution details"
      onClick={onClose}
    >
      <motion.div
        initial={reduced ? { opacity: 0 } : { y: 36, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={reduced ? { opacity: 0 } : { y: 28, scale: 0.97, opacity: 0 }}
        transition={dialogSpringTransition(reduced)}
        className="app-surface-glass max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[var(--radius-3xl)] border border-amber-400/35 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-6 text-center text-3xl font-black capitalize text-amber-300 [font-family:var(--font-display)]">
          {mega.name.replaceAll('-', ' ')}
        </h3>
        <div className="space-y-3">
          {mega.stats.map((stat, idx) => {
            const baseStat = base.stats[idx]?.value ?? 0;
            const diff = stat.value - baseStat;
            const diffClass = diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-white';
            return (
              <div
                key={stat.name}
                className="flex items-center justify-between rounded-xl border-2 border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md"
              >
                <span className="capitalize text-white/90">{stat.name}</span>
                <span className="flex items-center gap-2 font-bold text-white">
                  <span className="text-white/70">{baseStat}</span>
                  <span>→</span>
                  <span className={diffClass}>{stat.value}</span>
                  {diff !== 0 ? (
                    <span className={`text-sm ${diffClass}`}>
                      ({diff > 0 ? '+' : ''}
                      {diff})
                    </span>
                  ) : null}
                </span>
              </div>
            );
          })}
          <div className="flex items-center justify-between rounded-xl border-2 border-amber-400/50 bg-amber-400/15 px-4 py-3">
            <span className="font-bold text-white">Total</span>
            <span className="font-black text-white">
              {base.baseStatTotal} → {mega.baseStatTotal}{' '}
              <span className="text-sm text-emerald-300">(+{mega.baseStatTotal - base.baseStatTotal})</span>
            </span>
          </div>
        </div>
        <div className="mt-6">
          <h4 className="mb-2 font-bold text-white">Type</h4>
          <div className="flex flex-wrap gap-2">
            {mega.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </div>
        <div className="mt-6 rounded-2xl border-l-4 border-amber-400 bg-amber-400/10 p-4">
          <h4 className="mb-2 font-bold text-amber-200">Mega Evolution Requirement</h4>
          <p className="text-white/95">
            <strong>Mega Stone:</strong> {mega.megaStone}
          </p>
          <p className="mt-2 text-sm italic text-white/90">Hold the Mega Stone and use it during battle to Mega Evolve.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="app-focus-ring mt-6 w-full rounded-[var(--radius-2xl)] border border-white/20 bg-white/10 py-3 font-bold text-white transition-[background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:border-white/28 hover:bg-white/16"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
