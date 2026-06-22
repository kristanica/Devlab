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

describe("Auth E2E Tests", () => {
  beforeEach(() => {
    resetMockDb();
    setMockUser(null);
    vi.clearAllMocks();
  });

  it("Test 1: Happy path login (verifies redirection on valid login)", async () => {
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

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i) || screen.getByText(/Welcome back/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("Test 2: Happy path registration (verifies signup, username, email verification success toast)", async () => {
    render(
      <MemoryRouter initialEntries={["/Login"]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Create an account/i }));

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
      target: { value: "SecurePass123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Verification email sent! Please check your inbox.",
        expect.any(Object)
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Registered successfully! Please verify your email before logging in.",
        expect.any(Object)
      );
    });
  });

  it("Test 3: Password validation rules (verifies toast errors for short, missing uppercase/lowercase/number/special character passwords, and tooltip presentation)", async () => {
    render(
      <MemoryRouter initialEntries={["/Login"]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Create an account/i }));

    const testPassword = async (pass: string, expectedError: string) => {
      fireEvent.change(screen.getByPlaceholderText("Username"), {
        target: { value: "newUser" },
      });
      fireEvent.change(screen.getByPlaceholderText("Email address"), {
        target: { value: "new@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText(/^Password$/), {
        target: { value: pass },
      });
      fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
        target: { value: pass },
      });
      fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expectedError, expect.any(Object));
      });
      vi.clearAllMocks();
    };

    await testPassword("Short1!", "Password must be at least 8 characters long");
    await testPassword("no_uppercase_1!", "Password must contain an uppercase letter");
    await testPassword("NO_LOWERCASE_1!", "Password must contain a lowercase letter");
    await testPassword("NoNumberHere!", "Password must contain a number");
    await testPassword("NoSpecialChar123", "Password must contain a special character");

    const infoIcon = screen.getByText("ℹ️");
    fireEvent.click(infoIcon);
    expect(screen.getByText("Password must contain:")).toBeInTheDocument();
  });

  it("Test 4: Unverified email block (verifies signout and error toast when user has verified=false)", async () => {
    mockDb.users["user_2"] = {
      uid: "user_2",
      email: "unverified@example.com",
      emailVerified: false,
      isSuspend: false,
      role: "user",
    };

    render(
      <MemoryRouter initialEntries={["/Login"]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "unverified@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Your email has not been verified yet.",
        expect.any(Object)
      );
    });
  });

  it("Test 5: Account suspension block (verifies signout and error toast when user has isSuspend=true)", async () => {
    mockDb.users["user_3"] = {
      uid: "user_3",
      email: "suspended@example.com",
      emailVerified: true,
      isSuspend: true,
      role: "user",
    };

    render(
      <MemoryRouter initialEntries={["/Login"]}>
        <App />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "suspended@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Password123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Your account has been suspended.",
        expect.any(Object)
      );
    });
  });
});
