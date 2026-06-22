# Changes Report

This document records the exact modifications and file additions made to support the E2E Testing Infrastructure (Milestone E1) in Devlab.

## Files Created

### 1. `vitest.config.e2e.ts`
- **Location**: Project Root
- **Purpose**: Defines the Vitest runner configuration specifically isolated for E2E testing.
- **Key Settings**:
  - Name: `e2e`
  - Environment: `jsdom`
  - Setup files: `tests/e2e/setup.ts`
  - Includes: `tests/e2e/**/*.test.{ts,tsx,js,jsx}`
  - Alias: `@` mapping to `./src`
  - Coverage: V8 provider, html/json/text report formats

### 2. `tests/e2e/mocks/mockFirebase.ts`
- **Location**: `tests/e2e/mocks/mockFirebase.ts`
- **Purpose**: Mocks Firebase SDK services in-memory to prevent actual network calls.
- **Key Features**:
  - `mockDb` in-memory state tracking for users, inventory, and progress.
  - Mocked Firebase Auth SDK (sign in, sign up, signOut, token results, persistence).
  - Mocked Firestore SDK (`getDoc`, `setDoc`, `updateDoc`, `deleteDoc`, `increment`, `onSnapshot`).

### 3. `tests/e2e/mocks/handlers.ts`
- **Location**: `tests/e2e/mocks/handlers.ts`
- **Purpose**: Intercepts HTTP network requests using Mock Service Worker (MSW).
- **Mocks Included**:
  - `POST */fireBase/purchaseItem`: Returns purchase success.
  - `POST */openAI/codePlaygroundEval`: Returns successful OpenAI code evaluation.
  - `GET */fireBase/getAllData/:subject`: Returns mock lessons, levels, and stages structured data.

### 4. `tests/e2e/setup.ts`
- **Location**: `tests/e2e/setup.ts`
- **Purpose**: Bootstraps the testing environment before execution.
- **Key Configurations**:
  - Configures and starts the MSW Node server.
  - Sets up global mock objects like `Audio` element, `lottie-react`, and `@uiw/react-codemirror` (rendering it as a standard textarea for simplified validation).
  - Resets handlers, mock db, and localStorage between tests.

### 5. `tests/e2e/sanity.test.tsx`
- **Location**: `tests/e2e/sanity.test.tsx`
- **Purpose**: A basic sanity check to verify the test runner works properly.

### 6. `TEST_INFRA.md`
- **Location**: Project Root
- **Purpose**: Provides developer-facing documentation on how to run, write, and configure E2E tests in Devlab.

## Files Modified

### `package.json`
- **Scripts Added**:
  - `"test:e2e": "vitest run -c vitest.config.e2e.ts"`
  - `"test:e2e:watch": "vitest -c vitest.config.e2e.ts"`
  - `"test:e2e:coverage": "vitest run -c vitest.config.e2e.ts --coverage"`
- **DevDependencies Added**:
  - `@testing-library/jest-dom` (^6.6.3)
  - `@testing-library/react` (^16.2.0)
  - `@testing-library/user-event` (^14.6.1)
  - `@vitest/coverage-v8` (^2.1.8)
  - `jsdom` (^26.0.0)
  - `msw` (^2.7.0)
  - `vitest` (^2.1.8)
