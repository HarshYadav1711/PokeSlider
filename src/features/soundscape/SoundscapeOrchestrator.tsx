import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';

import { SoundscapeEngine } from '../../audio/soundscapeEngine';
import type { SoundscapeDriverState, SoundscapeScene } from '../../audio/soundscapeTypes';
import { useDiscoveryUiStore } from '../discovery/discoveryUiStore';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { qk } from '../../query/keys';
import { STALE_POKEMON_DETAIL_MS } from '../../query/staleTimes';
import { fetchDetailedPokemon } from '../../services/pokeapi/detailedPokemon';
import { useBattleSimulatorStore } from '../../store/battleSimulatorStore';
import { useComparisonStore } from '../../store/comparisonStore';
import { useRegionExplorerStore } from '../../store/regionExplorerStore';
import { useSoundscapeStore } from '../../store/soundscapeStore';
import { useTeamBuilderStore } from '../../store/teamBuilderStore';
import { useUiStore } from '../../store/uiStore';

function pickBrowserAudioSupported(): boolean {
  if (typeof globalThis === 'undefined') return false;
  const g = globalThis as typeof globalThis & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return Boolean(g.AudioContext ?? g.webkitAudioContext);
}

export function SoundscapeOrchestrator() {
  const engineRef = useRef<SoundscapeEngine | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const ambientEnabled = useSoundscapeStore((s) => s.ambientEnabled);
  const audioUnlocked = useSoundscapeStore((s) => s.audioUnlocked);
  const masterVolume = useSoundscapeStore((s) => s.masterVolume);
  const muted = useSoundscapeStore((s) => s.muted);
  const pauseWhenReducedMotion = useSoundscapeStore((s) => s.pauseWhenReducedMotion);
  const layers = useSoundscapeStore((s) => s.layers);
  const markAudioUnlocked = useSoundscapeStore((s) => s.markAudioUnlocked);

  const overlayOpen = useUiStore((s) => s.overlayOpen);
  const panel = useUiStore((s) => s.panel);
  const pokemonId = useUiStore((s) => s.selectedPokemonId);

  const regionExplorerOpen = useRegionExplorerStore((s) => s.open);
  const regionId = useRegionExplorerStore((s) => s.regionId);

  const battleOpen = useBattleSimulatorStore((s) => s.open);
  const compareOpen = useComparisonStore((s) => s.open);
  const discoveryOpen = useDiscoveryUiStore((s) => s.panelOpen);
  const teamBuilderOpen = useTeamBuilderStore((s) => s.open);

  const detailEnabled = overlayOpen && panel === 'pokemon' && pokemonId !== null;

  const detailQuery = useQuery({
    queryKey: pokemonId === null ? ['pokeapi', 'pokemon', 'soundscape', 'idle'] : qk.pokemon.detail(pokemonId),
    queryFn: async ({ signal }) => {
      const row = await fetchDetailedPokemon(pokemonId!, signal);
      if (!row) throw new Error('Could not load Pokémon for soundscape.');
      return row;
    },
    enabled: detailEnabled,
    staleTime: STALE_POKEMON_DETAIL_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const primaryType = detailQuery.data?.types[0] ?? null;
  const secondaryType = detailQuery.data?.types[1] ?? null;

  const scene: SoundscapeScene = useMemo(
    () => ({
      regionOpen: regionExplorerOpen,
      regionId: regionExplorerOpen ? regionId : null,
      battleOpen,
      compareOpen,
      discoveryOpen,
      teamBuilderOpen,
      overlayOpen,
      overlayPanel: panel,
      primaryType,
      secondaryType,
    }),
    [
      regionExplorerOpen,
      regionId,
      battleOpen,
      compareOpen,
      discoveryOpen,
      teamBuilderOpen,
      overlayOpen,
      panel,
      primaryType,
      secondaryType,
    ],
  );

  const blockedByMotion = pauseWhenReducedMotion && reducedMotion;
  const browserAudio = pickBrowserAudioSupported();

  const ctxAllowed = Boolean(
    ambientEnabled && !muted && !blockedByMotion && audioUnlocked && browserAudio,
  );

  const driver: SoundscapeDriverState = useMemo(
    () => ({
      ctxAllowed,
      masterLinear: muted || blockedByMotion ? 0 : masterVolume,
      layers,
      scene,
    }),
    [ctxAllowed, masterVolume, muted, blockedByMotion, layers, scene],
  );

  useEffect(() => {
    if (!ambientEnabled || audioUnlocked) return;
    const onPointerDown = () => {
      markAudioUnlocked();
    };
    document.addEventListener('pointerdown', onPointerDown, { capture: true, passive: true });
    return () => document.removeEventListener('pointerdown', onPointerDown, { capture: true });
  }, [ambientEnabled, audioUnlocked, markAudioUnlocked]);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ambientEnabled || !audioUnlocked || blockedByMotion || !browserAudio) {
      engineRef.current?.setPaused(true);
      return;
    }
    if (!engineRef.current) engineRef.current = new SoundscapeEngine();
    const eng = engineRef.current;
    if (!eng.isSupported()) return;
    eng.start();
    eng.setPaused(false);
  }, [ambientEnabled, audioUnlocked, blockedByMotion, browserAudio]);

  useEffect(() => {
    const eng = engineRef.current;
    if (!eng) return;
    eng.setDriver(driver);
  }, [driver]);

  return null;
}
