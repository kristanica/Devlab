import { unlockStage } from "../../components/BackEnd_Functions/unlockStage";
import { unlockAchievement } from "../../components/Custom Hooks/UnlockAchievement";
import { db } from "../../Firebase/Firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import CoinSurge from "../../ItemsLogics/CoinSurge";
import { useInventoryStore } from "../../ItemsLogics/Items-Store/useInventoryStore";
import { useRewardStore } from "../../ItemsLogics/Items-Store/useRewardStore";
import useFetchLevelsData from "../../components/BackEnd_Data/useFetchLevelsData";
import { useUserProgressStore } from "./CompletedLevelStore";

// Helper: Add EXP and Coins

const addExp = async (userId, expGain, coinsGain) => {
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

//  Reward Granting Function
const handleRewardGrant = async (userId, subject, lessonId, levelId) => {
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
  } catch (err) {
    console.error("Error in handleRewardGrant:", err.message);
  }
};
//  Main Function
export const goToNextStage = async ({subject,lessonId,levelId,stageId,navigate,setLevelComplete,userId,setAlreadyComplete}) => {
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
  } catch (error) {
    console.error("Error in goToNextStage:", error.message);
  }
};

