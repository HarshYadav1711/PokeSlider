import type { RegionDefinition, RegionId } from '../regionTypes';

import { ALOLA } from './alola';
import { GALAR } from './galar';
import { HOENN } from './hoenn';
import { JOHTO } from './johto';
import { KALOS } from './kalos';
import { KANTO } from './kanto';
import { PALDEA } from './paldea';
import { SINNOH } from './sinnoh';
import { UNOVA } from './unova';

export const REGIONS: readonly RegionDefinition[] = [
  KANTO,
  JOHTO,
  HOENN,
  SINNOH,
  UNOVA,
  KALOS,
  ALOLA,
  GALAR,
  PALDEA,
];

const MAP: Readonly<Record<RegionId, RegionDefinition>> = {
  kanto: KANTO,
  johto: JOHTO,
  hoenn: HOENN,
  sinnoh: SINNOH,
  unova: UNOVA,
  kalos: KALOS,
  alola: ALOLA,
  galar: GALAR,
  paldea: PALDEA,
};

export function getRegionDefinition(id: RegionId): RegionDefinition {
  return MAP[id];
}
