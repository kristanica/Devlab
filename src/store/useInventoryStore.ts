import { create } from "zustand";
import { doc, deleteDoc, getDoc, increment, updateDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import type { InventoryItem } from "../types";

interface InventoryStore {
  inventory: InventoryItem[];
  activeBuffs: string[];
  setInventory: (items: InventoryItem[]) => void;
  useItem: (itemId: string, buffName?: string) => Promise<void>;
  removeBuff: (buffName: string) => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  inventory: [],
  activeBuffs: [],

  setInventory: (items) => set({ inventory: items }),

  useItem: async (itemId, buffName) => {
    set((state) => ({
      activeBuffs:
        buffName && !state.activeBuffs.includes(buffName)
          ? [...state.activeBuffs, buffName]
          : state.activeBuffs,
    }));

    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user found.");
    }

    const itemRef = doc(db, "Users", user.uid, "Inventory", itemId);
    await updateDoc(itemRef, { quantity: increment(-1) });

    const snap = await getDoc(itemRef);
    const itemData = snap.data() as { quantity?: number } | undefined;
    if (!snap.exists() || (itemData?.quantity ?? 0) <= 0) {
      await deleteDoc(itemRef);
    }
  },

  removeBuff: (buffName) =>
    set((state) => ({
      activeBuffs: state.activeBuffs.filter((buff) => buff !== buffName),
    })),
}));
