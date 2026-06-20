import axios from "axios";
import { auth } from "../../Firebase/Firebase";

export const callGameOver = async (subject, lessonId, levelId, stageId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const token = await user.getIdToken();

    const response = await axios.post(
      `
https://devlab-server-railway-master-production.up.railway.app/fireBaseAdmin/gameOver`,
      {
        id: user.uid,
        category: subject,
        lessonId,
        levelId,
        stageId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // return the backend message
  } catch (error) {
    console.error(
      "Error in gameOverAPI:",
      error.response?.data || error.message
    );
    throw error;
  }
};
