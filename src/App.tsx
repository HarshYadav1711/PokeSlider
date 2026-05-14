import { lazy, Suspense } from 'react';

import { PokeBallCarousel } from './features/carousel/PokeBallCarousel';
import { DetailsOverlay } from './features/overlay/DetailsOverlay';
import { MyDexPanel } from './features/discovery/MyDexPanel';
import { JourneyBootstrap } from './features/journey/JourneyBootstrap';
import { JourneyEntryButton } from './features/journey/JourneyEntryButton';
import { SoundscapeControls } from './features/soundscape/SoundscapeControls';
import { useAppExperienceSurface } from './experience/useAppExperienceSurface';
import { useAppKeyboardShortcuts } from './hooks/useAppKeyboardShortcuts';
import { useImmersionChromeLock } from './hooks/useImmersionChromeLock';
import { usePerformanceTier, type PerformanceTier } from './hooks/usePerformanceTier';
import { useDiscoveryRecommendationStore } from './store/discoveryRecommendationStore';
import { useRegionExplorerStore } from './store/regionExplorerStore';
import { useTeamBuilderStore } from './store/teamBuilderStore';

const RegionExplorerModal = lazy(() => import('./features/region-explorer/RegionExplorerModal'));
const TeamBuilderModal = lazy(() =>
  import('./features/team-builder/TeamBuilderModal').then((m) => ({ default: m.TeamBuilderModal })),
);
const BattleSimulatorModal = lazy(() =>
  import('./features/battle-sim/BattleSimulatorModal').then((m) => ({ default: m.BattleSimulatorModal })),
);
const ComparisonModal = lazy(() =>
  import('./features/compare/ComparisonModal').then((m) => ({ default: m.ComparisonModal })),
);
const DiscoveryEngineModal = lazy(() =>
  import('./features/discovery-recommendation/DiscoveryEngineModal').then((m) => ({
    default: m.DiscoveryEngineModal,
  })),
);
const JourneyDashboardModal = lazy(() =>
  import('./features/journey/JourneyDashboardModal').then((m) => ({ default: m.JourneyDashboardModal })),
);
const JourneyOnboardingDialog = lazy(() =>
  import('./features/journey/JourneyOnboardingDialog').then((m) => ({ default: m.JourneyOnboardingDialog })),
);

const PerformanceDiagnostics = import.meta.env.DEV
  ? lazy(() =>
      import('./dev/PerformanceDiagnostics').then((m) => ({ default: m.PerformanceDiagnostics })),
    )
  : null;

const homeHeroShellLayout =
  'flex w-full flex-1 flex-col items-center max-md:w-full max-md:items-stretch';

function HomeHeroChrome({
  homeHeroActive,
  performanceTier,
}: {
  homeHeroActive: boolean;
  performanceTier: PerformanceTier;
}) {
  const shell = (
    <>
      <header className="relative z-10 mb-[var(--space-hero-gap)] w-full max-w-2xl text-center lg:mb-[var(--space-10)]">
        <div className="mb-[var(--space-4)] flex flex-wrap justify-center gap-2">
          <JourneyEntryButton />
          <SoundscapeControls />
          <button
            type="button"
            className="app-focus-ring rounded-full border border-sky-400/35 bg-sky-500/15 px-4 py-2 text-[var(--text-body-sm)] font-semibold text-sky-100 shadow-[var(--shadow-sm)] backdrop-blur-[var(--blur-glass)] hover:bg-sky-500/25"
            onClick={() => useRegionExplorerStore.getState().setOpen(true)}
          >
            Region explorer
          </button>
          <button
            type="button"
            className="app-focus-ring rounded-full border border-violet-400/35 bg-violet-500/15 px-4 py-2 text-[var(--text-body-sm)] font-semibold text-violet-100 shadow-[var(--shadow-sm)] backdrop-blur-[var(--blur-glass)] hover:bg-violet-500/25"
            onClick={() => useDiscoveryRecommendationStore.getState().setOpen(true)}
          >
            Discovery mix
          </button>
          <button
            type="button"
            className="app-focus-ring rounded-full border border-indigo-400/35 bg-indigo-500/15 px-4 py-2 text-[var(--text-body-sm)] font-semibold text-indigo-100 shadow-[var(--shadow-sm)] backdrop-blur-[var(--blur-glass)] hover:bg-indigo-500/25"
            onClick={() => useTeamBuilderStore.getState().setOpen(true)}
          >
            Open Team Builder
          </button>
        </div>
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

      {homeHeroActive ? <PokeBallCarousel performanceTier={performanceTier} /> : null}

      {homeHeroActive ? (
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
      ) : null}
    </>
  );

  if (homeHeroActive) {
    return <div className={homeHeroShellLayout}>{shell}</div>;
  }

  return (
    <div className={`${homeHeroShellLayout} pointer-events-none select-none`} aria-hidden="true">
      {shell}
    </div>
  );
}

export function App() {
  useAppKeyboardShortcuts();
  const performanceTier = usePerformanceTier();
  const { surface, isHomeCarouselSurface: homeHeroActive } = useAppExperienceSurface();
  useImmersionChromeLock(surface);

  const regionExplorerOpen = useRegionExplorerStore((s) => s.open);

  return (
    <>
      {import.meta.env.DEV && PerformanceDiagnostics ? (
        <Suspense fallback={null}>
          <PerformanceDiagnostics />
        </Suspense>
      ) : null}
      <a
        href="#main-content"
        className="sr-only absolute left-4 top-4 z-[9999] rounded-lg bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-slate-900 shadow-md focus:not-sr-only focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[rgb(129_140_248/0.9)]"
      >
        Skip to main content
      </a>
      <main
        id="main-content"
        className="relative z-[2] flex min-h-dvh w-full flex-col items-stretch text-[#f4f4f8] max-lg:pt-[env(safe-area-inset-top)]"
      >
        <div className="mx-auto flex w-full max-w-[min(100%,72rem)] flex-1 flex-col items-center px-[var(--space-section-x)] py-[var(--space-section-y)] max-md:items-stretch">
          <HomeHeroChrome homeHeroActive={homeHeroActive} performanceTier={performanceTier} />

          <DetailsOverlay />

          <MyDexPanel />

          <Suspense fallback={null}>
            <DiscoveryEngineModal />
            <ComparisonModal />
            <BattleSimulatorModal />
            <TeamBuilderModal />
            <JourneyDashboardModal />
            <JourneyOnboardingDialog />
          </Suspense>
          {regionExplorerOpen ? (
            <Suspense fallback={null}>
              <RegionExplorerModal />
            </Suspense>
          ) : null}

          <JourneyBootstrap />
        </div>
      </main>
    </>
  );
}
