import { useJourneyTrainerStore } from '../../store/journeyTrainerStore';
import { useJourneyUiStore } from '../../store/journeyUiStore';

export function JourneyEntryButton() {
  const onboardingComplete = useJourneyTrainerStore((s) => s.onboardingComplete);
  const onboardingDeferred = useJourneyTrainerStore((s) => s.onboardingDeferred);

  const label = onboardingComplete ? 'Journey' : onboardingDeferred ? 'Continue journey' : 'Your journey';

  return (
    <button
      type="button"
      className="app-focus-ring rounded-full border border-violet-400/35 bg-violet-500/15 px-4 py-2 text-[var(--text-body-sm)] font-semibold text-violet-100 shadow-[var(--shadow-sm)] backdrop-blur-[var(--blur-glass)] hover:bg-violet-500/25"
      aria-label={
        onboardingComplete
          ? 'Open journey dashboard with trainer card and milestones'
          : 'Open journey setup or trainer profile'
      }
      onClick={() => {
        if (onboardingComplete) {
          useJourneyUiStore.getState().setDashboardOpen(true);
        } else {
          useJourneyUiStore.getState().openOnboarding();
        }
      }}
    >
      {label}
    </button>
  );
}
