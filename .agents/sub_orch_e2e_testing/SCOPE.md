# Scope: E2E Testing Track

## Architecture
- The test runner uses Vitest with JSDOM environment, React Testing Library, and MSW for mocking the backend and OpenAI APIs.
- The Firebase SDK is mocked in-memory to prevent actual network calls during tests.
- E2E tests are located in `tests/e2e/`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E1 | E2E Test Infra Setup | Install devDependencies, create `vitest.config.e2e.ts`, `tests/e2e/setup.ts`, `tests/e2e/mocks/mockFirebase.ts`, `tests/e2e/mocks/handlers.ts`, and write `TEST_INFRA.md`. | None | PLANNED |
| E2 | Requirement-driven Tests | Implement Tier 1-4 tests (Auth, Lessons, Shop, GameModes, Achievements). | E1 | PLANNED |
| E3 | Publish TEST_READY.md | Run all tests successfully, verify test suite coverage, and generate `TEST_READY.md`. | E2 | PLANNED |

## Interface Contracts
- Tests must be opaque-box, interacting with the DOM elements rendered by `<App />` using React Router's `<MemoryRouter>`.
- The in-memory database mock must handle authentication status, user profile documents, and inventory/progress documents.
- OpenAI API responses must be strictly mocked via MSW to avoid any live integration calls, due to OpenAI API credit depletion.
