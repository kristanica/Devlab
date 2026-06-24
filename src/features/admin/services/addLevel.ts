import axios from "axios";
import { auth } from "@/services/firebase";

export interface AddLevelParams {
  category: string;
  lessonId: string;
}

const addLevel = async ({ category, lessonId }: AddLevelParams): Promise<any> => {
  const token = await auth.currentUser?.getIdToken(true);

  const res = await axios.post(
    import.meta.env.VITE_BACK_END + "/fireBaseAdmin/addLevel",
    { category, lessonId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export default addLevel;
