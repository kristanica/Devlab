import "@testing-library/jest-dom";
import { beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "./mocks/handlers";
import { resetMockDb } from "./mocks/mockFirebase";

// Start MSW Server
export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  server.resetHandlers();
  resetMockDb();
  localStorage.clear();
});
afterAll(() => server.close());

// Mock Audio
global.Audio = class {
  currentTime = 0;
  preload = "";
  play() { return Promise.resolve(); }
  pause() {}
  load() {}
} as any;

// Mock Lottie React
vi.mock("lottie-react", () => {
  return {
    default: () => null,
  };
});

// Mock CodeMirror Editor to render as simple text area
vi.mock("@uiw/react-codemirror", () => {
  return {
    default: ({ value, onChange, placeholder, ...props }: any) => {
      const React = require("react");
      return React.createElement("textarea", {
        "data-testid": "codemirror-mock",
        value: value,
        placeholder: placeholder,
        onChange: (e: any) => onChange && onChange(e.target.value),
        ...props,
      });
    },
  };
});
