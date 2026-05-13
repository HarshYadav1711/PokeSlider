import type { LocationAreaEncounter } from '../../types/pokeapi';
import type { PokemonEncounterLocation } from '../../types/pokemon';
import { pokeFetch } from './client';

export async function fetchPokemonLocations(
  pokemonId: number,
  signal?: AbortSignal,
): Promise<PokemonEncounterLocation[]> {
  try {
    const data = await pokeFetch<LocationAreaEncounter[]>(`/pokemon/${pokemonId}/encounters`, {
      signal,
    });
    const locations: PokemonEncounterLocation[] = [];
    for (const encounter of data) {
      for (const versionDetail of encounter.version_details) {
        for (const detail of versionDetail.encounter_details) {
          locations.push({
            location: encounter.location_area.name.replaceAll('-', ' '),
            game: versionDetail.version.name,
            method: detail.method.name.replaceAll('-', ' '),
            chance: detail.chance,
            minLevel: detail.min_level,
            maxLevel: detail.max_level,
          });
        }
      }
    }
    return locations;
  } catch {
    return [];
  }
}
