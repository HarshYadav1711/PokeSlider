import type { RegionId } from '../features/region-explorer/data/regionTypes';

import type { EvolutionStageFacet } from './evolutionStageFacet';
import type { TimeOfDay } from './timeOfDay';

export type BattleAtmosphereMode = 'explore' | 'duel';

export interface AtmosphereDomSnapshot {
  readonly primaryType: string | null;
  readonly secondaryType: string | null;
  readonly region: RegionId | 'unknown';
  readonly battle: BattleAtmosphereMode;
  readonly evolution: EvolutionStageFacet;
  readonly timeOfDay: TimeOfDay;
}

export function applyAtmosphereDomTheme(root: HTMLElement, snap: AtmosphereDomSnapshot | null): void {
  if (!snap) {
    root.removeAttribute('data-atmosphere');
    root.removeAttribute('data-atmosphere-secondary');
    root.removeAttribute('data-atmo-region');
    root.removeAttribute('data-atmo-battle');
    root.removeAttribute('data-atmo-evo');
    root.removeAttribute('data-atmo-tod');
    return;
  }
  if (snap.primaryType) root.setAttribute('data-atmosphere', snap.primaryType);
  else root.removeAttribute('data-atmosphere');
  if (snap.secondaryType) root.setAttribute('data-atmosphere-secondary', snap.secondaryType);
  else root.removeAttribute('data-atmosphere-secondary');
  root.setAttribute('data-atmo-region', snap.region);
  root.setAttribute('data-atmo-battle', snap.battle);
  root.setAttribute('data-atmo-evo', snap.evolution);
  root.setAttribute('data-atmo-tod', snap.timeOfDay);
}
