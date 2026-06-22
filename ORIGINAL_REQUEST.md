# Original User Request

## Initial Request — 2026-06-21T16:54:16Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Restructure the Devlab React project into a feature-based architecture and convert all `.js`/`.jsx` files to strict TypeScript (`.ts`/`.tsx`) with proper type casting, using the pre-defined global types in `src/types`.

Working directory: `C:\Users\lain\Documents\code\Devlab`
Integrity mode: development

## Requirements

### R1. Complete TypeScript Conversion
Convert all JavaScript and JSX files in the project to TypeScript. Replace implicit `any` types with explicit typings using the interfaces defined in `src/types/index.ts`. If an extremely complex or untyped third-party library is encountered where the exact type is difficult to ascertain, temporarily fallback to `any` and add a `// TODO: type this` comment to ensure the app continues to build and run.

### R2. Feature-Based File Restructuring
Reorganize the project into a modern feature-based architecture. Move global state, hooks, services, and core features into dedicated directories (`src/store`, `src/hooks`, `src/services`, `src/features`) and clean up the `src/components` directory to only contain reusable UI components. Fix all broken imports.

## Acceptance Criteria

### Compilation & Types
- [ ] Running `tsc --noEmit` completes with zero type errors.
- [ ] No files end in `.js` or `.jsx` (excluding configuration files like `vite.config.js` if they must remain JS).

### Runtime Integrity
- [ ] The application successfully builds and runs without import resolution errors.
- [ ] All game modes (BugBust, BrainBytes, etc.) load and execute successfully.

## Follow-up — 2026-06-21T17:00:29Z

USER UPDATE: The user just informed me that the OpenAI Evaluation endpoints (used in the game mode evaluate logic) might not work because they have run out of API credits. Ensure that the E2E Testing Track strictly uses MSW (Mock Service Worker) to mock all OpenAI API responses during tests, and do not attempt to run any live integration tests that hit the OpenAI API.

## 2026-06-22T02:47:51Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Restructure the Devlab React project into a feature-based architecture and convert all `.js`/`.jsx` files to strict TypeScript (`.ts`/`.tsx`) with proper type casting, using the pre-defined global types in `src/types`. Implement the parallel E2E testing track.

Working directory: `C:\Users\lain\Documents\code\Devlab`
Integrity mode: development

## Requirements

### R1. Complete TypeScript Conversion
Convert all JavaScript and JSX files in the project to TypeScript. Replace implicit `any` types with explicit typings using the interfaces defined in `src/types/index.ts`. If an extremely complex or untyped third-party library is encountered where the exact type is difficult to ascertain, temporarily fallback to `any` and add a `// TODO: type this` comment to ensure the app continues to build and run.

### R2. Feature-Based File Restructuring
Reorganize the project into a modern feature-based architecture. Move global state, hooks, services, and core features into dedicated directories (`src/store`, `src/hooks`, `src/services`, `src/features`) and clean up the `src/components` directory to only contain reusable UI components. Fix all broken imports.

### R3. E2E Test Infrastructure
Implement the E2E Testing Track (E1) using Vitest, JSDOM, and React Testing Library in complete network isolation. Strictly use MSW (Mock Service Worker) to mock all external API calls, especially OpenAI endpoints, as the OpenAI API credits are depleted.

## Acceptance Criteria

### Compilation & Types
- [ ] Running `tsc --noEmit` completes with zero type errors.
- [ ] No files end in `.js` or `.jsx` (excluding configuration files like `vite.config.js` if they must remain JS).

### Runtime Integrity
- [ ] The application successfully builds and runs without import resolution errors.
- [ ] All game modes (BugBust, BrainBytes, etc.) load and execute successfully.

### Testing Validation
- [ ] Running `pnpm run test:e2e` completes successfully using Vitest.
- [ ] No live network requests are made to the OpenAI API during the test suite execution.

