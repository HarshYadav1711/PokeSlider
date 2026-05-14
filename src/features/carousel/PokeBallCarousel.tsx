import { useCallback, useId, type KeyboardEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { POKEBALLS } from '../../data/pokeballs';
import { usePokeBallCarousel } from '../../hooks/usePokeBallCarousel';
import type { PerformanceTier } from '../../hooks/usePerformanceTier';
import { prefetchBallSuggestions } from '../../query/prefetch';
import { useUiStore } from '../../store/uiStore';

export function PokeBallCarousel({ performanceTier }: { readonly performanceTier: PerformanceTier }) {
  const qc = useQueryClient();
  const openBall = useUiStore((s) => s.openBall);
  const headingId = useId();
  const hintId = useId();
  const liveId = useId();

  const balls = POKEBALLS;
  const ballCount = balls.length;
  const { transforms, carouselProps, reducedMotion, activeIndex, angleStep, rotateBy, snapToIndex } =
    usePokeBallCarousel(ballCount, { performanceTier });

  const activeBall = balls[activeIndex] ?? balls[0]!;

  const onCarouselKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        rotateBy(-angleStep);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        rotateBy(angleStep);
        return;
      }
      if (e.key === 'Home') {
        e.preventDefault();
        snapToIndex(0);
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        snapToIndex(ballCount - 1);
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const b = balls[activeIndex];
        if (b) void openBall(b.id);
      }
    },
    [angleStep, activeIndex, ballCount, balls, openBall, rotateBy, snapToIndex],
  );

  const lightMotion = reducedMotion || performanceTier === 'low';
  const haloClasses = [
    'pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.06)_0%,transparent_68%)] max-md:size-[min(300px,85vw)]',
    lightMotion
      ? 'size-[min(420px,90vw)] opacity-40'
      : performanceTier === 'mid'
        ? 'motion-carousel-halo size-[min(450px,91vw)]'
        : 'motion-carousel-halo size-[min(480px,92vw)]',
  ].join(' ');

  const ballMotionExtras =
    lightMotion || performanceTier === 'mid'
      ? 'z-[1] scale-100 [filter:drop-shadow(0_6px_14px_rgb(0_0_0/0.35))]'
      : 'z-[1] scale-100 hover:scale-105 active:scale-[1.02] [filter:drop-shadow(0_6px_14px_rgb(0_0_0/0.35))] hover:[filter:drop-shadow(0_8px_18px_rgb(0_0_0/0.4))]';

  return (
    <section
      className="relative z-10 flex w-full max-w-[min(100%,72rem)] flex-col items-center px-[var(--space-section-x)]"
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="sr-only">
        Poké Ball carousel
      </h2>
      <p id={hintId} className="sr-only">
        Use Left and Right arrow keys to rotate the rack. Home and End jump to the first or last ball. Press Space or
        Enter to open the ball currently in front.
      </p>
      <div id={liveId} className="sr-only" aria-live="polite" aria-atomic="true">
        {activeBall.name} in front
      </div>

      <div
        tabIndex={0}
        role="group"
        aria-labelledby={headingId}
        aria-describedby={hintId}
        aria-activedescendant={`carousel-ball-${activeBall.id}`}
        onKeyDown={onCarouselKeyDown}
        className="app-focus-ring relative flex h-[min(600px,72dvh)] w-full max-w-4xl items-center justify-center outline-none [perspective:2000px] max-md:h-[min(420px,58dvh)] max-sm:h-[min(360px,52dvh)]"
      >
        <div className={haloClasses} aria-hidden />
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
            const isActive = ball.id === activeBall.id;
            return (
              <button
                key={ball.id}
                id={`carousel-ball-${ball.id}`}
                type="button"
                tabIndex={-1}
                aria-hidden={!isActive}
                onPointerEnter={() => {
                  void prefetchBallSuggestions(qc, ball);
                  void prefetchBallSuggestions(qc, nextBall);
                }}
                onClick={() => openBall(ball.id)}
                className={[
                  'app-focus-ring absolute left-1/2 top-1/2 size-[min(140px,30vw)] min-h-[44px] min-w-[44px] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-[var(--radius-2xl)] border-0 bg-transparent p-0 [transform-style:preserve-3d] [backface-visibility:hidden]',
                  'max-md:size-[min(100px,26vw)] max-sm:size-[min(88px,28vw)]',
                  'transition-[transform,box-shadow,filter] duration-[var(--duration-normal)] [transition-timing-function:var(--ease-out)]',
                  'motion-reduce:transition-none',
                  t.active
                    ? 'z-10 scale-[1.22] [filter:drop-shadow(0_10px_22px_rgb(0_0_0/0.45))]'
                    : ballMotionExtras,
                  t.active ? 'shadow-[var(--shadow-carousel-active)]' : 'shadow-none',
                ].join(' ')}
                style={{ transform: t.transform, willChange: 'transform' }}
                aria-label={`Open ${ball.name}`}
              >
                <img
                  src={ball.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={[
                    'size-full object-contain [image-rendering:-webkit-optimize-contrast] [image-rendering:pixelated]',
                    lightMotion
                      ? ''
                      : 'transition-transform duration-[var(--duration-normal)] [transition-timing-function:var(--ease-out)] hover:rotate-[2deg]',
                  ].join(' ')}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
