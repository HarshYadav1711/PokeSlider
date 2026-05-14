import { useSyncExternalStore } from 'react';

function subscribe(onStoreChange: () => void) {
  const on = () => onStoreChange();
  window.addEventListener('online', on);
  window.addEventListener('offline', on);
  return () => {
    window.removeEventListener('online', on);
    window.removeEventListener('offline', on);
  };
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true;
}

/** True when the browser reports a live network connection. */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
