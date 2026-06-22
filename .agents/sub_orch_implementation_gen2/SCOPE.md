# Scope & Implementation Plan: Milestones M2 - M7

This document outlines the execution blueprint, file relocation routing, strict TypeScript conversion requirements, and verification protocols for restructuring Devlab from a component-heavy layout to a feature-based architecture.

---

## 1. Directory & Feature Mapping Architecture

The source code under `src/` is being reorganized from old directory structures into a modular, feature-based format inside `src/features/`.

| Target Feature Folder | Purpose & Domain | Files to Relocate |
|---|---|---|
| **`src/features/auth/`** | Authentication: logins, register, resets, and email verification. | Auth action and page subcomponents from `src/components/` and `src/components/Login/`. |
| **`src/features/admin/`** | Content & User Management layout and administration panels. | Panels, forms, and backend-call scripts from `src/AdminComponents/` and `src/Layout/AdminLayout.jsx`. |
| **`src/features/gamemodes/`** | Learning game modes (`BrainBytes`, `BugBust`, `CodeCrafter`, `CodeRush`), overlays, popups, and evaluation handlers. | Game mode implementations, playgrounds, navigation utils, and overlays from `src/gameMode/` and `src/components/CodePlayground/` & `src/components/DataqueriesPlayground/`. |
| **`src/features/lessons/`** | Learning curriculum presentation, lesson list blocks, and stages locks modals. | Lesson view elements and about modals from `src/components/Lessons/`. |
| **`src/features/shop/`** | Store items, grid arrays, balance tracking, and purchase hooks. | Shop header, grid list, and item purchase hooks from `src/components/Shop/`. |
| **`src/features/inventory/`** | Custom player items usage, state, active buffs, and timer counters. | Active item logicians and timer hooks from `src/ItemsLogics/`. |
| **`src/features/achievements/`** | Progress badges, claims logic, data arrays, and extraction tools. | Badges list, claim queries, rendering components, and subject-specific parsing logic from `src/components/Achievements/` and `src/components/Achievements Utils/`. |
| **`src/features/dashboard/`** | Student dashboard: User profile, skill arsenal, inventory vault, and recent missions. | Card displays, skill panels, vault lists, and settings forms/actions from `src/components/Dashboard/` and `src/components/Settings/`. |

---

## 2. Milestone Decomposition & Schedule

### 🏁 Milestone M2: Global Services & Stores (Validation & Cleanup)
* **Goal**: Validate the previous implementation of Zustand stores (`src/store/`), services (`src/services/`), and hooks (`src/hooks/`). Remove all temporary `@ts-nocheck` overrides from services.
* **Tasks**:
  - Scan `src/services/api/` (6 files) and `src/services/openai/` (10 files).
  - Remove `// @ts-nocheck` and implement typed API parameter interfaces.
  - Fix any compiler warnings regarding implicit `any` and strict null checks on the Firebase Auth context (`auth.currentUser`).
* **Success Criteria**:
  - `src/services/` contains 0 `@ts-nocheck` lines.
  - Zero compilation errors in `src/store/`, `src/services/`, and `src/hooks/`.

### 🏁 Milestone M3: Move & Convert Auth & Admin
* **Goal**: Transition authentication and administrative elements to `src/features/auth/` and `src/features/admin/`.
* **Tasks**:
  - Relocate 6 auth components in `src/components/` and 4 components in `src/components/Login/` to `src/features/auth/`.
  - Relocate 38 admin elements from `src/AdminComponents/` and 1 layout file from `src/Layout/AdminLayout.jsx` to `src/features/admin/`.
  - Rename files from `.jsx`/`.js` to `.tsx`/`.ts`.
  - Replace absolute/relative paths using the `@/` alias.
  - Fully resolve type signatures for user administration arrays, state modifiers, and server requests using typings from `src/types/index.ts`.
* **Success Criteria**:
  - `src/AdminComponents/` and `src/Layout/AdminLayout.jsx` are fully deleted.
  - `src/features/auth/` and `src/features/admin/` contain complete, strictly typed TypeScript implementations.

