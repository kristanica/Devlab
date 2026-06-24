import { auth } from "@/services/firebase";
import axios from "axios";

export interface DeleteAchievementParams {
  category: string;
  uid: string;
}

export const deleteSpecificAchievement = async ({ category, uid }: DeleteAchievementParams): Promise<any> => {
  try {
    const token = await auth.currentUser?.getIdToken(true);
    const response = await axios.post(
      `${import.meta.env.VITE_BACK_END}/fireBaseAdmin/deleteAchievement`,
      { category, uid },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting achievement:", error);
    throw error;
  }
};
