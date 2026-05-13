const BASE = 'https://pokeapi.co/api/v2';

export class PokeApiError extends Error {
  readonly name = 'PokeApiError';

  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message);
  }
}

export function buildPokeApiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${normalized}`;
}

/** Convert a full PokeAPI resource URL into a `/pokemon/...` style path for `pokeFetch`. */
export function pokePathFromResourceUrl(resourceUrl: string): string {
  const url = new URL(resourceUrl);
  return `${url.pathname.replace(/^\/api\/v2/, '')}${url.search}`;
}

export async function pokeFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildPokeApiUrl(path);
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new PokeApiError(`PokeAPI request failed (${response.status})`, response.status, url);
  }
  return (await response.json()) as T;
}

export function getOfficialCryUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/${pokemonId}.ogg`;
}
