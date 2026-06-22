# E2E Test Infrastructure Design Analysis

## 1. Feature Map & Codebase Locations

Currently, the Devlab codebase is in a pre-restructured state. Below is a mapping of the core application features, their current locations, and their proposed locations after the feature-based restructuring (Tracks 1 and 2):

| Feature | Current Source Locations | Proposed Feature-Based Locations |
| :--- | :--- | :--- |
| **Authentication** | `src/pages/Login.tsx`<br>`src/components/Login/` (LoginForm, RegisterForm, AuthInteractiveUI, useAuthLogic)<br>`src/components/` (ForgotPassword, ForgotPasswordLink, ResetPassword, VerifyEmail, AuthActionHandler) | `src/features/auth/` (Login, Register, Verification, Password Reset components, forms, types, hooks) |
| **Game Modes** | `src/gameMode/` (BrainBytes, BugBust, CodeCrafter, CodeRush)<br>`src/gameMode/GameModes_Components/`<br>`src/gameMode/GameModes_Popups/`<br>`src/gameMode/GameModes_Utils/` | `src/features/gamemodes/` (BrainBytes, BugBust, CodeCrafter, CodeRush modes, popups, code runner integration, stores) |
| **Shop** | `src/pages/Shop.tsx`<br>`src/components/Shop/` (ShopHeader, ShopItemGrid, useBuyMutation)<br>`src/components/BackEnd_Functions/purchaseItem.jsx` | `src/features/shop/` (Shop grid, item selection, purchase endpoints integration) |
| **Lessons** | `src/pages/Lessons/` (CssLessons, DataLessons, HtmlLessons, JavaScriptLessons, LessonPage) | `src/features/lessons/` (Curriculum outlines, unit cards, lesson layout, lesson content viewer) |
| **Inventory** | `src/ItemsLogics/` (ItemsUse, BrainFilter, CodeWhisper, CoinSurge, ErrorShield, useCodeRushTimer)<br>`src/ItemsLogics/Items-Store/useInventoryStore.jsx` | `src/features/inventory/` (Inventory vault drawer, item logic wrappers, active buff indicators) |
| **Achievements** | `src/pages/Achievements.tsx`<br>`src/components/Achievements/`<br>`src/components/Custom Hooks/UnlockAchievement.jsx`<br>`src/components/Custom Hooks/useUserAchievements.jsx` | `src/features/achievements/` (Achievements showcase, progress counters, claiming rewards) |
| **Dashboard** | `src/pages/Dashboard.tsx`<br>`src/components/Dashboard/` | `src/features/dashboard/` (User stats, recent history, current leveling status, skill charts) |
| **Landing** | `src/pages/LandingPage.tsx`<br>`src/components/LandingPage/` | `src/features/landing/` (Public index page, parallax marketing cards, lighting elements) |
| **Admin** | `src/AdminComponents/` (AdminNavbar, ContentManagement, UserManagement, edit forms, backend functions) | `src/features/admin/` (Content and user management grids, add/edit modals) |

---

## 2. Integration Strategy: JSDOM Execution under Vitest

To run opaque-box E2E testing cleanly under Vitest + JSDOM, we must address the application's client-side SDK usage and backend dependencies. Since we are restricted to a local environment (`CODE_ONLY` network mode), we will mock these layers using in-memory substitutes that mimic real browser/server interactions.

### A. Authentication & Firestore (Firebase SDK)
* **Problem**: The app imports Firebase Auth and Firestore from `firebase/auth` and `firebase/firestore`. These libraries make network requests to Firebase servers.
* **Solution**: In the Vitest setup file, we intercept these imports using `vi.mock("firebase/auth")` and `vi.mock("firebase/firestore")`. We will initialize a global, in-memory mock database object `global.mockDb` that stores user documents, progress, and inventory states.
* **Auth Mocking**: Simulate `signInWithEmailAndPassword` and `createUserWithEmailAndPassword` to inspect and write to this in-memory mock database. Mock `auth.currentUser` reactively, and fire registered `onAuthStateChanged` listeners whenever login or logout actions are invoked.
* **Firestore Mocking**: Implement mock versions of `doc`, `getDoc`, `setDoc`, `updateDoc`, `deleteDoc`, `collection`, `getDocs`, and `onSnapshot`. When `updateDoc` is called (e.g. by `useInventoryStore` when using an item), it updates the local in-memory DB and calls registered `onSnapshot` listeners to propagate updates back to the UI.

