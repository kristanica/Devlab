import { useReducer } from "react";
import { ContentBlock } from "../types";

export interface StageState {
  title: string;
  description: string;
  isHidden: boolean;
  type: string;
  instruction: string;
  codingInterface: {
    html: string;
    css: string;
    js: string;
    sql: string;
  };
  timer?: number;
  choices: {
    a: string;
    b: string;
    c: string;
    d: string;
    correctAnswer: string;
  };
  copyCode: string;
  blocks: ContentBlock[];
}

// Initial state
const initialState: StageState = {
  // General
  title: "",
  description: "",
  isHidden: false,
  type: "",
  instruction: "",
  codingInterface: {
    html: "",
    css: "",
    js: "",
    sql: "",
  },
  // Code Rush
  timer: undefined,

  // BrainBytes
  choices: {
    a: "",
    b: "",
    c: "",
    d: "",
    correctAnswer: "",
  },

  // CodeCrafter
  copyCode: "",

  // Common Blocks
  blocks: [],
};

export type EditStageAction =
  | { type: "UPDATE_FIELD"; field: string; value: any }
  | { type: "UPDATE_CODING_INTERFACE"; field: string; value: string }
  | { type: "UPDATE_FIELD_CHOICES"; field: string; value: string }
  | { type: "ADD_BLOCK"; payload: ContentBlock }
  | { type: "UPDATE_BLOCK"; payload: { id: string | number; value: any } }
  | { type: "REMOVE_BLOCK"; id: string | number }
  | { type: "RESET_ALL_FIELD" }
  | { type: "UPDATE_ALL_FIELDS"; payload: Partial<StageState> };

// Reducer
const reducer = (state: StageState, action: EditStageAction): StageState => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };

    case "UPDATE_CODING_INTERFACE":
      return {
        ...state,
        codingInterface: {
          ...state.codingInterface,
          [action.field]: action.value,
        },
      };

    case "UPDATE_FIELD_CHOICES":
      return {
        ...state,
        choices: {
          ...state.choices,
          [action.field]: action.value,
        },
      };

    case "ADD_BLOCK":
      return {
        ...state,
        blocks: [
          ...state.blocks,
          action.payload,
        ],
      };

    case "UPDATE_BLOCK":
      return {
        ...state,
        blocks: state.blocks.map((block) =>
          block.id === action.payload.id
            ? { ...block, value: action.payload.value }
            : block
        ),
      };

    case "REMOVE_BLOCK":
      return {
        ...state,
        blocks: state.blocks.filter((block) => block.id !== action.id),
      };

    case "RESET_ALL_FIELD":
      return { ...initialState };

    case "UPDATE_ALL_FIELDS":
      return { ...initialState, ...action.payload };

    default:
      return state;
  }
};

// Custom hook
const useEditStage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
};

export default useEditStage;
