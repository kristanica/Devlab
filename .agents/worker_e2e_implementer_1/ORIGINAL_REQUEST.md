## 2026-06-22T10:58:44+08:00
You are worker_e2e_implementer_1. Your working directory is C:\Users\lain\Documents\code\Devlab\.agents\worker_e2e_implementer_1.
Your task is to implement the E2E test suites for Tiers 1-4.
Please follow these steps:
1. Update the Firebase mocks in `tests/e2e/mocks/mockFirebase.ts` to support real-time snapshots (`onSnapshot`), document updates (`updateDoc`), document deletes (`deleteDoc`), and numeric `increment` values. Export a listener registry or helper `triggerSnapshot(path)` so tests can manually trigger or mock snapshot updates. Ensure it manages:
   - Users path: `Users/{uid}`
   - Inventory path: `Users/{uid}/Inventory` or `Users/{uid}/Inventory/{itemId}`
   - Achievements path: `Users/{uid}/Achievements/{achievementId}`
2. Write 5 comprehensive E2E tests for each of the 5 modules, located in `tests/e2e/` (you can structure them in separate files):
   - `tests/e2e/auth.test.tsx`:
     - Test 1: Happy path login (verifies redirection on valid login)
     - Test 2: Happy path registration (verifies signup, username, email verification success toast)
     - Test 3: Password validation rules (verifies toast errors for short, missing uppercase/lowercase/number/special character passwords, and tooltip presentation)
     - Test 4: Unverified email block (verifies signout and error toast when user has verified=false)
     - Test 5: Account suspension block (verifies signout and error toast when user has isSuspend=true)
   - `tests/e2e/lessons.test.tsx`:
     - Test 1: HTML curriculum page lists levels, headers, chapters
     - Test 2: Navigation expands level card chevrons and shows stage links
     - Test 3: Stage card routing opens the workspace layout
     - Test 4: Back navigation links route to main menu, and footer "Previous" transitions correctly
     - Test 5: Locked stage modals block navigation and show warning popup
   - `tests/e2e/shop.test.tsx`:
     - Test 1: Successful purchase with sufficient coins (updates balance optimistically, triggers mock API, displays success toast)
     - Test 2: Failed purchase from insufficient coins (triggers immediate error toast, no API request)
     - Test 3: API purchase failure (500) triggers optimistic rollback of the coins balance
     - Test 4: Shop grid skeleton display is shown during load, then resolves
     - Test 5: Coin balance changes are propagated and animated in real-time
   - `tests/e2e/gamemodes.test.tsx`:
     - Test 1: MC BrainBytes happy path playthrough (select option, submit answer, success popup, continue)
     - Test 2: Correct vs incorrect answers (select wrong answer, submit, click retry, decrements hearts; select correct, submit, success popup)
     - Test 3: Level completed rewards (completing last stage renders LevelCompleted popup, increments XP/coins, updates profile)
     - Test 4: Heart depletion game over (heart drops to 0, renders GameOver popup, exits to first lesson, resets hearts)
     - Test 5: CodeEditor (typing code, RUN button updates preview body, SUBMIT evaluates using MSW mocked sandbox, success popup)
   - `tests/e2e/achievements.test.tsx`:
     - Test 1: Unlocked achievement lists showing "Claim Reward" buttons, locked achievements show lock icon and disabled buttons
     - Test 2: Clicking Claim Reward triggers database state change, success toast with coins/XP values, transitions text to "Claimed"
     - Test 3: Coin balance updates optimistically in dashboard stats
     - Test 4: Claiming XP rewards triggers Level progression and remainder calculations
     - Test 5: Full onboarding journey (login -> complete stage -> level complete popup -> unlock achievement toast -> click Achievements page -> claim reward -> coins update)
3. For MSW mocking, ensure you strictly mock all OpenAI API evaluation requests. Do not make live API calls. You can define handlers dynamically in tests using `server.use(...)` if needed.
4. Run `pnpm test:e2e` to compile and run all E2E tests, verifying that everything passes. Capture the test results and write a handoff report in your directory.
MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
