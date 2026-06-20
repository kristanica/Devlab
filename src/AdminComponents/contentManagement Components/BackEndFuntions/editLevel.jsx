import axios from "axios";
import { auth } from "../../../Firebase/Firebase";

const editLevel = async ({ category, lessonId, levelId, state }) => {
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
