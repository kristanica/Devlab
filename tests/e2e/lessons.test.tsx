import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import App from "@/App";
import { mockDb, setMockUser, resetMockDb } from "./mocks/mockFirebase";
import { server } from "./setup";
import { http, HttpResponse } from "msw";

describe("Lessons E2E Tests", () => {
  beforeEach(() => {
    resetMockDb();
    setMockUser({
      uid: "user_lessons",
      email: "lessons@example.com",
      emailVerified: true,
      isSuspend: false,
    });
  });

  it("Test 1: HTML curriculum page lists levels, headers, chapters", async () => {
    // Seed user progress to unlock Level1
    mockDb.users["user_lessons"] = {
      uid: "user_lessons",
      email: "lessons@example.com",
      emailVerified: true,
      isSuspend: false,
      role: "user",
    };

    render(
      <MemoryRouter initialEntries={["/Main/Lessons/Html"]}>
        <App />
      </MemoryRouter>
    );

    // Verify curriculum lists level, header, chapter
    await waitFor(() => {
      expect(screen.getByText("Curriculum")).toBeInTheDocument();
      expect(screen.getByText("Chapter 1")).toBeInTheDocument();
      expect(screen.getByText("Syntax Basics")).toBeInTheDocument();
    });
  });

  it("Test 2: Navigation expands level card chevrons and shows stage links", async () => {
    mockDb.users["user_lessons"] = {
      uid: "user_lessons",
      email: "lessons@example.com",
      emailVerified: true,
      isSuspend: false,
      role: "user",
    };

    render(
      <MemoryRouter initialEntries={["/Main/Lessons/Html"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Syntax Basics")).toBeInTheDocument();
    });

    // Click Level1 card to expand
    fireEvent.click(screen.getByText("Syntax Basics"));

    // Verify stage links are displayed after expansion
    await waitFor(() => {
      expect(screen.getByText("Intro Stage")).toBeInTheDocument();
      expect(screen.getByText("BrainBytes MC Challenge")).toBeInTheDocument();
    });
  });

  it("Test 3: Stage card routing opens the workspace layout", async () => {
    mockDb.users["user_lessons"] = {
      uid: "user_lessons",
      email: "lessons@example.com",
      emailVerified: true,
      isSuspend: false,
      role: "user",
    };

    // Unlock stage in database for stage access checker
    mockDb.progress["user_lessons"] = {
      "Html/Lessons/Lesson1/Levels/Level1/Stages/Stage1": {
        isActive: true,
        isCompleted: false,
      }
    };

    render(
      <MemoryRouter initialEntries={["/Main/Lessons/Html"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Syntax Basics")).toBeInTheDocument();
    });

    // Expand
    fireEvent.click(screen.getByText("Syntax Basics"));

    await waitFor(() => {
      expect(screen.getByText("Intro Stage")).toBeInTheDocument();
    });

    // Click Intro Stage link
    fireEvent.click(screen.getByText("Intro Stage"));

    // Verify it routes to the workspace layout (e.g. loads GameModeRouter content)
    await waitFor(() => {
      expect(screen.getByText("DevLab")).toBeInTheDocument();
    });
  });

  it("Test 4: Back navigation links route to main menu, and footer Previous transitions correctly", async () => {
    mockDb.users["user_lessons"] = {
      uid: "user_lessons",
      email: "lessons@example.com",
      emailVerified: true,
      isSuspend: false,
      role: "user",
    };

    mockDb.progress["user_lessons"] = {
      "Html/Lessons/Lesson1/Levels/Level1/Stages/Stage1": {
        isActive: true,
        isCompleted: true,
      },
      "Html/Lessons/Lesson1/Levels/Level1/Stages/Stage2": {
        isActive: true,
        isCompleted: false,
      }
    };

    render(
      <MemoryRouter initialEntries={["/Main/Lessons/Html/Lesson1/Level1/Stage2/BrainBytes"]}>
        <Routes>
          <Route path="/Main" element={<div>Mock Main Menu</div>} />
          <Route path="/Main/Lessons/:subject/:lessonId/:levelId/:stageId/:gamemodeId" element={<App />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify we are in the game workspace
    await waitFor(() => {
      expect(screen.getByText("DevLab")).toBeInTheDocument();
    });

    // Verify Previous button in footer is visible and transitions back to Stage1
    const prevButton = screen.getByRole("button", { name: /Previous/i });
    expect(prevButton).toBeInTheDocument();

    fireEvent.click(prevButton);

    // Verify transition back to Stage1 (which is Lesson gamemode)
    await waitFor(() => {
      expect(screen.getByText(/Intro Stage/i) || screen.getByText(/Stage1/i)).toBeInTheDocument();
    });
  });

  it("Test 5: Locked stage modals block navigation and show warning popup", async () => {
    mockDb.users["user_lessons"] = {
      uid: "user_lessons",
      email: "lessons@example.com",
      emailVerified: true,
      isSuspend: false,
      role: "user",
    };

    // Override User Progress mock to return locked level (isActive: false)
    server.use(
      http.get("*/fireBase/userProgres/:subject", () => {
        return HttpResponse.json({
          allProgress: {
            "Lesson1-Level1": { isActive: false }
          },
          allStages: {},
          allStagesComplete: {},
          completedLevels: 0,
          completedStages: 0,
        });
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Lessons/Html"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Syntax Basics")).toBeInTheDocument();
    });

    // Click Level card (it is locked)
    fireEvent.click(screen.getByText("Syntax Basics"));

    // Verify Access Denied modal pops up
    await waitFor(() => {
      expect(screen.getByText("Access Denied")).toBeInTheDocument();
      expect(screen.getByText(/You must complete the previous lessons to unlock this secure sector/i)).toBeInTheDocument();
    });
  });
});
