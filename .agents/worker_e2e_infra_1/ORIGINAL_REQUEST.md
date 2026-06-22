## 2026-06-21T16:57:56Z
Your task is to set up the E2E Testing Infrastructure (Milestone E1) for Devlab.
Please perform the following steps:
1. Read the drafted configurations and setups from C:\Users\lain\Documents\code\Devlab\.agents\explorer_e2e_infra_1\TEST_INFRA_draft.md.
2. Install the necessary devDependencies for the E2E framework. The recommended packages are:
   `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `msw`, and `@vitest/coverage-v8`.
   Try installing using `pnpm` (e.g., `pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw @vitest/coverage-v8`). If `pnpm` fails, you can fall back to `npm install --save-dev`.
3. Create `vitest.config.e2e.ts` in the project root exactly as drafted in TEST_INFRA_draft.md.
4. Modify `package.json` to add the following npm scripts under `"scripts"`:
   - `"test:e2e": "vitest run -c vitest.config.e2e.ts"`
   - `"test:e2e:watch": "vitest -c vitest.config.e2e.ts"`
   - `"test:e2e:coverage": "vitest run -c vitest.config.e2e.ts --coverage"`
5. Create the directory `tests/e2e/mocks/` and create the mock files:
   - `tests/e2e/mocks/mockFirebase.ts` (using the content from TEST_INFRA_draft.md)
   - `tests/e2e/mocks/handlers.ts` (using the content from TEST_INFRA_draft.md)
6. Create `tests/e2e/setup.ts` (using the content from TEST_INFRA_draft.md) to bootstrap MSW and the mock globals.
7. Create `TEST_INFRA.md` in the project root using the draft contents of `TEST_INFRA_draft.md`.
8. Create a temporary simple test file `tests/e2e/sanity.test.tsx` to verify the runner setup. For example:
   ```typescript
   import { describe, it, expect } from "vitest";
   describe("Sanity Check", () => {
     it("should run successfully", () => {
       expect(true).toBe(true);
     });
   });
   ```
9. Run `pnpm test:e2e` (or `npm run test:e2e`) to verify that the runner is configured correctly and executes without errors.
10. Write a detailed report `changes.md` in your working directory C:\Users\lain\Documents\code\Devlab\.agents\worker_e2e_infra_1 and provide your handoff report.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your working directory is C:\Users\lain\Documents\code\Devlab\.agents\worker_e2e_infra_1.
Report back with your results once complete.
