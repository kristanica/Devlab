import axios from "axios";
import { auth } from "@/services/firebase";

const addLesson = async ({ category }) => {
  const token = await auth.currentUser?.getIdToken(true);

  const res = await axios.post(
    import.meta.env.VITE_BACK_END + "/fireBaseAdmin/addLesson",
    { category },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data; // includes message
};

export default addLesson;
