import { useEffect } from 'react';

import { useBattleSimulatorStore } from '../store/battleSimulatorStore';
import { useComparisonStore } from '../store/comparisonStore';
import { useDiscoveryUiStore } from '../features/discovery/discoveryUiStore';
import { useDiscoveryRecommendationStore } from '../store/discoveryRecommendationStore';
import { useRegionExplorerStore } from '../store/regionExplorerStore';
import { useJourneyUiStore } from '../store/journeyUiStore';
import { useTeamBuilderStore } from '../store/teamBuilderStore';
import { useUiStore } from '../store/uiStore';

/**
 * Global shortcuts: `/` focuses discovery search (and opens My Dex), `Escape` walks modals
 * (team builder → battle → compare → journey onboarding → journey dashboard → region explorer → discovery mix → My Dex → overlay).
 */
export function useAppKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (e.defaultPrevented) return;
        const teamBuilderOpen = useTeamBuilderStore.getState().open;
        if (teamBuilderOpen) {
          useTeamBuilderStore.getState().setOpen(false);
          e.preventDefault();
          return;
        }
        const battleOpen = useBattleSimulatorStore.getState().open;
        if (battleOpen) {
          useBattleSimulatorStore.getState().close();
          e.preventDefault();
          return;
        }
        const compareOpen = useComparisonStore.getState().open;
        if (compareOpen) {
          useComparisonStore.getState().closeModal();
          e.preventDefault();
          return;
        }
        const journeyOnboardingOpen = useJourneyUiStore.getState().onboardingOpen;
        if (journeyOnboardingOpen) {
          useJourneyUiStore.getState().setOnboardingOpen(false);
          e.preventDefault();
          return;
        }
        const journeyDashboardOpen = useJourneyUiStore.getState().dashboardOpen;
        if (journeyDashboardOpen) {
          useJourneyUiStore.getState().setDashboardOpen(false);
          e.preventDefault();
          return;
        }
        const regionExplorerOpen = useRegionExplorerStore.getState().open;
        if (regionExplorerOpen) {
          useRegionExplorerStore.getState().setOpen(false);
          e.preventDefault();
          return;
        }
        const discoveryRecoOpen = useDiscoveryRecommendationStore.getState().open;
        if (discoveryRecoOpen) {
          useDiscoveryRecommendationStore.getState().setOpen(false);
          e.preventDefault();
          return;
        }
        const dexOpen = useDiscoveryUiStore.getState().panelOpen;
        if (dexOpen) {
          useDiscoveryUiStore.getState().setPanelOpen(false);
          e.preventDefault();
          return;
        }
        if (useUiStore.getState().overlayOpen) {
          useUiStore.getState().closeOverlay();
          e.preventDefault();
        }
        return;
      }

      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      e.preventDefault();
      useDiscoveryUiStore.getState().setPanelOpen(true);
      queueMicrotask(() => {
        document.querySelector<HTMLInputElement>('[data-discovery-search]')?.focus();
      });
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
}
