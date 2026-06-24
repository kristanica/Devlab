import axios from "axios";
import { auth } from "@/services/firebase";

export interface EditLevelParams {
  category: string;
  lessonId: string;
  levelId: string;
  state: any;
}

const editLevel = async ({ category, lessonId, levelId, state }: EditLevelParams): Promise<any> => {
  const token = await auth.currentUser?.getIdToken(true);

  const res = await axios.post(
    import.meta.env.VITE_BACK_END + "/fireBaseAdmin/editLevel",
    { category, lessonId, levelId, state },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export default editLevel;
