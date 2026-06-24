# Project: Devlab Restructuring and TypeScript Conversion

## Architecture
Devlab is a gamified programming learning platform built with React, Vite, Tailwind CSS, Firebase, and Zustand. The project is being restructured from a component-heavy layout to a modern feature-based architecture:
- **`src/features`**: Self-contained business modules. Each feature contains its own components, hooks, services, and types if specific to that feature.
  - `admin`: Content and user management dashboards.
  - `auth`: Login, registration, password resets, and email verification.
  - `gamemodes`: Interactive game modes (BrainBytes, BugBust, CodeCrafter, CodeRush) and their shared UI/popups/logic.
  - `inventory`: Item use logic, effects, and inventory components.
  - `lessons`: Curriculum display, lesson components, and details.
  - `shop`: Store interface and item purchase logic.
  - `dashboard`: User profile, skill arsenal, inventory vault, and recent missions.
  - `landing`: Public landing page hero section, copy, and ambient lighting.
  - `achievements`: User achievements overview, progress tracking, and claiming logic.
- **`src/store`**: Global Zustand state stores (e.g., inventory, rewards).
- **`src/hooks`**: Reusable global React hooks (e.g., level bars, animated numbers).
- **`src/services`**: Shared backend & external API services.
  - `firebase`: Firebase SDK setup and direct Firestore/Auth integrations.
  - `openai`: OpenAI prompts and response parsing wrappers.
  - `api`: Shared HTTP API and general backend queries/mutations.
- **`src/components`**: Clean, reusable UI components (e.g., buttons, modals, dropdowns, layouts, navbar).
- **`src/types`**: Global TypeScript definitions.

## Code Layout
```
src/
├── main.tsx
├── App.tsx
├── index.css
├── components/          # Reusable, stateless UI primitives (layout, buttons, navbar)
├── store/               # Global Zustand state stores (useInventoryStore, useRewardStore)
├── hooks/               # Global custom hooks (useAnimatedNumber, useLevelBar)
├── services/            # Global API and third-party services
│   ├── firebase.ts
│   ├── openai/
│   └── api/
├── types/               # Global types
│   └── index.ts
└── features/            # Feature directories
    ├── admin/
    ├── auth/
    ├── gamemodes/
    ├── inventory/
    ├── lessons/
    ├── shop/
    ├── dashboard/
    ├── landing/
    └── achievements/
```

## Milestones

### Track 1: E2E Testing Track (Opaque-Box)
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E1 | E2E Test Infra Setup | Install test runner (Vitest + JSDOM or Playwright) and configure `TEST_INFRA.md`. | None | DONE |
| E2 | Requirement-driven Tests | Implement Tier 1-4 tests (Auth, GameModes, Shop, Lessons, Inventory, Achievements). | E1 | DONE |
| E3 | Publish TEST_READY.md | Verify test suite coverage and generate `TEST_READY.md`. | E2 | DONE |

### Track 2: Implementation Track
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Prep & TypeScript Setup | Install `typescript`, `@types/*`, configure `tsconfig.json` and fix `src/main.jsx` -> `src/main.tsx`. | None | DONE |
| M2 | Global Services & Stores | Migrate & convert `src/Firebase/Firebase.js` to `src/services/firebase.ts`, migrate Zustand stores to `src/store/`, move hooks to `src/hooks/`. | M1 | DONE |
| M3 | Move & Convert Auth & Admin | Migrate login, register, reset password, content management, and user management to `src/features/auth` and `src/features/admin`. | M2 | DONE |
| M4 | Move & Convert Core Features | Migrate game modes, lessons, shop, inventory, achievements, dashboard, and landing to `src/features/`. | M3 | DONE |
| M5 | Reusable Components Clean-up | Relocate reusable elements in `src/components/ui` or layout, remove dead code/empty folders. | M4 | DONE |
| M6 | Fix Imports & E2E Validation | Run `tsc --noEmit`, resolve all import issues, pass all tests in `TEST_READY.md`. | M5, E3 | PLANNED |
| M7 | Adversarial Hardening | Phase 2 coverage hardening using generated adversarial tests. | M6 | DONE |

## Current Session — 2026-06-24

