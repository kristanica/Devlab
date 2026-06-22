# Devlab E2E Test Design Document (GameModes & Achievements)

This document provides a comprehensive design and blueprint for testing the **GameModes** and **Achievements** features within Devlab using its existing testing architecture (Vitest, JSDOM, React Testing Library, and MSW for mocking).

---

## Codebase Analysis & Data Models

### 1. GameModes State & Store Mechanics
* **Attempt Tracking (`useAttemptStore`)**: Managed via Zustand with local storage persistence (`attempt-storage-${userId}`). It maintains state for:
  - `heart` (number, default: `3`, max: `3` or `5` with buffs).
  - `roundKey` (number, triggers round resets).
  - `gameOver` (boolean, true if `heart <= 0`).
  - Actions: `submitAttempt(isCorrect)` (decrements hearts by 1 on incorrect attempt), `resetHearts()`, `applyExtraLives()`, `removeExtraLives()`.
* **OpenAI Prompt Store (`useGameStore`)**: Tracks state for AI evaluation:
  - `submittedCode` (object, e.g., `{ HTML: string }`).
  - `isCorrect` (boolean).
  - `showIsCorrect` (boolean).
  - `singleFeedback` (string).
* **Game Submission Flow (`GameFooter.tsx`)**:
  - If `gamemodeId === "Lesson"`, the button text is "Next", and clicking navigates directly using `goToNextStage`.
  - If `gamemodeId === "BrainBytes"`, the button in the footer is disabled until the question is answered and submitted via the inner `InstructionPanel`'s "SUBMIT ANSWER" button.
  - For coding challenges (`BugBust`, `CodeCrafter`, `CodeRush`), the footer button displays "Submit", which triggers the corresponding handler in `gameModeSubmitHandlers` and executes AI prompts.

### 2. Achievements State & Store Mechanics
* **Achievements Meta Data**: Fetched from `/fireBase/achievements/:category` (HTML, CSS, JS, Database).
* **User Achievements Database**: Saved in Firestore as documents under `/Users/{userId}/Achievements/{achievementId}`. The hook `useUserAchievements` returns an object: `{ [achievementId]: { isClaimed: boolean, coinsReward, expReward, achievementName, dateUnlocked } }`.
* **State Updates on Claim (`useClaimAchievement.tsx`)**:
  - Optimistically updates client-side React Query state.
  - *Key Detail/Discrepancy*: The optimistic update alters `["User_Details", userId]`, whereas the profile query in `useFetchUserData` uses `["userData"]`. This means E2E tests must verify this cache key integration, or mock both keys to ensure UI responsiveness.
  - Fires update requests to Firestore for the user (`exp`, `userLevel`, `coins`) and specific achievement (`isClaimed: true`).
  - Computes level-ups: if `newExp >= 100`, level increments by `Math.floor(newExp / 100)` and remainder sets the new EXP.

---

## E2E Test Suite 1: GameModes (5 Scenarios)

### Scenario 1: Playthrough Happy Path
* **Description**: Verifies a user can load a multiple-choice BrainBytes stage, choose the correct answer, submit it, receive a success popup, and advance to the next stage.
* **Prerequisites & Mock State**:
  - Authenticated user: `mockCurrentUser = { uid: "test-user-123", emailVerified: true }`.
  - Mock DB initial state: `mockDb.users["test-user-123"] = { uid: "test-user-123", coins: 0, exp: 0, userLevel: 1 }`.
  - MSW route `GET */fireBase/getGameMode/Html/Lesson1/Level1/Stage1` mocked to return:
    ```json
    {
      "level": { "levelOrder": 1, "title": "HTML Tags", "expReward": 20, "coinsReward": 5 },
      "stage": {
        "title": "Paragraph Tag",
        "type": "BrainBytes",
        "description": "Learn about paragraphs.",
        "instruction": "What tag is used for paragraphs?",
        "choices": { "A": "<p>", "B": "<h1>", "correctAnswer": "A" }
      }
    }
    ```
* **Step-by-Step Flow**:
  1. Render `GameModeRouter` wrapped in `MemoryRouter` set to path `/Main/Lessons/Html/Lesson1/Level1/Stage1/BrainBytes`.
  2. Acknowledge and dismiss the introductory popup by clicking the "Start Challenge" button.
  3. Locate the radio button for option A (`<p>`) and click it.
  4. Click the "SUBMIT ANSWER" button in the instruction panel.
  5. Assert that `CorrectWrongPopUp` is rendered.
  6. Click "Continue" inside the success popup.
