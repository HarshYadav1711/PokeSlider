/** National dex-style ids for main-series starter trios (sprites match `pokemon/{id}.png`). */
export interface JourneyStarterTriplet {
  readonly generation: number;
  readonly grass: number;
  readonly fire: number;
  readonly water: number;
}

export const JOURNEY_STARTER_TRIPLETS: readonly JourneyStarterTriplet[] = [
  { generation: 1, grass: 1, fire: 4, water: 7 },
  { generation: 2, grass: 152, fire: 155, water: 158 },
  { generation: 3, grass: 252, fire: 255, water: 258 },
  { generation: 4, grass: 387, fire: 390, water: 393 },
  { generation: 5, grass: 495, fire: 498, water: 501 },
  { generation: 6, grass: 650, fire: 653, water: 656 },
  { generation: 7, grass: 722, fire: 725, water: 728 },
  { generation: 8, grass: 810, fire: 813, water: 816 },
  { generation: 9, grass: 906, fire: 909, water: 912 },
] as const;
