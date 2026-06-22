import { useState, useEffect } from "react";
import { db, auth } from "../services/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import type { InventoryItem } from "../types";

export default function useUserInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const inventoryRef = collection(db, "Users", user.uid, "Inventory");

    const unsubscribe = onSnapshot(inventoryRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InventoryItem[];
      setInventory(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { inventory, loading };
}
