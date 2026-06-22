# Milestone M2 Analysis Report: Global Services & Stores

This report analyzes the Devlab repository to guide the implementation of Milestone M2 (Global Services & Stores).

---

## 1. Firebase Configuration Analysis
The current Firebase configuration is located in `src/Firebase/Firebase.js`.

### Current Implementation Details
- **Imports**: Imports `initializeApp` from `firebase/app`, `getAuth` from `firebase/auth`, `getFirestore` from `firebase/firestore`, and `getStorage` from `firebase/storage`.
- **Environment Variables**: Uses Vite's `import.meta.env` system for secret keys:
  - `VITE_API_KEY`
  - `VITE_AUTH_DOMAIN`
  - `VITE_PROJECT_ID`
  - `VITE_STORAGE_BUCKET`
  - `VITE_MESSAGING_SENDER_ID`
  - `VITE_APP_ID`
- **Exports**: `db` (Firestore instance), `auth` (Auth instance), and `storage` (Storage instance).

### Recommended TypeScript Migration (`src/Firebase/Firebase.ts` or `src/services/firebase.ts`)
We recommend migrating this file to **TypeScript** (`.ts`) and optionally placing it under the global services directory (e.g., `src/services/firebase.ts` or keeping it at `src/Firebase/Firebase.ts` with a path alias).

```typescript
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

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);
```

---

## 2. Zustand Stores Analysis & Recommendations
We located 5 Zustand stores scattered across multiple modules. We recommend migrating them all to `src/store/` and rewriting them in TypeScript.

### A. Catalog of Current Zustand Stores

| Current Path | Exported Store Hook | Purpose |
|---|---|---|
| `src/ItemsLogics/Items-Store/useInventoryStore.jsx` | `useInventoryStore` | Manages player inventory, active buffs, and syncing usage state to Firestore. |
| `src/ItemsLogics/Items-Store/useRewardStore.jsx` | `useRewardStore` | Stores the last received reward (EXP, coins) for popup modals. |
| `src/components/OpenAI Prompts/useBugBustStore.jsx` | `useGameStore` | Manages code evaluation flags (`isCorrect`, `isEvaluating`, `loading`), feedbacks, and loader states. |
| `src/gameMode/GameModes_Utils/CompletedLevelStore.jsx` | `useUserProgressStore` | Caches the completed levels (`userProgress`) retrieved from the backend. |
| `src/gameMode/GameModes_Utils/useAttemptStore_Local.jsx` & `useAttemptStore.jsx` | `useAttemptStore` | Creates dynamic, LocalStorage-persisted stores for user attempts/hearts based on `uid`. |

### B. Migration to `src/store/` with TypeScript Typings

Below are the recommended TypeScript implementations for the migrated stores in `src/store/`.

#### 1) `src/store/useInventoryStore.ts`
```typescript
import { create } from "zustand";
import { db, auth } from "@/Firebase/Firebase";
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
    if (!currentUser) return;
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

#### 2) `src/store/useRewardStore.ts`
```typescript
import { create } from "zustand";

