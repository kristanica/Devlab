## 2026-06-22T10:21:53Z
You are the Implementation Track Sub-Orchestrator (Rep). Your working directory is `C:\Users\lain\Documents\code\Devlab\.agents\sub_orch_implementation_gen2`.

Your objective is to complete the Devlab project restructuring into a feature-based architecture and convert all source files to strict TypeScript (Milestones M2 to M7).

## Context & Inputs
1. Read the global project plan `C:\Users\lain\Documents\code\Devlab\PROJECT.md`.
2. Read the previous implementation track progress/state at `C:\Users\lain\Documents\code\Devlab\.agents\sub_orch_implementation/`. Notice that M1 (TypeScript Setup) is complete, and M2 (Global Services & Stores) has been implemented (by worker_m2_gen3) but not fully verified.
3. The remaining legacy `.js` and `.jsx` files (72 total) are listed in `C:\Users\lain\Documents\code\Devlab\.agents\explorer_status_check\analysis.md`.

## Instructions
1. **Decompose & Schedule**: Read or recreate the `SCOPE.md` in your working directory. You must plan and track milestones M2 (validation), M3 (Auth & Admin), M4 (Core Features: game modes, lessons, shop, inventory, achievements, dashboard), M5 (Reusable Components Cleanup), M6 (Fix Imports & E2E validation), and M7 (Adversarial Hardening).
2. **Execute via Iteration Loop**: For each milestone (M3 to M6):
   a. Spawn `teamwork_preview_explorer` (if needed) to analyze the current milestone code.
   b. Spawn `teamwork_preview_worker` to:
      - Relocate files to the appropriate features subdirectory (e.g. `src/features/auth/`, `src/features/admin/`, `src/features/gamemodes/`, `src/features/shop/`, `src/features/inventory/`, `src/features/achievements/`, `src/features/dashboard/`, `src/features/lessons/`).
      - Rename `.js`/`.jsx` files to `.ts`/`.tsx`.
      - Convert to strict TypeScript using typings from `src/types/index.ts`. Remove `// @ts-nocheck` overrides as you go, ensuring no compile errors remain.
      - Fix all imports (the absolute path alias `@/` should be used where appropriate).
      - Run typescript compilation (`pnpm tsc --noEmit`) and E2E test suite (`pnpm test:e2e` or `npm run test:e2e`) to verify that the application builds and all E2E tests pass.
      - Ensure the MSW mocks correctly intercept all API endpoints (especially OpenAI API calls) during tests.
      - MANDATORY INTEGRITY WARNING must be included in the worker's prompt (do not cheat/hardcode test results).
   c. Spawn `teamwork_preview_reviewer` to review correctness, completeness, and layout compliance.
   d. Spawn `teamwork_preview_challenger` to run empirical validation.
   e. Spawn `teamwork_preview_auditor` to audit the changes. If any violation is found, roll back and retry.
3. **Verify Final Acceptance**:
   - Running `tsc --noEmit` must complete with 0 errors.
   - All E2E tests under `tests/e2e/` must pass.
   - The application must successfully build.
4. **Report back**: Deliver your final handoff report when all milestones M2-M7 are successfully verified.
