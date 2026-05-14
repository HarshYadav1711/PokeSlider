import { useDiscoveryUiStore } from '../features/discovery/discoveryUiStore';
import { useBattleSimulatorStore } from '../store/battleSimulatorStore';
import { useComparisonStore } from '../store/comparisonStore';
import { useDiscoveryRecommendationStore } from '../store/discoveryRecommendationStore';
import { useJourneyUiStore } from '../store/journeyUiStore';
import { useRegionExplorerStore } from '../store/regionExplorerStore';
import { useTeamBuilderStore } from '../store/teamBuilderStore';
import { useUiStore } from '../store/uiStore';

/**
 * When false, the home Poké Ball rack should unmount: no RAF, drag listeners, or 3D transforms.
 * Any immersive surface (overlay, dex sheet, modals, journey) blocks the hero.
 */
export function useHomeHeroSurfaceActive(): boolean {
  const overlayOpen = useUiStore((s) => s.overlayOpen);
  const dexOpen = useDiscoveryUiStore((s) => s.panelOpen);
  const compareOpen = useComparisonStore((s) => s.open);
  const teamBuilderOpen = useTeamBuilderStore((s) => s.open);
  const battleOpen = useBattleSimulatorStore((s) => s.open);
  const regionOpen = useRegionExplorerStore((s) => s.open);
  const discoveryRecoOpen = useDiscoveryRecommendationStore((s) => s.open);
  const journeyBlocking = useJourneyUiStore(
    (s) => s.dashboardOpen || s.onboardingOpen,
  );

  return !(
    overlayOpen ||
    dexOpen ||
    compareOpen ||
    teamBuilderOpen ||
    battleOpen ||
    regionOpen ||
    discoveryRecoOpen ||
    journeyBlocking
  );
}
