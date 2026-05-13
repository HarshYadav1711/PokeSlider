import { create } from 'zustand';

interface ComparisonState {
  open: boolean;
  idA: number | null;
  idB: number | null;
  openModal: () => void;
  closeModal: () => void;
  setA: (id: number | null) => void;
  setB: (id: number | null) => void;
  assignSlot: (side: 'a' | 'b', id: number) => void;
  swap: () => void;
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  open: false,
  idA: null,
  idB: null,
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false, idA: null, idB: null }),
  setA: (id) => set({ idA: id }),
  setB: (id) => set({ idB: id }),
  assignSlot: (side, id) => set(side === 'a' ? { idA: id, open: true } : { idB: id, open: true }),
  swap: () => set((s) => ({ idA: s.idB, idB: s.idA })),
}));
