# Handoff Report: Milestone M2 Exploration

This report summarizes findings and migration strategies for **Milestone M2 (Global Services & Stores)**.

---

## 1. Observation

We performed a static analysis of the workspace files to map Firebase configuration, Zustand stores, custom hooks, utilities, and compiler configurations.

### Firebase Configuration
- **Path**: `src/Firebase/Firebase.js`
- **Definition** (lines 10-17):
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
- **Exports** (lines 21-23):
  ```javascript
  export const db = getFirestore(app);
  export const auth = getAuth(app);
  export const storage = getStorage(app);
  ```

### Zustand Stores
1.  **Inventory Store**:
    - **Path**: `src/ItemsLogics/Items-Store/useInventoryStore.jsx`
    - **Export**: `export const useInventoryStore = create((set, get) => ({ ... }));` (line 6)
2.  **Reward Store**:
    - **Path**: `src/ItemsLogics/Items-Store/useRewardStore.jsx`
    - **Export**: `export const useRewardStore = create((set) => ({ ... }));` (line 3)
3.  **Game Store**:
    - **Path**: `src/components/OpenAI Prompts/useBugBustStore.jsx`
    - **Export**: `export const useGameStore = create((set, get) => ({ ... }));` (line 3) - *Mismatch between file name and exported store name.*
4.  **Completed Level / Progress Store**:
    - **Path**: `src/gameMode/GameModes_Utils/CompletedLevelStore.jsx`
    - **Export**: `export const useUserProgressStore = create((set) => ({ ... }));` (line 3) - *Mismatch between file name and exported store name.*
5.  **Attempt Store (Dynamic Local Persisted)**:
    - **Paths**: `src/gameMode/GameModes_Utils/useAttemptStore_Local.jsx` & `useAttemptStore.jsx`
    - **Exports**: `export const createUseAttemptStore = (userId) => ...;` (line 4 of `_Local.jsx`) and `export function useAttemptStore(selector) ...;` (line 7 of `useAttemptStore.jsx`).

### Custom Hooks & Utilities
- Directory `src/components/Custom Hooks/` contains:
  1.  `useAnimatedNumber.jsx` (lines 4-34): Generic animation hook.
  2.  `validations.jsx` (lines 1-28): pure JavaScript regex validations. No React dependencies.
  3.  `DevlabSoundHandler.jsx` (lines 19-57): HTML5 Audio preloader/player. No React state or hooks used.
  4.  `UnlockAchievement.jsx` (lines 9-107): Async firestore action dispatcher and custom Tailwind/Framer toast wrapper.
  5.  Various data-fetching snapshot & query hooks (`useUserInventory.jsx`, `useUserAchievements.jsx`, `useStoreLastOpenedLevel.jsx`) and UI progression components.

### M1 Challenger Configurations
- **TypeScript Config**: `tsconfig.json` contains:
  ```json
  "include": ["src", "vite.config.ts"],
  "exclude": ["node_modules", "dist"]
  ```
  It has no `"paths"` or `"baseUrl"` definitions.
- **Vitest Config**: `vitest.config.e2e.ts` contains (lines 13-15):
  ```typescript
  alias: {
    "@": path.resolve(__dirname, "./src"),
  }
  ```
- **Redundant Lockfiles**: Both `pnpm-lock.yaml` and `package-lock.json` coexist in the workspace.

---

## 2. Logic Chain

1.  **Observation 1** (Firebase configuration in `.js` format) indicates that global service exports (`db`, `auth`, `storage`) do not carry type annotations, limiting static analysis verification elsewhere. Converting this to TypeScript and declaring environment interfaces will prevent typos in environment integration.
2.  **Observation 2** highlights that Zustand store implementations are disorganized, stored in various component directories (`ItemsLogics`, `components`), and feature mismatches between file naming (`useBugBustStore`, `CompletedLevelStore`) and exported hook names (`useGameStore`, `useUserProgressStore`). Grouping them inside `src/store/` as typed `.ts` stores provides compile-time protection and consistent API access.
3.  **Observation 3** reveals significant architectural antipatterns where non-hook helper files (`validations.jsx`, `DevlabSoundHandler.jsx`, `UnlockAchievement.jsx`) live in `components/Custom Hooks/`. Extracting them to dedicated directories (`src/utils/` and `src/services/`) keeps React hooks pure and isolates core domain logic from UI presentation.
4.  **Observation 4** indicates that the E2E tests and path alias configuration mappings between Vitest and TypeScript are out of sync. Without matching path aliases in `tsconfig.json`, `@/` import resolutions work at runtime but break compilation during `tsc --noEmit`. Also, excluding `tests/` in `tsconfig.json` prevents tests from being typechecked. Standardizing lockfiles to `pnpm-lock.yaml` eliminates dependency conflicts.

---

## 3. Caveats

- We assumed that all component-level imports of Zustand stores and custom hooks can be safely refactored once moved to their target directories without requiring breaking logic changes.
- Dynamic verification via compiler check command execution was skipped due to command timeout constraints. All findings are derived via strict visual and semantic inspections of the code.

---

## 4. Conclusion

We recommend the next-step developer (implementer) carry out the following task items in M2:
1.  **Refactor Firebase**: Migrate `src/Firebase/Firebase.js` to `src/services/firebase.ts` with strict typed exports. Define global env typings in `src/vite-env.d.ts`.
2.  **Migrate Stores**: Move all Zustand stores to `src/store/` with appropriate TypeScript State/Action interfaces and uniform filenames.
3.  **Refactor Hooks & Utils**: Move generic UI hooks to `src/hooks/`, static validation/audio logic to `src/utils/`, and achievement actions to `src/services/`.
4.  **Align TypeScript**: Sync compiler configuration paths with Vitest, include tests in compilation, and delete the redundant `package-lock.json` file.

Detailed implementation details are written in `C:\Users\lain\Documents\code\Devlab\.agents\explorer_m2_1\analysis.md`.

---

## 5. Verification Method

Once terminal execution/compilation is authorized, verify implementation:
1.  Run typecheck tool:
    ```bash
    npx tsc --noEmit
    ```
2.  Build the workspace:
    ```bash
    pnpm run build
    ```
3.  Validate imports in components are updated to point to `src/store/` and compile cleanly.
4.  Verify that introducing a type error inside `tests/e2e/sanity.test.tsx` (e.g. `const testVal: number = "string";`) is caught by `npx tsc --noEmit`.
