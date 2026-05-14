import type { PokeBallDefinition } from '../../data/pokeballs';

import { rarityTierAccentClass, rarityTierLabel } from './pokeballRarityPresentation';

interface BallCollectibleCardProps {
  ball: PokeBallDefinition;
  /** Optional corner slot (e.g. rank #1 chip) */
  badge?: string;
}

export function BallCollectibleCard({ ball, badge }: BallCollectibleCardProps) {
  const accent = rarityTierAccentClass(ball.rarityTier);
  return (
    <article className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-white/14 bg-[rgb(8_10_18/0.72)] shadow-[var(--shadow-md)] backdrop-blur-md">
      <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} aria-hidden />
      <div className="grid gap-4 p-5 sm:grid-cols-[120px_1fr] sm:items-center">
        <div className="relative mx-auto flex size-[120px] items-center justify-center rounded-2xl border border-white/12 bg-white/8">
          {badge ? (
            <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-200">
              {badge}
            </span>
          ) : null}
          <img src={ball.image} alt="" className="size-24 object-contain" loading="lazy" decoding="async" />
        </div>
        <div className="space-y-2 text-white/90">
          <p className="text-[var(--text-eyebrow)] font-bold uppercase tracking-[0.18em] text-white/55">
            {rarityTierLabel(ball.rarityTier)}
          </p>
          <h3 className="text-xl font-black leading-tight tracking-tight text-white [font-family:var(--font-display)]">
            {ball.name}
          </h3>
          <p className="text-[var(--text-body-sm)] leading-snug text-white/78">{ball.heritageLine}</p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="min-w-[140px] flex-1">
              <div className="mb-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-white/55">
                <span>Collectibility</span>
                <span>{ball.collectibilityScore}/100</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-white/10"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={ball.collectibilityScore}
                aria-label={`Collectibility score ${ball.collectibilityScore} out of 100`}
              >
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${accent}`}
                  style={{ width: `${ball.collectibilityScore}%` }}
                />
              </div>
            </div>
            <p className="rounded-full border border-white/16 bg-white/8 px-3 py-1 text-xs font-semibold text-white/85">
              Catalog: {ball.catchRate}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
