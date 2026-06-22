## 2026-06-21T16:58:00Z

You are a teamwork_preview_worker. Your working directory is C:\Users\lain\Documents\code\Devlab\.agents\worker_m1.
Your identity: worker_m1.
Your task is to implement Milestone M1 (Prep & TypeScript Setup) for the Devlab restructuring project.

Follow these implementation steps:
1. Determine the correct package manager (the project has pnpm-lock.yaml and package-lock.json; check which one is preferred, e.g., pnpm or npm).
2. Install typescript, @types/node, @types/react-split-pane, @types/js-beautify, @types/prismjs, and @types/sql.js as devDependencies using the correct package manager.
3. Create a strict-mode tsconfig.json at the root of the project with allowJs: true and checkJs: false (to allow incremental migration).
4. Rename vite.config.js to vite.config.ts.
5. Update index.html script tag source to point to /src/main.tsx.
6. Rename src/main.jsx to src/main.tsx, correct the import of App (from ./App.jsx to ./App), and apply strict null checks by checking/asserting that document.getElementById('root') is not null.
7. Verify that you can build the project successfully (e.g. pnpm run build or npm run build) and that running npx tsc --noEmit does not report errors in main.tsx or App.tsx.
8. Document your changes in C:\Users\lain\Documents\code\Devlab\.agents\worker_m1\changes.md and write a handoff.md, then notify your parent (Conv ID: 090df5d8-56a2-40d1-a7a6-33a4fcacc870).

MANDATORY INTEGRITY WARNING:
> DO NOT CHEAT. All implementations must be genuine. DO NOT
> hardcode test results, create dummy/facade implementations, or
> circumvent the intended task. A Forensic Auditor will independently
> verify your work. Integrity violations WILL be detected and your
> work WILL be rejected.