### 🏁 Milestone M4: Move & Convert Core Features
* **Goal**: Transition game modes, lessons, shop, inventory, achievements, dashboard, and settings to their respective `src/features/` subdirectories.
* **Tasks**:
  - **Game Modes**: Relocate files in `src/gameMode/` (13 `.jsx`/`.js` files, plus TSX models), `src/components/CodePlayground/`, and `src/components/DataqueriesPlayground/` to `src/features/gamemodes/`.
  - **Lessons**: Relocate components in `src/components/Lessons/` to `src/features/lessons/`.
  - **Shop**: Relocate components in `src/components/Shop/` to `src/features/shop/`.
  - **Inventory**: Relocate active items and timers in `src/ItemsLogics/` to `src/features/inventory/`.
  - **Achievements**: Relocate achievements utils in `src/components/Achievements Utils/`, achievements components in `src/components/Achievements/`, and data in `src/Data/Achievements_Data.jsx` to `src/features/achievements/`.
  - **Dashboard**: Relocate dashboard components in `src/components/Dashboard/` and settings components in `src/components/Settings/` to `src/features/dashboard/`.
  - Rename all converted `.jsx`/`.js` files to `.tsx`/`.ts`.
  - Remove all remaining `@ts-nocheck` blocks from `src/components/Shop/useBuyMutation.tsx`, `src/gameMode/*.tsx`, and all game mode components.
  - Fully type state hook wrappers, custom callback arguments, CodeMirror instances, and game status structures.
* **Success Criteria**:
  - `src/gameMode/`, `src/ItemsLogics/`, `src/components/Dashboard/`, `src/components/Settings/`, `src/components/Shop/`, `src/components/Lessons/`, `src/components/Achievements/`, and `src/components/LandingPage/` directories are deleted or empty.
  - Core features operate with 0 compilation overrides and fully strict TypeScript.

### 🏁 Milestone M5: Reusable Components & Clean-up
* **Goal**: Remove dead legacy directories and ensure reusable UI components are organized.
* **Tasks**:
  - Remove empty folders: `src/components/BackEnd_Data/`, `src/components/BackEnd_Functions/`, `src/components/Custom Hooks/`, `src/components/OpenAI Prompts/`, `src/components/layout/`, `src/components/ui/`, `src/ItemsLogics/Items-Store/`.
  - Verify that the remaining global UI components (`src/components/Navbar.tsx`, `src/components/Loading.tsx`, `src/components/Prefetcher.tsx`, `src/components/FullScreenLoader.tsx`) compile without errors.
* **Success Criteria**:
  - Dead folders are deleted.
  - The project tree is clean and respects `PROJECT.md` conventions.

### 🏁 Milestone M6: Fix Imports & E2E Validation
* **Goal**: Resolve all broken imports across pages, router configurations, and test suites, and execute verification checks.
* **Tasks**:
  - Update `src/App.tsx`, `src/pages/**/*.tsx` imports to point to new `src/features/...` paths using the `@/` alias.
  - Run the TypeScript compile check (`pnpm tsc --noEmit`) to verify 0 compilation errors across the entire codebase.
  - Run the complete E2E test suite (`pnpm test:e2e`) to ensure that MSW handlers successfully intercept and test code logic under mock scenarios.
* **Success Criteria**:
  - `pnpm tsc --noEmit` returns 0 compilation errors.
  - `pnpm test:e2e` completes with 100% test success.

### 🏁 Milestone M7: Adversarial Hardening
* **Goal**: Harden the codebase against edge cases and runtime faults using robust typescript annotations and E2E error-flow validation.
* **Success Criteria**:
  - Build succeeds and passes all test assertions.

---

## 3. Worker Execution Loop & Role Assignment

For each milestone, the orchestrator/implementer will coordinate via this loop:
1. **Explorer**: Statically analyze the milestone's target source files. Formulate type definitions, relocation routing, and path alias fixes.
2. **Worker**: Perform code relocations, file renames, strict TS conversions, and import alignment.
3. **Reviewer**: Verify compilation (`tsc --noEmit`), code style, layout compliance, and mock service alignments.
4. **Challenger**: Run E2E tests (`pnpm test:e2e`), ensuring MSW intercepts mock API scenarios (especially OpenAI responses).
5. **Forensic Auditor**: Validate project architecture layout compliance (no non-metadata files under `.agents/`, only source code changes in designated paths) and assert test integrity.

> ⚠️ **MANDATORY INTEGRITY WARNING FOR WORKERS**: Workers must never mock, bypass, or fake TypeScript compiler checks or E2E assertions. Using `// @ts-ignore` or `// @ts-nocheck` as a final solution is strictly forbidden. MSW handlers must mock real HTTP structures rather than forcing mock successes.

---

## 4. Verification Methods

The following actions must be executed to declare project restructuring completion:
1. **Type-Check**: Run `pnpm tsc --noEmit` to verify type completeness and clean compilation.
2. **E2E Testing**: Run `pnpm test:e2e` (or equivalent execution scripts) to ensure all tests pass.
3. **Product Build**: Run the Vite compiler (`pnpm build` or `npm run build`) to ensure the application packages for production without errors.
