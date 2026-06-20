import { useReducer } from "react";

// Initial state
const initialState = {
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
    sql:"",
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

// Reducer
const reducer = (state, action) => {
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
          { id: action.payload.id, type: action.payload.type, value: action.payload.value },
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
