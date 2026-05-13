import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { AsyncFeedback } from '../../components/ui/AsyncFeedback';
import { BallDetailSkeleton } from '../../components/ui/PanelSkeletons';
import type { PokeBallDefinition } from '../../data/pokeballs';
import { prefetchPokemonDetail } from '../../query/prefetch';
import { useBallSuggestionsQuery } from '../../query/useBallSuggestionsQuery';
import { useUiStore } from '../../store/uiStore';
import type { PokemonSummary } from '../../types/pokemon';

interface BallDetailPanelProps {
  ball: PokeBallDefinition;
}

function PokemonThumb({ pokemon }: { pokemon: PokemonSummary }) {
  const qc = useQueryClient();
  const showPokemon = useUiStore((s) => s.showPokemon);
  const src =
    pokemon.image ??
    pokemon.sprite ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  return (
    <button
      type="button"
      onClick={() => showPokemon(pokemon.id)}
      onPointerEnter={() => {
        void prefetchPokemonDetail(qc, pokemon.id);
      }}
      aria-label={[
        `View ${pokemon.name} details`,
        pokemon.isLegendary ? 'Legendary Pokémon' : null,
        pokemon.isMythical ? 'Mythical Pokémon' : null,
        pokemon.isPseudoLegendary ? 'Pseudo-legendary Pokémon' : null,
      ]
        .filter(Boolean)
        .join(', ')}
      className="app-focus-ring relative flex flex-col items-center rounded-[var(--radius-2xl)] border border-white/12 bg-white/8 p-4 text-center transition-[transform,background-color,border-color] duration-[var(--duration-normal)] [transition-timing-function:var(--ease-out)] hover:-translate-y-0.5 hover:border-white/22 hover:bg-white/12 active:translate-y-0 active:scale-[0.99]"
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className="size-24 object-contain max-md:size-20 max-sm:size-16"
        onError={(e) => {
          const el = e.currentTarget;
          el.onerror = null;
          el.src =
            pokemon.sprite ??
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
        }}
      />
      <p className="mt-3 text-sm font-semibold capitalize text-white">{pokemon.name}</p>
      {pokemon.isLegendary ? (
        <span className="absolute right-3 top-3 text-xl text-amber-300" aria-hidden title="Legendary">
          ★
        </span>
      ) : pokemon.isMythical ? (
        <span className="absolute right-3 top-3 text-xl text-pink-300" aria-hidden title="Mythical">
          ✦
        </span>
      ) : pokemon.isPseudoLegendary ? (
        <span className="absolute right-3 top-3 text-xl text-violet-300" aria-hidden title="Pseudo-Legendary">
          ◆
        </span>
      ) : null}
    </button>
  );
}

export function BallDetailPanel({ ball }: BallDetailPanelProps) {
  const { data, isPending, isError, error, refetch, isFetching } = useBallSuggestionsQuery(ball);

  const pokemon = useMemo(() => data ?? [], [data]);

  if (isPending) {
    return <BallDetailSkeleton />;
  }

  if (isError) {
    return (
      <div className="space-y-4 text-center">
        <AsyncFeedback
          title="Could not load suggestions"
          description={error instanceof Error ? error.message : 'Unknown error'}
        />
        <button
          type="button"
          onClick={() => void refetch()}
          className="app-focus-ring min-h-11 rounded-[var(--radius-pill)] border border-white/22 bg-white/10 px-6 py-2 font-semibold text-white transition-[background-color,border-color] duration-[var(--duration-fast)] [transition-timing-function:var(--ease-out)] hover:border-white/30 hover:bg-white/16"
        >
          Retry loading suggestions
        </button>
      </div>
    );
  }

  if (pokemon.length === 0) {
    return (
      <AsyncFeedback role="status" title="No Pokémon to show" description="Try again in a moment." />
    );
  }

  return (
    <div className="space-y-6">
      {isFetching ? (
        <p className="text-center text-xs text-white/60" aria-live="polite">
          Refreshing…
        </p>
      ) : null}
      <div className="rounded-2xl border-l-4 border-white/30 bg-white/10 p-6 backdrop-blur-md">
        <p className="text-base leading-relaxed text-white/95">{ball.description}</p>
        <p className="mt-4 text-sm text-white/90">
          <span className="font-semibold">Catch Rate:</span> {ball.catchRate}
        </p>
      </div>
      <div>
        <h3 className="mb-4 text-xl font-bold tracking-tight text-white [font-family:var(--font-display)]">
          Commonly Caught Pokémon:
        </h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 max-md:grid-cols-[repeat(auto-fill,minmax(90px,1fr))]">
          {pokemon.map((p) => (
            <PokemonThumb key={p.id} pokemon={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