export interface Reward {
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

#### 3) `src/store/useGameStore.ts` (formerly `useBugBustStore.jsx`)
*Note: We recommend renaming this file to `useGameStore.ts` to match its exported store hook.*
```typescript
import { create } from "zustand";

export interface SubmittedCode {
  HTML: string;
  CSS: string;
  JS: string;
  SQL: string;
}

export interface StageFeedback {
  [key: string]: any;
}

interface GameState {
  submittedCode: SubmittedCode;
  isCorrect: boolean | null;
  showIsCorrect: boolean;
  isEvaluating: boolean;
  loading: boolean;
  loadingHint: boolean;
  singleFeedback: string | null;
  stageFeedbacks: StageFeedback[];
  lastGamemode: string | null;
  
  setSubmittedCode: (code: Partial<SubmittedCode>) => void;
  setIsCorrect: (value: boolean | null) => void;
  setShowIsCorrect: (value: boolean) => void;
  setIsEvaluating: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setLoadingHint: (value: boolean) => void;
  setSingleFeedback: (feedback: string | null) => void;
  clearSingleFeedback: () => void;
  addStageFeedback: (feedback: StageFeedback) => void;
  getAllFeedbacks: () => StageFeedback[];
  clearAllFeedbacks: () => void;
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

#### 4) `src/store/useUserProgressStore.ts` (formerly `CompletedLevelStore.jsx`)
*Note: Rename this file to `useUserProgressStore.ts` to match its exported store hook.*
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

#### 5) `src/store/useAttemptStore.ts` & `src/store/useAttemptStore_Local.ts`
*Note: The store uses dynamic creation based on `userId` to load/persist the hearts count in localStorage. It's structured as follows:*

##### `src/store/useAttemptStore_Local.ts`
```typescript
import { create, UseBoundStore, StoreApi } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

export const createUseAttemptStore = (userId: string): UseBoundStore<StoreApi<AttemptState>> =>
  create(
    persist<AttemptState>(
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
          const { heart, gameOver, roundKey } = get();
          if (isCorrect || gameOver) return;

          const newHearts = Math.max(heart - 1, 0);
          set({
            heart: newHearts,
            gameOver: newHearts <= 0,
            roundKey: heart > 1 ? roundKey + 1 : roundKey,
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
```

##### `src/store/useAttemptStore.ts`
```typescript
import { useMemo } from "react";
import { createUseAttemptStore, AttemptState } from "./useAttemptStore_Local";
import { auth } from "@/Firebase/Firebase";
import { UseBoundStore, StoreApi } from "zustand";

type AttemptStoreCache = Record<string, UseBoundStore<StoreApi<AttemptState>>>;
const storeCache: AttemptStoreCache = {};

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

## 3. Custom Hooks & Services Categorization

A review of `src/components/Custom Hooks/` reveals a mixture of true hooks, utility files, and service-like modules.

### A. Recommended Relocation Strategy

1. **Move to `src/hooks/` (True Hooks)**:
   - `useAnimatedNumber.jsx`
   - `useLevelBar.jsx`
   - `useStoreLastOpenedLevel.jsx`
   - `useUserInventory.jsx`
   - `useUserAchievements.jsx`
   - `useAchievementProgressBar.jsx`
   - `useSubjProgressBar.jsx`
   - `useSubjectCheckComplete.jsx`
2. **Move to `src/utils/` or `src/services/` (Utilities & Plain Services)**:
   - `DevlabSoundHandler.jsx` -> Move to `src/services/soundService.ts` or `src/utils/soundHandler.ts` (This file exports standard helper functions to load/play sound and is not a React hook).
   - `UnlockAchievement.jsx` -> Move to `src/services/achievementService.ts` (This is an asynchronous worker function for writing records to Firestore and showing achievement toasts).
   - `validations.jsx` -> Move to `src/utils/validation.ts` (This contains pure regex validator functions for email and password).

### B. Typings and Code Drafts for Key Hooks

#### 1) `src/hooks/useAnimatedNumber.ts`
```typescript
import { useState, useEffect } from "react";

export default function useAnimatedNumber(
  targetValue: number | null | undefined,
  duration = 500,
  frameRate = 30
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

#### 2) `src/hooks/useUserInventory.ts`
```typescript
import { useState, useEffect } from "react";
import { db, auth } from "@/Firebase/Firebase";
import { collection, onSnapshot, DocumentData } from "firebase/firestore";

export interface InventoryItem {
  id: string;
  [key: string]: any;
}

export default function useUserInventory(): { inventory: InventoryItem[]; loading: boolean } {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const inventoryRef = collection(db, "Users", user.uid, "Inventory");

    const unsubscribe = onSnapshot(inventoryRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInventory(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { inventory, loading };
}
```

---

## 4. M1 Challenger Findings Review & Recommendations

### M1 Findings Checklist
1. **TypeScript Exclusion in `tsconfig.json`**:
   - `tsconfig.json` does not include `tests/` directory or `vitest.config.e2e.ts`.
   - *Impact*: Typechecking commands like `tsc --noEmit` completely skip test files and configurations, meaning compile-time type issues inside test files go undetected.
2. **Missing Path Alias mapping in `tsconfig.json`**:
   - `vitest.config.e2e.ts` sets up the `@` path alias: `alias: { "@": path.resolve(__dirname, "./src") }`.
   - However, `tsconfig.json` has no path mapping for `@/*`, causing IDE/compiler errors if alias imports are used in source/tests.

### Recommendations for Addressing Gaps in M2

1. **Update `tsconfig.json` `include` Array**:
   - Modify `tsconfig.json` to explicitly include E2E test files and configurations:
   ```json
   "include": ["src", "vite.config.ts", "tests/**/*", "vitest.config.e2e.ts"]
   ```
2. **Add Path Aliases to `tsconfig.json`**:
   - Configure `baseUrl` and `paths` within the `compilerOptions` block:
   ```json
   "compilerOptions": {
     ...
     "baseUrl": ".",
     "paths": {
       "@/*": ["./src/*"]
     }
   }
   ```
3. **Synchronize path aliases in Vite / Vitest Configurations**:
   - Vite 6 config (`vite.config.ts`) and Vitest config (`vitest.config.e2e.ts`) should mirror these path aliases consistently. Since typescript compiler will now check test files, any imports in `tests/e2e/setup.ts` or other E2E files utilizing `@/` will be typechecked cleanly.
4. **TypeScript Migration of E2E mocks**:
   - Mocks in `tests/e2e/mocks/handlers.ts` and test helper configuration should be fully typed. For example, ensuring `MockDatabase` states have proper type definitions and requests in mock handlers use MSW types (`HttpResponse`, etc.).
