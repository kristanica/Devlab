import { create } from "zustand";

export const useRewardStore = create((set) => ({
  lastReward: { exp: 0, coins: 0 },
  setLastReward: (exp, coins) => set({ lastReward: { exp, coins } }),
  clearReward: () => set({ lastReward: { exp: 0, coins: 0 } }),
}));
