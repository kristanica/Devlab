# Milestone M1 - Changes Log

The following changes have been made to configure TypeScript and prep the environment for migration:

## 1. Package Manager Choice
- **Preferred package manager**: Chose **pnpm** because of the presence of `node_modules/.pnpm` and `node_modules/.modules.yaml`.

## 2. DevDependencies Installed (`package.json`)
- Added the following to `devDependencies`:
  - `typescript` (v5.7.3)
  - `@types/node` (v22.10.1)
  - `@types/react-split-pane` (v0.1.9)
  - `@types/js-beautify` (v1.14.3)
  - `@types/prismjs` (v1.26.5)
  - `@types/sql.js` (v1.4.9)

## 3. Strict Mode TypeScript Configuration (`tsconfig.json`)
- Created `tsconfig.json` in the root of the project.
- Configured options:
  - `"strict": true` (with individual strict flags explicitly set)
  - `"allowJs": true`
  - `"checkJs": false` (incremental migration support)
  - `"jsx": "react-jsx"`
  - `"moduleResolution": "bundler"`
  - `"module": "ESNext"`
  - `"target": "ES2020"`

## 4. Configuration Renaming (`vite.config.ts`)
- Created `vite.config.ts` matching the content of the old config.
- Deprecated `vite.config.js` by overwriting it with a deprecation comment.

## 5. Main Script Renaming & Fixes (`src/main.tsx`)
- Created `src/main.tsx` containing the updated entry point logic:
  - Imported `App` via `./App` (changed from `./App.jsx`).
  - Added strict null check logic: checked that `document.getElementById('root')` is not null.
  - Wrapped tree in `<StrictMode>`.
- Deprecated `src/main.jsx` by overwriting it with a deprecation comment.

## 6. HTML Entry Tag Updated (`index.html`)
- Updated line 11 to reference the new `/src/main.tsx` entry point script.
