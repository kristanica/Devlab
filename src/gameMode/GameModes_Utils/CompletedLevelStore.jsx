import { create } from "zustand";

export const useUserProgressStore = create((set) => ({
  userProgress: {},

  //  Update user progress
  setUserProgress: (data) => set({ userProgress: data || {} }),

  // Reset on logout
  resetUserProgress: () => set({ userProgress: {} }),
}));
