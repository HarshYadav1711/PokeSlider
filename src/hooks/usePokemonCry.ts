import { useCallback, useRef, useState } from 'react';

import { getOfficialCryUrl } from '../services/pokeapi/client';
import type { DetailedPokemon } from '../types/pokemon';

export type CryStatus = 'idle' | 'playing' | 'unavailable';

export function usePokemonCry() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<CryStatus>('idle');

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audioRef.current = null;
    }
    setStatus('idle');
  }, []);

  const play = useCallback(
    async (pokemon: Pick<DetailedPokemon, 'id' | 'cryUrl'>) => {
      stop();
      setStatus('playing');

      const sources = [pokemon.cryUrl, getOfficialCryUrl(pokemon.id)].filter(
        (url): url is string => Boolean(url),
      );

      for (const src of sources) {
        const audio = new Audio();
        audio.volume = 0.7;
        audio.src = src;
        audioRef.current = audio;
        try {
          await audio.play();
          audio.addEventListener(
            'ended',
            () => {
              setStatus('idle');
              audioRef.current = null;
            },
            { once: true },
          );
          return;
        } catch {
          // try next source
        }
      }

      setStatus('unavailable');
      window.setTimeout(() => setStatus('idle'), 2000);
    },
    [stop],
  );

  return { play, stop, status };
}
