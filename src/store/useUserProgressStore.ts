import { create } from "zustand";

export interface LevelProgress {
  isCompleted: boolean;
  completedAt?: Date;
  score?: number;
  [key: string]: any;
}

export interface UserProgress {
  [subject: string]: {
    [lessonId: string]: {
      [levelId: string]: LevelProgress;
    };
  };
}

export interface UserProgressState {
  userProgress: UserProgress | Record<string, any>;
  setUserProgress: (data: UserProgress | Record<string, any>) => void;
  resetUserProgress: () => void;
}

export const useUserProgressStore = create<UserProgressState>((set) => ({
  userProgress: {},
  setUserProgress: (data) => set({ userProgress: data || {} }),
  resetUserProgress: () => set({ userProgress: {} }),
}));
