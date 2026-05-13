import { useEffect } from 'react';

import { useComparisonStore } from '../store/comparisonStore';
import { useDiscoveryUiStore } from '../features/discovery/discoveryUiStore';
import { useTeamBuilderStore } from '../store/teamBuilderStore';
import { useUiStore } from '../store/uiStore';

/**
 * Global shortcuts: `/` focuses discovery search (and opens My Dex), `Escape` closes compare, My Dex, or the details overlay.
 */
export function useAppKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (e.defaultPrevented) return;
        const teamBuilderOpen = useTeamBuilderStore.getState().open;
        if (teamBuilderOpen) {
          useTeamBuilderStore.getState().setOpen(false);
          e.preventDefault();
          return;
        }
        const compareOpen = useComparisonStore.getState().open;
        if (compareOpen) {
          useComparisonStore.getState().closeModal();
          e.preventDefault();
          return;
        }
        const dexOpen = useDiscoveryUiStore.getState().panelOpen;
        if (dexOpen) {
          useDiscoveryUiStore.getState().setPanelOpen(false);
          e.preventDefault();
          return;
        }
        if (useUiStore.getState().overlayOpen) {
          useUiStore.getState().closeOverlay();
          e.preventDefault();
        }
        return;
      }

      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      e.preventDefault();
      useDiscoveryUiStore.getState().setPanelOpen(true);
      queueMicrotask(() => {
        document.querySelector<HTMLInputElement>('[data-discovery-search]')?.focus();
      });
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
}
