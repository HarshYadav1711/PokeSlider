import type { QueryClient } from '@tanstack/react-query';

import type { PokeBallDefinition } from '../data/pokeballs';
import { fetchDetailedPokemon } from '../services/pokeapi/detailedPokemon';

import { buildBallSuggestions } from './ballSuggestionsQuery';
import { qk } from './keys';
import { STALE_BALL_SUGGESTIONS_MS, STALE_POKEMON_DETAIL_MS } from './staleTimes';

export function prefetchBallSuggestions(qc: QueryClient, ball: PokeBallDefinition): Promise<void> {
  return qc.prefetchQuery({
    queryKey: qk.ball.suggestions(ball.id),
    queryFn: ({ signal }) => buildBallSuggestions(ball, qc, signal),
    staleTime: STALE_BALL_SUGGESTIONS_MS,
  });
}

export function prefetchPokemonDetail(qc: QueryClient, pokemonId: number): Promise<void> {
  return qc.prefetchQuery({
    queryKey: qk.pokemon.detail(pokemonId),
    queryFn: async ({ signal }) => {
      const row = await fetchDetailedPokemon(pokemonId, signal);
      if (!row) throw new Error('Pokémon not found');
      return row;
    },
    staleTime: STALE_POKEMON_DETAIL_MS,
  });
}
