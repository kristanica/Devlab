import { create } from "zustand";

export interface RewardState {
  exp: number;
  coins: number;
}

interface RewardStore {
  lastReward: RewardState;
  setLastReward: (exp: number, coins: number) => void;
  clearReward: () => void;
}

export const useRewardStore = create<RewardStore>((set) => ({
  lastReward: { exp: 0, coins: 0 },
  setLastReward: (exp, coins) => set({ lastReward: { exp, coins } }),
  clearReward: () => set({ lastReward: { exp: 0, coins: 0 } }),
}));
