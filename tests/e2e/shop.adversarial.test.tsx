import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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

describe("Shop Adversarial / Edge Case Tests", () => {
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

  it("Test 1: Rapid double-click on Buy triggers only one API call (debouncing/mutex)", async () => {
    mockDb.users["user_shop"] = {
      uid: "user_shop",
      email: "shop@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 100,
      role: "user",
    };

    let purchaseApiCalls = 0;

    server.use(
      http.get("*/fireBase/Shop", () => {
        return HttpResponse.json([
          { id: "item_shield", title: "Code Shield", desc: "Protects your streak", cost: 50, Icon: "shield.png" }
        ]);
      }),
      http.post("*/fireBase/purchaseItem", async () => {
        purchaseApiCalls++;
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
    fireEvent.click(buyButton);

    await waitFor(() => {
      expect(purchaseApiCalls).toBe(1);
    });
  });

  it("Test 2: Buy with exactly 0 coins shows insufficient-coins toast", async () => {
    mockDb.users["user_shop"] = {
      uid: "user_shop",
      email: "shop@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 0,
      role: "user",
    };

    server.use(
      http.get("*/fireBase/Shop", () => {
        return HttpResponse.json([
          { id: "item_shield", title: "Code Shield", desc: "Protects your streak", cost: 50, Icon: "shield.png" }
        ]);
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
    });
  });

  it("Test 3: Buy a free item (cost = 0) succeeds without deducting coins", async () => {
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
          { id: "item_free", title: "Free Sticker", desc: "It's free!", cost: 0, Icon: "free.png" }
        ]);
      }),
      http.post("*/fireBase/purchaseItem", async () => {
        return HttpResponse.json({ success: true });
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Shop"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Free Sticker")).toBeInTheDocument();
    });

    const buyButton = screen.getByRole("button", { name: /Buy for 0/i });
    fireEvent.click(buyButton);

    await waitFor(() => {
      expect(toast.custom).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText("100")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("Test 4: Navigate away mid-purchase does not bleed error state", async () => {
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
          { id: "item_shield", title: "Code Shield", desc: "Protects your streak", cost: 50, Icon: "shield.png" }
        ]);
      }),
      http.post("*/fireBase/purchaseItem", async () => {
        await new Promise(() => {});
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

    const dashboardLink = screen.getByText("Dashboard");
    fireEvent.click(dashboardLink);

    await waitFor(() => {
      expect(screen.getByText("DevLab")).toBeInTheDocument();
    });

    expect(toast.error).not.toHaveBeenCalled();
  });

  it("Test 5: Multiple items (10+) render in grid without layout breakage", async () => {
    mockDb.users["user_shop"] = {
      uid: "user_shop",
      email: "shop@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: 999,
      role: "user",
    };

    const items = Array.from({ length: 12 }, (_, i) => ({
      id: `item_${i}`,
      title: `Shop Item ${i + 1}`,
      desc: `Description for item ${i + 1}`,
      cost: (i + 1) * 10,
      Icon: `icon_${i}.png`
    }));

    server.use(
      http.get("*/fireBase/Shop", () => {
        return HttpResponse.json(items);
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Shop"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Shop Item 12")).toBeInTheDocument();
    });

    for (let i = 1; i <= 12; i++) {
      expect(screen.getByText(`Shop Item ${i}`)).toBeInTheDocument();
    }

    expect(screen.getByRole("heading", { name: "Available Items" })).toBeInTheDocument();
  });

  it("Test 6: Item with missing fields (no cost, no title) renders gracefully", async () => {
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
          { id: "item_bad", Icon: "unknown.png" }
        ]);
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Shop"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Available Items")).toBeInTheDocument();
      const itemCards = document.querySelectorAll('[class*="group relative overflow-hidden"]');
      expect(itemCards.length).toBe(1);
    });
  });

  it("Test 7: Empty shop response shows header but no items", async () => {
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
        return HttpResponse.json([]);
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Shop"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Available Items")).toBeInTheDocument();
    });

    const buyButtons = screen.queryAllByRole("button", { name: /Buy for/i });
    expect(buyButtons.length).toBe(0);
  });

  it("Test 8: Network failure on purchase shows error toast without crashing", async () => {
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
          { id: "item_shield", title: "Code Shield", desc: "Protects your streak", cost: 50, Icon: "shield.png" }
        ]);
      }),
      http.post("*/fireBase/purchaseItem", async () => {
        return HttpResponse.error();
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
      expect(toast.error).toHaveBeenCalledWith("Purchase failed. Try again!", expect.any(Object));
    });

    expect(screen.getByText("Available Items")).toBeInTheDocument();
  });

  it("Test 9: Coins display shows 0 instead of NaN when coins value is undefined", async () => {
    mockDb.users["user_shop"] = {
      uid: "user_shop",
      email: "shop@example.com",
      emailVerified: true,
      isSuspend: false,
      coins: undefined,
      role: "user",
    };

    server.use(
      http.get("*/fireBase/Shop", () => {
        return HttpResponse.json([
          { id: "item_shield", title: "Code Shield", desc: "Protects your streak", cost: 50, Icon: "shield.png" }
        ]);
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Shop"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Available Items")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("0")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("Test 10: Two purchases for different items in-flight both succeed without corruption", async () => {
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
          { id: "item_a", title: "Item A", desc: "First item", cost: 30, Icon: "a.png" },
          { id: "item_b", title: "Item B", desc: "Second item", cost: 20, Icon: "b.png" }
        ]);
      }),
      http.post("*/fireBase/purchaseItem", async () => {
        return HttpResponse.json({ success: true });
      })
    );

    render(
      <MemoryRouter initialEntries={["/Main/Shop"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Item A")).toBeInTheDocument();
      expect(screen.getByText("Item B")).toBeInTheDocument();
    });

    const buyButtonA = screen.getByRole("button", { name: /Buy for 30/i });
    const buyButtonB = screen.getByRole("button", { name: /Buy for 20/i });

    fireEvent.click(buyButtonA);
    fireEvent.click(buyButtonB);

    await waitFor(() => {
      expect(toast.custom).toHaveBeenCalledTimes(2);
    }, { timeout: 3000 });

    expect(toast.error).not.toHaveBeenCalled();
  });
});
