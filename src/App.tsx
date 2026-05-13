import { PokeBallCarousel } from './features/carousel/PokeBallCarousel';
import { ComparisonModal } from './features/compare/ComparisonModal';
import { MyDexPanel } from './features/discovery/MyDexPanel';
import { DetailsOverlay } from './features/overlay/DetailsOverlay';
import { useAppKeyboardShortcuts } from './hooks/useAppKeyboardShortcuts';

export function App() {
  useAppKeyboardShortcuts();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only absolute left-4 top-4 z-[9999] rounded-lg bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-slate-900 shadow-md focus:not-sr-only focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[rgb(129_140_248/0.9)]"
      >
        Skip to main content
      </a>
      <main id="main-content" className="relative z-[2] flex min-h-dvh w-full flex-col items-stretch text-[#f4f4f8] max-lg:pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex w-full max-w-[min(100%,72rem)] flex-1 flex-col items-center px-[var(--space-section-x)] py-[var(--space-section-y)] max-md:items-stretch">
        <header className="relative z-10 mb-[var(--space-hero-gap)] w-full max-w-2xl text-center lg:mb-[var(--space-10)]">
          <p className="mb-[var(--space-3)] text-[var(--text-eyebrow)] font-semibold uppercase tracking-[0.14em] text-white/62 [font-family:var(--font-sans)]">
            Interactive catalog
          </p>
          <h1 className="text-[var(--text-display)] font-bold leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-white [font-family:var(--font-display)]">
            Poké Ball carousel
          </h1>
          <p className="mx-auto mt-[var(--space-4)] max-w-lg text-[var(--text-body)] leading-[var(--leading-snug)] text-white/70">
            Spin the rack, open a ball, then browse species in My Dex — built for calm exploration.
          </p>
        </header>

        <PokeBallCarousel />

        <p
          className="z-10 mt-[var(--space-10)] w-full max-w-xl rounded-[var(--radius-pill)] border border-white/12 bg-[rgb(10_12_20/0.55)] px-[var(--space-6)] py-[var(--space-3)] text-center text-[var(--text-body-sm)] font-medium text-white/88 backdrop-blur-[var(--blur-glass)] max-md:mt-[var(--space-8)]"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <span className="block sm:inline">Drag or arrow keys to spin</span>
          <span className="mx-2 hidden text-white/35 sm:inline" aria-hidden>
            ·
          </span>
          <span className="block sm:inline">Tap the front ball for details</span>
          <span className="mx-2 hidden text-white/35 sm:inline" aria-hidden>
            ·
          </span>
          <span className="block sm:inline">
            <span className="whitespace-nowrap">My Dex to browse</span>
          </span>
        </p>
      </div>

      <DetailsOverlay />

      <MyDexPanel />

      <ComparisonModal />
      </main>
    </>
  );
}