### B. Global State (Zustand)
* **Problem**: Zustand stores (`useInventoryStore`, `useAttemptStore_Local`, etc.) carry state across components, and some are persisted to `localStorage`.
* **Solution**:
  - JSDOM natively implements `localStorage`, which will allow `useAttemptStore_Local` to persist automatically.
  - To prevent tests from leaking state to one another, the global setup file will clear `localStorage` (`localStorage.clear()`) and clear the in-memory mock database before each test.
  - Each Zustand store's state will be reset. (We can expose a reset utility or simply remount the `<App />` component in a fresh state context for each test).

### C. Router (React Router DOM)
* **Problem**: The application uses React Router for page routing. Standard router testing in browser environments uses URLs, but JSDOM does not handle full URL-based navigations nicely.
* **Solution**:
  Since `<BrowserRouter>` is instantiated in `main.jsx` and **not** inside `App.tsx`, we can mount the `App` component wrapped inside React Router's `<MemoryRouter>` during our E2E tests. This allows tests to:
  - Programmatically set the initial path (e.g. `initialEntries={['/Login']}`).
  - Transition pages transparently when buttons are clicked (which triggers standard `useNavigate` calls).
  - Assert on URL changes or route matching inside DOM trees.

### D. REST APIs & OpenAI (Backend Calls)
* **Problem**: The frontend uses `fetch` and `axios` to trigger server actions like `purchaseItem`, `gameOver`, or evaluate code via OpenAI prompts on `${import.meta.env.VITE_BACK_END}`.
* **Solution**:
  Implement Mock Service Worker (MSW) or a mock `global.fetch` spy in the setup file. MSW is preferred for opaque-box testing because it intercepts network requests at the API layer.
  - Intercept `/fireBase/purchaseItem` and deduct coins in the mock Firestore database.
  - Intercept `/openAI/codePlaygroundEval` to return simulated compiler/validator outputs (e.g., success, compilation errors).

### E. Non-JSDOM Web APIs (Audio)
* **Problem**: The app preloads and plays sounds (`DevlabSoundHandler`) using `new Audio()`. JSDOM does not support the HTML Audio API.
* **Solution**:
  Inject a mock `Audio` class into the JSDOM global context in `setup.ts`:
  ```typescript
  global.Audio = class {
    currentTime = 0;
    preload = "";
    play() { return Promise.resolve(); }
    pause() {}
    load() {}
  } as any;
  ```
  Also, mock `lottie-react` to return a simple placeholder component, avoiding canvas library dependency errors.

---

## 3. Test Runner Setup

We will configure Vitest to isolate E2E testing from standard unit/dev configs.

### A. Directory Layout
Place E2E testing files inside a dedicated `tests/e2e/` folder:
```
tests/
└── e2e/
    ├── setup.ts               # Setup file for global hooks & JSDOM mocks
    ├── mocks/
    │   ├── mockFirebase.ts    # In-memory mock database & Firebase SDK mock
    │   └── handlers.ts        # MSW request handlers (Mock backend and OpenAI)
    ├── auth/
    │   └── auth.test.tsx      # Auth E2E tests (Login, register, reset, verification)
    ├── lessons/
    │   └── lessons.test.tsx   # Lesson selection, navigation, and stage loading
    ├── shop/
    │   └── shop.test.tsx      # Shop purchases, inventory vault, and buff usage
    ├── gamemodes/
    │   └── gamemodes.test.tsx # BrainBytes, BugBust, CodeCrafter, CodeRush playthroughs
    └── achievements/
        └── achievements.test.tsx # Milestone progression and reward claiming
```

### B. Dependencies Configuration (`package.json`)
The following devDependencies must be added to the project:
* `vitest` (Test runner)
* `jsdom` (Test environment)
* `@testing-library/react` (React testing primitives)
* `@testing-library/jest-dom` (DOM matchers like `toBeInTheDocument()`)
* `@testing-library/user-event` (User event simulators)
* `msw` (Network requests mocking)
* `@vitest/coverage-v8` (Coverage generation)

