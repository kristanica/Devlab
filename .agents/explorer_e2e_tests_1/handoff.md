# Handoff Report: E2E Test Design for Auth & Lessons

This handoff report summarizes the read-only investigation of the DevLab codebase for authentication and lesson features, and provides a structured plan for implementing E2E tests.

## 1. Observation
* **LoginForm File:** `C:\Users\lain\Documents\code\Devlab\src\components\Login\LoginForm.tsx`
  * Input email line 43-50:
    ```tsx
    <input
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      type="email"
      placeholder="Email address"
      required
      className="..."
    />
    ```
  * Input password line 57-64:
    ```tsx
    <input
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      type={showPassword ? "text" : "password"}
      placeholder="Password"
      required
      className="..."
    />
    ```
  * Submit button line 101-107:
    ```tsx
    <button
      type="submit"
      disabled={loading}
      className="..."
    >
      {loading ? "Signing in..." : "Sign In"}
    </button>
    ```
* **RegisterForm File:** `C:\Users\lain\Documents\code\Devlab\src\components\Login\RegisterForm.tsx`
  * Details password requirements on line 107-113:
    ```tsx
    <li>• At least 8 characters</li>
    <li>• One uppercase letter</li>
    <li>• One lowercase letter</li>
    <li>• One number</li>
    <li>• One special character</li>
    ```
* **Auth Hook Logic:** `C:\Users\lain\Documents\code\Devlab\src\components\Login\useAuthLogic.ts`
  * Email verification check (lines 57-62):
    ```ts
    if (!user.emailVerified) {
      await signOut(auth);
      toast.error("Your email has not been verified yet.", { position: "top-center", theme: "colored" });
      setLoading(false);
      return;
    }
    ```
  * Suspension check (lines 64-72):
    ```ts
    const userRef = doc(db, "Users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data()?.isSuspend) {
      await signOut(auth);
      toast.error("Your account has been suspended.", { position: "top-center", theme: "colored" });
      setLoading(false);
      return;
    }
    ```
* **Lesson Curriculum Structure:** `C:\Users\lain\Documents\code\Devlab\src\components\Lessons\LessonCurriculum.tsx`
  * Displays chapter headers on line 62-64:
    ```tsx
    <h3 className={`font-exo text-xl font-bold text-white border-b border-[#2a2a3c] pb-2 ${config.theme.textLight}`}>
      Chapter {lesson.Lesson}
    </h3>
    ```
  * Controls stage click handler & navigation on lines 146-150:
    ```tsx
    onClick={() => {
      if (isStageUnlocked) {
        navigate(`/Main/Lessons/${subject}/${lesson.id}/${level.id}/${stage.id}/${stage.type}`);
      }
    }}
    ```
* **Game Workspace Navigators:**
  * Header Back Button: `C:\Users\lain\Documents\code\Devlab\src\gameMode\GameModes_Components\GameHeader.tsx` lines 31-36:
    ```tsx
    <Link
      to="/Main"
      className="..."
    >
      <MdArrowBackIosNew className="text-xl" />
    </Link>
    ```
  * Footer Prev Button: `C:\Users\lain\Documents\code\Devlab\src\gameMode\GameModes_Components\GameFooter.tsx` lines 136-146:
    ```tsx
    <button
      onClick={!isPrevDisabled ? () => goToPreviousStage({ subject, lessonId, levelId, stageId, navigate }) : undefined}
      disabled={isPrevDisabled || isLoading}
      className="..."
    >
      Previous
    </button>
    ```

## 2. Logic Chain
1. Based on **LoginForm** and **RegisterForm** DOM markup observations, inputs are bound to state via `value` (email, password, username, confirmPassword) and submit buttons have unique `type="submit"` attributes. Hence, we can query inputs by `placeholder` or attribute types, and find buttons by submission context.
2. Based on the **useAuthLogic.ts** verification and suspension branches:
   * A simulated user whose firebase auth returns `emailVerified === false` will trigger a toast message reading `"Your email has not been verified yet."` and sign the user out.
   * A simulated user whose database entry contains `isSuspend: true` will trigger a toast message reading `"Your account has been suspended."`.
   * These specific toast strings serve as our validation target text contents in E2E assertions.
3. Based on **LessonCurriculum.tsx** rendering:
   * Level cards represent list nodes with condition `isUnlocked`. When `isUnlocked` is false, it triggers `setShowLockedModal(true)`.
   * Unlocked stages route directly to `/Main/Lessons/{subject}/{lessonId}/{levelId}/{stageId}/{stageType}` on click.
   * Back-navigation uses `<Link to="/Main">` in the `GameHeader` component, and footer navigation uses `goToPreviousStage`.
   * Thus, we can test full list structures, locked states (by verifying locked modals trigger on click), transition states (expanding chapters/levels), stage navigation paths, and back/previous loops using standard route/dom text expectations.

## 3. Caveats
* The actual database status (`isSuspend`, progress completion) depends on external calls (Firestore / backend API). For exact E2E tests, the Firebase emulator or test seeds must be populated beforehand, or the API endpoints must be stubbed/mocked.
* UI transitions are wrapped in `framer-motion` `AnimatePresence`. Action testing should wait for animation layouts to settle (using auto-waiting features in Playwright or explicit wait timeouts in Cypress) to avoid selector resolution failures.

## 4. Conclusion
We have mapped the exact components, input configurations, error triggers, and navigation targets for both the Auth flow and Lesson screens. We have generated a complete, actionable test plan containing 5 Auth test cases and 5 Lessons test cases, detailing selector pathways and assertion conditions, stored in `analysis.md`.

## 5. Verification Method
1. Inspect the generated report: `C:\Users\lain\Documents\code\Devlab\.agents\explorer_e2e_tests_1\analysis.md`.
2. Verify selectors and logic flows against actual component rendering by running the DevLab UI locally (`npm run dev`) and inspecting the target DOM nodes in browser tools.
3. If an E2E framework (e.g. Playwright) is introduced in the future, running `npx playwright test` with specs based on `analysis.md` should run successfully when backend stubs are active.
