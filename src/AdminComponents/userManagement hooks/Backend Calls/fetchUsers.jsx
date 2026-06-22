import axios from "axios";
import { auth } from "@/services/firebase";

const fetchUsers = async () => {
  // Ensure user is logged in
  if (!auth.currentUser) {
    throw new Error("No authenticated user found.");
  }

  // Get Firebase ID token
  const token = await auth.currentUser.getIdToken(true);

  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BACK_END}/fireBaseAdmin/getUsers`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    console.log("Axios response:", res);
    console.log("Response data:", res.data);
    return res.data;
  } catch (error) {
    console.error("Axios error:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
};

export default fetchUsers;
