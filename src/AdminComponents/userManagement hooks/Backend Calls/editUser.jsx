import { auth } from "../../../Firebase/Firebase";
import axios from "axios";

export const editUser = async ({ uid, state }) => {
  const token = await auth.currentUser?.getIdToken(true);

  if (!token) throw new Error("User not authenticated");

  const response = await axios.post(
    `
${import.meta.env.VITE_BACK_END}/fireBaseAdmin/editUser`,
    {
      uid,
      username: state.username,
      bio: state.bio,
      userLevel: state.userLevel,
      coins: state.coins,
      exp: state.exp,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  console.log("editUser response:", response.data);
  return response.data;
};