* **DOM Elements to Query**:
  - Introductory Popup Button: `screen.getByRole("button", { name: /Start Challenge/i })`
  - Radio Input / Option: `screen.getByLabelText("<p>")` or selector `input[value="A"]`
  - Submit Button: `screen.getByRole("button", { name: /SUBMIT ANSWER/i })`
  - Correct Alert Title: `screen.getByText(/Correct/i)`
  - Continue Button: `screen.getByRole("button", { name: /Continue/i })`
* **Asserted State Changes**:
  - Zustand `useAttemptStore.getState().heart` remains `3`.
  - Next route is queried and loaded (triggers navigation action to Stage 2).

---

### Scenario 2: Answer Submissions (Correct vs. Incorrect)
* **Description**: Verifies the response pathways for correct and incorrect answers, highlighting heart decrements and retry mechanics.
* **Prerequisites & Mock State**:
  - Same mock configuration as Scenario 1.
* **Step-by-Step Flow**:
  * **Test A: Incorrect Answer submission**
    1. Load BrainBytes stage. Click "Start Challenge".
    2. Select the incorrect option B (`<h1>`).
    3. Click "SUBMIT ANSWER".
    4. Assert that `CorrectWrongPopUp` shows incorrect status ("Incorrect" or retry prompts).
    5. Click the "Retry" button.
    6. Verify that the hearts in `useAttemptStore` decrement to `2` and the footer updates its heart icon display.
  * **Test B: Correct Answer submission**
    1. Select the correct option A (`<p>`).
    2. Click "SUBMIT ANSWER".
    3. Assert `CorrectWrongPopUp` shows success.
    4. Verify hearts count remains `2`.
* **DOM Elements to Query**:
  - Option Label B: `screen.getByLabelText("<h1>")`
  - Submit Button: `screen.getByRole("button", { name: /SUBMIT ANSWER/i })`
  - Incorrect Popup Text: `screen.getByText(/Incorrect/i)` or similar error state container.
  - Retry Button: `screen.getByRole("button", { name: /Retry/i })`
  - Heart Display (Footer/Header): Elements showing heart icons or count (e.g., text node containing `2x` or `2` heart shapes).
* **Asserted State Changes**:
  - Zustand `useAttemptStore.getState().heart` decrements to `2` on incorrect submission.
  - Zustand `useAttemptStore.getState().heart` remains at `2` after correct submission.

---

### Scenario 3: Correct Answer Score / EXP Gain
* **Description**: Asserts that completing the final stage of a level properly awards rewards (XP/Coins), displays the summary, and updates the user profile cache.
* **Prerequisites & Mock State**:
  - Level configuration: `expReward = 50`, `coinsReward = 20`.
  - User profile initial state: `coins: 100`, `exp: 10`.
  - MSW route mock for `GET */fireBase/userProgres/Html` returns progress showing the current stage is completed when navigated.
  - MSW route mock for `POST */fireBase/unlockStage` returning next stage unlock status.
* **Step-by-Step Flow**:
  1. Complete the last stage of the level.
  2. Verify that `LevelCompleted_PopUp` renders.
  3. Assert that the XP count animated indicator reaches `+50XP` and DevCoins displays `+20`.
  4. Click the "Continue" or "Back to Main" button.
  5. Assert that a refetch is triggered.
  6. Verify the user details display in the main dashboard shows `120` coins and `60` EXP.
* **DOM Elements to Query**:
  - Level Completed Title: `screen.getByText("LEVEL COMPLETED")`
  - DevCoin Reward Text: `screen.getByText(/\+20/)` (or finding coins reward container)
  - XP Reward Text: `screen.getByText(/\+50XP/)`
  - Continue Button: `screen.getByRole("button", { name: /Continue/i })`
  - Main Dashboard Coins Count: `screen.getByText("120")` (in footer or navbar)
* **Asserted State Changes**:
  - Zustand `useRewardStore` cleared after popup dismissal.
  - React Query queryClient cache for `["userData"]` gets updated to reflect:
    ```json
    { "coins": 120, "exp": 60, "userLevel": 1 }
    ```

---

### Scenario 4: Heart Depletion Boundary to GameOver
* **Description**: Verifies that when a user runs out of hearts, the GameOver popup appears, blocks progress, and redirects the user back to the first lesson upon confirmation.
* **Prerequisites & Mock State**:
  - Start stage with `heart = 1` in Zustand store (simulating previous failures).
  - MSW mock for `POST */fireBase/gameOver` returns `{ success: true }`.
