import { create } from 'zustand';

interface BattleSimulatorState {
  open: boolean;
  idA: number | null;
  idB: number | null;
  openWithCombatants: (a: number, b: number) => void;
  close: () => void;
}

export const useBattleSimulatorStore = create<BattleSimulatorState>((set) => ({
  open: false,
  idA: null,
  idB: null,
  openWithCombatants: (a, b) => set({ open: true, idA: a, idB: b }),
  close: () => set({ open: false, idA: null, idB: null }),
}));
