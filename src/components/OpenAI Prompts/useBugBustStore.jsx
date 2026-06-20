import { create } from "zustand";

export const useGameStore = create((set, get) => ({
  //  For storing all code snippets
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

  //  Evaluation flags and data
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

  //  For AI evaluation feedback
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


