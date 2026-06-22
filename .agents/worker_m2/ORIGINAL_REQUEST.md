## 2026-06-21T17:10:09Z
You are a teamwork_preview_worker. Your working directory is C:\Users\lain\Documents\code\Devlab\.agents\worker_m2.
Your identity: worker_m2.
Your task is to implement Milestone M2 (Global Services & Stores) for the Devlab restructuring project.

Follow these implementation steps:
1. Firebase Migration:
   - Move/rename `src/Firebase/Firebase.js` to `src/services/firebase.ts`.
   - Convert it to clean, strict TypeScript.
   - Update any files importing from the old Firebase path to point to the new location (or use path alias `@/services/firebase` if configured).
   - Deprecate/remove the old `src/Firebase/Firebase.js`.

2. Zustand Stores Consolidation:
   - Migrate and convert the following stores from their old paths to `src/store/` as TypeScript (.ts) files:
     - `src/ItemsLogics/Items-Store/useInventoryStore.jsx` -> `src/store/useInventoryStore.ts`
     - `src/ItemsLogics/Items-Store/useRewardStore.jsx` -> `src/store/useRewardStore.ts`
     - `src/components/OpenAI Prompts/useBugBustStore.jsx` -> `src/store/useBugBustStore.ts`
     - `src/gameMode/GameModes_Utils/CompletedLevelStore.jsx` -> `src/store/useUserProgressStore.ts`
     - `src/gameMode/GameModes_Utils/useAttemptStore.jsx` & `useAttemptStore_Local.jsx` -> `src/store/useAttemptStore.ts`
   - Convert them to strict TypeScript with appropriate state and action interfaces.
   - Deprecate/remove the old store files.

3. Custom Hooks & Utilities Sorting:
   - Move the custom hooks in `src/components/Custom Hooks/` to `src/hooks/` and convert them to TypeScript:
     - `useAnimatedNumber.jsx` -> `src/hooks/useAnimatedNumber.ts`
     - `useLevelBar.jsx` -> `src/hooks/useLevelBar.ts`
     - `useStoreLastOpenedLevel.jsx` -> `src/hooks/useStoreLastOpenedLevel.ts`
     - `useUserInventory.jsx` -> `src/hooks/useUserInventory.ts`
     - `useUserAchievements.jsx` -> `src/hooks/useUserAchievements.ts`
     - `useAchievementProgressBar.jsx` -> `src/hooks/useAchievementProgressBar.ts`
     - `useSubjProgressBar.jsx` -> `src/hooks/useSubjProgressBar.ts`
     - `useSubjectCheckComplete.jsx` -> `src/hooks/useSubjectCheckComplete.ts`
   - Relocate the non-hook utilities in `src/components/Custom Hooks/` to `src/services/` or `src/utils/` and convert to TypeScript:
     - `DevlabSoundHandler.jsx` -> `src/utils/DevlabSoundHandler.ts`
     - `UnlockAchievement.jsx` -> `src/utils/UnlockAchievement.ts`
     - `validations.jsx` -> `src/utils/validations.ts`
   - Deprecate/remove the old files in `src/components/Custom Hooks/`.

4. TypeScript Configuration Gaps (M1 Challenger Fixes):
   - Modify `tsconfig.json` to include baseUrl and path mapping:
     `"baseUrl": "."`
     `"paths": { "@/*": ["./src/*"] }`
   - Update the `"include"` array in `tsconfig.json` to include E2E tests and test config:
     `"include": ["src", "vite.config.ts", "tests/**/*", "vitest.config.e2e.ts"]`
   - Add a `"typecheck"` script to `package.json`: `"typecheck": "tsc --noEmit"`.

5. Verification:
   - Attempt to verify your changes by proposing build/type-check (pnpm run build / pnpm typecheck). If commands time out or fail due to environment restrictions, perform thorough static reviews to ensure type compatibility.
   - Update imports in any files affected by these path changes.

6. Document your changes in C:\Users\lain\Documents\code\Devlab\.agents\worker_m2\changes.md and write a handoff.md, then notify your parent (Conv ID: 090df5d8-56a2-40d1-a7a6-33a4fcacc870).

MANDATORY INTEGRITY WARNING:
> DO NOT CHEAT. All implementations must be genuine. DO NOT
> hardcode test results, create dummy/facade implementations, or
> circumvent the intended task. A Forensic Auditor will independently
> verify your work. Integrity violations WILL be detected and your
> work WILL be rejected.
