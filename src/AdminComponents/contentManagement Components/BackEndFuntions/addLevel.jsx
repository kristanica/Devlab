import axios from "axios";
import { auth } from "../../../Firebase/Firebase";

const addLevel = async ({ category, lessonId }) => {
  const token = await auth.currentUser?.getIdToken(true);

  const res = await axios.post(
    "https://devlab-server-railway-master-production.up.railway.app/fireBaseAdmin/addLevel",
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
