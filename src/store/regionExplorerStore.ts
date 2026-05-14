import { create } from 'zustand';

import type { RegionId } from '../features/region-explorer/data/regionTypes';

interface RegionExplorerState {
  open: boolean;
  regionId: RegionId;
  routeId: string | null;
  hotspotId: string | null;
  setOpen: (open: boolean) => void;
  setRegionId: (id: RegionId) => void;
  setRouteId: (id: string | null) => void;
  setHotspotId: (id: string | null) => void;
}

export const useRegionExplorerStore = create<RegionExplorerState>((set) => ({
  open: false,
  regionId: 'kanto',
  routeId: null,
  hotspotId: null,
  setOpen: (open) => set({ open }),
  setRegionId: (regionId) => set({ regionId, routeId: null, hotspotId: null }),
  setRouteId: (routeId) => set({ routeId }),
  setHotspotId: (hotspotId) => set({ hotspotId }),
}));
