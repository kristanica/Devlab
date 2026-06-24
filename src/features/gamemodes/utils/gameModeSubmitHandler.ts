import bugBustPrompt from '@/services/openai/bugBustPrompt';
import codeCrafterPrompt from '@/services/openai/codeCrafterPrompt';
import codeRushPrompt from '@/services/openai/codeRushPrompt';
import { useGameStore } from "@/store/useGameStore";
import { goToNextStage } from "./utilNavigation";
import type { NavigateFunction } from "react-router-dom";

interface SubmitParams {
  submittedCode: string;
  setIsCorrect: (val: boolean) => void;
  setShowIsCorrect: (val: boolean) => void;
  instruction: string;
  providedCode: string;
  description: string;
  subject: string;
  stageId: string;
}

interface BrainBytesParams {
  params: {
    subject: string;
    lessonId: string;
    levelId: string;
    stageId: string;
    navigate: NavigateFunction;
    setLevelComplete: (val: boolean) => void;
    userId: string;
    setAlreadyComplete: (val: boolean) => void;
  };
}

interface GameModeSubmitHandlers {
  BugBust: (params: SubmitParams) => Promise<void>;
  CodeCrafter: (params: SubmitParams) => Promise<void>;
  CodeRush: (params: SubmitParams) => Promise<void>;
  BrainBytes: (params: BrainBytesParams) => Promise<void>;
}

export const gameModeSubmitHandlers: GameModeSubmitHandlers = {
  BugBust: async ({submittedCode,setIsCorrect,setShowIsCorrect,instruction,providedCode,description,subject, stageId}) => {
    setIsCorrect(false);
    try {
      const result = await bugBustPrompt({
        submittedCode,
        instruction,
        providedCode,
        description,
        subject,
      });
      if (result?.correct && result?.feedback) {
        useGameStore.getState().setSingleFeedback(result.feedback);
          useGameStore.getState().addStageFeedback({
    stageId: stageId || "UnknownStage",
    isCorrect: result.correct,
    feedback: result.feedback,
  });
      }
      setIsCorrect(result?.correct || false);
      setShowIsCorrect(true);
    } catch (error) {
      setIsCorrect(false);
      setShowIsCorrect(true);
    }
  },
  CodeCrafter: async ({submittedCode,setIsCorrect,setShowIsCorrect,instruction,providedCode,description,subject, stageId}) => {
    setIsCorrect(false);
    try {
      const result = await codeCrafterPrompt({
        submittedCode,
        instruction,
        providedCode,
        description,
        subject,
      });
      if (result?.correct && result?.feedback) {
        useGameStore.getState().setSingleFeedback(result.feedback);
          useGameStore.getState().addStageFeedback({
    stageId: stageId || "UnknownStage",
    isCorrect: result.correct,
    feedback: result.feedback,
  });
      }
      setIsCorrect(result?.correct || false);
      setShowIsCorrect(true);
    } catch (error) {
      setIsCorrect(false);
      setShowIsCorrect(true);
    }
  },

  CodeRush: async ({submittedCode,setIsCorrect,setShowIsCorrect,instruction,providedCode,description,subject, stageId}) => {
    setIsCorrect(false);
    const { setIsEvaluating } = useGameStore.getState();
    try {
      setIsEvaluating(true);
      const result = await codeRushPrompt({
        submittedCode,
        instruction,
        providedCode,
        description,
        subject,
      });
      if (result?.correct && result?.feedback) {
        useGameStore.getState().setSingleFeedback(result.feedback);
          useGameStore.getState().addStageFeedback({
    stageId: stageId || "UnknownStage",
    isCorrect: result.correct,
    feedback: result.feedback,
  });
      }
      setIsCorrect(result?.correct || false);
      setShowIsCorrect(true);
      console.log(result);
    } catch (error) {
      setIsCorrect(false);
      setShowIsCorrect(true);
    }finally {
      setIsEvaluating(false);
    }
  },

  BrainBytes: async ({ params }) => {
    goToNextStage(params);
  },
};
