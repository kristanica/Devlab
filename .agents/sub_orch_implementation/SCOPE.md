# Scope: Implementation Track

## Architecture
- Restructuring of the Devlab React application from component-heavy layout to a feature-based architecture in `src/features/`.
- Conversion of all `.js`/`.jsx` source files to strict TypeScript (`.ts`/`.tsx`).
- Integration of global Zustand state stores (`src/store/`), services (`src/services/`), and custom hooks (`src/hooks/`).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Prep & TypeScript Setup | Install `typescript`, `@types/*` dependencies, initialize/configure `tsconfig.json`, configure Vite config, and rename/convert `src/main.jsx` to `src/main.tsx`. | None | DONE |
| M2 | Global Services & Stores | Migrate and convert `src/Firebase/Firebase.js` to `src/services/firebase.ts`, migrate Zustand stores to `src/store/`, and move custom hooks to `src/hooks/`. | M1 | PLANNED |
| M3 | Move & Convert Auth & Admin | Migrate login, registration, password resets, content management, and user management components/logic to `src/features/auth/` and `src/features/admin/`. | M2 | PLANNED |
| M4 | Move & Convert Core Features | Migrate game modes (BrainBytes, BugBust, CodeCrafter, CodeRush), lessons, shop, inventory, achievements, and dashboard to `src/features/`. | M3 | PLANNED |
| M5 | Reusable Components Clean-up | Relocate reusable UI elements (e.g. `src/components/ui` or layout, navbar, buttons, modals) and remove dead code or empty folders. | M4 | PLANNED |
| M6 | Fix Imports & E2E Validation | Wait for E2E testing track to publish `TEST_READY.md`. Run `tsc --noEmit`, resolve all import/compilation issues, run build/tests, and pass all E2E tests. | M5 | PLANNED |
| M7 | Adversarial Hardening | Phase 2 coverage hardening using generated adversarial tests. | M6 | PLANNED |

## Interface Contracts
### global store ↔ components/features
- `useInventoryStore`: React hook providing inventory state and mutations.
- `useRewardStore`: React hook providing current rewards state.

### firebase service ↔ features
- `src/services/firebase.ts`: Exported `db` (Firestore), `auth` (FirebaseAuth), and initialization wrappers.
