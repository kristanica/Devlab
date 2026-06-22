# Devlab E2E Testing Infrastructure

This document outlines the architecture, setup, directory structure, mock strategies, and execution commands for the end-to-end (E2E) testing framework in Devlab. 

The test runner is configured to use **Vitest** + **JSDOM** + **React Testing Library**, running in complete network isolation (`CODE_ONLY` mode friendly). It is fully decoupled from the dev/prod build configurations.

---

## 1. Directory Structure

All E2E tests, configuration files, and mocks are located within a dedicated directory at the root of the workspace to isolate them:

```
tests/
└── e2e/
    ├── setup.ts                 # Pre-test global setups, spies, and environment overrides
    ├── mocks/
    │   ├── mockFirebase.ts      # In-memory mock database & Firebase SDK mock
    │   └── handlers.ts          # MSW network interceptors (rest & OpenAI endpoints)
    ├── auth/
    │   └── auth.test.tsx        # Registration, Login, and Password resets
    ├── lessons/
    │   └── lessons.test.tsx     # Curriculum navigation & Level select
    ├── shop/
    │   └── shop.test.tsx        # Item purchasing & Inventory buff activation
    ├── gamemodes/
    │   └── gamemodes.test.tsx   # Interactive BrainBytes, BugBust, CodeCrafter, CodeRush
    └── achievements/
        └── achievements.test.tsx # Progress thresholds & claiming rewards
```

---

## 2. Package Installations

The following development packages are required for the E2E framework. Run the following command to install them:

```bash
pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw @vitest/coverage-v8
```

*Note: `@testing-library/react` v16+ should be used to support the project's React 19 dependency.*

---

## 3. Configuration Files

### A. Vitest Config (`vitest.config.e2e.ts`)
Create this file at the project root to run the E2E track isolated from standard test configs:

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

### B. NPM Scripts (`package.json`)
Add the following commands under the `"scripts"` section of `package.json`:

```json
"scripts": {
  "test:e2e": "vitest run -c vitest.config.e2e.ts",
  "test:e2e:watch": "vitest -c vitest.config.e2e.ts",
  "test:e2e:coverage": "vitest run -c vitest.config.e2e.ts --coverage"
}
```

---

## 4. Mocking Strategy

The application relies on external backend services and Firebase SDKs. To run opaque-box E2E tests in a local environment:

### A. Firebase SDKs Mocking (`tests/e2e/mocks/mockFirebase.ts`)
We mock `firebase/auth`, `firebase/firestore`, and `firebase/storage` in-memory.

```typescript
import { vi } from "vitest";

// In-Memory Database State
export interface MockDatabase {
  users: Record<string, any>;
  inventory: Record<string, Record<string, any>>;
  progress: Record<string, Record<string, any>>;
}

export let mockDb: MockDatabase = {
  users: {},
  inventory: {},
  progress: {},
};

// Reset database state between tests
export const resetMockDb = () => {
  mockDb = {
    users: {},
    inventory: {},
    progress: {},
  };
};

// Mock Auth State
export let mockCurrentUser: any = null;
let authStateListeners: Array<(user: any) => void> = [];

export const setMockUser = (user: any) => {
  mockCurrentUser = user;
  authStateListeners.forEach((listener) => listener(user));
};

// Mock Firebase Auth
vi.mock("firebase/auth", () => {
  return {
    getAuth: () => ({
      currentUser: mockCurrentUser,
      onAuthStateChanged: (callback: (user: any) => void) => {
        authStateListeners.push(callback);
        callback(mockCurrentUser);
        return () => {
          authStateListeners = authStateListeners.filter((l) => l !== callback);
        };
      },
      signOut: async () => {
        setMockUser(null);
        return Promise.resolve();
      },
      setPersistence: async () => Promise.resolve(),
    }),
    signInWithEmailAndPassword: async (auth: any, email: string) => {
      const matchedUser = Object.values(mockDb.users).find((u) => u.email === email);
      if (!matchedUser) {
        throw { code: "auth/invalid-credential" };
      }
      const userObj = {
        uid: matchedUser.uid,
        email: matchedUser.email,
        emailVerified: matchedUser.emailVerified ?? true,
        getIdTokenResult: async () => ({ claims: { role: matchedUser.role || "user" } }),
        getIdToken: async () => "mock-token-id",
        reload: async () => Promise.resolve(),
      };
      setMockUser(userObj);
      return { user: userObj };
    },
    createUserWithEmailAndPassword: async (auth: any, email: string) => {
      const uid = "user_" + Math.random().toString(36).substr(2, 9);
      const newUser = { uid, email, role: "user", emailVerified: true };
      mockDb.users[uid] = newUser;
      const userObj = {
        uid,
        email,
        emailVerified: true,
        getIdTokenResult: async () => ({ claims: { role: "user" } }),
        getIdToken: async () => "mock-token-id",
        reload: async () => Promise.resolve(),
      };
      return { user: userObj };
    },
    sendEmailVerification: async () => Promise.resolve(),
    sendPasswordResetEmail: async () => Promise.resolve(),
    browserLocalPersistence: "local",
    browserSessionPersistence: "session",
  };
});

// Mock Firebase Firestore
vi.mock("firebase/firestore", () => {
  return {
    getFirestore: () => ({}),
    doc: (db: any, ...paths: string[]) => {
      return { path: paths.join("/") };
    },
    collection: (db: any, ...paths: string[]) => {
      return { path: paths.join("/") };
    },
    getDoc: async (docRef: { path: string }) => {
      const parts = docRef.path.split("/");
      // E.g., Users/{uid}
      if (parts[0] === "Users" && parts.length === 2) {
        const uid = parts[1];
        const data = mockDb.users[uid];
        return {
          exists: () => !!data,
          data: () => data,
        };
      }
      return { exists: () => false, data: () => null };
    },
    setDoc: async (docRef: { path: string }, data: any) => {
      const parts = docRef.path.split("/");
      if (parts[0] === "Users" && parts.length === 2) {
        const uid = parts[1];
        mockDb.users[uid] = { ...(mockDb.users[uid] || {}), ...data };
      }
      return Promise.resolve();
    },
    updateDoc: async (docRef: { path: string }, data: any) => {
      const parts = docRef.path.split("/");
      if (parts[0] === "Users" && parts.length === 2) {
        const uid = parts[1];
        mockDb.users[uid] = { ...(mockDb.users[uid] || {}), ...data };
      }
      return Promise.resolve();
    },
    deleteDoc: async (docRef: { path: string }) => {
      return Promise.resolve();
    },
    increment: (val: number) => val,
    onSnapshot: (docRef: any, callback: any) => {
      // Return a unsubscribe dummy function
      return () => {};
    },
  };
});
```

