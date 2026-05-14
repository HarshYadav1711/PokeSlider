export type JourneyAchievementTier = 'quiet' | 'notable' | 'rare';

export interface JourneyAchievementDef {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly tier: JourneyAchievementTier;
}
