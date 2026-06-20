import axios from "axios";
import { auth } from "../../Firebase/Firebase";

export const purchaseItem = async (itemId, itemCost, itemName) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const token = await user.getIdToken();

    const response = await axios.post(
      `
https://devlab-server-railway-master-production.up.railway.app/fireBase/purchaseItem`,
      { itemId, itemCost, itemName },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // backend returns { message, newCoins }
  } catch (error) {
    console.error("Error in purchaseItem API:", error.response?.data || error.message);
    throw error;
  }
};