### B. MSW Network Interceptors (`tests/e2e/mocks/handlers.ts`)
We intercept fetch and axios endpoints pointing to the backend and ChatGPT prompts:

```typescript
import { http, HttpResponse } from "msw";

export const handlers = [
  // Mock Purchase Item Endpoint
  http.post("*/fireBase/purchaseItem", async ({ request }) => {
    return HttpResponse.json({ success: true, message: "Purchase completed" });
  }),

  // Mock OpenAI Sandbox Evaluation Endpoint
  http.post("*/openAI/codePlaygroundEval", async ({ request }) => {
    return HttpResponse.json({
      success: true,
      stdout: "Hello Devlab!",
      evaluation: "pass",
      feedback: "Code compiles and runs flawlessly.",
    });
  }),
  
  // Mock Lessons Fetching
  http.get("*/fireBase/getAllData/:subject", ({ params }) => {
    return HttpResponse.json({
      Lesson1: {
        id: "Lesson1",
        title: "Introduction",
        Levels: {
          Level1: {
            id: "Level1",
            title: "Syntax Basics",
            Stages: {
              Stage1: { id: "Stage1", gamemode: "BrainBytes" }
            }
          }
        }
      }
    });
  }),
];
```

### C. Global Env & Web API Setup (`tests/e2e/setup.ts`)
Bootstraps MSW, mocks Audio elements, and handles cleanup:

```typescript
import "@testing-library/jest-dom";
import { beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "./mocks/handlers";
import { resetMockDb } from "./mocks/mockFirebase";

// Start MSW Server
export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  server.resetHandlers();
  resetMockDb();
  localStorage.clear();
});
afterAll(() => server.close());

// Mock Audio
global.Audio = class {
  currentTime = 0;
  preload = "";
  play() { return Promise.resolve(); }
  pause() {}
  load() {}
} as any;

// Mock Lottie React
vi.mock("lottie-react", () => {
  return {
    default: () => null,
  };
});

// Mock CodeMirror Editor to render as simple text area
vi.mock("@uiw/react-codemirror", () => {
  return {
    default: ({ value, onChange, placeholder, ...props }: any) => {
      const React = require("react");
      return React.createElement("textarea", {
        "data-testid": "codemirror-mock",
        value: value,
        placeholder: placeholder,
        onChange: (e: any) => onChange && onChange(e.target.value),
        ...props,
      });
    },
  };
});
```

---

## 5. E2E Test Execution Instructions

### Run the complete test suite once
```bash
pnpm test:e2e
```

### Start tests in interactive watch mode (TDD mode)
```bash
pnpm test:e2e:watch
```

### Generate a test coverage report
```bash
pnpm test:e2e:coverage
```
The coverage outputs will be generated under `/coverage/index.html`. Open it in a browser to see detailed line-by-line coverage reports.
