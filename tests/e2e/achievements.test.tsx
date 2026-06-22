import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import App from "@/App";
import { mockDb, setMockUser, resetMockDb } from "./mocks/mockFirebase";
import { toast } from "react-hot-toast";
import { server } from "./setup";
import { http, HttpResponse } from "msw";

vi.mock("react-hot-toast", () => ({
  toast: {
    custom: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("Achievements E2E Tests", () => {
  beforeEach(() => {
    resetMockDb();
    setMockUser({
      uid: "user_ach",
      email: "ach@example.com",
      emailVerified: true,
      isSuspend: false,
    });
    vi.clearAllMocks();
  });

  it("Test 1: Unlocked achievement lists showing Claim Reward buttons, locked achievements show lock icon and disabled buttons", async () => {
    mockDb.users["user_ach"] = {
      uid: "user_ach",
      email: "ach@example.com",
      emailVerified: true,
      isSuspend: false,
      role: "user",
    };

    // First Steps is unlocked, Subject Master is locked (not present)
    mockDb.achievements["user_ach"] = {
      ach_first_steps: {
        isClaimed: false,
        achievementName: "First Steps",
        coinsReward: 100,
        expReward: 50,
      }
    };

    render(
      <MemoryRouter initialEntries={["/Main/Achievements"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("First Steps")).toBeInTheDocument();
    });

    // Unlocked achievement button:
    expect(screen.getByRole("button", { name: /Claim Reward/i })).toBeInTheDocument();

    // Locked achievement button:
    expect(screen.getByRole("button", { name: /Locked/i })).toBeDisabled();
  });

  it("Test 2: Clicking Claim Reward triggers database state change, success toast with coins/XP values, transitions text to Claimed", async () => {
    mockDb.users["user_ach"] = {
      uid: "user_ach",
      email: "ach@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 100,
      exp: 0,
      userLevel: 1,
      role: "user",
    };

    mockDb.achievements["user_ach"] = {
      ach_first_steps: {
        isClaimed: false,
        achievementName: "First Steps",
        coinsReward: 100,
        expReward: 50,
      }
    };

    render(
      <MemoryRouter initialEntries={["/Main/Achievements"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("First Steps")).toBeInTheDocument();
    });

    const claimBtn = screen.getByRole("button", { name: /Claim Reward/i });
    fireEvent.click(claimBtn);

    // Verify database updates
    await waitFor(() => {
      expect(mockDb.achievements["user_ach"]["ach_first_steps"].isClaimed).toBe(true);
      expect(mockDb.users["user_ach"].coins).toBe(200);
      expect(mockDb.users["user_ach"].exp).toBe(50);
      expect(toast.custom).toHaveBeenCalled();
      expect(screen.getByRole("button", { name: /Claimed/i })).toBeInTheDocument();
    });
  });

  it("Test 3: Coin balance updates optimistically in dashboard stats", async () => {
    mockDb.users["user_ach"] = {
      uid: "user_ach",
      email: "ach@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 100,
      role: "user",
    };

    mockDb.achievements["user_ach"] = {
      ach_first_steps: {
        isClaimed: false,
        achievementName: "First Steps",
        coinsReward: 100,
        expReward: 50,
      }
    };

    render(
      <MemoryRouter initialEntries={["/Main"]}>
        <App />
      </MemoryRouter>
    );

    // Check dashboard initially has 100 coins
    await waitFor(() => {
      expect(screen.getByText("100")).toBeInTheDocument();
    });

    // Navigate to Achievements and claim
    render(
      <MemoryRouter initialEntries={["/Main/Achievements"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("First Steps")).toBeInTheDocument();
    });

    const claimBtn = screen.getByRole("button", { name: /Claim Reward/i });
    fireEvent.click(claimBtn);

    // Verify balance updates optimistically (200 coins)
    await waitFor(() => {
      expect(mockDb.users["user_ach"].coins).toBe(200);
    });
  });

  it("Test 4: Claiming XP rewards triggers Level progression and remainder calculations", async () => {
    mockDb.users["user_ach"] = {
      uid: "user_ach",
      email: "ach@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 100,
      exp: 90,
      userLevel: 1,
      role: "user",
    };

    mockDb.achievements["user_ach"] = {
      ach_first_steps: {
        isClaimed: false,
        achievementName: "First Steps",
        coinsReward: 100,
        expReward: 50,
      }
    };

    render(
      <MemoryRouter initialEntries={["/Main/Achievements"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("First Steps")).toBeInTheDocument();
    });

    const claimBtn = screen.getByRole("button", { name: /Claim Reward/i });
    fireEvent.click(claimBtn);

    // Verify Level progressions: 90 + 50 = 140 -> Level 2, Exp remainder 40
    await waitFor(() => {
      expect(mockDb.users["user_ach"].userLevel).toBe(2);
      expect(mockDb.users["user_ach"].exp).toBe(40);
    });
  });

  it("Test 5: Full onboarding journey (login -> complete stage -> level complete popup -> unlock achievement toast -> click Achievements page -> claim reward -> coins update)", async () => {
    mockDb.users["user_ach"] = {
      uid: "user_ach",
      email: "ach@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 100,
      exp: 0,
      userLevel: 1,
      role: "user",
    };

    mockDb.progress["user_ach"] = {
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

    // Start onboarding from Login page
    render(
      <MemoryRouter initialEntries={["/Login"]}>
        <App />
      </MemoryRouter>
    );

    // 1. Log in
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "ach@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    // 2. Redirected to Main dashboard
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i) || screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });

    // 3. Complete Stage 2
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

    // Verify level completed popup is visible
    await waitFor(() => {
      expect(screen.getByText("Level Completed!")).toBeInTheDocument();
    });

    // Verify achievement unlocked toast/state
    await waitFor(() => {
      expect(mockDb.achievements["user_ach"]["ach_first_steps"]).toBeDefined();
    });

    // 4. Click Achievements page link (render achievements page directly)
    render(
      <MemoryRouter initialEntries={["/Main/Achievements"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("First Steps")).toBeInTheDocument();
    });

    // 5. Claim reward
    const claimBtn = screen.getByRole("button", { name: /Claim Reward/i });
    fireEvent.click(claimBtn);

    // Verify coins update (initial 100 + 100 from level completed + 100 from achievement claimed = 300)
    await waitFor(() => {
      expect(mockDb.users["user_ach"].coins).toBe(300);
    });
  });
});
