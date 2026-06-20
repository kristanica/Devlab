import axios from "axios";
import { auth } from "../../../Firebase/Firebase";

const editLevel = async ({ category, lessonId, levelId, state }) => {
  const token = await auth.currentUser?.getIdToken(true);

  const res = await axios.post(
    "https://devlab-server-railway-master-production.up.railway.app/fireBaseAdmin/editLevel",
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
