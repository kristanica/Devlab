import { auth } from "../../../Firebase/Firebase";
import axios from "axios";

export const suspendAccount = async (id, toggleDisable) => {
  const token = await auth.currentUser?.getIdToken(true);

  const response = await axios.post(
    `
https://devlab-server-railway-master-production.up.railway.app/fireBaseAdmin/suspendAccount`,
    { uid: id, toggleDisable },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data; // { uid, isAccountSuspended }
};
