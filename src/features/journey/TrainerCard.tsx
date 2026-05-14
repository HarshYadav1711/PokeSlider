import { journeyRegionLabel } from '../../data/journeyRegions';
import { journeyPokemonSpriteUrl } from './journeySpriteUrl';

export interface TrainerCardProps {
  readonly displayName: string;
  readonly starterPokemonId: number | null;
  readonly favoriteRegionKey: string | null;
  readonly compact?: boolean;
  readonly className?: string;
}

export function TrainerCard({ displayName, starterPokemonId, favoriteRegionKey, compact, className }: TrainerCardProps) {
  const name = displayName.trim() || 'Trainer';
  const region = journeyRegionLabel(favoriteRegionKey);
  const sprite = starterPokemonId !== null ? journeyPokemonSpriteUrl(starterPokemonId) : null;

  return (
    <div
      className={[
        'app-surface-glass relative overflow-hidden rounded-[var(--radius-2xl)] border border-white/14 bg-[rgb(8_10_18/0.72)] text-left shadow-[var(--shadow-md)]',
        compact ? 'p-4' : 'p-6 sm:p-7',
        className ?? '',
      ].join(' ')}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-indigo-500/18 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-8 h-56 w-56 rounded-full bg-violet-500/12 blur-3xl"
        aria-hidden
      />

      <div className={compact ? 'flex items-center gap-4' : 'flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8'}>
        <div
          className={[
            'relative mx-auto flex shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-[rgb(6_8_14/0.85)] shadow-inner',
            compact ? 'h-20 w-20' : 'h-28 w-28 sm:h-32 sm:w-32',
          ].join(' ')}
        >
          {sprite ? (
            <img
              src={sprite}
              alt=""
              width={compact ? 72 : 112}
              height={compact ? 72 : 112}
              className="object-contain p-1 drop-shadow-md"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="text-3xl text-white/35" aria-hidden>
              ◆
            </span>
          )}
          <span className="sr-only">Partner Pokémon portrait</span>
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-[var(--text-eyebrow)] font-semibold uppercase tracking-[0.14em] text-indigo-200/75">
            Trainer card
          </p>
          <p className="mt-1 truncate text-[var(--text-title)] font-bold tracking-tight text-white [font-family:var(--font-display)]">
            {name}
          </p>
          <p className="mt-2 text-[var(--text-body-sm)] text-white/72">
            <span className="text-white/55">Affiliation · </span>
            {region}
          </p>
          {!compact ? (
            <p className="mt-3 max-w-md text-[var(--text-body-sm)] leading-relaxed text-white/62">
              A quiet record of how you explore the catalog — favorites, teams, and discoveries stay on this device.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
