// @ts-nocheck
import axios from "axios";
import { auth } from "@/services/firebase"; 
import { useGameStore } from "@/store/useGameStore";

export const fetchLevelSummary = async () => {
  const { stageFeedbacks, clearAllFeedbacks } = useGameStore.getState();
  const feedbackArray = Object.values(stageFeedbacks).flat();

  if (!feedbackArray || feedbackArray.length === 0) {
    console.log("No stage feedback to summarize.");
    return null;
  }

  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("No authenticated user found.");
      return null;
    }
    const token = await currentUser.getIdToken(true);
    const response = await axios.post(
      `
${import.meta.env.VITE_BACK_END}/openAI/feedbackPrompts`,
      { stageFeedbacks: feedbackArray },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Level Summary:", response.data.response);
    return response.data.response;

  } catch (error) {
    if (error.response) {
      console.error("Backend responded with error:", error.response.data);
    } else if (error.request) {
      console.error("No response from backend. Request:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    return null;

  } finally {
    //  Always clear feedbacks (success or fail)
    clearAllFeedbacks();
    console.log("stageFeedbacks cleared (finally block).");
  }
};
