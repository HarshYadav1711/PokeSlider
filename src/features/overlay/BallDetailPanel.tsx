import { useMemo } from 'react';

import { AsyncFeedback } from '../../components/ui/AsyncFeedback';
import type { PokeBallDefinition } from '../../data/pokeballs';
import { pickPokemonForBall } from '../../services/ballSuggestions';
import { usePokemonCatalogStore } from '../../store/pokemonCatalogStore';
import { useUiStore } from '../../store/uiStore';
import type { PokemonSummary } from '../../types/pokemon';

interface BallDetailPanelProps {
  ball: PokeBallDefinition;
}

function PokemonThumb({ pokemon }: { pokemon: PokemonSummary }) {
  const showPokemon = useUiStore((s) => s.showPokemon);
  const src =
    pokemon.image ??
    pokemon.sprite ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  return (
    <button
      type="button"
      onClick={() => showPokemon(pokemon.id)}
      className="relative flex flex-col items-center rounded-2xl border-2 border-white/10 bg-white/10 p-4 text-center backdrop-blur-md transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/20"
    >
      <img
        src={src}
        alt={pokemon.name}
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
        <span className="absolute right-3 top-3 text-xl text-amber-300" title="Legendary">
          ★
        </span>
      ) : pokemon.isMythical ? (
        <span className="absolute right-3 top-3 text-xl text-pink-300" title="Mythical">
          ✦
        </span>
      ) : pokemon.isPseudoLegendary ? (
        <span className="absolute right-3 top-3 text-xl text-violet-300" title="Pseudo-Legendary">
          ◆
        </span>
      ) : null}
    </button>
  );
}

export function BallDetailPanel({ ball }: BallDetailPanelProps) {
  const status = usePokemonCatalogStore((s) => s.status);
  const error = usePokemonCatalogStore((s) => s.error);
  const progress = usePokemonCatalogStore((s) => s.progress);
  const partition = usePokemonCatalogStore((s) => s.partition);
  const retryHydration = usePokemonCatalogStore((s) => s.retryHydration);

  const pokemon = useMemo(() => {
    if (!partition) return [];
    return pickPokemonForBall(ball, partition);
  }, [ball, partition]);

  if (status === 'loading' || status === 'idle') {
    const pct = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0;
    return (
      <AsyncFeedback
        title="Loading Pokémon index…"
        description={`Preparing suggestions for ${ball.name}. ${progress.total ? `${pct}% (${progress.loaded}/${progress.total})` : 'Starting…'}`}
      />
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-4 text-center">
        <AsyncFeedback title="Could not load Pokémon data" description={error ?? 'Unknown error'} />
        <button
          type="button"
          onClick={() => retryHydration()}
          className="rounded-full border border-white/30 bg-white/15 px-6 py-2 font-semibold text-white transition hover:bg-white/25"
        >
          Retry
        </button>
      </div>
    );
  }

  if (status === 'empty' || pokemon.length === 0) {
    return <AsyncFeedback title="No Pokémon to show" description="Try again after the catalog finishes loading." />;
  }

  return (
    <div className="space-y-6">
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
