import { create } from 'zustand';

interface JourneyUiState {
  dashboardOpen: boolean;
  onboardingOpen: boolean;
  /** When true, onboarding updates profile without resetting journey start timestamp. */
  onboardingEditMode: boolean;
  setDashboardOpen: (open: boolean) => void;
  setOnboardingOpen: (open: boolean) => void;
  openOnboarding: (opts?: { edit?: boolean }) => void;
}

export const useJourneyUiStore = create<JourneyUiState>((set) => ({
  dashboardOpen: false,
  onboardingOpen: false,
  onboardingEditMode: false,
  setDashboardOpen: (open) => set({ dashboardOpen: open }),
  setOnboardingOpen: (open) =>
    set((s) => ({
      onboardingOpen: open,
      onboardingEditMode: open ? s.onboardingEditMode : false,
    })),
  openOnboarding: (opts) =>
    set({
      onboardingOpen: true,
      onboardingEditMode: Boolean(opts?.edit),
    }),
}));
