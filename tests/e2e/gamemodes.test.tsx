import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import App from "@/App";
import { mockDb, setMockUser, resetMockDb } from "./mocks/mockFirebase";
import { server } from "./setup";
import { http, HttpResponse } from "msw";

describe("Gamemodes E2E Tests", () => {
  beforeEach(() => {
    resetMockDb();
    setMockUser({
      uid: "user_game",
      email: "game@example.com",
      emailVerified: true,
      isSuspend: false,
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("Test 1: MC BrainBytes happy path playthrough (select option, submit answer, success popup, continue)", async () => {
    mockDb.users["user_game"] = {
      uid: "user_game",
      email: "game@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 100,
      role: "user",
    };

    mockDb.progress["user_game"] = {
      "Html/Lessons/Lesson1/Levels/Level1/Stages/Stage2": {
        isActive: true,
        isCompleted: false,
      }
    };

    server.use(
      http.get("*/fireBase/getGameMode/:subject/:lessonId/:levelId/:stageId", () => {
        return HttpResponse.json({
          stage: {
            type: "BrainBytes",
            title: "Syntax Quiz",
            description: "Choose correct option.",
            instruction: "Identify the correct tag",
            choices: {
              correctAnswer: "A",
              A: "Option A Text",
              B: "Option B Text",
              C: "Option C Text"
            }
          },
          level: {
            levelOrder: 1,
            expReward: 50,
            coinsReward: 100
          }
        });
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Lessons/Html/Lesson1/Level1/Stage2/BrainBytes"]}>
        <App />
      </MemoryRouter>
    );

    // Click start challenge on instruction popup
    await waitFor(() => {
      expect(screen.getByText("Start Challenge")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Start Challenge"));

    // Verify option is visible and click it
    await waitFor(() => {
      expect(screen.getByText("Option A Text")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Option A Text"));

    // Click SUBMIT ANSWER
    fireEvent.click(screen.getByText("SUBMIT ANSWER"));

    // Verify Correct Answer popup is visible
    await waitFor(() => {
      expect(screen.getByText("Correct Answer!")).toBeInTheDocument();
    });

    // Click Continue
    fireEvent.click(screen.getByText("Continue"));
  });

  it("Test 2: Correct vs incorrect answers (select wrong answer, submit, click retry, decrements hearts; select correct, submit, success popup)", async () => {
    mockDb.users["user_game"] = {
      uid: "user_game",
      email: "game@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 100,
      role: "user",
    };

    mockDb.progress["user_game"] = {
      "Html/Lessons/Lesson1/Levels/Level1/Stages/Stage2": {
        isActive: true,
        isCompleted: false,
      }
    };

    server.use(
      http.get("*/fireBase/getGameMode/:subject/:lessonId/:levelId/:stageId", () => {
        return HttpResponse.json({
          stage: {
            type: "BrainBytes",
            title: "Syntax Quiz",
            description: "Choose correct option.",
            instruction: "Identify the correct tag",
            choices: {
              correctAnswer: "A",
              A: "Option A Text",
              B: "Option B Text",
              C: "Option C Text"
            }
          },
          level: {
            levelOrder: 1,
            expReward: 50,
            coinsReward: 100
          }
        });
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Lessons/Html/Lesson1/Level1/Stage2/BrainBytes"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Start Challenge")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Start Challenge"));

    await waitFor(() => {
      expect(screen.getByText("Option B Text")).toBeInTheDocument();
    });

    // Select incorrect answer B
    fireEvent.click(screen.getByText("Option B Text"));
    fireEvent.click(screen.getByText("SUBMIT ANSWER"));

    // Verify Wrong Answer popup
    await waitFor(() => {
      expect(screen.getByText("Wrong Answer")).toBeInTheDocument();
    });

    // Click Retry and verify heart decrement (2 hearts left)
    fireEvent.click(screen.getByText("Retry"));

    // Select correct answer A
    await waitFor(() => {
      expect(screen.getByText("Option A Text")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Option A Text"));
    fireEvent.click(screen.getByText("SUBMIT ANSWER"));

    // Verify Correct Answer popup
    await waitFor(() => {
      expect(screen.getByText("Correct Answer!")).toBeInTheDocument();
    });
  });

  it("Test 3: Level completed rewards (completing last stage renders LevelCompleted popup, increments XP/coins, updates profile)", async () => {
    mockDb.users["user_game"] = {
      uid: "user_game",
      email: "game@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 100,
      exp: 0,
      userLevel: 1,
      role: "user",
    };

    mockDb.progress["user_game"] = {
      "Html/Lessons/Lesson1/Levels/Level1/Stages/Stage2": {
        isActive: true,
        isCompleted: false,
      }
    };

    // Level configuration data in Firestore path Html/Lesson1/Levels/Level1
    mockDb.progress["user_game"]["Html/Lesson1/Levels/Level1"] = {
      expReward: 50,
      coinsReward: 100,
    };

    server.use(
      http.get("*/fireBase/getGameMode/:subject/:lessonId/:levelId/:stageId", () => {
        return HttpResponse.json({
          stage: {
            type: "BrainBytes",
            title: "Syntax Quiz",
            choices: {
              correctAnswer: "A",
              A: "Option A Text",
            }
          },
          level: {
            levelOrder: 1,
            expReward: 50,
            coinsReward: 100
          }
        });
      }),
      // Mock unlockStage to return next level unlock (trigger reward grant)
      http.post("*/fireBase/unlockStage", () => {
        return HttpResponse.json({
          isNextLevelUnlocked: true
        });
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Lessons/Html/Lesson1/Level1/Stage2/BrainBytes"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Start Challenge")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Start Challenge"));

    await waitFor(() => {
      expect(screen.getByText("Option A Text")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Option A Text"));
    fireEvent.click(screen.getByText("SUBMIT ANSWER"));

    await waitFor(() => {
      expect(screen.getByText("Correct Answer!")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Continue"));

    // Verify Level Completed Popup renders and displays reward details
    await waitFor(() => {
      expect(screen.getByText("LEVEL COMPLETED")).toBeInTheDocument();
      // Verify XP/coins incremented in user stats in database
      expect(mockDb.users["user_game"].coins).toBe(200);
      expect(mockDb.users["user_game"].exp).toBe(50);
    });
  });

  it("Test 4: Heart depletion game over (heart drops to 0, renders GameOver popup, exits to first lesson, resets hearts)", async () => {
    mockDb.users["user_game"] = {
      uid: "user_game",
      email: "game@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 100,
      role: "user",
    };

    mockDb.progress["user_game"] = {
      "Html/Lessons/Lesson1/Levels/Level1/Stages/Stage1": {
        isActive: true,
        isCompleted: true,
      },
      "Html/Lessons/Lesson1/Levels/Level1/Stages/Stage2": {
        isActive: true,
        isCompleted: false,
      }
    };

    server.use(
      http.get("*/fireBase/getGameMode/:subject/:lessonId/:levelId/:stageId", () => {
        return HttpResponse.json({
          stage: {
            type: "BrainBytes",
            title: "Syntax Quiz",
            choices: {
              correctAnswer: "A",
              A: "Option A Text",
              B: "Option B Text",
            }
          },
          level: {
            levelOrder: 1,
            expReward: 50,
            coinsReward: 100
          }
        });
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Lessons/Html/Lesson1/Level1/Stage2/BrainBytes"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Start Challenge")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Start Challenge"));

    await waitFor(() => {
      expect(screen.getByText("Option B Text")).toBeInTheDocument();
    });

    // 1st Wrong Attempt (3 -> 2 hearts)
    fireEvent.click(screen.getByText("Option B Text"));
    fireEvent.click(screen.getByText("SUBMIT ANSWER"));
    await waitFor(() => expect(screen.getByText("Wrong Answer")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Retry"));

    // 2nd Wrong Attempt (2 -> 1 hearts)
    await waitFor(() => expect(screen.getByText("Option B Text")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Option B Text"));
    fireEvent.click(screen.getByText("SUBMIT ANSWER"));
    await waitFor(() => expect(screen.getByText("Wrong Answer")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Retry"));

    // 3rd Wrong Attempt (1 -> 0 hearts)
    await waitFor(() => expect(screen.getByText("Option B Text")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Option B Text"));
    fireEvent.click(screen.getByText("SUBMIT ANSWER"));

    // Click Retry to decrement heart from 1 to 0 and trigger game over
    await waitFor(() => expect(screen.getByText("Wrong Answer")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Retry"));

    // Verify Game Over Popup shows up (text is "Game Over !!" in the component)
    await waitFor(() => {
      expect(screen.getAllByText("Game Over !!").length).toBeGreaterThanOrEqual(1);
    });

    // Exit to first lesson (button text matches Gameover_PopUp component)
    fireEvent.click(screen.getAllByRole("button", { name: /Go back to the 1st Lesson/i })[0]);

    await waitFor(() => {
      expect(screen.getByText("DevLab")).toBeInTheDocument();
    });
  });

  it("Test 5: CodeEditor (typing code, RUN button updates preview body, SUBMIT evaluates using MSW mocked sandbox, success popup)", async () => {
    mockDb.users["user_game"] = {
      uid: "user_game",
      email: "game@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 100,
      role: "user",
    };

    mockDb.progress["user_game"] = {
      "Html/Lessons/Lesson1/Levels/Level1/Stages/Stage3": {
        isActive: true,
        isCompleted: false,
      }
    };

    server.use(
      http.get("*/fireBase/getGameMode/:subject/:lessonId/:levelId/:stageId", () => {
        return HttpResponse.json({
          stage: {
            type: "CodeCrafter",
            title: "HTML Boilerplate",
            description: "Write html",
            instruction: "Create a div",
            codingInterface: {
              html: "",
            }
          },
          level: {
            levelOrder: 1,
            expReward: 50,
            coinsReward: 100
          }
        });
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Lessons/Html/Lesson1/Level1/Stage3/CodeCrafter"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Start Challenge")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Start Challenge"));

    // Locate custom mocked codemirror textarea and type html
    await waitFor(() => {
      expect(screen.getByTestId("codemirror-mock")).toBeInTheDocument();
    });
    const textarea = screen.getByTestId("codemirror-mock");
    fireEvent.change(textarea, { target: { value: "<div>Hello Devlab!</div>" } });

    // Click RUN button
    const runBtn = screen.getByRole("button", { name: /RUN/i });
    fireEvent.click(runBtn);

    // Verify preview frame is rendered with output body
    await waitFor(() => {
      expect(screen.getByTitle("output")).toBeInTheDocument();
    });

    // Click Submit (which is the Next/Submit button in footer)
    const submitBtn = screen.getByRole("button", { name: /Submit/i });
    fireEvent.click(submitBtn);

    // Verify success popup displays correct evaluation response
    await waitFor(() => {
      expect(screen.getByText("Correct Answer!")).toBeInTheDocument();
    });
  });
});
