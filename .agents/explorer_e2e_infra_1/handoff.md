# Handoff Report — E2E Testing Framework Design

## 1. Observation
We observed the following characteristics in the Devlab codebase:
* **Firebase SDK Imports**: The client-side database and auth actions import directly from Firebase SDK modules:
  * In `src/components/Login/useAuthLogic.ts` lines 4-11:
    ```typescript
    import {
      signInWithEmailAndPassword,
      signOut,
      setPersistence,
      browserLocalPersistence,
      browserSessionPersistence,
      createUserWithEmailAndPassword,
      sendEmailVerification,
    } from "firebase/auth";
    ```
* **Routing Setup**: The app routing lives in `src/App.tsx` and is not coupled to `<BrowserRouter>` directly inside `App.tsx`:
  * In `src/App.tsx` lines 92-181:
    ```tsx
    <Routes>
      <Route path="/" element={...} />
      <Route path="/Login" element={...} />
      <Route path="/Main" element={...}>
        ...
      </Route>
      ...
    </Routes>
    ```
  * In `src/main.jsx` lines 8-10:
    ```jsx
    <BrowserRouter>
      <App />
    </BrowserRouter>
    ```
* **REST/OpenAI Integrations**: Remote data querying and mutations use fetch/axios pointing to a backend server:
  * In `src/components/BackEnd_Data/useFetchUserData.jsx` lines 14-16:
    ```jsx
    const res = await fetch(`
    ${import.meta.env.VITE_BACK_END}/fireBase/getSpecificUser/${uid}`, {
    ```
* **HTML Audio API Usage**: Audio files are preloaded using the HTML `Audio` constructor:
  * In `src/components/Custom Hooks/DevlabSoundHandler.jsx` line 22:
    ```jsx
    const audio = new Audio(file);
    ```
* **CodeMirror Editor**: Text input editing relies on CodeMirror:
  * In `src/pages/CodePlayground.tsx` lines 45-51:
    ```tsx
    <PlaygroundEditor 
      tabs={tabs} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      code={code} 
      onChange={onChange} 
    />
    ```
* **Current Feature Restructuring Status**: We observed that the `src/features/` subdirectories (`admin`, `auth`, `gamemodes`, `inventory`, `lessons`, `shop`) are currently present but empty. Existing feature code resides in the legacy directory locations (`src/pages/`, `src/components/`, `src/gameMode/`, `src/ItemsLogics/`).

---

## 2. Logic Chain
1. Since the application imports the Firebase Auth and Firestore SDK client-side (Obs 1), running opaque-box E2E tests directly in JSDOM would trigger network requests. Under `CODE_ONLY` network mode, these will fail. Mocking the Firebase SDK modules via Vitest `vi.mock` is necessary to ensure zero external calls.
2. Because the application utilizes both client-side Firestore writes and HTTP requests to `VITE_BACK_END` (Obs 1, Obs 3), we need a dual mocking layer: an in-memory database mock (for Firestore) and MSW (for the backend endpoints).
3. Because `<BrowserRouter>` is wrapped in `main.jsx` and not in `App.tsx` (Obs 2), E2E tests can render the `<App />` component in isolation by wrapping it in `<MemoryRouter>`. This gives the test suite full control over routing entries and navigation events.
4. Because the HTML5 Audio API (Obs 4) is not implemented in JSDOM, tests running in JSDOM will crash when `new Audio()` is executed. Overriding `global.Audio` in the Vitest environment setup is required.
5. Because CodeMirror editor (Obs 5) performs layout computations and depends on layout features not supported by JSDOM, it causes test rendering failures. Mocking it with a simple React `<textarea>` that triggers `onChange` keeps the test suite stable.
6. Since the current features are in the process of migration (Obs 6), E2E tests must target the current files now, but the testing configuration must be general enough that it automatically handles imports as they migrate (via Path Aliases and generic feature test suites).

---

## 3. Caveats
* **Admin Verification**: The admin functions (e.g. `UserManagement`, `ContentManagement`) perform operations that are highly coupled to backend claims. MSW must accurately mock JWT token evaluations or user credentials checks, otherwise the page will render a verification error.
* **Canvas Mocks**: Lottie animations require a mock in `setup.ts` to prevent DOM warnings since JSDOM lacks a full canvas implementation. We assumed that mocking the `lottie-react` library directly is acceptable.

---

## 4. Conclusion
We conclude that:
* Vitest + JSDOM is the most suitable environment for this application's opaque-box testing because it integrates cleanly with MSW, allows fast in-memory mocking of the Firebase SDK, and runs in sub-second times without spin-up overhead.
* A dedicated E2E configuration `vitest.config.e2e.ts` should be created to prevent E2E tests from interfering with unit/integration configs.
* An in-memory mock database and MSW server configuration should be placed in `tests/e2e/setup.ts` to handle both client-side and server-side request intercepts.

---

## 5. Verification Method
To verify the proposed design:
1. Review the configurations and mocks drafted in `C:\Users\lain\Documents\code\Devlab\.agents\explorer_e2e_infra_1\TEST_INFRA_draft.md`.
2. Inspect the codebase details outlined in `C:\Users\lain\Documents\code\Devlab\.agents\explorer_e2e_infra_1\analysis.md`.
3. The design is invalidated if the implementation agent cannot successfully run the tests using `vitest run -c vitest.config.e2e.ts` or if mock state escapes between test files.
