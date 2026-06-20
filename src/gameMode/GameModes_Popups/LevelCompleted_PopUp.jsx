import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import Lottie from "lottie-react";
import confetti from "../../assets/Lottie/Confetti.json";
import smallLoading from "../../assets/Lottie/loadingSmall.json";
import loadingDots from "../../assets/Lottie/LoadingDots.json"
import { useEffect, useState, useMemo, useCallback } from "react";
import { playSound } from "../../components/Custom Hooks/DevlabSoundHandler";

import useFetchUserData from "../../components/BackEnd_Data/useFetchUserData";
import useAnimatedNumber from "../../components/Custom Hooks/useAnimatedNumber";
import { unlockAchievement } from "../../components/Custom Hooks/UnlockAchievement";
import { fetchLevelSummary } from "../../components/OpenAI Prompts/feedbackPrompt";
import { unlockStage } from "../../components/BackEnd_Functions/unlockStage";
import { useRewardStore } from "../../ItemsLogics/Items-Store/useRewardStore";
import useFetchLevelsData from "../../components/BackEnd_Data/useFetchLevelsData";
import { useAttemptStore } from "../GameModes_Utils/useAttemptStore";
import { useInventoryStore } from "../../ItemsLogics/Items-Store/useInventoryStore";

function LevelCompleted_PopUp({ subj, lessonId, LevelId, heartsRemaining, setLevelComplete, resetHearts }) {
  const navigate = useNavigate();
  const { stageId } = useParams();
  const { levelsData} = useFetchLevelsData(subj);
  const { lastReward } = useRewardStore();
  const { clearReward } = useRewardStore.getState();
  const { userData, refetch } = useFetchUserData();
  const removeExtraLives = useAttemptStore((state) => state.removeExtraLives);
  const removeBuff = useInventoryStore((state) => state.removeBuff);

  const [levelSummary, setLevelSummary] = useState(null);

  const hearts = heartsRemaining;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  playSound("success"); 
}, []);

  //  Fetch feedback once
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const summary = await fetchLevelSummary();
      if (isMounted && summary) setLevelSummary(summary);
    })();
    return () => {
      isMounted = false;
    };
  }, []);
  

  //  Fetch Level Data
const LevelData = useMemo(() => {
  const lesson = levelsData.find(l => l.id === lessonId);
  return lesson?.Levels?.find(lv => lv.id === LevelId) || null;
}, [levelsData, lessonId, LevelId]);

  //  Derived rewards (memoized)
const finalCoinReward = useMemo(() => {
  if (lastReward.coins > 0) return lastReward.coins;
  if (LevelData?.coinsReward) return LevelData.coinsReward;
  return 0;
}, [lastReward, LevelData]);

const finalExpReward = useMemo(() => {
  if (lastReward.exp > 0) return lastReward.exp;
  if (LevelData?.expReward) return LevelData.expReward;
  return 0;
}, [lastReward, LevelData]);

const { animatedValue: Coins } = useAnimatedNumber(finalCoinReward);
const { animatedValue: Exp } = useAnimatedNumber(finalExpReward);

useEffect(() => {
  // Cleanup: reset hearts only when popup is closed/unmounted
  return () => {
    resetHearts();
  };
}, []);



  //  Unlock next level handler
  const unlockNextLevel = useCallback(
    async (goContinue) => {
      try {
        const userId = userData.uid;
        const data = await unlockStage(subj, lessonId, LevelId, stageId);

        await unlockAchievement(userId, subj, "firstLevelComplete", { LevelId, lessonId });

        if (data.isNextLevelUnlocked && goContinue) {
          navigate(`/Main/Lessons/${subj}/${lessonId}/${data.nextLevelId}/Stage1/Lesson`);
        } else if (data.isNextLessonUnlocked && goContinue) {
          await unlockAchievement(userId, subj, "lessonComplete", { lessonId });
          navigate(`/Main/Lessons/${subj}/${data.nextLessonId}/Level1/Stage1/Lesson`);
        } else if (data.isWholeTopicFinished && goContinue) {
          navigate("/Main");
          await unlockAchievement(userId, subj, "subjectComplete");
        }
      } catch (err) {
        console.error("Error unlocking next level:", err);
      }
    },
    [userData.uid, subj, lessonId, LevelId, stageId, navigate]
  );
