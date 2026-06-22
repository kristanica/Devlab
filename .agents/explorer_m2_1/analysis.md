# Milestone M2 Analysis Report: Global Services & Stores

This report provides a comprehensive analysis of the **Devlab** codebase for **Milestone M2 (Global Services & Stores)**. It examines current structures, identifies organizational antipatterns, and recommends detailed paths and TypeScript typings to implement global stores, service layers, and custom hooks.

---

## 1. Firebase Configuration Analysis

### Current File Location
- `src/Firebase/Firebase.js` (JavaScript)

### Observations
The configuration file initializes Firebase SDK services (Firestore, Auth, and Storage) utilizing Vite environment variables:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};
```
It exports three global instances: `db` (Firestore), `auth` (FirebaseAuth), and `storage` (FirebaseStorage).

### Recommendations
1. **Relocate & Rename**: Move the configuration file to `src/services/firebase.ts` (or keep as `src/Firebase/Firebase.ts` to minimize import breakages, while updating path aliases if defined).
2. **Vite Typings**: Define Vite's environment variables in a global declaration file (e.g. `src/vite-env.d.ts`) to ensure strict compiler compliance:
   ```typescript
   interface ImportMetaEnv {
     readonly VITE_API_KEY: string;
     readonly VITE_AUTH_DOMAIN: string;
     readonly VITE_PROJECT_ID: string;
     readonly VITE_STORAGE_BUCKET: string;
     readonly VITE_MESSAGING_SENDER_ID: string;
     readonly VITE_APP_ID: string;
   }

   interface ImportMeta {
     readonly env: ImportMetaEnv;
   }
   ```
3. **Type-safe Initializer**: Add explicit return types to the exported services:
   ```typescript
   import { initializeApp } from "firebase/app";
   import { getAuth, Auth } from "firebase/auth";
   import { getFirestore, Firestore } from "firebase/firestore";
   import { getStorage, FirebaseStorage } from "firebase/storage";

   const firebaseConfig = {
     apiKey: import.meta.env.VITE_API_KEY,
     authDomain: import.meta.env.VITE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_APP_ID,
   };

   const app = initializeApp(firebaseConfig);
   export const db: Firestore = getFirestore(app);
   export const auth: Auth = getAuth(app);
   export const storage: FirebaseStorage = getStorage(app);
   ```

---

## 2. Zustand Stores Analysis & Migration Plan

Currently, Zustand stores are scattered throughout the codebase (in `ItemsLogics` and `components` directories) and lack TypeScript type checking. 

### Store Inventory Summary

| # | Current File Path | Exported Store Name | Target Migration Path |
|---|---|---|---|
| 1 | `src/ItemsLogics/Items-Store/useInventoryStore.jsx` | `useInventoryStore` | `src/store/useInventoryStore.ts` |
| 2 | `src/ItemsLogics/Items-Store/useRewardStore.jsx` | `useRewardStore` | `src/store/useRewardStore.ts` |
| 3 | `src/components/OpenAI Prompts/useBugBustStore.jsx` | **`useGameStore`** *(Mismatch)* | `src/store/useGameStore.ts` |
| 4 | `src/gameMode/GameModes_Utils/CompletedLevelStore.jsx` | **`useUserProgressStore`** *(Mismatch)* | `src/store/useUserProgressStore.ts` |
| 5 | `src/gameMode/GameModes_Utils/useAttemptStore_Local.jsx`<br>`src/gameMode/GameModes_Utils/useAttemptStore.jsx` | `createUseAttemptStore`<br>`useAttemptStore` | `src/store/useAttemptStore.ts` |

---

### Detailed Store Typings & Recommendations

#### 1. Inventory Store (`src/store/useInventoryStore.ts`)
*   **Purpose**: Manages user inventory and active power-ups (buffs). Updates Firestore documents directly under `Users/{userId}/Inventory/{itemId}` in the background.
*   **Proposed Interfaces**:
    ```typescript
    export interface InventoryItem {
      id: string;
      quantity: number;
      [key: string]: any; // supports dynamic Firestore fields
    }

    export interface InventoryState {
      inventory: InventoryItem[];
      activeBuffs: string[];
      setInventory: (items: InventoryItem[]) => void;
      useItem: (itemId: string, buffName?: string) => Promise<void>;
      removeBuff: (buffName: string) => void;
    }
    ```

#### 2. Reward Store (`src/store/useRewardStore.ts`)
*   **Purpose**: Briefly caches experience and coin rewards earned upon level completion.
*   **Proposed Interfaces**:
      ```typescript
      export interface Reward {
        exp: number;
        coins: number;
      }

      export interface RewardState {
        lastReward: Reward;
        setLastReward: (exp: number, coins: number) => void;
        clearReward: () => void;
      }
      ```

#### 3. Game Store (`src/store/useGameStore.ts`)
*   **Purpose**: Tracks OpenAI prompt evaluations, user's submitted codes (HTML, CSS, JS, SQL), loading states, and AI feedbacks.
*   **Proposed Interfaces**:
    ```typescript
    export interface SubmittedCode {
      HTML?: string;
      CSS?: string;
      JS?: string;
      SQL?: string;
    }

    export interface StageFeedback {
      stageId?: string;
      feedback: string;
      isCorrect: boolean;
      [key: string]: any;
    }

    export interface GameState {
      submittedCode: Required<SubmittedCode>;
      setSubmittedCode: (code: SubmittedCode) => void;
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
      singleFeedback: string | null;
      setSingleFeedback: (feedback: string | null) => void;
      clearSingleFeedback: () => void;
      stageFeedbacks: StageFeedback[];
      addStageFeedback: (feedback: StageFeedback) => void;
      getAllFeedbacks: () => StageFeedback[];
      clearAllFeedbacks: () => void;
      lastGamemode: string | null;
      setLastGamemode: (mode: string | null) => void;
    }
    ```

#### 4. User Progress Store (`src/store/useUserProgressStore.ts`)
*   **Purpose**: Caches user completion data of subjects and levels locally.
*   **Proposed Interfaces**:
    ```typescript
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
    ```

#### 5. Attempt Store (`src/store/useAttemptStore.ts`)
*   **Purpose**: Manages levels and user hearts (attempts). Employs Zustand persistence middleware (`localStorage`) cache keyed by User ID.
*   **Proposed Interfaces**:
    ```typescript
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
    ```
*   **Dynamic Cache Handling**:
    ```typescript
    import { create, StoreApi, UseBoundStore } from "zustand";
    import { persist } from "zustand/middleware";

    let storeCache: Record<string, UseBoundStore<StoreApi<AttemptState>>> = {};

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
            storage: {
              getItem: (name) => {
                const item = localStorage.getItem(name);
                return item ? JSON.parse(item) : null;
              },
              setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
              removeItem: (name) => localStorage.removeItem(name),
            },
          }
        )
      );
    ```

---

## 3. Custom Hooks Analysis & Reorganization

We inspected `src/components/Custom Hooks/` and found a significant organizational antipattern: the directory contains a mixture of **global React hooks**, **domain-specific querying hooks**, **utility helpers**, and **sound player managers**.

### Current Custom Hooks File Classification

1.  **Global/Generic UI Hooks**
    *   `useAnimatedNumber.jsx`: Animates a counter towards a target value. Pure UI utility.
    *   *Recommendation*: Relocate to `src/hooks/useAnimatedNumber.ts` and add proper typings.
2.  **Domain-Specific & Firestore-Querying Hooks (React Query / Snapshots)**
    *   `useUserInventory.jsx`: Standard Firestore listener.
    *   `useUserAchievements.jsx`: Wrapper for fetching Achievements.
    *   `useStoreLastOpenedLevel.jsx`: React Query mutation.
    *   *Recommendation*: Move to `src/hooks/queries/` (e.g. `src/hooks/queries/useUserInventory.ts`) or manage under a query-service module.
3.  **Specific Component UI Hooks**
    *   `useAchievementProgressBar.jsx`, `useLevelBar.jsx`, `useSubjProgressBar.jsx`, `useSubjectCheckComplete.jsx`
    *   *Recommendation*: Keep inside feature components folder (e.g., `src/components/Dashboard/hooks/`) or refactor as sub-modules within `src/hooks/ui/`.
4.  **Static Utilities & Action Helpers (Not Hooks)**
    *   `validations.jsx`: Contains standard string regex validators for emails/passwords. No hooks.
    *   `DevlabSoundHandler.jsx`: Manage audio file preloads. No hooks or state hooks.
    *   `UnlockAchievement.jsx`: Service function executing async Firestore writes and UI alerts.
    *   *Recommendation*: **Remove** from `Custom Hooks`. Relocate to:
        *   `src/utils/validations.ts`
        *   `src/utils/soundHandler.ts`
        *   `src/services/unlockAchievement.ts`

### Recommended Typings for Global/Utility Hooks

#### `src/hooks/useAnimatedNumber.ts`
```typescript
export interface AnimatedNumberOptions {
  duration?: number;
  frameRate?: number;
}

