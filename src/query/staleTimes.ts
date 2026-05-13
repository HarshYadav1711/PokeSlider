/** Pokémon list / type member lists change rarely. */
export const STALE_NATIONAL_LIST_MS = 1000 * 60 * 60 * 12;

/** Per-species summary used for ball grids. */
export const STALE_POKEMON_SUMMARY_MS = 1000 * 60 * 30;

/** Full detail payload (stats, locations, mega, cries). */
export const STALE_POKEMON_DETAIL_MS = 1000 * 60 * 30;

/** Derived extras (type chart + evolution UI) from detail. */
export const STALE_POKEMON_DETAIL_EXTRAS_MS = 1000 * 60 * 60;

/** Type roster from `/type/{name}`. */
export const STALE_TYPE_MEMBERS_MS = 1000 * 60 * 60 * 6;

/** Ball suggestion grid — stable for a session but not forever. */
export const STALE_BALL_SUGGESTIONS_MS = 1000 * 60 * 30;

export const STALE_GENERATION_MS = 1000 * 60 * 60 * 24 * 7;
export const STALE_POKEDEX_LIST_MS = 1000 * 60 * 60 * 24 * 7;
export const STALE_POKEDEX_MEMBERS_MS = 1000 * 60 * 60 * 24;
export const STALE_ABILITY_MEMBERS_MS = 1000 * 60 * 60 * 12;
export const STALE_FORM_SEARCH_INDEX_MS = 1000 * 60 * 60 * 24 * 30;
export const STALE_SPECIES_PRIOR_MS = 1000 * 60 * 60 * 24 * 7;
