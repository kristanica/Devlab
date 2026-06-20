// stores/useInventoryStore.js
import { create } from "zustand";
import { db, auth } from "../../Firebase/Firebase";
import { doc, updateDoc, deleteDoc, getDoc, increment } from "firebase/firestore";

export const useInventoryStore = create((set, get) => ({
  inventory: [],
  activeBuffs: [],

  setInventory: (items) => set({ inventory: items }),

useItem: async (itemId, buffName) => {
  // Update Zustand immediately 
  set((state) => {
    let updatedBuffs = state.activeBuffs;

    if (buffName && !state.activeBuffs.includes(buffName)) {
      // Only add if it doesn't already exist
      updatedBuffs = [...state.activeBuffs, buffName];
    }

    return { activeBuffs: updatedBuffs };
  });

  // Update Firestore in background
  const userId = auth.currentUser.uid;
  const itemRef = doc(db, "Users", userId, "Inventory", itemId);

  await updateDoc(itemRef, { quantity: increment(-1) });
  const snap = await getDoc(itemRef);

  if (!snap.exists() || snap.data().quantity <= 0) {
    await deleteDoc(itemRef);
  }
},

  removeBuff: (buffName) => set((state) => ({
  activeBuffs: state.activeBuffs.filter((buff) => buff !== buffName)
}))
}));
