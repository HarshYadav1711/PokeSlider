import { JOURNEY_ACHIEVEMENTS } from './journeyAchievementCatalog';

export interface JourneyProgressSnapshot {
  readonly uniqueDiscoveredCount: number;
  readonly favoriteEventsCount: number;
  readonly compareSessionsCount: number;
  readonly teamSnapshotsCount: number;
}

export function evaluateNewJourneyAchievements(
  snap: JourneyProgressSnapshot,
  alreadyUnlocked: ReadonlySet<string>,
): readonly string[] {
  const next: string[] = [];

  const want = (id: string, met: boolean) => {
    if (!met || alreadyUnlocked.has(id)) return;
    next.push(id);
  };

  want('first_light', snap.uniqueDiscoveredCount >= 1);
  want('wandering', snap.uniqueDiscoveredCount >= 25);
  want('horizon', snap.uniqueDiscoveredCount >= 100);
  want('warm_glow', snap.favoriteEventsCount >= 1);
  want('keepsakes', snap.favoriteEventsCount >= 12);
  want('duelist', snap.compareSessionsCount >= 1);
  want('rivalry', snap.compareSessionsCount >= 8);
  want('full_bench', snap.teamSnapshotsCount >= 1);
  want('travel_log', snap.teamSnapshotsCount >= 5);

  const order = new Map(JOURNEY_ACHIEVEMENTS.map((a, i) => [a.id, i]));
  next.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
  return next;
}
