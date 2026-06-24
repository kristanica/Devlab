import React, { useState } from "react";
import { PiTreasureChest } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import useUserInventory from "@/hooks/useUserInventory";
import { useInventoryStore } from "@/store/useInventoryStore";
import { unlockAchievement } from "@/services/UnlockAchievement";
import useFetchUserData from '@/services/api/useFetchUserData';
import { useParams } from "react-router-dom";
import { useAttemptStore } from "@/store/useAttemptStore";

interface UIInventoryItem {
  id: string;
  title: string;
  Icon: string;
  quantity: number;
  type: string;
  effect: unknown;
}

function ItemsUse({ setShowCodeWhisper, gamemodeId }: { setShowCodeWhisper: (val: boolean) => void; gamemodeId: string }): React.ReactNode {
  const { subject } = useParams();
  const { userData } = useFetchUserData();
  const icons: Record<string, { default: string }> = import.meta.glob("../../assets/ItemsIcon/*", { eager: true });
  const [showInventory, setShowInventory] = useState(false);
  const { inventory: rawInventory } = useUserInventory();
  const userInventory = rawInventory as unknown as UIInventoryItem[];
  const useItem = useInventoryStore((state) => state.useItem);
const applyExtraLives = useAttemptStore((state) => state.applyExtraLives);


  const [brainFilterUsed, setBrainFilterUsed] = useState(false);


  const showItemUsedToast = (item: UIInventoryItem) => {
    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="bg-[#1A0B2E]/90 border border-purple-500 rounded-2xl shadow-[0_0_20px_rgba(128,0,255,0.7)] px-6 py-4 flex items-center gap-4 max-w-sm w-full mx-auto"
        >
          <div className="w-12 h-12 rounded-full bg-purple-800 flex justify-center items-center shadow-inner">
            <img
                    src={icons[`../../assets/ItemsIcon/${item.Icon}`]?.default || ""}
              alt={item.title}
              className="w-8 h-8 object-contain"
            />
          </div>

          <div className="flex flex-col text-left">
            <h1 className="font-exo text-purple-400 font-bold text-lg">
              ⚡ {item.title} activated!
            </h1>
            <p className="text-gray-300 text-sm">Item used successfully</p>
          </div>
        </motion.div>
      ),
      { duration: 2500, position: "top-center" }
    );
  };

  const activeBuffs = useInventoryStore((state) => state.activeBuffs);

  const itemActions: Record<string, (item: UIInventoryItem) => void> = {
    CoinSurge: (item: UIInventoryItem) => {
      if (activeBuffs.includes("doubleCoins")) {
        toast.error("Coin Surge is already active!", {
          position: "top-right",
        });
        return;
      }
      useItem(item.id, "doubleCoins");
      showItemUsedToast(item);
    },
    CodeWhisper: async (item: UIInventoryItem) => {
      if (activeBuffs.includes("revealHint")) {
        toast.error("Code Whisper is already active!", {
          position: "top-right",
        });
        return;
      }
      if (gamemodeId === "BrainBytes") {
        toast.error("Code Whisper cannot be used in BrainBytes mode", {
          position: "top-right",
        });
        return;
      }
      await useItem(item.id, "revealHint");
      showItemUsedToast(item);
      setShowCodeWhisper(true);
    },
CodePatch: (item: UIInventoryItem) => {
  const applied = applyExtraLives();
  if (!applied) {
    toast.error("You already have maximum lives!", {
      position: "top-right",
    });
    return;
  }

  useItem(item.id, "extraLives");
  showItemUsedToast(item);
},
    TimeFreeze: (item: UIInventoryItem) => {
      if (activeBuffs.includes("timeFreeze")) {
        toast.error("Time Freeze is already active!", {
          position: "top-right",
        });
        return;
      }
      if (gamemodeId !== "CodeRush") {
        toast.error("Cannot use Item in this Game mode", {
          position: "top-right",
        });
        return;
      }
      useItem(item.id, "timeFreeze");
      showItemUsedToast(item);
    },
    ErrorShield: async (item: UIInventoryItem) => {
      if (activeBuffs.includes("errorShield")) {
        toast.error("Error Shield is already active!", {
          position: "top-right",
        });
        return;
      }
      await useItem(item.id, "errorShield");
      showItemUsedToast(item);
    },
  BrainFilter: (item: UIInventoryItem) => {
    if (brainFilterUsed) {
      toast.error("Brain Filter can only be used once this stage!", {
        position: "top-right",
      });
      return;
    }
    if (gamemodeId !== "BrainBytes") {
      toast.error("Cannot use Item in this Game mode", {
        position: "top-right",
      });
      return;
    }

    useItem(item.id, "brainFilter");
    showItemUsedToast(item);
    setBrainFilterUsed(true);
  },
  };

  return (
    <>
      <PiTreasureChest
        onClick={() => setShowInventory((prev) => !prev)}
        className="text-4xl cursor-pointer text-gray-300 hover:text-white transition-all duration-200"
      />

      <AnimatePresence>
        {showInventory && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            className="fixed z-50 bottom-16 left-4 md:left-6 w-[90%] sm:w-[320px] md:w-[360px] h-auto max-h-[60vh] flex flex-col"
          >
            <div className="h-full w-full border border-white/10 rounded-2xl bg-[#0a0a0f]/95 backdrop-blur-xl p-4 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-2">
                  <PiTreasureChest className="text-purple-400 text-xl" />
                  <h1 className="text-white font-exo text-lg font-bold tracking-widest uppercase">
                    Inventory
                  </h1>
                </div>
                <div className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-2 py-1 rounded-md border border-purple-500/20 uppercase tracking-wider">
                  {userInventory ? userInventory.length : 0} Unique
                </div>
              </div>

              <div className="overflow-y-auto overflow-x-hidden flex flex-col gap-3 scrollbar-custom pr-2">
                {userInventory && userInventory.length > 0 ? (
                  userInventory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (gamemodeId === "Lesson" && item.title !== "CoinSurge") {
                          toast.error("Items cannot be used in Lesson mode", {
                            position: "top-right",
                          });
                          return;
                        }
                        itemActions[item.title]?.(item);
                        unlockAchievement(userData?.uid || "", subject || "", "itemUse", {
                          itemName: item.title,
                        });
                      }}
                      className="group relative cursor-pointer border border-white/5 rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent hover:border-purple-500/30 hover:bg-purple-500/10 transition-all duration-300 flex items-center gap-3 p-3 shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out pointer-events-none" />

                      <div className="rounded-xl bg-black/40 flex justify-center items-center w-12 h-12 overflow-hidden border border-white/5 shrink-0 shadow-inner group-hover:border-purple-500/30 transition-colors p-2">
                        <img
                          src={icons[`../../assets/ItemsIcon/${item.Icon}`]?.default || ""}
                          alt={item.title}
                          className="w-full h-full object-contain drop-shadow-[0_0_5px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-all duration-300"
                        />
                      </div>

                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <h2 className="text-sm font-exo font-bold text-gray-200 group-hover:text-purple-300 transition-colors truncate w-full text-left">
                          {item.title.replace(/([A-Z])/g, ' $1').trim()}
                        </h2>
                        <p className="text-[10px] text-gray-500 font-medium tracking-wide">
                          Click to activate
                        </p>
                      </div>

                      <div className="flex items-center justify-center min-w-[32px] h-[32px] rounded-lg bg-[#13131f] border border-[#2a2a3c] group-hover:border-purple-500/40 group-hover:bg-purple-500/20 shrink-0 transition-colors duration-300 shadow-inner">
                        <span className="text-xs font-bold text-gray-300 group-hover:text-purple-300 transition-colors">
                          {item.quantity}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 opacity-60">
                    <PiTreasureChest className="text-4xl text-gray-500 mb-2" />
                    <p className="text-gray-400 text-sm font-exo font-medium text-center">
                      Your inventory is empty.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ItemsUse;
