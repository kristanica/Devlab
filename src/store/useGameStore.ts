import { create } from "zustand";

export interface SubmittedCode {
  HTML?: string;
  CSS?: string;
  JS?: string;
  SQL?: string;
}

export interface StageFeedback {
  stageId?: string;
  feedback: string;
  isCorrect: boolean;
  [key: string]: any;
}

export interface GameState {
  submittedCode: Required<SubmittedCode>;
  setSubmittedCode: (code: SubmittedCode) => void;
  isCorrect: boolean | null;
  setIsCorrect: (value: boolean | null) => void;
  showIsCorrect: boolean;
  setShowIsCorrect: (value: boolean) => void;
  isEvaluating: boolean;
  setIsEvaluating: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  loadingHint: boolean;
  setLoadingHint: (value: boolean) => void;
  singleFeedback: string | null;
  setSingleFeedback: (feedback: string | null) => void;
  clearSingleFeedback: () => void;
  stageFeedbacks: StageFeedback[];
  addStageFeedback: (feedback: StageFeedback) => void;
  getAllFeedbacks: () => StageFeedback[];
  clearAllFeedbacks: () => void;
  lastGamemode: string | null;
  setLastGamemode: (mode: string | null) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  submittedCode: {
    HTML: "",
    CSS: "",
    JS: "",
    SQL: "",
  },
  setSubmittedCode: (code) =>
    set((state) => ({
      submittedCode: { ...state.submittedCode, ...code },
    })),

  isCorrect: null,
  setIsCorrect: (value) => set({ isCorrect: value }),

  showIsCorrect: false,
  setShowIsCorrect: (value) => set({ showIsCorrect: value }),

  isEvaluating: false,
  setIsEvaluating: (value) => set({ isEvaluating: value }),

  loading: false,
  setLoading: (value) => set({ loading: value }),

  loadingHint: false,
  setLoadingHint: (value) => set({ loadingHint: value }),

  singleFeedback: null,
  setSingleFeedback: (feedback) => set({ singleFeedback: feedback }),
  clearSingleFeedback: () => set({ singleFeedback: null }),

  stageFeedbacks: [],
  addStageFeedback: (feedback) =>
    set((state) => ({
      stageFeedbacks: [...state.stageFeedbacks, feedback],
    })),
  getAllFeedbacks: () => get().stageFeedbacks,
  clearAllFeedbacks: () => set({ stageFeedbacks: [] }),

  lastGamemode: null,
  setLastGamemode: (mode) => set({ lastGamemode: mode }),
}));
