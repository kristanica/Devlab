import axios from "axios";
import { auth } from "@/services/firebase";


const deleteLevel = async ({ category, lessonId, levelId }) => {
  const token = await auth.currentUser?.getIdToken(true);

  try {
    const res = await axios.post(
      `
${import.meta.env.VITE_BACK_END}/fireBaseAdmin/deleteLevel`,
      { category, lessonId, levelId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error deleting level:", error);
    throw error;
  }
};

export default deleteLevel;
