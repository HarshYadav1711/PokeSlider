import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { SoundscapeLayerToggles } from '../audio/soundscapeTypes';

const DEFAULT_LAYERS: SoundscapeLayerToggles = {
  type: true,
  region: true,
  battle: true,
  evolution: true,
  environment: true,
};

interface SoundscapeState {
  /** Ephemeral UI — not persisted; gates home hero mount with other immersive surfaces. */
  settingsPanelOpen: boolean;
  setSettingsPanelOpen: (open: boolean) => void;
  /** User opt-in — avoids autoplay policy issues and surprise audio. */
  ambientEnabled: boolean;
  /** Session flag: set after first user gesture once ambient is enabled. */
  audioUnlocked: boolean;
  masterVolume: number;
  muted: boolean;
  /** When true, ambient output is silenced while the OS prefers reduced motion. */
  pauseWhenReducedMotion: boolean;
  layers: SoundscapeLayerToggles;
  setAmbientEnabled: (enabled: boolean) => void;
  setMasterVolume: (value: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  setPauseWhenReducedMotion: (value: boolean) => void;
  setLayer: <K extends keyof SoundscapeLayerToggles>(key: K, value: boolean) => void;
  markAudioUnlocked: () => void;
}

export const useSoundscapeStore = create<SoundscapeState>()(
  persist(
    (set) => ({
      settingsPanelOpen: false,
      setSettingsPanelOpen: (settingsPanelOpen) => set({ settingsPanelOpen }),
      ambientEnabled: false,
      audioUnlocked: false,
      masterVolume: 0.42,
      muted: false,
      pauseWhenReducedMotion: true,
      layers: DEFAULT_LAYERS,
      setAmbientEnabled: (ambientEnabled) =>
        set((s) => ({
          ambientEnabled,
          audioUnlocked: ambientEnabled ? s.audioUnlocked : false,
        })),
      setMasterVolume: (masterVolume) =>
        set({ masterVolume: Math.max(0, Math.min(1, masterVolume)) }),
      setMuted: (muted) => set({ muted }),
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
      setPauseWhenReducedMotion: (pauseWhenReducedMotion) => set({ pauseWhenReducedMotion }),
      setLayer: (key, value) =>
        set((s) => ({
          layers: { ...s.layers, [key]: value },
        })),
      markAudioUnlocked: () => set({ audioUnlocked: true }),
    }),
    {
      name: 'pokeslider-soundscape',
      version: 1,
      partialize: (s) => ({
        ambientEnabled: s.ambientEnabled,
        masterVolume: s.masterVolume,
        muted: s.muted,
        pauseWhenReducedMotion: s.pauseWhenReducedMotion,
        layers: s.layers,
      }),
    },
  ),
);
