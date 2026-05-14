/**
 * Canonical Pokémon hydration surface — pair with `qk.pokemon.*` query keys and TanStack Query.
 * Features may import services directly; this module documents the intended “front door” for entity loads.
 */
export { fetchPokemonNationalIndex, fetchPokemonNationalDexIds } from '../../services/pokeapi/pokemonListResource';
export type { NationalDexRow } from '../../services/pokeapi/pokemonListResource';
export { fetchPokemonSummaryById } from '../../services/pokeapi/pokemonSummary';
