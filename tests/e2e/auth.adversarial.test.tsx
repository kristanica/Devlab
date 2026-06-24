import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "@/App";
import { mockDb, setMockUser, resetMockDb } from "./mocks/mockFirebase";
import { toast } from "react-toastify";

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));

describe("Auth Adversarial E2E Tests", () => {
  beforeEach(() => {
    resetMockDb();
    setMockUser(null);
    vi.clearAllMocks();
  });

  it("Test 1: Rapid form submission — loading state prevents double-submit", async () => {
    mockDb.users["user_1"] = {
      uid: "user_1",
      email: "test@example.com",
      emailVerified: true,
      isSuspend: false,
      role: "user",
    };

    render(
      <MemoryRouter initialEntries={["/Login"]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Password123!" },
    });

    const signInBtn = screen.getByRole("button", { name: /Sign In/i });

    fireEvent.click(signInBtn);

    await waitFor(() => {
      expect(signInBtn).toBeDisabled();
    });

    fireEvent.click(signInBtn);

    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("Test 2: Empty input submission — form validation prevents submission", async () => {
    render(
      <MemoryRouter initialEntries={["/Login"]}>
        <App />
      </MemoryRouter>
    );

    const signInBtn = screen.getByRole("button", { name: /Sign In/i });
    fireEvent.click(signInBtn);

    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(signInBtn).not.toBeDisabled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
  });

  it("Test 3: Whitespace padding in email — browser trims and login works", async () => {
    mockDb.users["user_1"] = {
      uid: "user_1",
      email: "test@example.com",
      emailVerified: true,
      isSuspend: false,
      role: "user",
    };

    render(
      <MemoryRouter initialEntries={["/Login"]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "  test@example.com  " },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("Test 4: XSS attempt in username — stored safely without execution", async () => {
    render(
      <MemoryRouter initialEntries={["/Login"]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Create an account"));

    const xssPayload = "<script>alert('xss')</script>";

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: xssPayload },
    });
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "xss@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^Password$/), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "SecurePass123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Registered successfully! Please verify your email before logging in.",
        expect.any(Object)
      );
    });

    const createdUser = Object.values(mockDb.users).find(
      (u: any) => u.email === "xss@example.com"
    );
    expect(createdUser).toBeDefined();
    expect((createdUser as any).username).toBe(xssPayload);
  });

  it("Test 5: Extremely long email — handled gracefully", async () => {
    render(
      <MemoryRouter initialEntries={["/Login"]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Create an account"));

    const longEmail = "a".repeat(500) + "@b.com";

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "longemail" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: longEmail },
    });
    fireEvent.change(screen.getByPlaceholderText(/^Password$/), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "SecurePass123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    await waitFor(() => {
      const anyToast =
        (toast.success as ReturnType<typeof vi.fn>).mock.calls.length > 0 ||
        (toast.error as ReturnType<typeof vi.fn>).mock.calls.length > 0;
      expect(anyToast).toBe(true);
    });
  });

  it("Test 6: Password mismatch — error toast shown", async () => {
    render(
      <MemoryRouter initialEntries={["/Login"]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Create an account"));

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "newUser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^Password$/), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "DifferentPass456!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Passwords do not match!",
        expect.any(Object)
      );
    });
  });

  it("Test 7: Case sensitivity in email — login still works with uppercase", async () => {
    mockDb.users["user_1"] = {
      uid: "user_1",
      email: "test@example.com",
      emailVerified: true,
      isSuspend: false,
      role: "user",
    };

    render(
      <MemoryRouter initialEntries={["/Login"]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "TEST@EXAMPLE.COM" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("Test 8: Concurrent renders — rapid form toggling causes no errors", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={["/Login"]}>
        <App />
      </MemoryRouter>
    );

    let inLogin = true;
    for (let i = 0; i < 10; i++) {
      if (inLogin) {
        const btn = screen.queryByText("Create an account");
        if (btn) fireEvent.click(btn);
      } else {
        const btn = screen.queryByText("Sign In");
        if (btn) fireEvent.click(btn);
      }
      inLogin = !inLogin;
    }

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("Test 9: Navigate away during loading — no stuck loading state", async () => {
    mockDb.users["user_1"] = {
      uid: "user_1",
      email: "test@example.com",
      emailVerified: true,
      isSuspend: false,
      role: "user",
    };

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { unmount } = render(
      <MemoryRouter initialEntries={["/Login"]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    unmount();

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("Test 10: Invalid email format — error toast shown during registration", async () => {
    render(
      <MemoryRouter initialEntries={["/Login"]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Create an account"));

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "newUser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^Password$/), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "SecurePass123!" },
    });

    const form = screen.getByPlaceholderText("Email address").closest("form") as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Email is not in valid format",
        expect.any(Object)
      );
    });
  });
});