* **Step-by-Step Flow**:
  1. Select incorrect option B.
  2. Click "SUBMIT ANSWER".
  3. Assert that instead of standard retry, `Gameover_PopUp` overlays the entire screen.
  4. Verify that "Game Over !!" title is visible.
  5. Click the "Go back to the 1st Lesson" button.
  6. Assert that the user is navigated back to the first stage page `/Main/Lessons/Html/Lesson1/Level1/Stage1/Lesson`.
  7. Check that the Zustand store hearts are reset back to `3`.
* **DOM Elements to Query**:
  - GameOver Banner: `screen.getByRole("heading", { name: /Game Over !!/i })`
  - GameOver Message: `screen.getByText(/"System Crash: No remaining lives detected in memory."/i)`
  - Exit Button: `screen.getByRole("button", { name: /Go back to the 1st Lesson/i })`
* **Asserted State Changes**:
  - Zustand `useAttemptStore.getState().gameOver` becomes `true`.
  - After clicking exit, `useAttemptStore.getState().heart` is reset to `3`, and `gameOver` resets to `false`.
  - Firestore backend function `callGameOver` API is called.

---

### Scenario 5: CodeMirror Mocked Textarea Changes
* **Description**: Validates that users can edit code in the text editor pane, execute it, view output in the preview frame, and successfully submit the solution to the AI evaluator.
* **Prerequisites & Mock State**:
  - Route: `/Main/Lessons/Html/Lesson1/Level1/Stage2/BugBust`.
  - MSW Mock for OpenAI API:
    ```javascript
    http.post("*/openAI/codePlaygroundEval", () => HttpResponse.json({
      success: true,
      stdout: "<h1>Hello World</h1>",
      evaluation: "pass",
      feedback: "Perfect!"
    }))
    ```
* **Step-by-Step Flow**:
  1. Locate the CodeMirror mocked textarea (using `data-testid="codemirror-mock"`).
  2. Simulate user typing code: `<h1>Hello World</h1>`.
  3. Click the "RUN" button next to the editor.
  4. Assert the Live Preview frame renders and the internal iframe contains the body `<h1>Hello World</h1>`.
  5. Click the "Submit" button in the footer.
  6. Assert that the evaluation call is pending (loading spinner appears).
  7. Upon resolution, assert `CorrectWrongPopUp` is shown with feedback text "Perfect!".
* **DOM Elements to Query**:
  - Code Editor Textarea: `screen.getByTestId("codemirror-mock")`
  - RUN button: `screen.getByRole("button", { name: /RUN/i })`
  - Live Preview Iframe: `screen.getByTitle("output")`
  - Submit Button: `screen.getByRole("button", { name: /Submit/i })`
  - Loading Spinner: `screen.getByTestId("loading-dots")` or matching animation wrapper
* **Asserted State Changes**:
  - Zustand `useGameStore.getState().submittedCode` contains `{ HTML: "<h1>Hello World</h1>" }`.
  - Zustand `useGameStore.getState().isCorrect` evaluates to `true`.
  - Zustand `useGameStore.getState().singleFeedback` is populated with `"Perfect!"`.

---

## E2E Test Suite 2: Achievements (5 Scenarios)

### Scenario 1: Unlocked Achievement Rendering
* **Description**: Confirms that unlocked achievements show distinct visuals (colored theme borders and subject icons) with an active "Claim Reward" button, while locked achievements show low opacity and lock icons.
* **Prerequisites & Mock State**:
  - Mock achievements config:
    ```json
    {
      "html_first": { "id": "html_first", "title": "First Tag", "description": "Write a tag", "coinsReward": 10, "expReward": 15, "order": 1 }
    }
    ```
  - Unlocked list: `userAchievements` contains `{ html_first: { isClaimed: false } }`.
  - Locked list: `css_first` is NOT in `userAchievements`.
* **Step-by-Step Flow**:
  1. Render `Achievements` page.
  2. Query the HTML achievements milestone grid.
  3. Verify that the card for "First Tag" is unlocked: opacity is normal, and it displays the "Claim Reward" action button.
  4. Query the CSS milestone grid and locate the locked card.
  5. Verify that it displays the lock icon (`<FaLock>`) and the button shows "Locked" and is disabled.
* **DOM Elements to Query**:
  - Achievement Section Headers: `screen.getByRole("heading", { name: /HTML Milestones/i })`
  - Claim Reward Button: `screen.getByRole("button", { name: /Claim Reward/i })`
  - Locked Button: `screen.getByRole("button", { name: /Locked/i })`
  - Lock Icon: Look for SVG element representing the lock or having lock classes.
