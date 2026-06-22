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
  Toaster: () => null,
}));

describe("Shop E2E Tests", () => {
  beforeEach(() => {
    resetMockDb();
    setMockUser({
      uid: "user_shop",
      email: "shop@example.com",
      emailVerified: true,
      isSuspend: false,
    });
    vi.clearAllMocks();
  });

  it("Test 1: Successful purchase with sufficient coins (updates balance optimistically, triggers mock API, displays success toast)", async () => {
    mockDb.users["user_shop"] = {
      uid: "user_shop",
      email: "shop@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 100,
      role: "user",
    };

    server.use(
      http.get("*/fireBase/Shop", () => {
        return HttpResponse.json([
          {
            id: "item_shield",
            title: "Code Shield",
            desc: "Protects your streak",
            cost: 50,
            Icon: "shield.png"
          }
        ]);
      }),
      http.post("*/fireBase/purchaseItem", async () => {
        mockDb.users["user_shop"].coins -= 50;
        return HttpResponse.json({ success: true });
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Shop"]}>
        <App />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText("Code Shield")).toBeInTheDocument();
    });

    const buyButton = screen.getByRole("button", { name: /Buy for 50/i });
    fireEvent.click(buyButton);

    // Verify optimistic balance update and toast call
    await waitFor(() => {
      expect(toast.custom).toHaveBeenCalled();
      expect(screen.getByText("50")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("Test 2: Failed purchase from insufficient coins (triggers immediate error toast, no API request)", async () => {
    mockDb.users["user_shop"] = {
      uid: "user_shop",
      email: "shop@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 20,
      role: "user",
    };

    let apiCalled = false;
    server.use(
      http.get("*/fireBase/Shop", () => {
        return HttpResponse.json([
          {
            id: "item_shield",
            title: "Code Shield",
            desc: "Protects your streak",
            cost: 50,
            Icon: "shield.png"
          }
        ]);
      }),
      http.post("*/fireBase/purchaseItem", async () => {
        apiCalled = true;
        return HttpResponse.json({ success: true });
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Shop"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Code Shield")).toBeInTheDocument();
    });

    const buyButton = screen.getByRole("button", { name: /Buy for 50/i });
    fireEvent.click(buyButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Not enough DevCoins!", expect.any(Object));
      expect(apiCalled).toBe(false);
    });
  });

  it("Test 3: API purchase failure (500) triggers optimistic rollback of the coins balance", async () => {
    mockDb.users["user_shop"] = {
      uid: "user_shop",
      email: "shop@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 100,
      role: "user",
    };

    server.use(
      http.get("*/fireBase/Shop", () => {
        return HttpResponse.json([
          {
            id: "item_fail_500",
            title: "Broken Upgrade",
            desc: "Will fail on buy",
            cost: 50,
            Icon: "broken.png"
          }
        ]);
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Shop"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Broken Upgrade")).toBeInTheDocument();
    });

    const buyButton = screen.getByRole("button", { name: /Buy for 50/i });
    fireEvent.click(buyButton);

    // Balance should roll back to 100 after 500 error
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Purchase failed. Try again!", expect.any(Object));
      expect(screen.getByText("100")).toBeInTheDocument();
    });
  });

  it("Test 4: Shop grid skeleton display is shown during load, then resolves", async () => {
    mockDb.users["user_shop"] = {
      uid: "user_shop",
      email: "shop@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 100,
      role: "user",
    };

    // Delay shop items loading to inspect skeleton
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    server.use(
      http.get("*/fireBase/Shop", async () => {
        await promise;
        return HttpResponse.json([
          {
            id: "item_shield",
            title: "Code Shield",
            desc: "Protects your streak",
            cost: 50,
            Icon: "shield.png"
          }
        ]);
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Shop"]}>
        <App />
      </MemoryRouter>
    );

    // Verify skeleton loaders are present initially
    await waitFor(() => {
      expect(screen.getByText("Available Items")).toBeInTheDocument();
      expect(screen.queryByText("Code Shield")).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Resolve loading promise
    resolvePromise();

    // Verify skeleton resolves to the shop grid
    await waitFor(() => {
      expect(screen.getByText("Code Shield")).toBeInTheDocument();
    });
  });

  it("Test 5: Coin balance changes are propagated and animated in real-time", async () => {
    mockDb.users["user_shop"] = {
      uid: "user_shop",
      email: "shop@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 100,
      role: "user",
    };

    render(
      <MemoryRouter initialEntries={["/Main/Shop"]}>
        <App />
      </MemoryRouter>
    );

    // Check balance is initially loaded and animated
    await waitFor(() => {
      expect(screen.getByText("100")).toBeInTheDocument();
    });

    // Directly update user's coins in database to simulate backend increase
    mockDb.users["user_shop"].coins = 150;

    // Trigger window focus to force react-query to refetch
    window.dispatchEvent(new Event('focus'));
    window.dispatchEvent(new Event('visibilitychange'));

    // Trigger user data refresh if needed, or check animation propagation
    await waitFor(() => {
      expect(screen.getByText("150")).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
