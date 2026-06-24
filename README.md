# Devlab

A gamified programming learning platform built with React 19, TypeScript, and Firebase. Users complete coding challenges across HTML, CSS, JavaScript, and Database subjects — earning XP, coins, and achievements as they progress.

## Tech Stack

- **Framework**: React 19, TypeScript 5.7, Vite 6
- **Routing**: React Router 7
- **State**: Zustand 5, TanStack React Query 5
- **Styling**: Tailwind CSS 4, Framer Motion 12
- **Backend**: Firebase (Auth + Firestore)
- **Editor**: CodeMirror 6
- **Drag & Drop**: dnd-kit

## Getting Started

```bash
pnpm install
pnpm run dev          # Start dev server (local network accessible)
pnpm run build        # Production build
pnpm run preview      # Preview production build
```

## Project Structure

```
src/
├── features/              # Feature-based modules
│   ├── achievements/      # User achievements, claiming logic
│   ├── admin/             # Content & user management
│   ├── auth/              # Login, registration, password resets
│   ├── dashboard/         # User profile, stats, inventory
│   ├── gamemodes/         # BrainBytes, BugBust, CodeCrafter, CodeRush
│   ├── inventory/         # Item use logic and effects
│   ├── landing/           # Public landing page
│   ├── lessons/           # Curriculum, lesson components
│   └── shop/              # Store interface, item purchasing
├── components/            # Reusable UI primitives (navbar, layout, loaders)
├── hooks/                 # Global custom hooks
├── pages/                 # Top-level route pages (Login, Settings, etc.)
├── services/              # Firebase, OpenAI prompts, API clients
├── store/                 # Zustand stores (inventory, rewards, game state)
├── types/                 # Global TypeScript definitions
└── utils/                 # Utilities (sound handler, validations)
```

## Testing

E2E tests run with Vitest + JSDOM + React Testing Library, using MSW for complete network isolation (no live API calls).

```bash
pnpm run test:e2e           # Run full suite (69 tests)
pnpm run test:e2e:watch     # Interactive watch mode
pnpm run test:e2e:coverage  # With coverage report
pnpm run typecheck          # TypeScript type checking
```

## Key Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start dev server |
| `pnpm run build` | Production build |
| `pnpm run lint` | ESLint check |
| `pnpm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `pnpm run test:e2e` | Run E2E test suite |

## Environment

Create a `.env` file with:

```
VITE_BACK_END=<backend-api-url>
```

The application uses Firebase for authentication and Firestore for data persistence. All OpenAI API endpoints are mocked during tests via MSW.
