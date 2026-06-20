import axios from "axios";
import { auth } from "../../../Firebase/Firebase";

const fetchUsers = async () => {
  // Ensure user is logged in
  if (!auth.currentUser) {
    throw new Error("No authenticated user found.");
  }

  // Get Firebase ID token
  const token = await auth.currentUser.getIdToken(true);

try {
  const res = await axios.get(
    `https://devlab-server-railway-master-production.up.railway.app/fireBaseAdmin/getUsers`,
    { headers: { Authorization: `Bearer ${token}` } }
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
