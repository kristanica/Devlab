## 2026-06-22T02:50:26Z

You are a worker agent executing Milestone M2: Global Services & Stores.
Your working directory is C:\Users\lain\Documents\code\Devlab\.agents\worker_m2_gen2.
Your identity is:
- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: C:\Users\lain\Documents\code\Devlab\.agents\worker_m2_gen2
- Parent Conversation ID: e0cc69b6-0212-430f-84ff-bd9c7ebda54b

Task details:
Migrate and convert the following files:
1. Refactor Firebase: Migrate src/Firebase/Firebase.js to src/services/firebase.ts with strict typed exports. Define global env typings in src/vite-env.d.ts.
2. Migrate Stores: Move all Zustand stores to src/store/ with appropriate TypeScript State/Action interfaces and uniform filenames:
   - src/ItemsLogics/Items-Store/useInventoryStore.jsx -> src/store/useInventoryStore.ts
   - src/ItemsLogics/Items-Store/useRewardStore.jsx -> src/store/useRewardStore.ts
   - src/components/OpenAI Prompts/useBugBustStore.jsx -> src/store/useGameStore.ts (rename the hook and ensure references are updated)
   - src/gameMode/GameModes_Utils/CompletedLevelStore.jsx -> src/store/useUserProgressStore.ts
   - src/gameMode/GameModes_Utils/useAttemptStore_Local.jsx & useAttemptStore.jsx -> src/store/useAttemptStore.ts (implement using the recommended layout in explorer_m2_1's analysis.md)
3. Refactor Hooks & Utils: Move generic UI hooks to src/hooks/, static validation/audio logic to src/utils/, and achievement actions to src/services/:
   - useAnimatedNumber.jsx -> src/hooks/useAnimatedNumber.ts
   - validations.jsx -> src/utils/validations.ts
   - DevlabSoundHandler.jsx -> src/utils/DevlabSoundHandler.ts
   - UnlockAchievement.jsx -> src/utils/UnlockAchievement.ts
   - useUserInventory.jsx, useUserAchievements.jsx, useStoreLastOpenedLevel.jsx -> src/hooks/useUserInventory.ts, src/hooks/useUserAchievements.ts, src/hooks/useStoreLastOpenedLevel.ts etc.
4. Align TypeScript config:
   - Update tsconfig.json to include "baseUrl": "." and "paths": { "@/*": ["./src/*"] } in compilerOptions.
   - Update "include" block in tsconfig.json to process src, tests/**/*, vite.config.ts, vitest.config.e2e.ts.
   - Delete package-lock.json.
5. Update all imports in components to point to the new paths and compile cleanly.
6. Verify compilation with `npx tsc --noEmit` and build with `pnpm run build`.
