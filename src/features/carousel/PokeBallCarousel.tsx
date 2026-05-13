import { useMemo } from 'react';

import { POKEBALLS } from '../../data/pokeballs';
import { usePokeBallCarousel } from '../../hooks/usePokeBallCarousel';
import { useUiStore } from '../../store/uiStore';

export function PokeBallCarousel() {
  const openBall = useUiStore((s) => s.openBall);
  const { transforms, carouselProps } = usePokeBallCarousel(POKEBALLS.length);

  const balls = useMemo(() => POKEBALLS, []);

  return (
    <div className="relative z-10 flex w-full max-w-6xl flex-col items-center px-4">
      <div
        className="relative flex h-[600px] w-full max-w-4xl items-center justify-center [perspective:2000px] max-md:h-[400px] max-sm:h-[350px]"
        aria-label="Poké Ball carousel"
      >
        <div
          className="pointer-events-none absolute size-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)] max-md:size-[300px]"
          style={{ animation: 'pulse-ring 3s ease-in-out infinite' }}
          aria-hidden
        />
        <div
          className="relative z-[1] size-[200px] [transform-style:preserve-3d] max-md:size-[150px] max-sm:size-[120px]"
          onPointerEnter={carouselProps.onPointerEnter}
          onPointerLeave={carouselProps.onPointerLeave}
          onPointerDown={(event) => {
            if ((event.target as HTMLElement).closest('button')) return;
            carouselProps.onPointerDown(event);
          }}
        >
          {balls.map((ball, index) => {
            const t = transforms[index] ?? { transform: 'none', active: false };
            return (
              <button
                key={ball.id}
                type="button"
                onClick={() => openBall(ball.id)}
                className={[
                  'absolute left-1/2 top-1/2 size-[140px] -translate-x-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 transition-all duration-300 [transform-style:preserve-3d] [backface-visibility:hidden]',
                  'max-md:size-[100px] max-sm:size-[80px]',
                  t.active
                    ? 'z-10 scale-[1.3] drop-shadow-[0_0_30px_rgba(255,255,255,0.9)] [animation:active-pulse_2s_ease-in-out_infinite]'
                    : 'z-[1] hover:scale-110 hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]',
                ].join(' ')}
                style={{ transform: t.transform, willChange: 'transform' }}
                aria-label={`Open ${ball.name}`}
              >
                <img
                  src={ball.image}
                  alt={ball.name}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] [image-rendering:-webkit-optimize-contrast] [image-rendering:pixelated] transition-transform duration-300 hover:rotate-3 hover:scale-105"
                />
              </button>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes active-pulse {
          0%, 100% { filter: drop-shadow(0 0 30px rgba(255,255,255,0.9)) drop-shadow(0 0 60px rgba(138,43,226,0.6)); }
          50% { filter: drop-shadow(0 0 40px rgba(255,255,255,1)) drop-shadow(0 0 80px rgba(138,43,226,0.8)); }
        }
      `}</style>
    </div>
  );
}
