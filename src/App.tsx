import { PokeBallCarousel } from './features/carousel/PokeBallCarousel';
import { DetailsOverlay } from './features/overlay/DetailsOverlay';

export function App() {
  return (
    <div className="relative z-[2] flex min-h-dvh w-full flex-col items-center justify-center px-4 py-10 text-white max-md:justify-start max-md:pt-8">
      <header className="relative z-10 mb-8 text-center">
        <h1 className="bg-gradient-to-br from-white via-[#e8e8e8] to-white bg-clip-text text-4xl font-extrabold tracking-wide text-transparent drop-shadow-[0_0_20px_rgba(138,43,226,0.45)] [animation:title-glow_3s_ease-in-out_infinite] [font-family:var(--font-display)] max-md:text-2xl md:text-5xl">
          ⚡ 3D Poké Ball Carousel ⚡
        </h1>
        <span
          className="pointer-events-none absolute -right-10 top-1/2 hidden -translate-y-1/2 text-3xl md:block"
          style={{ animation: 'sparkle 2s ease-in-out infinite' }}
          aria-hidden
        >
          ⚡
        </span>
      </header>

      <PokeBallCarousel />

      <p className="z-10 mt-10 max-w-xl rounded-full border border-white/20 bg-black/30 px-6 py-3 text-center text-sm font-semibold tracking-wide text-white/95 backdrop-blur-md max-md:mt-6 max-md:text-xs">
        Drag to spin · Tap a ball to see details
      </p>

      <DetailsOverlay />
    </div>
  );
}
