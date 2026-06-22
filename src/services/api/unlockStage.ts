// @ts-nocheck
import axios from "axios";
import { auth } from "@/services/firebase";

export const unlockStage = async (subject, lessonId, levelId, stageId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const token = await user.getIdToken();

    const response = await axios.post(
      `
${import.meta.env.VITE_BACK_END}/fireBase/unlockStage`, 
      { subject, lessonId, levelId, stageId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // 🔹 Return the backend response
  } catch (error) {
    console.error("Error in unlockStage API:", error.response?.data || error.message);
    throw error; // rethrow so caller can handle it
  }
};
