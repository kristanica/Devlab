import axios from "axios";
import { auth } from "@/services/firebase";

export interface AddStageParams {
  category: string;
  lessonId: string;
  levelId: string;
}

const addStage = async ({ category, lessonId, levelId }: AddStageParams): Promise<any> => {
  const token = await auth.currentUser?.getIdToken(true);

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BACK_END}/fireBaseAdmin/addStage`,
      { category, lessonId, levelId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error Adding Stage:", error);
    throw error;
  }
};

export default addStage;
