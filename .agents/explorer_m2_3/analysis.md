# Milestone M2 Analysis: Global Services & Stores

This report presents the analysis and migration roadmap for Milestone M2 (Global Services & Stores) of the Devlab Restructuring and TypeScript Conversion project.

---

## 1. Firebase Configuration Analysis

The current Firebase setup is located in:
- **Path**: `src/Firebase/Firebase.js` (JavaScript)

### Observations
* The configuration parameters (`apiKey`, `authDomain`, etc.) are read from Vite-specific environment variables (`import.meta.env.VITE_*`).
* It exports four main symbols:
  - `db` (Firestore database instance)
  - `auth` (Firebase Auth instance)
  - `storage` (Firebase Storage instance)
  - `app` (Firebase app instance - initialized implicitly)

### Proposed Location
- **Path**: `src/services/firebase.ts`

### Recommended TypeScript Implementation
To transition to TypeScript, migrate the file to the proposed path with standard Firebase v11 and React 19 types:

```typescript
// src/services/firebase.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY as string,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_APP_ID as string,
};

const app: FirebaseApp = initializeApp(firebaseConfig);

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);
```

---

## 2. Zustand Stores Analysis

We identified five Zustand stores currently scattered across different directories. All should be migrated to `src/store/` with appropriate TypeScript types.

### Catalog of Zustand Stores

| Store Hook Name | Current Location | Proposed Location | Purpose |
|---|---|---|---|
| `useInventoryStore` | `src/ItemsLogics/Items-Store/useInventoryStore.jsx` | `src/store/useInventoryStore.ts` | Tracks user active inventory and buffs, syncs uses with Firestore. |
| `useRewardStore` | `src/ItemsLogics/Items-Store/useRewardStore.jsx` | `src/store/useRewardStore.ts` | Tracks the experience and coins gained from the last cleared level. |
| `useGameStore` | `src/components/OpenAI Prompts/useBugBustStore.jsx` | `src/store/useGameStore.ts` | Centralized game evaluation, code input, loading states, and AI feedback store. |
| `useUserProgressStore` | `src/gameMode/GameModes_Utils/CompletedLevelStore.jsx` | `src/store/useUserProgressStore.ts` | Tracks user completed level IDs and handles clean up on sign-out. |
| `useAttemptStore` | `src/gameMode/GameModes_Utils/useAttemptStore.jsx` & `useAttemptStore_Local.jsx` | `src/store/useAttemptStore.ts` | Dynamic user-cached store for user heart attempts (persists to `localStorage`). |

---

### Recommended Typed Store Implementations

#### A. `src/store/useInventoryStore.ts`
```typescript
import { create } from "zustand";
import { db, auth } from "../services/firebase";
import { doc, updateDoc, deleteDoc, getDoc, increment } from "firebase/firestore";

export interface InventoryItem {
  id: string;
  quantity: number;
  [key: string]: any;
}

interface InventoryState {
  inventory: InventoryItem[];
  activeBuffs: string[];
  setInventory: (items: InventoryItem[]) => void;
  useItem: (itemId: string, buffName?: string) => Promise<void>;
  removeBuff: (buffName: string) => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventory: [],
  activeBuffs: [],

  setInventory: (items) => set({ inventory: items }),

  useItem: async (itemId, buffName) => {
    set((state) => {
      let updatedBuffs = state.activeBuffs;
      if (buffName && !state.activeBuffs.includes(buffName)) {
        updatedBuffs = [...state.activeBuffs, buffName];
      }
      return { activeBuffs: updatedBuffs };
    });

    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No authenticated user");

    const userId = currentUser.uid;
    const itemRef = doc(db, "Users", userId, "Inventory", itemId);

    await updateDoc(itemRef, { quantity: increment(-1) });
    const snap = await getDoc(itemRef);

    if (!snap.exists() || (snap.data()?.quantity ?? 0) <= 0) {
      await deleteDoc(itemRef);
    }
  },

  removeBuff: (buffName) =>
    set((state) => ({
      activeBuffs: state.activeBuffs.filter((buff) => buff !== buffName),
    })),
}));
```

#### B. `src/store/useRewardStore.ts`
```typescript
import { create } from "zustand";

interface Reward {
  exp: number;
  coins: number;
}

interface RewardState {
  lastReward: Reward;
  setLastReward: (exp: number, coins: number) => void;
  clearReward: () => void;
}

export const useRewardStore = create<RewardState>((set) => ({
  lastReward: { exp: 0, coins: 0 },
  setLastReward: (exp, coins) => set({ lastReward: { exp, coins } }),
  clearReward: () => set({ lastReward: { exp: 0, coins: 0 } }),
}));
```

