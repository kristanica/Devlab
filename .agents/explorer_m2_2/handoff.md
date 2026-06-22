# Handoff Report: Milestone M2 (Global Services & Stores) Analysis

This report is submitted by `explorer_m2_2` for Milestone M2. It outlines observations, reasoning, and recommendations for migrating Firebase, Zustand stores, custom hooks, and addressing M1 Challenger compiler gaps.

---

## 1. Observation
We have inspected the codebase and observed the following:

1. **Firebase Config**:
   - Path: `C:\Users\lain\Documents\code\Devlab\src\Firebase\Firebase.js`
   - Contains:
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
   - Exported instances (lines 20-23):
     ```javascript
     const app = initializeApp(firebaseConfig);
     export const db = getFirestore(app);
     export const auth = getAuth(app);
     export const storage = getStorage(app);
     ```

2. **Zustand Stores**:
   - There are 5 Zustand store implementations in the project:
     - `src/ItemsLogics/Items-Store/useInventoryStore.jsx`: Exports `useInventoryStore` with state (`inventory: []`, `activeBuffs: []`) and actions (`setInventory`, `useItem`, `removeBuff`).
     - `src/ItemsLogics/Items-Store/useRewardStore.jsx`: Exports `useRewardStore` with state (`lastReward: { exp: 0, coins: 0 }`) and actions (`setLastReward`, `clearReward`).
     - `src/components/OpenAI Prompts/useBugBustStore.jsx`: Exports `useGameStore` with state (`submittedCode`, `isCorrect`, etc.) and actions (`setSubmittedCode`, `setIsCorrect`, etc.).
     - `src/gameMode/GameModes_Utils/CompletedLevelStore.jsx`: Exports `useUserProgressStore` with state (`userProgress: {}`) and actions (`setUserProgress`, `resetUserProgress`).
     - `src/gameMode/GameModes_Utils/useAttemptStore_Local.jsx` & `useAttemptStore.jsx`: Exports a dynamic user-persisted store hook creator `createUseAttemptStore(userId)` and React wrapper `useAttemptStore`.

3. **Custom Hooks in `src/components/Custom Hooks/`**:
   - Identified files:
     - `useAnimatedNumber.jsx`: Pure UI hook to animate numeric display (e.g. coin counting).
     - `useLevelBar.jsx`: Animates XP bar progress using `useFetchUserData`.
     - `useStoreLastOpenedLevel.jsx`: Mutation using React Query to save level navigation.
     - `useUserInventory.jsx`: Real-time subscription to user inventory doc.
     - `useUserAchievements.jsx`: React Query fetcher for achievements.
     - `useAchievementProgressBar.jsx`: Sub-progress computation hook.
     - `useSubjProgressBar.jsx`: Subject completion progress calculation hook.
     - `useSubjectCheckComplete.jsx`: Effect hook to check if all lessons are completed.
     - `DevlabSoundHandler.jsx`: Non-hook wrapper exporting audio utility functions (`loadSounds`, `playSound`, `unloadSounds`).
     - `UnlockAchievement.jsx`: Non-hook async helper function that triggers Firestore records and custom React Hot Toast alerts.
     - `validations.jsx`: Pure helper validation functions for emails/passwords.

4. **M1 Challenger Findings**:
   - `C:\Users\lain\Documents\code\Devlab\tsconfig.json`:
     - Line 34: `"include": ["src", "vite.config.ts"]`
     - Missing: Path aliases mappings (`paths`, `baseUrl`).
   - `C:\Users\lain\Documents\code\Devlab\vitest.config.e2e.ts`:
     - Lines 13-15:
       ```typescript
       alias: {
         "@": path.resolve(__dirname, "./src"),
       }
       ```
     - Line 11: `include: ["tests/e2e/**/*.test.{ts,tsx,js,jsx}"]`

---

## 2. Logic Chain
1. **Firebase**: Because `Firebase.js` uses standard imports and Vite environment metadata variables (Observation 1), migrating it to TypeScript involves declaring type interfaces (`FirebaseConfig`, `FirebaseApp`, `Firestore`, `Auth`, `FirebaseStorage`) to satisfy compiler configuration check. Moving it to `src/services/` or creating path alias `@/Firebase/Firebase` allows cleaner, uniform resolution.
2. **Zustand Stores**: Since Zustand stores are currently scattered across different feature folders (`src/ItemsLogics`, `src/components`, `src/gameMode`) in untyped `.jsx` files (Observation 2), consolidating them into `src/store/` using typed interfaces provides centralized, predictable global state. Re-declaring the store configurations in TypeScript enables full IDE autocomplete and robust validation of states/actions across pages.
3. **Custom Hooks**: Based on files in `src/components/Custom Hooks/` (Observation 3), they must be separated into React hooks (moved to `src/hooks/`) and utility services (moved to `src/services/` or `src/utils/`). Doing so ensures adherence to project architecture layout standards and avoids importing non-react helpers as React hooks.
4. **tsconfig.json Gaps**: Because test directories (`tests/`) and `vitest.config.e2e.ts` are excluded from compilation (Observation 4), `tsc --noEmit` fails to detect compile-time errors in tests. Similarly, because `@/` path alias is defined only in Vitest (Observation 4), importing components with `@/` inside tests breaks static compilation. Thus, syncing `tsconfig.json` `include` list and adding compiler `paths` mapping is a prerequisite for executing error-free TypeScript compilations.

---

## 3. Caveats
- No caveats: The entire code structure regarding Firebase, Zustand stores, custom hooks, and compiler configs was successfully verified.

---

## 4. Conclusion
1. **Firebase Migration**: Migrate `Firebase.js` to TypeScript at `src/Firebase/Firebase.ts` or `src/services/firebase.ts`.
2. **Zustand Migration**: Standardize all 5 Zustand stores in `src/store/` using TypeScript, renaming filenames like `CompletedLevelStore.jsx` and `useBugBustStore.jsx` to reflect their exported store hook names (`useUserProgressStore.ts` and `useGameStore.ts`).
3. **Hook Sorting**: Move the 8 custom hooks to `src/hooks/`. Relocate helper functions (`DevlabSoundHandler`, `UnlockAchievement`, `validations`) to `src/services/` and `src/utils/`.
4. **TypeScript Gaps**: Update `tsconfig.json` `include` to `["src", "vite.config.ts", "tests/**/*", "vitest.config.e2e.ts"]` and configure path mapping (`"@/*": ["./src/*"]`) under `compilerOptions` with `"baseUrl": "."`.

Detailed code drafts and TS configurations are fully documented in `C:\Users\lain\Documents\code\Devlab\.agents\explorer_m2_2\analysis.md`.

---

## 5. Verification Method
To verify that these recommendations address the gaps:
1. Open the project configuration files:
   - Check if `C:\Users\lain\Documents\code\Devlab\tsconfig.json` includes `tests/**/*` and path alias options.
2. Run standard typescript type-check:
   ```bash
   npx tsc --noEmit
   ```
   *Pass Condition*: Compiler successfully parses test files and alias definitions without warnings.
3. Run E2E test suite:
   ```bash
   pnpm test:e2e
   ```
   *Pass Condition*: Sanity and E2E test specs execute successfully under Vitest runner.
