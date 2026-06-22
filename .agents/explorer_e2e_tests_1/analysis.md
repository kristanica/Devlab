# E2E Test Design Specification: Auth & Lessons

This report details the analysis of the DevLab codebase for authentication and lesson features, and designs 10 comprehensive End-to-End (E2E) test cases. It provides exact DOM query patterns, user interaction flows, and assertions suitable for modern E2E testing tools like Playwright or Cypress.

---

## 1. Auth Test Suite (5 Test Cases)

### Test 1.1: Happy Path Login
* **Objective:** Verify a user with valid, verified, and active credentials can successfully log in and is redirected to the main dashboard.
* **Pre-conditions:**
  * User account exists with email `testuser@devlab.com` and password `Password123!`.
  * `emailVerified` is `true`.
  * `isSuspend` is `false` in the `/Users/{uid}` Firestore document.
* **Test Flow & DOM Selector Strategy:**
  1. Navigate to the login page `/` or `/login`.
  2. Query email input using `input[type="email"]` or `input[placeholder="Email address"]`. Type: `testuser@devlab.com`.
  3. Query password input using `input[type="password"]` or `input[placeholder="Password"]`. Type: `Password123!`.
  4. Query the "Remember me" checkbox label or input `input[type="checkbox"]` and click to check it.
  5. Locate the submit button `button[type="submit"]` which initially renders the text `"Sign In"`. Click it.
* **Asserted State Changes:**
  * Verify the submit button text changes to `"Signing in..."` and receives the `disabled` attribute (`disabled={loading}`).
  * Assert page navigates away from login to the dashboard `/Main`.
  * Assert that browser local storage has active persistence token (due to "Remember me" enabled).

---

### Test 1.2: Happy Path Registration
* **Objective:** Verify a user can successfully fill out the registration form, submit it, trigger verification, and initialize user records.
* **Pre-conditions:**
  * Email `newcoder@devlab.com` is unregistered in Firebase Auth.
* **Test Flow & DOM Selector Strategy:**
  1. Navigate to the login page, locate the "Create an account" toggle button: `button` inside `div.mt-8` containing text `"Create an account"`. Click it.
  2. Assert the `RegisterForm` component is rendered by querying the heading: `h2` with text `"Create account"`.
  3. Locate the Username input: `input[placeholder="Username"]`. Type: `newcoder`.
  4. Locate the Email input: `input[placeholder="Email address"]` (within the register form). Type: `newcoder@devlab.com`.
  5. Locate the Password input: `input[placeholder="Password"]` (first password input). Type: `SecurePass1!`.
  6. Locate the Confirm Password input: `input[placeholder="Confirm Password"]`. Type: `SecurePass1!`.
  7. Locate and click the Sign Up submit button: `button[type="submit"]` which initially reads `"Sign Up"`.
* **Asserted State Changes:**
  * Verify the submit button text changes to `"Creating account..."` and is disabled.
  * Assert that a success toast appears in the Toast container: `.Toastify__toast--success` containing `"Verification email sent! Please check your inbox."`.
  * Verify Firebase Auth triggers `sendEmailVerification` and a new Firestore document under `/Users/{new_uid}` is initialized with default fields (`exp: 0`, `userLevel: 1`, `coins: 0`, `bio: ""`, etc.).

---

### Test 1.3: Registration Password Validation
* **Objective:** Verify registration fails with appropriate error toast alerts when password criteria are unmet or mismatch occurs.
* **Pre-conditions:** None.
* **Test Flow & DOM Selector Strategy:**
  1. Navigate to the registration view.
  2. Fill Username `tester` and Email `tester@devlab.com`.
  3. **Case A (Too Short):** Input Password `Aa1!` and Confirm Password `Aa1!`. Click Submit.
     * *Assert:* Toast message `.Toastify__toast--error` displays `"Password must be at least 8 characters long"`.
  4. **Case B (No Uppercase):** Input Password `password1!` and Confirm Password `password1!`. Click Submit.
     * *Assert:* Toast message displays `"Password must contain an uppercase letter"`.
  5. **Case C (No Lowercase):** Input Password `PASSWORD1!` and Confirm Password `PASSWORD1!`. Click Submit.
     * *Assert:* Toast message displays `"Password must contain a lowercase letter"`.
  6. **Case D (No Number):** Input Password `Password!` and Confirm Password `Password!`. Click Submit.
     * *Assert:* Toast message displays `"Password must contain a number"`.
  7. **Case E (No Special Character):** Input Password `Password123` and Confirm Password `Password123`. Click Submit.
     * *Assert:* Toast message displays `"Password must contain a special character"`.
  8. **Case F (Mismatch):** Input Password `Password1!` and Confirm Password `Password2!`. Click Submit.
     * *Assert:* Toast message displays `"Passwords do not match!"`.
  9. **Interactive Tooltip Check:** Click the info marker `span` containing `ℹ️`.
     * *Assert:* The validation rules container (motion div) displays, listing items:
       * `At least 8 characters`
       * `One uppercase letter`
       * `One lowercase letter`
       * `One number`
       * `One special character`

