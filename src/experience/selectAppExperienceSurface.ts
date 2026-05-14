import type { AppExperienceFlags, AppExperienceSurface } from './appExperienceTypes';

/**
 * Picks the top-most active experience for diagnostics and `html[data-*]` hooks.
 * For mount gating, any surface other than `"home"` disables the carousel — equivalent to
 * `selectAppExperienceSurface(f) !== 'home'`.
 *
 * Priority matches Escape-shortcut / visual stacking: journey blocks everything, then
 * details overlay, My Dex, modals, then soundscape settings.
 */
export function selectAppExperienceSurface(flags: AppExperienceFlags): AppExperienceSurface {
  if (flags.journeyBlocking) return 'journey';
  if (flags.overlayOpen) return 'details_overlay';
  if (flags.dexOpen) return 'discovery';
  if (flags.compareOpen) return 'compare';
  if (flags.battleOpen) return 'battle';
  if (flags.teamBuilderOpen) return 'team_builder';
  if (flags.regionOpen) return 'region_explorer';
  if (flags.discoveryRecoOpen) return 'discovery_mix';
  if (flags.soundscapeSettingsOpen) return 'soundscape';
  return 'home';
}

export function isHomeCarouselSurface(surface: AppExperienceSurface): boolean {
  return surface === 'home';
}
