import { auth } from "@/services/firebase";
import axios from "axios";

export const suspendAccount = async (id: string, toggleDisable: boolean): Promise<any> => {
  const token = await auth.currentUser?.getIdToken(true);

  const response = await axios.post(
    `${import.meta.env.VITE_BACK_END}/fireBaseAdmin/suspendAccount`,
    { uid: id, toggleDisable },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data; // { uid, isAccountSuspended }
};
