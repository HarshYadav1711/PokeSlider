import { useSyncExternalStore } from 'react';

function subscribe(onStoreChange: () => void) {
  const onVis = () => onStoreChange();
  document.addEventListener('visibilitychange', onVis);
  return () => document.removeEventListener('visibilitychange', onVis);
}

function getSnapshot(): boolean {
  return document.visibilityState === 'visible';
}

function getServerSnapshot(): boolean {
  return true;
}

/** True while the document is visible (tab foreground). */
export function useDocumentVisibility(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
