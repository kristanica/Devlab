import { auth } from "@/services/firebase";
import axios from "axios";

export const deleteSpecificAchievement = async ({ category, uid }) => {
  try {
    const token = await auth.currentUser?.getIdToken(true);
    const response = await axios.post(`
${import.meta.env.VITE_BACK_END}/fireBaseAdmin/deleteAchievement`, 
       
        {category: category,
        uid: uid},
        {
          headers: {
        Authorization: `Bearer ${token}`,
      },}
    );
    return response.data; // return backend response
  } catch (error) {
    console.error("Error deleting achievement:", error);
    throw error; // rethrow so React Query or caller can handle it
  }
};
