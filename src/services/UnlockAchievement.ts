import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import Throphy from "../assets/Lottie/AchievementUnlock.json";
import { playSound } from "../utils/DevlabSoundHandler";
import React from "react";

export interface UnlockAchievementPayload {
  LevelId?: string;
  lessonId?: string;
  usedTags?: string[];
  itemName?: string;
  achievementTitle?: string;
  [key: string]: any;
}

export const unlockAchievement = async (
  userId: string,
  subject: string,
  actionType: string,
  payload: UnlockAchievementPayload = {}
): Promise<void> => {
  try {
    const achievementsRef = doc(db, "Achievements", subject);
    const snapshot = await getDoc(achievementsRef);

    if (!snapshot.exists()) return;

    const achievementsMap = snapshot.data();

    for (const [achievementId, achievement] of Object.entries(achievementsMap)) {
      const condition = achievement?.unlockCondition;
      let match = false;

      switch (actionType) {
        case "firstLevelComplete":
          match =
            condition?.levelId === payload?.LevelId &&
            condition?.lessonId === payload?.lessonId &&
            condition?.subject === subject;
          break;
        case "lessonComplete":
          match = !!payload.lessonId && condition?.lessonId === payload?.lessonId;
          break;
        case "tagUsed": {
          const usedTags = Array.isArray(payload.usedTags) ? payload.usedTags : [];
          const requiredTags = Array.isArray(condition?.tagReq)
            ? condition.tagReq
            : [condition?.tagReq].filter(Boolean);

          match =
            subject === condition?.subject &&
            requiredTags.some((tag: string) => usedTags.includes(tag));
          break;
        }
        case "itemUse":
          match = payload?.itemName === condition?.itemReq && subject === condition?.subject;
          break;
        case "cssAction":
          match = payload?.achievementTitle === condition?.title && condition.subject === subject;
          break;
        case "subjectComplete":
          match = condition?.type === "subjectCompletion" && condition?.subject === subject;
          break;
      }

      if (match) {
        const userAchRef = doc(db, "Users", userId, "Achievements", achievementId);
        const userAchSnap = await getDoc(userAchRef);
        if (!userAchSnap.exists()) {
          await setDoc(userAchRef, {
            isClaimed: false,
            coinsReward: achievement.coinsReward,
            expReward: achievement.expReward,
            achievementName: achievement.title,
            dateUnlocked: new Date(),
          });
          playSound("achievementUnlock");

          toast.custom((t) =>
            React.createElement(
              AnimatePresence,
              { mode: "popLayout" },
              t.visible &&
                React.createElement(
                  motion.div,
                  {
                    key: t.id,
                    initial: { opacity: 0, y: 30, scale: 0.9 },
                    animate: { opacity: 1, y: 0, scale: 1 },
                    exit: { opacity: 0, y: 30, scale: 0.9 },
                    transition: { type: "spring", stiffness: 120, damping: 15 },
                    className:
                      "max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex gap-4 ring-1 ring-black ring-opacity-10 p-5 items-center",
                  },
                  React.createElement(Lottie, {
                    animationData: Throphy,
                    loop: false,
                    autoplay: true,
                    style: { width: 80, height: 80 },
                  }),
                  React.createElement(
                    "div",
                    { className: "flex-1" },
                    React.createElement(
                      "p",
                      { className: "text-xl font-bold font-exo text-green-600 drop-shadow-sm" },
                      "Achievement Unlocked!"
                    ),
                    React.createElement(
                      "p",
                      { className: "mt-1 text-sm font-exo text-gray-700" },
                      achievement.title
                    )
                  ),
                  React.createElement(
                    "button",
                    {
                      onClick: () => toast.dismiss(t.id),
                      className:
                        "ml-3 text-gray-400 hover:text-gray-600 hover:scale-110 transition-transform",
                    },
                    "✖"
                  )
                )
            )
          );

          console.log(`Achievement unlocked: ${achievement.title}`);
        }
      }
    }
  } catch (error) {
    console.error("Error unlocking achievement:", error);
  }
};
