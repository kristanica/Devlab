# Plan: Devlab Restructuring and TypeScript Conversion

## 1. Complexity Assessment
- **Scope**: Large. Conversion of ~80+ Javascript/JSX files to strict TypeScript, restructuring of folder architecture, and updating all import references.
- **Knowledge**: Familiar React + Zustand + Firebase stack, but needs careful tracking of dependencies to prevent import compilation breakages.
- **Risk**: High. Broken imports could halt the application. Types need to match existing Firestore schemas.
- **Ambiguity**: Low. The acceptance criteria in `ORIGINAL_REQUEST.md` are clear: zero type errors with `tsc --noEmit`, all JS/JSX files converted, application runs successfully.
- **Strategy**: Spawn two tracks. 
  1. **E2E Testing Track**: Build testing infrastructure and requirements coverage to guard against runtime regressions.
  2. **Implementation Track**: Perform restructuring and TypeScript conversion step-by-step, with unit verification at each step.

## 2. Step-by-Step Execution Plan

### Phase 1: Planning & Setup
1. [x] Create `ORIGINAL_REQUEST.md` (orchestrator copy).
2. [x] Create `BRIEFING.md` and start heartbeat cron.
3. [x] Create global `PROJECT.md` defining architecture, layout, milestones, and interface contracts.
4. [x] Create this `plan.md`.

### Phase 2: Track Dispatch
1. **Dispatch E2E Testing Track Orchestrator**:
   - Spawn subagent with role `E2E Testing Orchestrator`.
   - Task: Setup test runner (Vitest + JSDOM) and write test cases for Tiers 1-4.
   - Deliverable: Publish `TEST_READY.md` when complete.
2. **Dispatch Implementation Track Orchestrator**:
   - Spawn subagent with role `Implementation Orchestrator`.
   - Task: Decompose and execute implementation milestones (TypeScript setup, services migration, feature migration, import fixing, and testing).
   - Deliverable: Successful build, `tsc --noEmit` returns zero errors, 100% test pass.

### Phase 3: Integration & Final Verification
1. Implementation Orchestrator runs all tests in `TEST_READY.md`.
2. Spawn **Challengers** to stress-test and write adversarial tests (Phase 2 coverage hardening).
3. Spawn **Forensic Auditor** to verify integrity and check for any facade/dummy code.
4. Synthesize all findings and report status back to the Sentinel.

## 3. Subagent Workspace Folder Allocation
- E2E Testing Orchestrator: `.agents/e2e_testing/`
- Implementation Orchestrator: `.agents/implementation/`

## 4. Verification Methods
- Zero errors in `tsc --noEmit`.
- Successful production build (`npm run build`).
- 100% passing tests in E2E test suite.
- Clean Forensic Auditor report.

## 5. Key Constraints
- **OpenAI/MSW Constraint**: The OpenAI API keys/credits are depleted. The E2E Testing Track MUST strictly use MSW (Mock Service Worker) to mock all OpenAI API responses during testing. Live integration tests hitting the actual OpenAI API endpoints are strictly prohibited.
