import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { PokeBallDefinition } from '../data/pokeballs';

import { buildBallSuggestions } from './ballSuggestionsQuery';
import { qk } from './keys';
import { STALE_BALL_SUGGESTIONS_MS } from './staleTimes';

export function useBallSuggestionsQuery(ball: PokeBallDefinition) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: qk.ball.suggestions(ball.id),
    queryFn: ({ signal }) => buildBallSuggestions(ball, qc, signal),
    staleTime: STALE_BALL_SUGGESTIONS_MS,
    gcTime: 1000 * 60 * 60 * 12,
  });
}
