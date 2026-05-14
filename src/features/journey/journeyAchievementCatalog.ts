import type { JourneyAchievementDef } from './journeyAchievementTypes';

/** Small, honest catalog — conditions evaluated in `achievementEngine.ts`. */
export const JOURNEY_ACHIEVEMENTS: readonly JourneyAchievementDef[] = [
  {
    id: 'first_light',
    title: 'First light',
    description: 'Opened a Pokémon profile from your journey.',
    tier: 'quiet',
  },
  {
    id: 'wandering',
    title: 'Wandering',
    description: 'Catalogued 25 distinct species in your journey log.',
    tier: 'quiet',
  },
  {
    id: 'horizon',
    title: 'Horizon',
    description: 'Catalogued 100 distinct species in your journey log.',
    tier: 'notable',
  },
  {
    id: 'warm_glow',
    title: 'Warm glow',
    description: 'Starred a Pokémon you want to remember.',
    tier: 'quiet',
  },
  {
    id: 'keepsakes',
    title: 'Keepsakes',
    description: 'Recorded 12 favorite moments in your journey.',
    tier: 'notable',
  },
  {
    id: 'duelist',
    title: 'Duelist',
    description: 'Opened a full comparison between two species.',
    tier: 'quiet',
  },
  {
    id: 'rivalry',
    title: 'Rivalry',
    description: 'Completed eight thoughtful comparisons.',
    tier: 'notable',
  },
  {
    id: 'full_bench',
    title: 'Full bench',
    description: 'Saved a complete party of six in Team Builder.',
    tier: 'notable',
  },
  {
    id: 'travel_log',
    title: 'Travel log',
    description: 'Archived five different six-Pokémon teams.',
    tier: 'rare',
  },
] as const;