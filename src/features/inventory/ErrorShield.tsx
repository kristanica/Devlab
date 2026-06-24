import { useCallback, useState } from "react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { toast } from "react-hot-toast";

export const useErrorShield = (): { hasShield: boolean; consumeErrorShield: () => Promise<boolean> } => {
  const { removeBuff } = useInventoryStore.getState();
  const activeBuffs = useInventoryStore((state) => state.activeBuffs);
  const [consuming, setConsuming] = useState(false);

  const hasShield = activeBuffs.includes("errorShield");

  const consumeErrorShield = useCallback(async () => {
    if (!hasShield || consuming) return false;

    setConsuming(true);
    try {
      removeBuff("errorShield");
      console.log("ErrorShield consumed");

toast.success("🛡️ Error Shield activated! This mistake won't count.", {
  id: "errorShieldUsed",
  position: "top-right",
});


      return true;
    } finally {
      setConsuming(false);
    }
  }, [hasShield, consuming]);

  return { hasShield, consumeErrorShield };
};