* **Asserted State Changes**:
  - Assert that the claim button is enabled (`disabled = false`) for unlocked ones.
  - Assert that the locked button is disabled (`disabled = true`) for locked ones.

---

### Scenario 2: Claim Reward Flow
* **Description**: Simulates clicking "Claim Reward", checks the mutation triggers correctly, displays the toast confirmation banner, and sets the card state to "Claimed".
* **Prerequisites & Mock State**:
  - Authenticated user with 10 coins, 0 EXP, level 1.
  - User has `html_first` unlocked but unclaimed.
* **Step-by-Step Flow**:
  1. Locate the "Claim Reward" button on the "First Tag" achievement card.
  2. Click the button.
  3. Assert that the loading spinner / disabling mechanism triggers temporarily.
  4. Check that the custom hot-toast "Reward Claimed! Unlocked First Tag" is visible on the screen.
  5. Assert that the coins and EXP rewards (`+10 COINS`, `+15 EXP`) are visible inside the toast.
  6. Assert the button text changes to "Claimed" and becomes disabled.
* **DOM Elements to Query**:
  - Claim Reward Button: `screen.getByRole("button", { name: /Claim Reward/i })`
  - Toast Container: `screen.getByText("Reward Claimed!")`
  - Toast Unlocked Item Text: `screen.getByText("First Tag")`
  - Toast Rewards: `screen.getByText("+10 COINS")` and `screen.getByText("+15 EXP")`
  - Claimed Button State: `screen.getByRole("button", { name: /Claimed/i })`
* **Asserted State Changes**:
  - Firestore updates: `Users/userId/Achievements/html_first` `isClaimed` is updated to `true`.
  - The Query Cache `["userAchievements", userId]` is updated to store `isClaimed: true` for `html_first`.

---

### Scenario 3: Coin Balance Update
* **Description**: Verifies that when an achievement reward is claimed, the user's coins balance updates optimistically in the overview board and stays persistent on refetches.
* **Prerequisites & Mock State**:
  - User initial coins: `50`.
  - Achievement `html_first` awards `20` coins.
* **Step-by-Step Flow**:
  1. Load the Achievements page.
  2. Assert that the initial coins value of the user is displayed as `50` inside the `AchievementsOverview` header.
  3. Click "Claim Reward" for "First Tag".
  4. Verify that the coins balance in the header updates immediately from `50` to `70` coins (via query cache modification).
* **DOM Elements to Query**:
  - Overview User Section: Identify the Developer stats panel.
  - Coins Balance Text (Header/Overview): Find text containing `70` (or `50` prior to claim).
  - Claim Button: `screen.getByRole("button", { name: /Claim Reward/i })`
* **Asserted State Changes**:
  - QueryClient cache for `["userData"]` (or the local user details hook cache) is optimistically updated with `coins: 70`.
  - Firestore document `/Users/{userId}` updates `coins` field to `70`.

---

### Scenario 4: Cross-Feature Combination with Level Progression
* **Description**: Asserts that claiming an EXP reward triggers leveling up if the cumulative EXP equals or exceeds 100.
* **Prerequisites & Mock State**:
  - User profile initial state: `coins: 200`, `exp: 85`, `userLevel: 2`.
  - Achievement `html_first` rewards `30` EXP.
* **Step-by-Step Flow**:
  1. Assert the player is at Level 2 with 85 EXP.
  2. Click "Claim Reward" on the achievement card.
  3. Assert that the EXP math calculates `85 + 30 = 115`, triggering a level up.
  4. Verify that the user level display instantly updates to show "Level 3" (or Developer Level 3).
  5. Verify that the remaining EXP drops to `15` (115 % 100).
* **DOM Elements to Query**:
  - User Level Indicator: Look for elements displaying `Level 2` transitioning to `Level 3`.
  - XP Progress Bar: Verify bar length or percentage text displays change.
* **Asserted State Changes**:
  - Cache document `User_Details` / `userData` is updated:
    ```json
    { "userLevel": 3, "exp": 15, "coins": 200 }
    ```
  - Firestore updates document: `/Users/{userId}` with `{ userLevel: 3, exp: 15 }`.

---

### Scenario 5: Real-World Onboarding Scenario (Full Journey)
* **Description**: Executes the entire user journey: a user logs in, completes their first HTML level stage, unlocks the "First Level Complete" achievement, navigates to the Achievements page, and claims the rewards.
* **Prerequisites & Mock State**:
  - Fresh user with `coins: 0`, `exp: 0`, `userLevel: 1`.
  - HTML Level 1 has 1 stage (BrainBytes), which is incomplete.
  - Achievement `first_completed` unlocks on `firstLevelComplete` condition matching.
