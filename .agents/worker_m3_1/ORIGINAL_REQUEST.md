## 2026-06-22T15:21:09Z
You are teamwork_preview_worker. Your working directory is C:\Users\lain\documents\code\devlab\.agents\worker_m3_1. Your task is to relocate, restructure, and convert the Admin feature files and apply the required TypeScript compilation and testing fixes.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Key Tasks:
1. Relocate all 38 files under `src/AdminComponents/` and `src/Layout/AdminLayout.jsx` to their respective targets under `src/features/admin/`, organizing the folder structure into camelCase/kebab-case without spaces (e.g. `src/features/admin/components/contentManagement/`, `src/features/admin/services/`, `src/features/admin/hooks/`, `src/features/admin/layouts/`). Use the detailed path mapping from the M3 Status Explorer's analysis file at: C:\Users\lain\documents\code\devlab\.agents\explorer_m3_1\analysis.md.
2. Rename the moved files to `.tsx` (for components/layouts) and `.ts` (for hooks/services).
3. Convert all relocated files to strict TypeScript. Avoid using implicit `any` and handle null checks properly. Use the typescript schemas and prop interfaces detailed in `C:\Users\lain\documents\code\devlab\.agents\explorer_m3_1\analysis.md`.
4. Fix the statically identified TypeScript compilation issues in `src/features/auth/components/` files:
   - `ForgotPassword.tsx`, `ForgotPasswordLink.tsx`, `ResetPassword.tsx`, `VerifyEmail.tsx`: add types for prop destructuring (e.g., onClose, oobCode).
   - In catch blocks (e.g., `ForgotPassword.tsx`, `ResetPassword.tsx`), cast caught error (currently `unknown`) to an object with `code?: string` to fix TS2571 compiler errors.
   - `LoginForm.tsx`, `RegisterForm.tsx`: add proper types for `formVariants` and `authLogic`.
5. Update imports across the codebase (e.g., `src/App.tsx`, `src/Layout/Layout.tsx`, router configs, tests) to point to the new Target Paths under `src/features/admin/...` and `src/features/auth/...` using `@/` path alias.
6. Clean up/delete empty legacy directories: `src/AdminComponents/` and `src/Layout/AdminLayout.jsx`.
7. Periodic Build Constraint: You must run the build command (`pnpm run build` or `npm run build`) and type-checking (`pnpm tsc --noEmit`) periodically during the migration process (e.g. after migrating a group of files or fixing imports) to catch and fix compile and bundler issues early. Do not wait until the very end.
8. Verify that all E2E tests pass (`pnpm test:e2e`).
9. OpenAI/MSW Constraint: The OpenAI API keys/credits are depleted. All tests must strictly use MSW to mock OpenAI responses, and no live integration requests are allowed.

Write your handoff report to C:\Users\lain\documents\code\devlab\.agents\worker_m3_1\handoff.md and send a message to the orchestrator (conversation ID: 4a5b5f46-57d2-482c-a07a-7e7250160642) when complete.