---

### Test 1.4: Email Verification Block
* **Objective:** Verify users cannot log in if their email has not been verified.
* **Pre-conditions:**
  * User credentials `unverified@devlab.com` / `Password123!` exist, but the Firebase Auth `emailVerified` flag is `false`.
* **Test Flow & DOM Selector Strategy:**
  1. Navigate to the login screen.
  2. Input email: `unverified@devlab.com` and password: `Password123!`.
  3. Click `"Sign In"` (`button[type="submit"]`).
* **Asserted State Changes:**
  * The login handler reloads the user state (`await user.reload()`), catches that `!user.emailVerified` is true, calls `signOut(auth)`, and sets loading back to false.
  * Assert error toast `.Toastify__toast--error` displays `"Your email has not been verified yet."`.
  * Assert route remains on the login page (`/` or `/login`), and the user is NOT redirected to `/Main`.

---

### Test 1.5: Account Suspension Block
* **Objective:** Verify users are blocked from logging in if their account status is marked suspended in the database.
* **Pre-conditions:**
  * User credentials `suspended@devlab.com` / `Password123!` exist and email is verified.
  * The Firestore document `/Users/{uid}` contains field `isSuspend: true`.
* **Test Flow & DOM Selector Strategy:**
  1. Navigate to the login screen.
  2. Input email `suspended@devlab.com` and password `Password123!`.
  3. Click `"Sign In"` (`button[type="submit"]`).
* **Asserted State Changes:**
  * The login handler checks `userSnap.data()?.isSuspend` or catches firebase error code `auth/user-disabled`.
  * Sign out is triggered immediately via `signOut(auth)`.
  * Assert error toast `.Toastify__toast--error` displays `"Your account has been suspended."`.
  * Assert route remains on the login page, preventing access to the dashboard.

---

## 2. Lessons Test Suite (5 Test Cases)

### Test 2.1: HTML Lessons List Rendering
* **Objective:** Verify that when accessing HTML lessons, the system displays the correct lesson header, chapter structures, and curriculum list.
* **Pre-conditions:**
  * User is authenticated and navigated to the `/Lessons/Html` path.
* **Test Flow & DOM Selector Strategy:**
  1. Assert page header by querying `h1` containing `"< > HTML: The Gateway to Web Adventure"` (or config title).
  2. Verify badge rendering: `div` containing `"Core Module"` inside the header.
  3. Verify curriculum section: heading `h2` containing `"Curriculum"`.
  4. Query chapter sub-headers: find all `h3` elements containing `"Chapter "`. Assert that the correct number of chapters (retrieved from `levelsData` API) is rendered.
  5. Query about sidebar: `h2` containing `"About Html"`, and verify that list elements (`IoCheckmarkCircle` nodes) render checks: `"Structure Documents"`, `"Semantic Markup"`, `"SEO Fundamentals"`.
* **Asserted State Changes:**
  * Page displays full dashboard curriculum skeleton loaders first (`isLoading || progressLoading` animate-pulse states), then settles into fully populated level elements when API data is returned.

---

### Test 2.2: Navigation to Specific Lessons
* **Objective:** Verify that clicking an unlocked level card expands it to reveal the stages dropdown with smooth transitions.
* **Pre-conditions:**
  * HTML level 1 is unlocked (`isActive` is true in user progress dictionary).
* **Test Flow & DOM Selector Strategy:**
  1. Locate the Level card wrapper `div` matching Level 1 (containing level title `level.title` inside `h4` and description text inside `p`).
  2. Assert that the card does not have the locked class configuration (i.e. check for the hover effects like `config.theme.hoverBorder` or absence of `FaLock` icon inside the box).
  3. Query the chevron container inside the card: `div` containing class `rotate-180` should NOT exist before clicking.
  4. Click the level card container.