#### C. `src/store/useGameStore.ts`
```typescript
import { create } from "zustand";

export interface SubmittedCode {
  HTML: string;
  CSS: string;
  JS: string;
  SQL: string;
}

interface GameState {
  submittedCode: SubmittedCode;
  setSubmittedCode: (code: Partial<SubmittedCode>) => void;
  isCorrect: boolean | null;
  setIsCorrect: (value: boolean | null) => void;
  showIsCorrect: boolean;
  setShowIsCorrect: (value: boolean) => void;
  isEvaluating: boolean;
  setIsEvaluating: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  loadingHint: boolean;
  setLoadingHint: (value: boolean) => void;
  singleFeedback: any;
  setSingleFeedback: (feedback: any) => void;
  clearSingleFeedback: () => void;
  stageFeedbacks: any[];
  addStageFeedback: (feedback: any) => void;
  getAllFeedbacks: () => any[];
  clearAllFeedbacks: () => void;
  lastGamemode: string | null;
  setLastGamemode: (mode: string | null) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  submittedCode: { HTML: "", CSS: "", JS: "", SQL: "" },
  setSubmittedCode: (code) =>
    set((state) => ({
      submittedCode: { ...state.submittedCode, ...code },
    })),
  isCorrect: null,
  setIsCorrect: (value) => set({ isCorrect: value }),
  showIsCorrect: false,
  setShowIsCorrect: (value) => set({ showIsCorrect: value }),
  isEvaluating: false,
  setIsEvaluating: (value) => set({ isEvaluating: value }),
  loading: false,
  setLoading: (value) => set({ loading: value }),
  loadingHint: false,
  setLoadingHint: (value) => set({ loadingHint: value }),
  singleFeedback: null,
  setSingleFeedback: (feedback) => set({ singleFeedback: feedback }),
  clearSingleFeedback: () => set({ singleFeedback: null }),
  stageFeedbacks: [],
  addStageFeedback: (feedback) =>
    set((state) => ({
      stageFeedbacks: [...state.stageFeedbacks, feedback],
    })),
  getAllFeedbacks: () => get().stageFeedbacks,
  clearAllFeedbacks: () => set({ stageFeedbacks: [] }),
  lastGamemode: null,
  setLastGamemode: (mode) => set({ lastGamemode: mode }),
}));
```

#### D. `src/store/useUserProgressStore.ts`
```typescript
import { create } from "zustand";

interface UserProgressState {
  userProgress: Record<string, any>;
  setUserProgress: (data: Record<string, any> | null | undefined) => void;
  resetUserProgress: () => void;
}

export const useUserProgressStore = create<UserProgressState>((set) => ({
  userProgress: {},
  setUserProgress: (data) => set({ userProgress: data || {} }),
  resetUserProgress: () => set({ userProgress: {} }),
}));
```

#### E. `src/store/useAttemptStore.ts`
*(Combines the logic of `useAttemptStore.jsx` and `useAttemptStore_Local.jsx` into a unified file)*
```typescript
import { create, StoreApi, UseBoundStore } from "zustand";
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

export const createUseAttemptStore = (userId: string): UseBoundStore<StoreApi<AttemptState>> =>
  create<AttemptState>()(
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
          const { heart } = get();
          if (heart >= 5) return false;

          const newHeart = Math.min(heart + 1, 5);

          set({
            maxHearts: 5,
            heart: newHeart,
            roundKey: get().roundKey + 1,
          });

          return true;
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
        name: `attempt-storage-${userId}`,
        storage: createJSONStorage(() => localStorage),
      }
    )
  );

export function useAttemptStore<T>(selector: (state: AttemptState) => T): T | undefined {
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid;

  const store = useMemo(() => {
    if (!uid) return null;

    if (!storeCache[uid]) {
      storeCache[uid] = createUseAttemptStore(uid);
    }
    return storeCache[uid];
  }, [uid]);

  if (!store) return undefined;
  return store(selector);
}
```

---

## 3. Custom Hooks Analysis

We analyzed the custom hooks located under `src/components/Custom Hooks/` and `src/ItemsLogics/`. Following the project guidelines, reusable utility hooks should move to `src/hooks/` and business-feature-specific hooks should reside in `src/features/<feature>/hooks/`.

### Classification and Reorganization Recommendations

#### Global Hooks (`src/hooks/`)
These hooks are general UI helpers or cross-feature widgets:
1. `useAnimatedNumber` (`useAnimatedNumber.jsx` -> `src/hooks/useAnimatedNumber.ts`)
   - **Role**: Pure mathematical value animator.
2. `useLevelBar` (`useLevelBar.jsx` -> `src/hooks/useLevelBar.ts`)
   - **Role**: Global user navigation/header level bar animator. Dependencies: fetches user database details.

#### Feature-Specific Hooks
These should be moved to their corresponding feature folders:
1. **`src/features/inventory/hooks/`**:
   - `useUserInventory` (`useUserInventory.jsx` -> `useUserInventory.ts`): Subscribes to real-time user inventory collection.
2. **`src/features/achievements/hooks/`**:
   - `useUserAchievements` (`useUserAchievements.jsx` -> `useUserAchievements.ts`): Queries user unlocked achievements list.
   - `useAchievementProgressBar` (`useAchievementProgressBar.jsx` -> `useAchievementProgressBar.ts`): Computes achievement progression percentage.
3. **`src/features/dashboard/hooks/`**:
   - `useSubjProgressBar` (`useSubjProgressBar.jsx` -> `useSubjProgressBar.ts`): Computes lessons cleared versus total lessons for dashboard indicators.
