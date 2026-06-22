import { describe, it, expect, beforeEach, vi } from "vitest";
import { useRewardStore } from "../../src/store/useRewardStore";
import { useAttemptStore, createUseAttemptStore } from "../../src/store/useAttemptStore";
import { validateEmail, validatePassword } from "../../src/utils/validations";

// We need to set up mock user for attempt store
import { setMockUser } from "./mocks/mockFirebase";

describe("Zustand Reward Store", () => {
  beforeEach(() => {
    useRewardStore.getState().clearReward();
  });

  it("should have initial reward state of 0 exp and 0 coins", () => {
    const state = useRewardStore.getState();
    expect(state.lastReward.exp).toBe(0);
    expect(state.lastReward.coins).toBe(0);
  });

  it("should set reward correctly", () => {
    useRewardStore.getState().setLastReward(100, 50);
    const state = useRewardStore.getState();
    expect(state.lastReward.exp).toBe(100);
    expect(state.lastReward.coins).toBe(50);
  });

  it("should clear reward correctly", () => {
    useRewardStore.getState().setLastReward(100, 50);
    useRewardStore.getState().clearReward();
    const state = useRewardStore.getState();
    expect(state.lastReward.exp).toBe(0);
    expect(state.lastReward.coins).toBe(0);
  });
});

describe("Zustand Attempt Store", () => {
  beforeEach(() => {
    setMockUser({ uid: "test_user_123" });
  });

  it("should load hearts and default to max", () => {
    // AttemptStore is parameterized by user, which requires a hook invocation or mock user.
    // Since useAttemptStore is a wrapper hook, we can also test it inside a React context, or call createUseAttemptStore directly:
    const store = createUseAttemptStore("test_user_123");
    
    expect(store.getState().heart).toBe(3);
    expect(store.getState().maxHearts).toBe(3);
    expect(store.getState().gameOver).toBe(false);
  });

  it("should decrement hearts on incorrect attempt", () => {
    const store = createUseAttemptStore("test_user_123");
    
    store.getState().submitAttempt(false);
    expect(store.getState().heart).toBe(2);
    expect(store.getState().gameOver).toBe(false);
  });

  it("should set game over when hearts hit 0", () => {
    const store = createUseAttemptStore("test_user_123");
    
    store.getState().submitAttempt(false);
    store.getState().submitAttempt(false);
    store.getState().submitAttempt(false);
    expect(store.getState().heart).toBe(0);
    expect(store.getState().gameOver).toBe(true);
  });

  it("should apply extra lives", () => {
    const store = createUseAttemptStore("test_user_123");
    
    const applied = store.getState().applyExtraLives();
    expect(applied).toBe(true);
    expect(store.getState().heart).toBe(4);
    expect(store.getState().maxHearts).toBe(5);
  });
});

describe("Validations Utility", () => {
  describe("validateEmail", () => {
    it("should accept valid email formats", () => {
      const [status, msg] = validateEmail("user@example.com");
      expect(status).toBe("success");
    });

    it("should reject invalid email formats", () => {
      const [status, msg] = validateEmail("invalid-email");
      expect(status).toBe("error");
    });
  });

  describe("validatePassword", () => {
    it("should reject passwords shorter than 8 characters", () => {
      const [status, msg] = validatePassword("Short1!");
      expect(status).toBe("error");
      expect(msg).toContain("8 characters");
    });

    it("should reject passwords lacking uppercase letters", () => {
      const [status, msg] = validatePassword("lowercase1!");
      expect(status).toBe("error");
      expect(msg).toContain("uppercase");
    });

    it("should reject passwords lacking lowercase letters", () => {
      const [status, msg] = validatePassword("UPPERCASE1!");
      expect(status).toBe("error");
      expect(msg).toContain("lowercase");
    });

    it("should accept strong passwords", () => {
      const [status, msg] = validatePassword("StrongPass123!");
      expect(status).toBe("success");
    });
  });
});
