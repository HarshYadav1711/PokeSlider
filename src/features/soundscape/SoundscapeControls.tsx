import { useEffect, useId, useRef } from 'react';

import { useSoundscapeStore } from '../../store/soundscapeStore';

export function SoundscapeControls() {
  const panelId = useId();
  const open = useSoundscapeStore((s) => s.settingsPanelOpen);
  const setSettingsPanelOpen = useSoundscapeStore((s) => s.setSettingsPanelOpen);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const ambientEnabled = useSoundscapeStore((s) => s.ambientEnabled);
  const audioUnlocked = useSoundscapeStore((s) => s.audioUnlocked);
  const masterVolume = useSoundscapeStore((s) => s.masterVolume);
  const muted = useSoundscapeStore((s) => s.muted);
  const pauseWhenReducedMotion = useSoundscapeStore((s) => s.pauseWhenReducedMotion);
  const layers = useSoundscapeStore((s) => s.layers);
  const setAmbientEnabled = useSoundscapeStore((s) => s.setAmbientEnabled);
  const setMasterVolume = useSoundscapeStore((s) => s.setMasterVolume);
  const setMuted = useSoundscapeStore((s) => s.setMuted);
  const setPauseWhenReducedMotion = useSoundscapeStore((s) => s.setPauseWhenReducedMotion);
  const setLayer = useSoundscapeStore((s) => s.setLayer);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsPanelOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setSettingsPanelOpen]);

  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  const statusText = muted
    ? 'Soundscape muted.'
    : !ambientEnabled
      ? 'Ambient soundscape off.'
      : !audioUnlocked
        ? 'Tap anywhere once to start the ambient soundscape.'
        : 'Ambient soundscape on.';

  return (
    <div className="relative z-20">
      <button
        type="button"
        className="app-focus-ring rounded-full border border-emerald-400/35 bg-emerald-500/15 px-4 py-2 text-[var(--text-body-sm)] font-semibold text-emerald-100 shadow-[var(--shadow-sm)] backdrop-blur-[var(--blur-glass)] hover:bg-emerald-500/25"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-describedby={`${panelId}-hint`}
        onClick={() => setSettingsPanelOpen(!open)}
      >
        Soundscape
      </button>
      <span id={`${panelId}-hint`} className="sr-only">
        {statusText}
      </span>

      {open ? (
        <>
          <button
            type="button"
            className="pointer-events-auto fixed inset-0 z-[80] cursor-default bg-[rgb(2_3_8/0.72)] max-md:bg-[rgb(2_3_8/0.88)] max-md:backdrop-blur-none backdrop-blur-sm"
            aria-label="Close soundscape settings"
            onClick={() => setSettingsPanelOpen(false)}
          />
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${panelId}-title`}
            className="pointer-events-auto app-surface-glass fixed left-1/2 top-[min(12rem,18svh)] z-[90] w-[min(22rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-[var(--radius-2xl)] border border-white/14 p-[var(--space-5)] shadow-[var(--shadow-md)] backdrop-blur-[var(--blur-glass)]"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 id={`${panelId}-title`} className="text-base font-bold text-white">
                Soundscape
              </h2>
              <button
                ref={closeBtnRef}
                type="button"
                className="app-focus-ring rounded-full border border-white/18 bg-white/8 px-2.5 py-1 text-sm text-white/85 hover:bg-white/14"
                onClick={() => setSettingsPanelOpen(false)}
              >
                <span aria-hidden>×</span>
                <span className="sr-only">Close</span>
              </button>
            </div>

            <p className="mb-4 text-[var(--text-body-sm)] leading-snug text-white/72">
              Subtle procedural ambience. Off by default — enable when you want atmosphere without hijacking Pokémon
              cries.
            </p>

            <div className="flex flex-col gap-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm text-white/88">
                <input
                  type="checkbox"
                  className="app-focus-ring size-4 rounded border-white/40 bg-black/30 accent-emerald-400"
                  checked={ambientEnabled}
                  onChange={(e) => setAmbientEnabled(e.target.checked)}
                />
                Enable ambient soundscape
              </label>

              {ambientEnabled && !audioUnlocked ? (
                <p className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-[var(--text-body-sm)] text-amber-50/95">
                  After enabling, use a click or tap anywhere on the page once so the browser can start audio.
                </p>
              ) : null}

              <label className="flex cursor-pointer items-center gap-3 text-sm text-white/88">
                <input
                  type="checkbox"
                  className="app-focus-ring size-4 rounded border-white/40 bg-black/30 accent-emerald-400"
                  checked={muted}
                  onChange={(e) => setMuted(e.target.checked)}
                />
                Mute soundscape
              </label>

              <div>
                <div className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-wide text-white/55">
                  <span>Volume</span>
                  <span aria-hidden>{Math.round(masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  className="app-focus-ring h-2 w-full cursor-pointer accent-emerald-400 disabled:opacity-40"
                  aria-label="Soundscape volume"
                  disabled={!ambientEnabled || muted}
                  value={Math.round(masterVolume * 100)}
                  onChange={(e) => setMasterVolume(Number(e.target.value) / 100)}
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 text-sm text-white/88">
                <input
                  type="checkbox"
                  className="app-focus-ring mt-0.5 size-4 rounded border-white/40 bg-black/30 accent-emerald-400"
                  checked={pauseWhenReducedMotion}
                  onChange={(e) => setPauseWhenReducedMotion(e.target.checked)}
                />
                <span>
                  Pause ambient when <span className="whitespace-nowrap">reduced motion</span> is on (recommended)
                </span>
              </label>

              <fieldset className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-white/55">Layers</legend>
                <div className="mt-2 flex flex-col gap-2 text-sm text-white/85">
                  {(
                    [
                      ['type', 'Type atmosphere'],
                      ['region', 'Region explorer bed'],
                      ['battle', 'Battle & compare tension'],
                      ['evolution', 'Evolution shimmer'],
                      ['environment', 'Environmental bed'],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        className="app-focus-ring size-4 rounded border-white/40 bg-black/30 accent-emerald-400"
                        checked={layers[key]}
                        disabled={!ambientEnabled}
                        onChange={(e) => setLayer(key, e.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
