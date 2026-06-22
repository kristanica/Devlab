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
| E1 | E2E Test Infra Setup | Install test runner (Vitest + JSDOM or Playwright) and configure `TEST_INFRA.md`. | None | PLANNED |
| E2 | Requirement-driven Tests | Implement Tier 1-4 tests (Auth, GameModes, Shop, Lessons, Inventory, Achievements). | E1 | PLANNED |
| E3 | Publish TEST_READY.md | Verify test suite coverage and generate `TEST_READY.md`. | E2 | PLANNED |

### Track 2: Implementation Track
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Prep & TypeScript Setup | Install `typescript`, `@types/*`, configure `tsconfig.json` and fix `src/main.jsx` -> `src/main.tsx`. | None | DONE |
| M2 | Global Services & Stores | Migrate & convert `src/Firebase/Firebase.js` to `src/services/firebase.ts`, migrate Zustand stores to `src/store/`, move hooks to `src/hooks/`. | M1 | IN_PROGRESS |
| M3 | Move & Convert Auth & Admin | Migrate login, register, reset password, content management, and user management to `src/features/auth` and `src/features/admin`. | M2 | PLANNED |
| M4 | Move & Convert Core Features | Migrate game modes, lessons, shop, inventory, achievements, and dashboard to `src/features/`. | M3 | PLANNED |
| M5 | Reusable Components Clean-up | Relocate reusable elements in `src/components/ui` or layout, remove dead code/empty folders. | M4 | PLANNED |
| M6 | Fix Imports & E2E Validation | Run `tsc --noEmit`, resolve all import issues, pass all tests in `TEST_READY.md`. | M5, E3 | PLANNED |
| M7 | Adversarial Hardening | Phase 2 coverage hardening using generated adversarial tests. | M6 | PLANNED |

## Interface Contracts
### global store ↔ components/features
- `useInventoryStore`: React hook providing inventory state and mutations.
- `useRewardStore`: React hook providing current rewards state.

### firebase service ↔ features
- `src/services/firebase.ts`: Exported `db` (Firestore), `auth` (FirebaseAuth), and initialization wrappers.

## Project Constraints
- **OpenAI/MSW Constraint**: OpenAI API keys/credits are depleted. The E2E Testing Track MUST strictly use MSW (Mock Service Worker) to mock all OpenAI API responses during testing. Live integration tests hitting the actual OpenAI API endpoints are strictly prohibited.