* **Step-by-Step Flow**:
  1. Render `App` router. Navigate user to `/Main/Lessons/Html/Lesson1/Level1/Stage1/BrainBytes`.
  2. Select the correct radio option and click "SUBMIT ANSWER".
  3. Click "Continue" in the success popup.
  4. Since it was the last stage, this displays the `LevelCompleted_PopUp`.
  5. Assert that the Level Completed Popup renders, executing the `unlockAchievement` hook.
  6. Toast "Achievement Unlocked! First Level Completed" triggers at the bottom.
  7. Click "Back to Main" inside the Level Completed Popup.
  8. Navigate to the `/Main/Achievements` page via the sidebar link.
  9. Locate the newly unlocked achievement in the HTML Milestones section.
  10. Click "Claim Reward" and verify that coins and XP balances reflect the rewards.
* **DOM Elements to Query**:
  - Navigation Sidebar Links: `screen.getByRole("link", { name: /Achievements/i })`
  - Unlocked Achievement Toast: `screen.getByText("Achievement Unlocked!")`
  - Claim Reward Button: `screen.getByRole("button", { name: /Claim Reward/i })`
  - Balances in Sidebar / Header: Verify total coins change from `0` to reward amount.
* **Asserted State Changes**:
  - Firestore documents:
    - `/Users/{userId}/Achievements/first_completed` exists with `{ isClaimed: true }` post-claim.
    - `/Users/{userId}` updates `coins` and `exp` to the awarded sums.
  - Zustand `useUserProgressStore` stores completion of `Lesson1-Level1-Stage1`.

---

## Actionable Integration Suggestions & Code Templates

### Key Cache Mismatch Note
In `useClaimAchievement.tsx`, the optimistic mutation modifies the query cache under the key `["User_Details", userData?.uid]`, while `useFetchUserData.jsx` queries the profile using the key `["userData"]`. To prevent issues, E2E tests should ensure that:
1. Both caches are mocked or set to match the state.
2. The implementation is eventually refactored to align query keys to `["userData"]` for cohesive caching.

### Vitest + JSDOM Test Code Scaffold
Below is a skeleton template for implementing these tests:

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GameModeRouter from "@/gameMode/GameModes_Utils/GameModeRouter";
import Achievements from "@/pages/Achievements";
import { setMockUser, mockDb } from "../mocks/mockFirebase";

// Setup wrapper
const createTestClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

describe("GameModes & Achievements E2E Suite", () => {
  beforeEach(() => {
    // Populate mock user
    setMockUser({ uid: "user_test", email: "test@devlab.com", emailVerified: true });
    mockDb.users["user_test"] = {
      uid: "user_test",
      username: "CoderLain",
      coins: 100,
      exp: 50,
      userLevel: 1
    };
  });

  it("should complete Scenario 1: Playthrough Happy Path", async () => {
    const queryClient = createTestClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/Main/Lessons/Html/Lesson1/Level1/Stage1/BrainBytes"]}>
          <Routes>
            <Route 
              path="/Main/Lessons/:subject/:lessonId/:levelId/:stageId/:gamemodeId" 
              element={<GameModeRouter />} 
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // 1. Dismiss instructions popup
    const startBtn = await screen.findByRole("button", { name: /Start Challenge/i });
    fireEvent.click(startBtn);

    // 2. Select Option A
    const radioBtn = await screen.findByLabelText("<p>");
    fireEvent.click(radioBtn);

    // 3. Submit Answer
    const submitBtn = screen.getByRole("button", { name: /SUBMIT ANSWER/i });
    fireEvent.click(submitBtn);

    // 4. Assert Success & Continue
    expect(await screen.findByText(/Correct/i)).toBeInTheDocument();
    const continueBtn = screen.getByRole("button", { name: /Continue/i });
    fireEvent.click(continueBtn);
  });

  it("should complete Achievements Scenario 2: Claim Reward Flow", async () => {
    const queryClient = createTestClient();
    
    // Add unlocked, unclaimed achievement
    mockDb.users["user_test"].Achievements = {
      html_first: {
        isClaimed: false,
        coinsReward: 20,
        expReward: 10,
        achievementName: "First Tag"
      }
    };

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Achievements />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Find and Click Claim Reward button
    const claimBtn = await screen.findByRole("button", { name: /Claim Reward/i });
    fireEvent.click(claimBtn);

    // Wait for the button text to transition to "Claimed"
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Claimed/i })).toBeDisabled();
    });
  });
});
```
