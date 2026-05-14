import { useRegisterSW } from 'virtual:pwa-register/react';

import { useOnlineStatus } from '../../hooks/useOnlineStatus';

/**
 * Install / update prompts and an explicit offline banner so cached data never feels like a silent failure.
 */
export function PwaClientChrome() {
  const online = useOnlineStatus();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onOfflineReady() {
      setOfflineReady(true);
    },
    onNeedRefresh() {
      setNeedRefresh(true);
    },
  });

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[9990] flex flex-col items-center gap-2 p-[max(0.5rem,env(safe-area-inset-top))_0.75rem_0]"
      aria-live="polite"
    >
      {!online ? (
        <div
          className="pointer-events-auto max-w-lg rounded-[var(--radius-2xl)] border border-amber-400/35 bg-[rgb(20_16_8/0.92)] px-[var(--space-4)] py-[var(--space-3)] text-center text-[var(--text-body-sm)] leading-[var(--leading-snug)] text-amber-50 shadow-[var(--shadow-md)] backdrop-blur-[var(--blur-glass)]"
          role="status"
        >
          <p className="font-semibold text-amber-100">You are offline</p>
          <p className="mt-1 text-amber-100/88">
            Pokémon data comes from this device&apos;s last successful session and the service worker cache.
            Favorites and recents stay on this device and remain editable.
          </p>
        </div>
      ) : null}

      {offlineReady && online ? (
        <div
          className="pointer-events-auto max-w-md rounded-[var(--radius-2xl)] border border-emerald-400/30 bg-[rgb(6_20_14/0.9)] px-[var(--space-4)] py-[var(--space-3)] text-center text-[var(--text-body-sm)] text-emerald-50 shadow-[var(--shadow-md)] backdrop-blur-[var(--blur-glass)]"
          role="status"
        >
          <p className="font-semibold text-emerald-100">Ready to work offline</p>
          <p className="mt-1 text-emerald-100/85">Core pages and assets are cached for the next time you lose signal.</p>
          <button
            type="button"
            className="app-focus-ring pointer-events-auto mt-2 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-50 hover:bg-emerald-500/30"
            onClick={() => setOfflineReady(false)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {needRefresh ? (
        <div
          className="pointer-events-auto flex max-w-lg flex-col items-center gap-2 rounded-[var(--radius-2xl)] border border-sky-400/35 bg-[rgb(8_14_24/0.94)] px-[var(--space-4)] py-[var(--space-3)] text-center text-[var(--text-body-sm)] text-sky-50 shadow-[var(--shadow-md)] backdrop-blur-[var(--blur-glass)]"
          role="status"
        >
          <p className="font-semibold text-sky-100">A new version of PokeSlider is ready</p>
          <p className="text-sky-100/85">Reload to pick up the latest fixes and cache rules.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="app-focus-ring rounded-full border border-sky-400/45 bg-sky-500/25 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500/35"
              onClick={() => {
                void updateServiceWorker(true);
              }}
            >
              Reload and update
            </button>
            <button
              type="button"
              className="app-focus-ring rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white/90 hover:bg-white/10"
              onClick={() => setNeedRefresh(false)}
            >
              Later
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
