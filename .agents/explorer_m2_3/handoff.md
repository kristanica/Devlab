# Handoff Report — Milestone M2 Exploration (Global Services & Stores)

This is a **Hard Handoff** summarizing the investigation and migration planning for Milestone M2 of the Devlab Restructuring and TypeScript Conversion project.

---

## 1. Observation

We performed a read-only code analysis to locate and inspect the Firebase configuration, Zustand stores, custom hooks, and the M1 Challenger findings:

### A. Firebase Configuration
* File path: `src/Firebase/Firebase.js` (lines 1 to 24)
* Content:
  ```javascript
  import { initializeApp } from "firebase/app";
  import {getAuth} from 'firebase/auth';
  import {getFirestore} from 'firebase/firestore'
  import {getStorage} from 'firebase/storage'
  ...
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID
  };
  const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  export const auth = getAuth(app);
  export const storage = getStorage(app);
  ```

### B. Zustand Stores
We discovered the following 5 stores:
1. `src/ItemsLogics/Items-Store/useInventoryStore.jsx`: Exports `useInventoryStore = create((set, get) => ({ ... }))` (manages inventory items and buffs; reads/writes user subcollections in Firestore).
2. `src/ItemsLogics/Items-Store/useRewardStore.jsx`: Exports `useRewardStore = create((set) => ({ ... }))` (tracks rewards exp and coins).
3. `src/components/OpenAI Prompts/useBugBustStore.jsx`: Exports `useGameStore = create((set, get) => ({ ... }))` (tracks evaluation outputs, code submissions, loading signals, and AI evaluation feedback).
4. `src/gameMode/GameModes_Utils/CompletedLevelStore.jsx`: Exports `useUserProgressStore = create((set) => ({ ... }))` (tracks userProgress state).
5. `src/gameMode/GameModes_Utils/useAttemptStore.jsx` & `useAttemptStore_Local.jsx`: Combines dynamic store caching with localStorage persistence:
   ```javascript
   export const createUseAttemptStore = (userId) => create(persist((set, get) => ({ ... }), { name: `attempt-storage-${userId}` }));
   ```

### C. Custom Hooks
We located the hooks within `src/components/Custom Hooks/` and `src/ItemsLogics/`:
1. `useAnimatedNumber.jsx`
2. `useLevelBar.jsx`
3. `useStoreLastOpenedLevel.jsx`
4. `useSubjProgressBar.jsx`
5. `useSubjectCheckComplete.jsx`
6. `useUserAchievements.jsx`
7. `useUserInventory.jsx`
8. `useAchievementProgressBar.jsx`
9. `src/ItemsLogics/useCodeRushTimer.jsx`

We also noted non-hook helper files in `src/components/Custom Hooks/`:
* `UnlockAchievement.jsx`: Unlocks Firestore achievement entries and issues Tailwind CSS notifications.
* `DevlabSoundHandler.jsx`: Caches and plays game sounds (`correct.mp3`, `achievementUnlocked.mp3`, etc.).
* `validations.jsx`: Standard regex-based email/password checkers.

### D. M1 Challenger Findings
We inspected the handoffs of `challenger_m1_1` and `challenger_m1_2` under `.agents/` and observed:
* **`tsconfig.json`**:
  ```json
  "include": ["src", "vite.config.ts"]
  ```
  It lacks `"paths"` or `"baseUrl"` configurations.
* **`vitest.config.e2e.ts`**:
  ```typescript
  alias: {
    "@": path.resolve(__dirname, "./src"),
  }
  ```
* **`vite.config.ts`**: Lacks path alias settings.
* **JS/JSX overrides**: Approximately 10 `// @ts-ignore` statements exist in typescript files (like `src/App.tsx`) to bypass compilation errors on unconverted Javascript imports.

---

## 2. Logic Chain

1. **Firebase Migration**: `src/Firebase/Firebase.js` (from Observation A) must be migrated to `src/services/firebase.ts` and cast environment variable accesses to `string` in order to satisfy the strict TypeScript checks (`noImplicitAny: true` and `strictNullChecks: true`) configured in `tsconfig.json`.
2. **Store Reorganization**: All 5 stores identified in Observation B should be moved to `src/store/` and converted to TypeScript (`.ts`). Dynamic stores like `useAttemptStore` must import proper type hooks (`StoreApi`, `UseBoundStore` from `"zustand"`) to guarantee type safety in components using them.
3. **Hook Sorting**: Hooks in Observation C should be separated into two buckets:
   - **Global**: Pure UI/Utility hooks (`useAnimatedNumber`, `useLevelBar`, `useStoreLastOpenedLevel`) go to `src/hooks/`.
   - **Feature-Specific**: Hooks associated with particular features (`inventory`, `achievements`, `dashboard`, `lessons`, `gamemodes`) belong to their respective feature folders under `src/features/<feature>/hooks/` as defined in `PROJECT.md`.
   - **Helpers**: Files like `UnlockAchievement.jsx` and `DevlabSoundHandler.jsx` are not hooks and must be moved to service/util folders (e.g. `src/features/achievements/services/` and `src/services/`).
4. **Challenger Mitigations**:
   - Including tests under `"tests/**/*"` and `"vitest.config.e2e.ts"` in `tsconfig.json` ensures E2E test files are parsed by `tsc`.
   - Defining `"paths"` in `tsconfig.json` matches the alias in `vitest.config.e2e.ts`.
   - Adding path mapping to `vite.config.ts` ensures that compilation does not crash when bundling `@/` imports for production.
   - Migrating modules like the sound handler in M2 allows the safe removal of `// @ts-ignore` statements (Observation D).

---

## 3. Caveats

* We assumed the list of folders in `PROJECT.md` is fixed and feature boundaries are strictly enforced.
* We did not modify any source code (read-only restriction).
* We could not verify shell commands due to permissions/timeouts, so we relied on static analysis.

---

## 4. Conclusion

The codebase is well-prepared for the M2 transition. The implementer worker should:
1. **Migrate Firebase Setup**: Convert to `src/services/firebase.ts` with strict typing.
2. **Reorganize/Type stores**: Move all 5 stores to `src/store/` as TypeScript modules.
3. **Restructure Hooks**: Split custom hooks between global `src/hooks/` and respective `src/features/<feature>/hooks/` modules. Relocate non-hook utilities to appropriate services/utils.
4. **Fix Configuration**: Update `tsconfig.json` include list and path aliases, sync path aliases in `vite.config.ts`, and clear related `// @ts-ignore` annotations.

---

## 5. Verification Method

Once terminal execution is active, verify changes as follows:
1. **Compilation Check**: Run `npx tsc --noEmit` from the root directory to confirm there are no type-checking compilation failures.
2. **Production Build**: Run `pnpm run build` to confirm the Vite bundler successfully compiles all path aliases and imports.
3. **Test Validation**: Execute E2E tests:
   ```bash
   pnpm run test:e2e
   ```
4. **File Check**: Inspect `tsconfig.json` and `vite.config.ts` to ensure path aliases are synchronized. Verify that `@ts-ignore` comments for migrated modules are deleted.
