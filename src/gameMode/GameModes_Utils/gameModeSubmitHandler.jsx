import bugBustPrompt from "../../components/OpenAI Prompts/bugBustPrompt";
import codeCrafterPrompt from "../../components/OpenAI Prompts/codeCrafterPrompt";
import codeRushPrompt from "../../components/OpenAI Prompts/codeRushPrompt";

import { useGameStore } from "../../components/OpenAI Prompts/useBugBustStore";


export const gameModeSubmitHandlers = {
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
    evaluation: result.correct ? "Correct" : "Incorrect",
    feedback: result.feedback,
  });
      }
      setIsCorrect(result?.correct || false);
      setShowIsCorrect(true);
      console.log(result);
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
    evaluation: result.correct ? "Correct" : "Incorrect",
    feedback: result.feedback,
  });
      }
      setIsCorrect(result?.correct || false);
      setShowIsCorrect(true);
      console.log(result);
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
    evaluation: result.correct ? "Correct" : "Incorrect",
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