* **Asserted State Changes:**
  * Verify `expandedLevel` state updates, adding the expanded motion dropdown `motion.div` to the DOM.
  * Verify the chevron icon rotated (receives class `rotate-180`).
  * Verify the connector line `div.absolute.w-px.bg-\[\#2a2a3c\]` and stages list under the level become visible.

---

### Test 2.3: Loading a Specific Stage
* **Objective:** Verify that clicking on an unlocked stage card navigates the player into the dedicated lesson workspace page.
* **Pre-conditions:**
  * Level 1 is expanded, and Stage 1 (`stageId === "Stage1"`) is unlocked (`userStageCompleted` is true).
* **Test Flow & DOM Selector Strategy:**
  1. In the expanded stages panel, locate the clickable stage row (`div` with play icon `IoPlayOutline` or matching text title `stage.title`).
  2. Click the stage container.
* **Asserted State Changes:**
  * Assert browser path updates to match pattern: `/Main/Lessons/Html/{lessonId}/{levelId}/Stage1/Lesson`.
  * Assert page renders `LessonPage` layout including:
    * `GameHeader` (renders "DevLab" and level XP progress).
    * `SplitPane` containing `LessonInstructionPanel` on the left and `<Html_TE />` code panel on the right.
    * `GameFooter` containing the `"Next"` action button.

---

### Test 2.4: Back Navigation
* **Objective:** Verify back navigation buttons correctly return users back to the previous steps or curriculum view.
* **Pre-conditions:**
  * User is inside the stage workspace page for HTML Stage 2.
* **Test Flow & DOM Selector Strategy:**
  1. **Case A (Back to Curriculum):**
     * Locate the back button in `GameHeader`: `a` link containing `MdArrowBackIosNew` icon with property `to="/Main"`. Click it.
     * *Assert:* Route changes back to `/Main`.
  2. **Case B (Footer "Previous" Stage Navigation):**
     * Go back to Stage 2. In `GameFooter`, locate the `"Previous"` button: `button` with text `"Previous"`.
     * Assert it is not disabled (since current stage is not "Stage1" and previous stages are unlocked). Click it.
     * *Assert:* Route updates back to Stage 1.
     * Verify `"Previous"` button is now disabled because stage is `"Stage1"`.

---

### Test 2.5: Stage Lock & Locked Modal Behavior
* **Objective:** Verify clicking on locked levels/stages correctly halts navigation and displays the access locked modal.
* **Pre-conditions:**
  * At least one level/stage is locked (e.g. `isActive` is false, and `userStageCompleted` is false).
* **Test Flow & DOM Selector Strategy:**
  1. Locate the Level card corresponding to the locked level.
  2. Verify it contains `FaLock` icon instead of the subject icon and has style class `opacity-70`.
  3. Click the locked level card.
* **Asserted State Changes:**
  * Assert the locked levels do not toggle the stages dropdown list.
  * Assert `LessonLockedModal` is added to the DOM: query element `div` containing text `"Access Denied"` and `"You must complete the previous lessons to unlock this secure sector."`.
  * Locate the close/dismiss button: `button` with text `"Acknowledge"`. Click it.
  * Assert the modal is removed from the DOM.

---

## 3. Best Practices & Query Recommendations

To ensure these tests are robust, maintainable, and decoupled from styling/layouts:
1. **Targeting Inputs & Forms:** Use standard ARIA roles or specific semantic placeholders:
   * Playwright: `page.getByPlaceholder('Email address')`
   * Cypress: `cy.get('input[type="email"]')`
2. **Toast Alerts:** Query by toast role `.Toastify__toast` to retrieve warning/error/success text content dynamically, as class names may change.
3. **Zustand & DB mockups:** Use Firebase Emulators or a dedicated staging database to guarantee seed states (specifically checking `isSuspend` and `emailVerified` behaviors).
4. **Data Test IDs (`data-testid`):** Add unique attributes to elements that are difficult to locate cleanly due to nested structural divs, such as:
   * Level Card: `data-testid="level-card-levelId"`
   * Stage Card: `data-testid="stage-card-stageId"`
   * Tooltip trigger: `data-testid="password-tooltip-trigger"`
