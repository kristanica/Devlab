import { create } from "zustand";
import { persist } from "zustand/middleware";

export const createUseAttemptStore = (userId) =>
  create(
    persist(
      (set, get) => ({
        heart: 3,
        maxHearts: 3,
        roundKey: 0,
        gameOver: false,

        loadHearts: () => {
          const { heart } = get();
          set({ gameOver: heart <= 0 });
        },

        submitAttempt: (isCorrect) => {
          const { heart, gameOver } = get();
          if (isCorrect || gameOver) return;

          const newHearts = Math.max(heart - 1, 0);

          set({
            heart: newHearts,
            gameOver: newHearts <= 0,
            roundKey: heart > 1 ? get().roundKey + 1 : get().roundKey,
          });
        },

        resetHearts: () => {
          set({
            heart: get().maxHearts,
            roundKey: get().roundKey + 1,
            gameOver: false,
          });
        },

 applyExtraLives: () => {
  const { heart, maxHearts } = get();

  if (heart >= 5) {
    // Already at max, do nothing
    return false; // can return a flag to show a toast in the component
  }

  const newHeart = Math.min(heart + 1, 5);

  set({
    maxHearts: 5,
    heart: newHeart,
    roundKey: get().roundKey + 1,
  });

  return true; // successfully applied
},

        removeExtraLives: () => {
          const { heart } = get();
          const adjustedHeart = Math.min(heart, 3);

          set({
            maxHearts: 3,
            heart: adjustedHeart,
            roundKey: get().roundKey + 1,
          });
        },
      }),
      {
        name: `attempt-storage-${userId}`, // ✅ just a string
        getStorage: () => localStorage,
      }
    )
  );
