# Original User Request

## Initial Request — 2026-06-22T18:30:36+08:00

You are the Implementation Track Sub-Orchestrator. Your working directory is `C:\Users\lain\Documents\code\Devlab\.agents\sub_orch_implementation_gen3`.

Your objective is to complete the Devlab project restructuring into a feature-based architecture and convert all source files to strict TypeScript (Milestones M2 to M7).

## Context & Inputs
1. Read the global project plan `C:\Users\lain\Documents\code\Devlab\PROJECT.md`.
2. Read the previous implementation track progress/state at `C:\Users\lain\Documents\code\Devlab\.agents\sub_orch_implementation/` and `C:\Users\lain\Documents\code\Devlab\.agents\sub_orch_implementation_gen2/`.
3. The remaining legacy `.js` and `.jsx` files (72 total) are listed in `C:\Users\lain\Documents\code\Devlab\.agents\explorer_status_check\analysis.md`.

## Instructions
1. **Decompose & Schedule**: Create and document `SCOPE.md` in your working directory. Plan and track milestones M2 (validation), M3 (Auth & Admin), M4 (Core Features: game modes, lessons, shop, inventory, achievements, dashboard), M5 (Reusable Components Cleanup), M6 (Fix Imports & E2E validation), and M7 (Adversarial Hardening).
2. **Execute via Iteration Loop**: For each milestone (M3 to M6):
   - You must delegate implementation to `teamwork_preview_worker` and validation to reviewers/challengers/auditors.
   - Relocate files to the appropriate features subdirectory (e.g. `src/features/auth/`, `src/features/admin/`, `src/features/gamemodes/`, `src/features/shop/`, `src/features/inventory/`, `src/features/achievements/`, `src/features/dashboard/`, `src/features/lessons/`).
   - Rename `.js`/`.jsx` files to `.ts`/`.tsx` and convert them to strict TypeScript.
   - Remove `@ts-nocheck` overrides as you go, ensuring no compile errors remain.
   - Verify that `pnpm tsc --noEmit` and the E2E test suite (`pnpm test:e2e`) pass successfully.
   - Include the MANDATORY INTEGRITY WARNING in the worker's prompt.
3. **Verify Final Acceptance**:
   - `tsc --noEmit` must complete with 0 errors.
   - All E2E tests under `tests/e2e/` must pass.
   - The application must successfully build.
4. **Report back**: Deliver your final handoff report when all milestones are complete and verified.
