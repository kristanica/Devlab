import React from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../Firebase/Firebase";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import Claim from "../../assets/Lottie/ClaimAchievement.json";

export const useClaimAchievement = (userData: any, setLoadingClaim: (val: boolean) => void) => {
  const queryClient = useQueryClient();

  const showClaimToast = (item: any) => {
    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="bg-[#0d0d12] border border-[#2a2a3c] rounded-xl shadow-2xl p-5 flex flex-col sm:flex-row items-center gap-5 max-w-sm w-full mx-auto"
        >
          <div className="shrink-0 w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
            <Lottie animationData={Claim} loop={false} autoplay className="w-12 h-12" />
          </div>
          <div className="flex flex-col flex-1">
            <h1 className="font-exo text-white font-bold text-lg tracking-tight">
              Reward Claimed!
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Unlocked <span className="font-bold text-fuchsia-400">{item.title}</span>
            </p>
            <div className="flex gap-2 mt-3">
              <div className="bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-md">
                <p className="text-xs text-yellow-500 font-bold tracking-wider">
                  +{item.coinsReward} COINS
                </p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md">
                <p className="text-xs text-cyan-500 font-bold tracking-wider">
                  +{item.expReward} EXP
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
    mutationFn: async (achievement: any) => {
      if (!userData?.uid) throw new Error("No user ID");
      const userId = userData.uid;
      const userRef = doc(db, "Users", userId);
      const userAchRef = doc(db, "Users", userId, "Achievements", achievement.id);

      await updateDoc(userAchRef, { isClaimed: true });

      let newExp = (userData.exp || 0) + (achievement.expReward || 0);
      let newLevel = userData.userLevel || 1;
      let newCoins = (userData.coins || 0) + (achievement.coinsReward || 0);

      if (newExp >= 100) {
        const levelsGained = Math.floor(newExp / 100);
        newLevel += levelsGained;
        newExp = newExp % 100;
      }

      await updateDoc(userRef, {
        exp: newExp,
        userLevel: newLevel,
        coins: newCoins,
      });

      return achievement.id;
    },
    onMutate: async (achievement: any) => {
      showClaimToast(achievement);

      queryClient.setQueryData(["userAchievements", userData?.uid], (oldData: any) => ({
        ...oldData,
        [achievement.id]: { ...oldData?.[achievement.id], isClaimed: true },
      }));

      queryClient.setQueryData(["User_Details", userData?.uid], (oldData: any) => ({
        ...oldData,
        exp: (oldData?.exp || 0) + (achievement.expReward || 0),
        userLevel:
          (oldData?.userLevel || 1) +
          Math.floor(((oldData?.exp || 0) + (achievement.expReward || 0)) / 100),
        coins: (oldData?.coins || 0) + (achievement.coinsReward || 0),
      }));
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["userAchievements", userData?.uid] });
      queryClient.invalidateQueries({ queryKey: ["User_Details", userData?.uid] });
      setLoadingClaim(false);
    },
    onSuccess: () => {
      setLoadingClaim(false);
    }
  });
};