export default function useAnimatedNumber(
  targetValue: number | null,
  duration = 500,
  frameRate = 30
): { animatedValue: number }
```

#### `src/utils/validations.ts`
```typescript
export type ValidationResult = ["success" | "error", string];

export const validateEmail = (email: string): ValidationResult;
export const validatePassword = (password: string): ValidationResult;
```

---

## 4. Review of M1 Challenger Findings & Test Infrastructure

The M1 Challenger raised two key configuration discrepancies and one filesystem redundancy:

1.  **Excluded Tests Directory**: E2E test files (`tests/e2e/sanity.test.tsx`, `tests/e2e/setup.ts`) and configuration files (`vitest.config.e2e.ts`) are completely excluded from `tsconfig.json`'s `"include"` block. Consequently, running typechecking (`tsc --noEmit`) fails to validate changes in tests.
2.  **Path Alias Mismatch**: `vitest.config.e2e.ts` sets up path aliases (`@/` mapping to `./src`), but `tsconfig.json` does not implement `"baseUrl"` or `"paths"`. This creates compiler warning/error blockages if `@/` import styles are adopted in the codebase.
3.  **Redundant Lockfiles**: Both `pnpm-lock.yaml` and `package-lock.json` coexist in the workspace, risking dependency desynchronization.

### Recommended Implementation in M2

To resolve these, the worker in M2 should implement the following steps:

1.  **Configure Path Aliases in `tsconfig.json`**:
    Inside the `compilerOptions` section of `tsconfig.json`, append `"baseUrl"` and `"paths"` to resolve compiler imports matching Vitest's resolver:
    ```json
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"]
      }
    }
    ```
2.  **Include Tests and Configurations in type-check scope**:
    Expand the `"include"` list in `tsconfig.json` to process E2E tests, helper scripts, and Vitest configurations:
    ```json
    "include": [
      "src",
      "tests/**/*",
      "vite.config.ts",
      "vitest.config.e2e.ts"
    ]
    ```
3.  **Deduplicate Lockfiles**:
    Remove `package-lock.json` and enforce `pnpm` usage, standardizing the installation environment.