4. **`src/features/lessons/hooks/`**:
   - `useSubjectCheckComplete` (`useSubjectCheckComplete.jsx` -> `useSubjectCheckComplete.ts`): Logic validating if all stage lessons in a subject are finished, triggering achievement unlock.
5. **`src/features/gamemodes/hooks/`**:
   - `useCodeRushTimer` (`src/ItemsLogics/useCodeRushTimer.jsx` -> `useCodeRushTimer.ts`): Specific timer rules and buff reactions during `CodeRush` play.
   - `useStageAccess` (`src/gameMode/GameModes_Utils/useStageAccess.ts` -> `useStageAccess.ts`): Real-time access policy validator for stage access.

#### Non-Hook Utilities (Relocate Accordingly)
These files reside under `Custom Hooks/` but are **not** React hooks:
* `UnlockAchievement.jsx` -> Move to `src/features/achievements/services/unlockAchievement.ts` (API/service file).
* `DevlabSoundHandler.jsx` -> Move to `src/services/soundHandler.ts` or `src/utils/soundHandler.ts` (Audio player utility).
* `validations.jsx` -> Move to `src/features/auth/utils/validations.ts` (Input validation helper).

---

### Recommended Typed Implementations for Global Hooks

#### A. `src/hooks/useAnimatedNumber.ts`
```typescript
import { useState, useEffect } from "react";

export default function useAnimatedNumber(
  targetValue: number | null | undefined,
  duration: number = 500,
  frameRate: number = 30
): { animatedValue: number } {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (targetValue == null) return;

    const start = animatedValue;
    const steps = Math.ceil(duration / frameRate);
    const stepAmount = (targetValue - start) / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const newValue = Math.round(start + stepAmount * currentStep);

      setAnimatedValue(() =>
        stepAmount > 0
          ? Math.min(newValue, targetValue)
          : Math.max(newValue, targetValue)
      );

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, frameRate);

    return () => clearInterval(interval);
  }, [targetValue, duration, frameRate]);

  return { animatedValue };
}
```

#### B. `src/hooks/useLevelBar.ts`
```typescript
import { useState, useEffect } from "react";
import useFetchUserData from "../components/BackEnd_Data/useFetchUserData";

interface LevelBarResult {
  animatedExp: number;
  isLoading: boolean;
}

export default function useLevelBar(): LevelBarResult {
  const [animatedExp, setAnimatedExp] = useState(0);
  const { userData, isLoading } = useFetchUserData();

  useEffect(() => {
    if (userData?.exp >= 0) {
      let start = animatedExp;
      const target = userData.exp;
      const step = () => {
        if (start < target) {
          start = Math.min(start + 2, target);
          setAnimatedExp(start);
          requestAnimationFrame(step);
        } else {
          setAnimatedExp(target);
        }
      };
      requestAnimationFrame(step);
    }
  }, [userData?.exp]);

  return { animatedExp, isLoading };
}
```

---

## 4. M1 Challenger Findings & M2 Action Recommendations

The M1 Challenger raised important issues concerning the E2E test files and missing path aliases in `tsconfig.json`. The M2 worker should resolve these issues.

### 1. Issue: E2E Test Suite Skipping Typecheck
* **Finding**: `tsconfig.json` contains `"include": ["src", "vite.config.ts"]`. The E2E tests in `tests/` and configuration file `vitest.config.e2e.ts` are completely excluded, which means `tsc --noEmit` fails to detect compile-time errors in the test suites.
* **Resolution**: The M2 worker should modify `tsconfig.json` to include tests:
  ```json
  "include": ["src", "vite.config.ts", "tests/**/*", "vitest.config.e2e.ts"]
  ```

### 2. Issue: Path Alias (`@/`) Inconsistency
* **Finding**: `vitest.config.e2e.ts` defines an alias for `@/` pointing to `src/`. However, `tsconfig.json` does NOT define paths, meaning TypeScript will throw compilation errors if `@/` imports are used inside TS files. Additionally, `vite.config.ts` has no alias support, meaning the main app bundle build will break if `@/` is used.
* **Resolution**:
  1. Add path aliases to `tsconfig.json`:
     ```json
     "compilerOptions": {
       ...
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"]
       }
     }
     ```
  2. Sync `vite.config.ts` to support `@/` resolution without installing external plugins:
     ```typescript
     // vite.config.ts
     import { defineConfig } from 'vite';
     import react from '@vitejs/plugin-react';
     import tailwindcss from '@tailwindcss/vite';
     import path from 'path';

     export default defineConfig({
       plugins: [react(), tailwindcss()],
       resolve: {
         alias: {
           '@': path.resolve(__dirname, './src')
         }
       }
     });
     ```

### 3. Issue: Cleanup of `@ts-ignore` Compiler Overrides
* **Finding**: 10 `// @ts-ignore` overrides exist in TS files (e.g. `src/App.tsx`) because they import untyped `.jsx` or `.js` modules (like the sound handler).
* **Resolution**: As the Firebase config, Zustand stores, and global hooks are migrated to TS/TSX in Milestone M2, the worker must locate and remove these `@ts-ignore` comments, ensuring proper type coverage is established.
