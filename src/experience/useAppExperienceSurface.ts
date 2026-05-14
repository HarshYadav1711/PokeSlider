import { useMemo } from 'react';

import { useDiscoveryUiStore } from '../features/discovery/discoveryUiStore';
import { useBattleSimulatorStore } from '../store/battleSimulatorStore';
import { useComparisonStore } from '../store/comparisonStore';
import { useDiscoveryRecommendationStore } from '../store/discoveryRecommendationStore';
import { useJourneyUiStore } from '../store/journeyUiStore';
import { useRegionExplorerStore } from '../store/regionExplorerStore';
import { useSoundscapeStore } from '../store/soundscapeStore';
import { useTeamBuilderStore } from '../store/teamBuilderStore';
import { useUiStore } from '../store/uiStore';

import type { AppExperienceSurface } from './appExperienceTypes';
import { isHomeCarouselSurface, selectAppExperienceSurface } from './selectAppExperienceSurface';

export interface AppExperienceSnapshot {
  readonly surface: AppExperienceSurface;
  /** True only on the idle home shell — carousel may mount. */
  readonly isHomeCarouselSurface: boolean;
}

/**
 * Centralized experience mode derived from existing feature stores (no duplicate open state).
 */
export function useAppExperienceSurface(): AppExperienceSnapshot {
  const journeyBlocking = useJourneyUiStore((s) => s.dashboardOpen || s.onboardingOpen);
  const overlayOpen = useUiStore((s) => s.overlayOpen);
  const dexOpen = useDiscoveryUiStore((s) => s.panelOpen);
  const compareOpen = useComparisonStore((s) => s.open);
  const battleOpen = useBattleSimulatorStore((s) => s.open);
  const teamBuilderOpen = useTeamBuilderStore((s) => s.open);
  const regionOpen = useRegionExplorerStore((s) => s.open);
  const discoveryRecoOpen = useDiscoveryRecommendationStore((s) => s.open);
  const soundscapeSettingsOpen = useSoundscapeStore((s) => s.settingsPanelOpen);

  const surface = useMemo(
    () =>
      selectAppExperienceSurface({
        journeyBlocking,
        overlayOpen,
        dexOpen,
        compareOpen,
        battleOpen,
        teamBuilderOpen,
        regionOpen,
        discoveryRecoOpen,
        soundscapeSettingsOpen,
      }),
    [
      journeyBlocking,
      overlayOpen,
      dexOpen,
      compareOpen,
      battleOpen,
      teamBuilderOpen,
      regionOpen,
      discoveryRecoOpen,
      soundscapeSettingsOpen,
    ],
  );

  return {
    surface,
    isHomeCarouselSurface: isHomeCarouselSurface(surface),
  };
}