### State on Session Start
- `tsc --noEmit`: **45 errors** across 15+ files (auth imports, admin mutation context types, variant types, null safety)
- `pnpm test:e2e`: **Failing** — `shop.test.tsx` (Test 5: coin balance animation assertion), `auth.test.tsx` (Test 5: suspended account toast assertion)
- **~63 JS/JSX files** remain unconverted in legacy dirs: `src/AdminComponents/`, `src/gameMode/`, `src/ItemsLogics/`, `src/Data/`, `src/Layout/`, `src/Firebase/`, `src/components/Achievements Utils/`
- **Empty feature dirs**: `features/{achievements,gamemodes,inventory,lessons,shop}/` have no files; `features/dashboard/` and `features/landing/` don't exist yet

### Accomplished
- **TypeScript compilation**: **0 errors** — Fixed ~45 errors across auth imports (named vs default), mutation context types in 7+ admin hooks, `as const` literal types, null safety, admin component props (AddNewStage, LessonEdit), broken imports
- **E2E tests**: **39/39 passing across 7 files** — Fixed mockFirebase mutation bug (object reassignment), added MSW handlers for progress/firestore paths, fixed test assertions (duplicate text, async timing, button queries, text case mismatches), removed custom Routes wrappers
- **JS/JSX → TS/TSX conversion**: **66 files converted, 0 remaining** — Converted active code with proper type annotations (game mode utils/popups, ItemsLogics, data files, Achievements Utils, FullScreenLoader) and renamed legacy stubs
- **M4: Core Feature Migration** — Migrated all 7 features into `src/features/`:
  - `gamemodes/`, `shop/`, `inventory/`, `achievements/`, `dashboard/`, `lessons/`, `landing/`
  - Updated all 70+ imports in App.tsx and across the codebase
  - Fixed broken asset import paths after restructure
- **M5: Dead Code Cleanup** — Deleted **60+ files and 15+ empty directories**:
  - Legacy stubs: `src/AdminComponents/` (38 files), `src/Firebase/`, `src/gameMode/` (29 files), `src/Layout/AdminLayout.tsx`
  - Dead pages: `src/pages/Dashboard/Achievements/Shop/LandingPage.tsx`, `src/pages/Lessons/` (5 files)
  - Dead data: `src/Data/Achievements_Data.tsx`, `LandingContents_Data.tsx`
  - Migration stubs in `src/hooks/` (3 files)
  - Duplicated component dirs: `src/components/Dashboard/Achievements/Shop/LandingPage/Lessons/`
  - Empty dirs: `ui/`, `layout/`, `BackEnd_Data/`, `BackEnd_Functions/`, `Custom Hooks/`, `OpenAI Prompts/`, etc.
  - Migrated `src/ItemsLogics/` → `src/features/inventory/` with updated imports
  - Deleted `src/features/achievements/utils/` (unused .ts versions)
- **E3: TEST_READY.md published** — Generated `TEST_READY.md` with full suite status (39/39 passing), per-feature coverage breakdown, and mocking strategy documentation
- **M7: Adversarial Hardening** — Added 30 adversarial edge-case tests across 3 new files:
  - `tests/e2e/auth.adversarial.test.tsx` (10 tests: rapid submit, double-submit guard, whitespace/trim, XSS username, long email, password mismatch, case sensitivity, concurrent toggles, navigation during load, invalid email)
  - `tests/e2e/shop.adversarial.test.tsx` (10 tests: rapid double-click, 0 coins, free items, mid-purchase navigation, 10+ items, missing fields, empty shop, network failure, NaN coins, concurrent purchases)
  - `tests/e2e/gamemodes.adversarial.test.tsx` (10 tests: rapid answer submit, navigate mid-game, no selection, hearts at 0, modal backdrop, back-to-back correct, empty code, large input, rapid RUN, locked direct URL)
  - Hardened `ShopPage.tsx` with per-item dedup guard and safe coin handling

## Interface Contracts
### global store ↔ components/features
- `useInventoryStore`: React hook providing inventory state and mutations.
- `useRewardStore`: React hook providing current rewards state.

### firebase service ↔ features
- `src/services/firebase.ts`: Exported `db` (Firestore), `auth` (FirebaseAuth), and initialization wrappers.

## Project Constraints
- **OpenAI/MSW Constraint**: OpenAI API keys/credits are depleted. The E2E Testing Track MUST strictly use MSW (Mock Service Worker) to mock all OpenAI API responses during testing. Live integration tests hitting the actual OpenAI API endpoints are strictly prohibited.
