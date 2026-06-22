// @ts-nocheck
import React from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { purchaseItem } from '@/services/api/purchaseItem';
import { playSound } from "@/utils/DevlabSoundHandler";
import MoneyIcon from "../../assets/Images/DevCoins.png";

interface ShopItem {
  id: string;
  title: string;
  cost: number;
  Icon: string;
}

interface UserSummary {
  uid?: string;
  coins?: number;
}

export const useBuyMutation = (
  userData: UserSummary | null | undefined,
  setIsBuying: (val: boolean) => void
) => {
  const queryClient = useQueryClient();

  const showPurchaseToast = (item: ShopItem) => {
    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="bg-[#0d0d12] border border-[#2a2a3c] rounded-xl shadow-2xl p-5 flex flex-col sm:flex-row items-center gap-5 max-w-sm w-full mx-auto"
        >
          <div className="shrink-0 w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
            <span className="text-2xl">🛒</span>
          </div>
          <div className="flex flex-col flex-1">
            <h1 className="font-exo text-white font-bold text-lg tracking-tight">
              Purchase Successful!
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Acquired <span className="font-bold text-fuchsia-400">{item.title}</span>
            </p>
            <div className="flex gap-2 mt-3">
              <div className="bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
                <img src={MoneyIcon} alt="Coins" className="w-3.5 h-3.5 object-contain" />
                <p className="text-xs text-yellow-500 font-bold tracking-wider">
                  -{item.cost}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ),
      { duration: 3500, position: "top-center" }
    );
  };

  return useMutation({
    mutationFn: async (item: ShopItem) => purchaseItem(item.id, item.cost, item.Icon),
    onMutate: async (item: ShopItem) => {
      playSound("purchase"); 
      await queryClient.cancelQueries({ queryKey: ["userData"] });
      const previousUserData = (queryClient.getQueryData(["userData"]) || userData) as UserSummary | undefined;
      
      if (!previousUserData || previousUserData.coins < item.cost) {
        toast.error("Not enough DevCoins!", { 
          position: "top-center", 
          style: {
            background: '#0d0d12',
            color: '#ef4444',
            border: '1px solid #ef444450'
          }
        });
        throw new Error("Insufficient coins");
      }
      
      queryClient.setQueryData(["userData"], (oldData: any) => ({
        ...oldData,
        coins: (oldData?.coins || 0) - item.cost,
      }));
      
      showPurchaseToast(item);
      return { previousUserData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userData"] });
      queryClient.invalidateQueries({ queryKey: ["shopItems"] });
      setIsBuying(false);
    },
    onError: (err: Error, item: ShopItem, context: { previousUserData?: UserSummary } | undefined) => {
      if (context?.previousUserData) {
        queryClient.setQueryData(["userData"], context.previousUserData);
      }
      if (err.message !== "Insufficient coins") {
        toast.error("Purchase failed. Try again!", { 
          position: "top-center",
          style: {
            background: '#0d0d12',
            color: '#ef4444',
            border: '1px solid #ef444450'
          }
        });
      }
      setIsBuying(false);
    },
  });
};
