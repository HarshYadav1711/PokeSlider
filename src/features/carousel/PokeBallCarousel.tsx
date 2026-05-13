import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { POKEBALLS } from '../../data/pokeballs';
import { usePokeBallCarousel } from '../../hooks/usePokeBallCarousel';
import { prefetchBallSuggestions } from '../../query/prefetch';
import { useUiStore } from '../../store/uiStore';

export function PokeBallCarousel() {
  const qc = useQueryClient();
  const openBall = useUiStore((s) => s.openBall);
  const { transforms, carouselProps, reducedMotion } = usePokeBallCarousel(POKEBALLS.length);

  const balls = useMemo(() => POKEBALLS, []);

  return (
    <div className="relative z-10 flex w-full max-w-[min(100%,72rem)] flex-col items-center px-[var(--space-section-x)]">
      <div
        className="relative flex h-[min(600px,72dvh)] w-full max-w-4xl items-center justify-center [perspective:2000px] max-md:h-[min(420px,58dvh)] max-sm:h-[min(360px,52dvh)]"
        aria-label="Poké Ball carousel"
      >
        <div
          className={[
            'pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.06)_0%,transparent_68%)] max-md:size-[min(300px,85vw)]',
            reducedMotion ? 'size-[min(420px,90vw)] opacity-40' : 'motion-carousel-halo size-[min(480px,92vw)]',
          ].join(' ')}
          aria-hidden
        />
        <div
          className="relative z-[1] size-[min(200px,42vw)] [transform-style:preserve-3d] max-md:size-[min(150px,38vw)] max-sm:size-[min(120px,36vw)]"
          onPointerEnter={carouselProps.onPointerEnter}
          onPointerLeave={carouselProps.onPointerLeave}
          onPointerDown={(event) => {
            if ((event.target as HTMLElement).closest('button')) return;
            carouselProps.onPointerDown(event);
          }}
        >
          {balls.map((ball, index) => {
            const t = transforms[index] ?? { transform: 'none', active: false };
            const nextBall = balls[(index + 1) % balls.length]!;
            return (
              <button
                key={ball.id}
                type="button"
                onPointerEnter={() => {
                  void prefetchBallSuggestions(qc, ball);
                  void prefetchBallSuggestions(qc, nextBall);
                }}
                onClick={() => openBall(ball.id)}
                className={[
                  'app-focus-ring absolute left-1/2 top-1/2 size-[min(140px,30vw)] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-[var(--radius-2xl)] border-0 bg-transparent p-0 [transform-style:preserve-3d] [backface-visibility:hidden]',
                  'max-md:size-[min(100px,26vw)] max-sm:size-[min(88px,28vw)]',
                  'transition-[transform,box-shadow,filter] duration-[var(--duration-normal)] [transition-timing-function:var(--ease-out)]',
                  'motion-reduce:transition-none',
                  t.active
                    ? 'z-10 scale-[1.22] [filter:drop-shadow(0_10px_22px_rgb(0_0_0/0.45))]'
                    : 'z-[1] scale-100 hover:scale-105 active:scale-[1.02] [filter:drop-shadow(0_6px_14px_rgb(0_0_0/0.35))] hover:[filter:drop-shadow(0_8px_18px_rgb(0_0_0/0.4))]',
                  t.active ? 'shadow-[var(--shadow-carousel-active)]' : 'shadow-none',
                ].join(' ')}
                style={{ transform: t.transform, willChange: 'transform' }}
                aria-label={`Open ${ball.name}`}
              >
                <img
                  src={ball.image}
                  alt={ball.name}
                  loading="lazy"
                  decoding="async"
                  className={[
                    'size-full object-contain [image-rendering:-webkit-optimize-contrast] [image-rendering:pixelated]',
                    reducedMotion
                      ? ''
                      : 'transition-transform duration-[var(--duration-normal)] [transition-timing-function:var(--ease-out)] hover:rotate-[2deg]',
                  ].join(' ')}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
