import { useState, useEffect } from "react";
import { db, auth } from "../../Firebase/Firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function useUserInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const inventoryRef = collection(db, "Users", user.uid, "Inventory");

    // Listen for changes in real time
    const unsubscribe = onSnapshot(inventoryRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInventory(items);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup when component unmounts
  }, []);

  return { inventory, loading };
}
