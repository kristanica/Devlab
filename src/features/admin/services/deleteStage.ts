import axios from "axios";
import { auth } from "@/services/firebase";

export interface DeleteStageParams {
  category: string;
  lessonId: string;
  levelId: string;
  stageId: string;
}

const deleteStage = async ({ category, lessonId, levelId, stageId }: DeleteStageParams): Promise<any> => {
  const token = await auth.currentUser?.getIdToken(true);

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BACK_END}/fireBaseAdmin/deleteStage`,
      { category, lessonId, levelId, stageId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error Deleting Stage:", error);
    throw error;
  }
};

export default deleteStage;