### C. Vitest E2E Configuration (`vitest.config.e2e.ts`)
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    name: "e2e",
    globals: true,
    environment: "jsdom",
    include: ["tests/e2e/**/*.test.{ts,tsx,js,jsx}"],
    setupFiles: ["tests/e2e/setup.ts"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*"],
    },
  },
});
```

---

## 4. E2E Test Suite (Tier 1-4 Category-Partition Plan)

### Tier 1: Feature Coverage (Happy Path)
1. **Auth Login**: Boot at `/Login`. Fill valid email (`user@devlab.edu`) and password. Submit form. Intercept authentication token lookup. Verify navigation to `/Main` and rendering of Dashboard.
2. **Auth Registration**: Fill register form (username, email, passwords). Submit. Verify verification email success toast appears. Verify navigation swaps to login mode.
3. **Lessons Navigation**: Navigate to `/Main/Lessons/Html`. Verify that lesson panels list "Lesson1" and Stage buttons display correctly. Click "Level 1" and verify loading.
4. **Game Modes Progression**: Simulate playing BugBust. Choose options, answer correctly, and submit. Verify completion popup renders showing EXP gained.
5. **Shop Purchases**: Navigate to `/Main/Shop`. Click "Buy" on "Error Shield" (5 coins). Intercept `/fireBase/purchaseItem`. Confirm coin balance decrements, and inventory lists the item.
6. **Inventory Vault Usage**: Open inventory vault from Dashboard. Click "Use Item" on "Error Shield". Verify Zustand state updates and active buff count increases.
7. **Achievements Progression**: Navigate to `/Main/Achievements`. Verify that an unlocked achievement displays a "Claim Reward" button. Click claim and verify coin balance increases.

### Tier 2: Boundary & Corner Cases
1. **Auth Verification Block**: User logs in with correct credentials, but `emailVerified` is `false`. Verify that authentication fails, signs out, and triggers the error toast: *"Your email has not been verified yet."*
2. **Account Suspension**: User logs in. Mock database indicates user is suspended (`isSuspend: true`). Verify that authentication triggers: *"Your account has been suspended."*
3. **Registration Validation Limits**:
   - Mismatched passwords on signup. Assert that toast displays *"Passwords do not match!"*.
   - Invalid email string. Assert that validation blocks submit.
4. **Game Heart Depletion**: Play CodeRush. Submit incorrect answers repeatedly. Confirm that heart count decrements from 3 to 0. Verify that `gameOver` Zustand state switches to `true`, and the "Game Over" screen overlays.
5. **Shop Coin Boundaries**:
   - **Exact Balance**: User has exactly 5 coins, buys item costing 5 coins. Verify successful purchase and final balance of 0.
   - **Insufficient Balance**: User has 4 coins, tries to buy item costing 5 coins. Verify "Buy" is disabled or purchase triggers error message.
6. **Buff Stacking Restrictions**: Attempt to consume "Error Shield" when a buff of that type is already active. Verify that state restricts duplicate buffers.
7. **Zero Quantity Clean-up**: Consume the last "Extra Life" item (quantity = 1). Verify that the document path is deleted from the user's Inventory in the mock Firestore database.

### Tier 3: Cross-Feature Combinations
1. **Inventory Buff ↔ Game Mode Heart Guard**:
   - Activate "Error Shield" from inventory vault.
   - Enter BugBust game mode.
   - Submit a wrong answer.
   - Verify that instead of losing a heart (stay at 3/3), the "Error Shield" buff is consumed/removed, and a notification appears.
2. **Inventory Buff ↔ Reward Modifier (Coin Surge)**:
   - Activate "Coin Surge" buff.
   - Complete HTML Stage 1.
   - Assert that the completed level yields double coins (e.g. 20 instead of 10) in both local Zustand balance and the mock Firestore write.
3. **Level Progression ↔ Achievement Unlock ↔ Dashboard Update**:
   - User completes JS Lesson 2.
   - Progress increments and hits the boundary for "JS Journeyman" achievement.
   - Navigate to Achievements page; verify "JS Journeyman" is now claimable.
   - Claim reward, go to Dashboard, confirm EXP bar and coins are updated.
4. **Admin Suspend ↔ Active User Navigation**:
   - Simulate active user logged in on Dashboard.
   - Under-the-hood mock event triggers account suspension (admin writes `isSuspend: true`).
   - On the user's next route change (e.g. navigating to `/Main/Shop`), verify that auth state change detects the suspension, logs out the user, and redirects back to `/Login`.

### Tier 4: Real-World Workload Scenarios
1. **New User Happy Path (Onboarding Journey)**:
   - User registers -> receives email verification.
   - Mock verification complete -> User logs in successfully.
   - User navigates to HTML Lessons -> plays Lesson 1, Stage 1 (BrainBytes).
   - Completes stage -> gains 50 EXP and 10 coins.
   - Opens Shop -> buys "Error Shield" for 5 coins.
   - Verifies coin balance is 5, and inventory vault shows "Error Shield" (1).
   - Logs out -> attempts to access `/Main` and gets redirected back to `/Login`.
2. **Clutch Recovery Playthrough Journey**:
   - User logs in, enters a JavaScript CodeRush game mode.
   - Fails first two questions (hearts drop to 1/3).
   - User pauses/exits to Dashboard, enters Inventory, and consumes "Extra Life".
   - Hearts increase to 2/3.
   - Re-enters game mode, answers the final question correctly.
   - Completes the level, triggers the "JS Hero" achievement.
   - Navigates to Achievements, claims 100 coins.
   - Verifies navigation bar updates to reflect new coin balance.
