import { unlockStage } from '@/services/api/unlockStage';
import { unlockAchievement } from "@/services/UnlockAchievement";
import { db } from "@/services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import CoinSurge from "../../inventory/CoinSurge";
import { useInventoryStore } from "../../../store/useInventoryStore";
import { useRewardStore } from "../../../store/useRewardStore";
import useFetchLevelsData from '@/services/api/useFetchLevelsData';
import { useUserProgressStore } from "../../../store/useUserProgressStore";
import type { NavigateFunction } from "react-router-dom";

const addExp = async (userId: string, expGain: number, coinsGain: number): Promise<void> => {
  const userRef = doc(db, "Users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const { exp = 0, userLevel = 1, coins = 0 } = userSnap.data();
  let newExp = exp + (expGain || 0);
  let newLevel = userLevel;
  let newCoins = coins + (coinsGain || 0);

  // Level-up logic
  if (newExp >= 100) {
    newLevel += Math.floor(newExp / 100);
    newExp %= 100;
  }

  await updateDoc(userRef, {
    exp: newExp,
    userLevel: newLevel,
    coins: newCoins,
  });
};

const handleRewardGrant = async (userId: string, subject: string, lessonId: string, levelId: string): Promise<void> => {
  try {
    const { setLastReward } = useRewardStore.getState();
    const { activeBuffs, removeBuff } = useInventoryStore.getState();
// const { levelsData } = useFetchLevelsData(subject);
// const LevelData = useMemo(() => {
//   const lesson = levelsData.find(l => l.id === lessonId);
//   return lesson?.Levels?.find(lv => lv.id === levelId) || null;
// }, [levelsData, lessonId, levelId]);
// if (!LevelData) return;
// let { expReward = 0, coinsReward = 0 } = LevelData;
    const levelRef = doc(db, subject, lessonId, "Levels", levelId);
    const levelSnap = await getDoc(levelRef);
    if (!levelSnap.exists()) return;

    let { expReward = 0, coinsReward = 0 } = levelSnap.data();

    //  Apply buff (Double Coins)
if (activeBuffs.includes("doubleCoins")) {
  const { DoubleCoins } = CoinSurge(coinsReward);
  coinsReward = DoubleCoins();
  removeBuff("doubleCoins");
}

    console.log("Granting rewards:", expReward, coinsReward);
  setLastReward(expReward, coinsReward);
    // Add EXP & Coins
    await addExp(userId, expReward, coinsReward);

    // Mark reward as claimed
    const userLevelRef = doc(db,"Users",userId,"Progress",subject,"Lessons",lessonId,"Levels",levelId);
    await updateDoc(userLevelRef, { isRewardClaimed: true });
  } catch (err: unknown) {
    console.error("Error in handleRewardGrant:", err instanceof Error ? err.message : err);
  }
};
interface GoToNextStageParams {
  subject: string;
  lessonId: string;
  levelId: string;
  stageId: string;
  navigate: NavigateFunction;
  setLevelComplete: (val: boolean) => void;
  userId: string;
  setAlreadyComplete: (val: boolean) => void;
}

export const goToNextStage = async ({subject,lessonId,levelId,stageId,navigate,setLevelComplete,userId,setAlreadyComplete}: GoToNextStageParams): Promise<void> => {
  try {
    const data = await unlockStage(subject, lessonId, levelId, stageId);
    console.log("Unlock response:", data);

    if (data.isNextStageUnlocked) {
      navigate(
        `/Main/Lessons/${subject}/${lessonId}/${levelId}/${data.nextStageId}/${data.nextStageType}`,
        { replace: true }
      );
    } else if (data.isNextLevelUnlocked) {
      const { userProgress } = useUserProgressStore.getState();
      const levelKey = `${lessonId}-${levelId}`;
      const levelData = userProgress[levelKey];
      const alreadyCompleted = levelData?.isCompleted === true;

      if (alreadyCompleted) {
        await setAlreadyComplete(true);
      } else {
        await handleRewardGrant(userId, subject, lessonId, levelId);
        await setLevelComplete(true);
      }
    } else if (data.isNextLessonUnlocked || data.isWholeTopicFinished) {
      // Check if lesson or topic is already completed
      const { userProgress } = useUserProgressStore.getState();
      const levelKey = `${lessonId}-${levelId}`;
      const levelData = userProgress[levelKey];
      const alreadyCompleted = levelData?.isCompleted === true;

      if (alreadyCompleted) {
        await setAlreadyComplete(true);
      } else {
        if (data.isNextLessonUnlocked) {
          await unlockAchievement(userId, subject, "lessonComplete", { lessonId });
        }
        await handleRewardGrant(userId, subject, lessonId, levelId);
        await setLevelComplete(true);
      }
    }
  } catch (error: unknown) {
    console.error("Error in goToNextStage:", error instanceof Error ? error.message : error);
  }
};
