import { memo } from 'react';

import type { PokemonSummary } from '../../types/pokemon';
import { journeyPokemonSpriteUrl } from '../journey/journeySpriteUrl';

interface RegionExplorerPokemonRowProps {
  readonly summaries: readonly PokemonSummary[];
  readonly loading: boolean;
  readonly onOpenPokemon: (id: number) => void;
}

export const RegionExplorerPokemonRow = memo(function RegionExplorerPokemonRow({
  summaries,
  loading,
  onOpenPokemon,
}: RegionExplorerPokemonRowProps) {
  if (loading && summaries.length === 0) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-1" aria-busy="true" aria-live="polite">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 w-[5.5rem] shrink-0 animate-pulse rounded-xl bg-white/[0.06]"
          />
        ))}
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <p className="text-[var(--text-body-sm)] text-white/62" role="status">
        Open a route to preview species from this generation.
      </p>
    );
  }

  return (
    <ul className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {summaries.map((p) => (
        <li key={p.id} className="shrink-0">
          <button
            type="button"
            className="app-focus-ring flex w-[5.75rem] flex-col gap-1.5 rounded-xl border border-white/12 bg-[rgb(6_8_14/0.55)] p-2 text-left shadow-[var(--shadow-sm)] hover:border-white/20 md:min-h-[6.5rem] md:w-[6.25rem]"
            onClick={() => onOpenPokemon(p.id)}
          >
            <div className="relative mx-auto h-12 w-12 overflow-hidden rounded-lg bg-[rgb(4_6_12/0.85)]">
              <img
                src={journeyPokemonSpriteUrl(p.id)}
                alt=""
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="line-clamp-2 text-[11px] font-semibold capitalize leading-snug text-white/88">
              {p.name.replaceAll('-', ' ')}
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/55">
              {p.types.join(' · ')}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
});
