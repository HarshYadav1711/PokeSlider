/** Parse numeric National Dex id from a PokeAPI `/pokemon/{id}/` resource URL. */
export function parsePokemonIdFromPokeApiUrl(url: string): number | null {
  const match = /\/pokemon\/(\d+)\/?$/.exec(url);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/** Parse species id from `/pokemon-species/{id}/` URLs. */
export function parsePokemonSpeciesIdFromPokeApiUrl(url: string): number | null {
  const match = /\/pokemon-species\/(\d+)\/?$/.exec(url);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isFinite(id) && id > 0 ? id : null;
}
