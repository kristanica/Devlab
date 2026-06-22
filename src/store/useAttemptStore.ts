import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useMemo } from "react";
import { auth } from "../services/firebase";

export interface AttemptState {
  heart: number;
  maxHearts: number;
  roundKey: number;
  gameOver: boolean;
  loadHearts: () => void;
  submitAttempt: (isCorrect: boolean) => void;
  resetHearts: () => void;
  applyExtraLives: () => boolean;
  removeExtraLives: () => void;
}

const storeCache: Record<string, UseBoundStore<StoreApi<AttemptState>>> = {};

export const createUseAttemptStore = (userId: string) =>
  create<AttemptState>()(
    persist(
      (set, get) => ({
        heart: 3,
        maxHearts: 3,
        roundKey: 0,
        gameOver: false,
        loadHearts: () => set({ gameOver: get().heart <= 0 }),
        submitAttempt: (isCorrect) => {
          const { heart, gameOver, roundKey } = get();
          if (isCorrect || gameOver) return;
          const newHearts = Math.max(heart - 1, 0);
          set({
            heart: newHearts,
            gameOver: newHearts <= 0,
            roundKey: heart > 1 ? roundKey + 1 : roundKey,
          });
        },
        resetHearts: () => set({ heart: get().maxHearts, roundKey: get().roundKey + 1, gameOver: false }),
        applyExtraLives: () => {
          const { heart } = get();
          if (heart >= 5) return false;
          set({ maxHearts: 5, heart: Math.min(heart + 1, 5), roundKey: get().roundKey + 1 });
          return true;
        },
        removeExtraLives: () => set({ maxHearts: 3, heart: Math.min(get().heart, 3), roundKey: get().roundKey + 1 }),
      }),
      {
        name: `attempt-storage-${userId}`,
        storage: createJSONStorage(() => localStorage),
      }
    )
  );

const defaultState: AttemptState = {
  heart: 3,
  maxHearts: 3,
  roundKey: 0,
  gameOver: false,
  loadHearts: () => {},
  submitAttempt: () => {},
  resetHearts: () => {},
  applyExtraLives: () => false,
  removeExtraLives: () => {},
};

export function useAttemptStore<T = AttemptState>(selector?: (state: AttemptState) => T): T {
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid;

  const store = useMemo(() => {
    if (!uid) return null;

    if (!storeCache[uid]) {
      storeCache[uid] = createUseAttemptStore(uid);
    }
    return storeCache[uid];
  }, [uid]);

  if (!store) {
    return selector ? selector(defaultState) : (defaultState as unknown as T);
  }
  return store(selector as any);
}
