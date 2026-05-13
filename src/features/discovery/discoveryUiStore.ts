import { create } from 'zustand';

import type { DiscoveryFiltersState, MyDexTab } from './discoveryTypes';
import { defaultDiscoveryFilters } from './discoveryTypes';

interface DiscoveryUiState {
  panelOpen: boolean;
  tab: MyDexTab;
  activeResultIndex: number;
  query: string;
  filters: DiscoveryFiltersState;
  setPanelOpen: (open: boolean) => void;
  setTab: (tab: MyDexTab) => void;
  setActiveResultIndex: (index: number | ((prev: number) => number)) => void;
  setQuery: (query: string) => void;
  setFilters: (patch: Partial<DiscoveryFiltersState>) => void;
  resetFilters: () => void;
}

export const useDiscoveryUiStore = create<DiscoveryUiState>((set) => ({
  panelOpen: false,
  tab: 'browse',
  activeResultIndex: 0,
  query: '',
  filters: defaultDiscoveryFilters(),
  setPanelOpen: (open) => set({ panelOpen: open, activeResultIndex: 0 }),
  setTab: (tab) => set({ tab, activeResultIndex: 0 }),
  setActiveResultIndex: (index) =>
    set((s) => ({
      activeResultIndex: typeof index === 'function' ? index(s.activeResultIndex) : index,
    })),
  setQuery: (query) => set({ query, activeResultIndex: 0 }),
  setFilters: (patch) =>
    set((s) => ({
      filters: { ...s.filters, ...patch },
      activeResultIndex: 0,
    })),
  resetFilters: () => set({ filters: defaultDiscoveryFilters(), activeResultIndex: 0 }),
}));
