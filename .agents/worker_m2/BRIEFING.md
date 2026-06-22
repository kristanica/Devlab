# BRIEFING — 2026-06-22T01:10:00+08:00

## Mission
Migrate global services, Zustand stores, and custom hooks/utilities to TypeScript and their consolidated directories in src/, update TS config, verify, and resolve imports.

## 🔒 My Identity
- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: C:\Users\lain\Documents\code\Devlab\.agents\worker_m2
- Original parent: 090df5d8-56a2-40d1-a7a6-33a4fcacc870
- Milestone: M2 (Global Services & Stores)

## 🔒 Key Constraints
- CODE_ONLY network mode: No external network access, curl, wget, lynx, etc.
- Minimal change principle: only modify what is necessary, no unrelated "while I'm here" refactorings.
- No dummy/facade implementations.
- Write only to our folder (.agents/worker_m2/) for metadata.

## Current Parent
- Conversation ID: 090df5d8-56a2-40d1-a7a6-33a4fcacc870
- Updated: not yet

## Task Summary
- **What to build**: Migrate Firebase config to TS, consolidate 5 Zustand stores in `src/store/` as TS, relocate and type hooks in `src/hooks/` and utils in `src/utils/` or `src/services/`, configure tsconfig.json and package.json typecheck script, fix all import references, run and verify build/type-check.
- **Success criteria**: Strict TypeScript compilation passes, build succeeds, old files deprecated/deleted.
- **Interface contracts**: Standard Devlab app codebase structure.
- **Code layout**:
  - `src/services/firebase.ts`
  - `src/store/useInventoryStore.ts`
  - `src/store/useRewardStore.ts`
  - `src/store/useBugBustStore.ts`
  - `src/store/useUserProgressStore.ts`
  - `src/store/useAttemptStore.ts`
  - `src/hooks/useAnimatedNumber.ts`
  - `src/hooks/useLevelBar.ts`
  - `src/hooks/useStoreLastOpenedLevel.ts`
  - `src/hooks/useUserInventory.ts`
  - `src/hooks/useUserAchievements.ts`
  - `src/hooks/useAchievementProgressBar.ts`
  - `src/hooks/useSubjProgressBar.ts`
  - `src/hooks/useSubjectCheckComplete.ts`
  - `src/utils/DevlabSoundHandler.ts`
  - `src/utils/UnlockAchievement.ts`
  - `src/utils/validations.ts`

## Key Decisions Made
- Migrate files one by one to ensure exact type mappings.
- Use path alias `@/` if possible, otherwise relative imports to keep consistency.

## Change Tracker
- **Files modified**: None
- **Build status**: Untested
- **Pending issues**: None

## Quality Status
- **Build/test result**: Untested
- **Lint status**: Untested
- **Tests added/modified**: None

## Loaded Skills
- **Source**: cli, caveman, ui-ux-pro-max, antigravity-guide
- **Local copy**: None
- **Core methodology**: General instructions and guides on Antigravity development, UI/UX, and prompt/token usage guidelines.

## Artifact Index
- C:\Users\lain\Documents\code\Devlab\.agents\worker_m2\ORIGINAL_REQUEST.md — Original request description.
