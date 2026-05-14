export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

/** Local-clock “simulated” time-of-day buckets (atmospheric only, not gameplay). */
export function timeOfDayFromLocalDate(d = new Date()): TimeOfDay {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h >= 5 && h < 7.5) return 'dawn';
  if (h >= 7.5 && h < 17) return 'day';
  if (h >= 17 && h < 20.5) return 'dusk';
  return 'night';
}
