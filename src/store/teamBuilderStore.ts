import { create } from 'zustand';

interface TeamBuilderState {
  open: boolean;
  setOpen: (open: boolean) => void;
  lockedIds: number[];
  toggleLock: (id: number) => void;
  clearLocks: () => void;
}

export const useTeamBuilderStore = create<TeamBuilderState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  lockedIds: [],
  toggleLock: (id) =>
    set((s) => {
      const has = s.lockedIds.includes(id);
      if (has) return { lockedIds: s.lockedIds.filter((x) => x !== id) };
      if (s.lockedIds.length >= 6) return s;
      return { lockedIds: [...s.lockedIds, id] };
    }),
  clearLocks: () => set({ lockedIds: [] }),
}));