return (
  <div className="fixed inset-0 bg-black/95 z-0 flex items-center justify-center">
    <Lottie
      animationData={confetti}
      loop={false}
      className="w-full h-full fixed z-1"
    />

    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="bg-gradient-to-b from-cyan-400 to-purple-500 rounded-2xl shadow-lg p-[1px] w-[92%] sm:w-[80%] md:w-[65%] lg:w-[55%] text-center z-2">
      <div
        className="
          bg-[#111827] w-full rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-5 items-center">
        <h1
          className="font-exo font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[3rem] text-[#F2FF43] text-center">
          LEVEL COMPLETED
        </h1>

        {/* SUMMARY BOX */}
        <div
          className="
            bg-[#080C14] rounded-2xl border border-gray-700 
            p-3 sm:p-4 
            font-exo w-[95%] md:w-[90%] 
            min-h-[100px] 
            
            flex flex-col items-center justify-center">
          {levelSummary ? (
            <div
              className="
                text-left text-white 
                mx-auto p-2 sm:p-3 
                w-[95%] leading-relaxed
              "
            >
              {["recap", "strengths", "improvements", "encouragement"].map((key, i) => (
                <p key={i} className="text-sm sm:text-base md:text-lg LevelComplete">
                  <span
                    className={`font-semibold ${
                      key === "recap"
                        ? "text-cyan-400"
                        : key === "strengths"
                        ? "text-green-400"
                        : key === "improvements"
                        ? "text-yellow-400"
                        : "text-purple-400"
                    }`}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                  </span>{" "}
                  {levelSummary[key]}
                </p>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-white">
              <p className="text-base sm:text-lg font-exo mb-2">
                Generating Feedback...
              </p>
              <Lottie
                animationData={smallLoading}
                loop
                className="w-[20%] sm:w-[15%] md:w-[10%]"
              />
            </div>
          )}
        </div>

        <hr className="text-white w-[95%]" />

        {/* PERFORMANCE SUMMARY */}
        <div className="text-center">
          <h2 className="font-exo text-white text-xl sm:text-2xl md:text-[2rem]">
            PERFORMANCE SUMMARY
          </h2>

          <div className="flex flex-col gap-3 mt-5">
            <p className="text-white font-exo font-semibold text-sm sm:text-base">
              Lives Remaining:{" "}
              <span className="font-bold text-red-400">{hearts}x</span>
            </p>
            <p className="text-white font-exo font-semibold text-sm sm:text-base">
              DevCoins: +<span className="font-bold text-yellow-400">{Coins}</span>
            </p>
            <p className="text-white font-exo font-semibold text-sm sm:text-base">
              XP Gained: +<span className="font-bold text-cyan-400">{Exp}XP</span>
            </p>
          </div>
        </div>

        {/* BUTTONS */}
        <div
          className="w-full sm:w-[85%] flex flex-col sm:flex-row gap-4 sm:gap-0 items-center justify-around p-4">
          {/* BACK TO MAIN */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ bounceDamping: 100 }}
            onClick={() => {
              removeBuff("extraLives");
              removeExtraLives();      
              resetHearts(); 
              setIsLoading(false);
              navigate("/Main", { replace: true });
              clearReward();
              (async () => {
                await Promise.all([unlockNextLevel(false), refetch()]);
              })();
            }}
            className="
              bg-[#9333EA] 
              w-full sm:min-w-[40%] sm:max-w-[45%] 
              text-white px-6 py-3 
              rounded-xl font-semibold 
              hover:bg-purple-700 
              hover:drop-shadow-[0_0_6px_rgba(126,34,206,0.4)] 
              cursor-pointer">
            Back to Main
          </motion.button>

          {/* CONTINUE */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ bounceDamping: 100 }}
            onClick={() => {
              removeBuff("extraLives");
              removeExtraLives();      
              resetHearts();
              setIsLoading(true);
              clearReward();
              unlockNextLevel(true);
              (async () => {
                await refetch();
              })();
            }}
            className="bg-[#36DB4F] w-full sm:min-w-[40%] sm:max-w-[45%] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2CBF45] hover:drop-shadow-[0_0_10px_rgba(126,34,206,0.5)] cursor-pointer">
            Continue
          </motion.button>
        </div>
      </div>
    </motion.div>

    {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98">
          <Lottie
            animationData={loadingDots}
            loop={true}
            className="w-[50%] h-[50%]"/>
        </div>
    )}
  </div>
);

}

export default LevelCompleted_PopUp;
