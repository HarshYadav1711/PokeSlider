/**
 * Single source of truth for “what experience owns the shell”.
 * The Poké Ball carousel mounts only when {@link AppExperienceSurface} is `"home"`.
 */
export type AppExperienceSurface =
  | 'home'
  | 'soundscape'
  | 'details_overlay'
  | 'discovery'
  | 'compare'
  | 'battle'
  | 'team_builder'
  | 'region_explorer'
  | 'discovery_mix'
  | 'journey';

export interface AppExperienceFlags {
  readonly journeyBlocking: boolean;
  readonly overlayOpen: boolean;
  readonly dexOpen: boolean;
  readonly compareOpen: boolean;
  readonly battleOpen: boolean;
  readonly teamBuilderOpen: boolean;
  readonly regionOpen: boolean;
  readonly discoveryRecoOpen: boolean;
  readonly soundscapeSettingsOpen: boolean;
}
