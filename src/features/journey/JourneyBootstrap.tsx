import { useEffect, useState } from 'react';

import { useJourneyTrainerStore } from '../../store/journeyTrainerStore';
import { useJourneyUiStore } from '../../store/journeyUiStore';

/**
 * After persisted trainer state hydrates, offer onboarding once for new visitors who have not deferred.
 */
export function JourneyBootstrap() {
  const [ready, setReady] = useState(() => useJourneyTrainerStore.persist.hasHydrated());

  useEffect(() => {
    if (useJourneyTrainerStore.persist.hasHydrated()) {
      setReady(true);
      return;
    }
    const unsub = useJourneyTrainerStore.persist.onFinishHydration(() => {
      setReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!ready) return;
    const { onboardingComplete, onboardingDeferred } = useJourneyTrainerStore.getState();
    if (!onboardingComplete && !onboardingDeferred) {
      useJourneyUiStore.getState().openOnboarding();
    }
  }, [ready]);

  return null;
}
