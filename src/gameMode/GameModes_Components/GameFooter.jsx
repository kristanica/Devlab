import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { goToNextStage } from "../GameModes_Utils/Util_Navigation";

// Hooks
import useFetchUserData from "../../components/BackEnd_Data/useFetchUserData";
import useFetchGameModeData from "../../components/BackEnd_Data/useFetchGameModeData";
import useFetchUserProgress from "../../components/BackEnd_Data/useFetchUserProgress";
import { goToPreviousStage } from "../GameModes_Utils/goToPrev";

// Motion
import { motion } from "framer-motion";

// Utils
import ItemsUse from "../../ItemsLogics/ItemsUse";
import { useGameStore } from "../../components/OpenAI Prompts/useBugBustStore";
import { gameModeSubmitHandlers } from "../GameModes_Utils/gameModeSubmitHandler";

// Lottie
import Lottie from "lottie-react";
import Loading from "../../assets/Lottie/LoadingDots.json";

function GameFooter({
  setLevelComplete,
  setShowCodeWhisper,
  setAlreadyComplete,
}) {
  const navigate = useNavigate();
  const { userData } = useFetchUserData();
  const {
    gameModeData,
    levelData,
    subject,
    lessonId,
    levelId,
    stageId,
    gamemodeId,
  } = useFetchGameModeData();
  const { userStageCompleted, completedLevels } = useFetchUserProgress(subject);

  const submittedCode = useGameStore((state) => state.submittedCode);
  const setIsCorrect = useGameStore((state) => state.setIsCorrect);
  const setShowIsCorrect = useGameStore((state) => state.setShowIsCorrect);
  const [isLoading, setIsLoading] = useState(false);


  console.log(submittedCode);
  const buttonText =
    gamemodeId === "Lesson" || gamemodeId === "BrainBytes" ? "Next" : "Submit";
  const showLoading = buttonText === "Next";

  const handleClick = async () => {
    if (showLoading) setIsLoading(true); // start loading only for Next

    const stageKey = `${lessonId}-${levelId}-${stageId}`;
    const isStageLocked = userStageCompleted?.[stageKey] ?? false;

    if (isStageLocked || gamemodeId === "Lesson") {
      await goToNextStage({
        subject,
        lessonId,
        levelId,
        stageId,
        navigate,
        setLevelComplete,
        setAlreadyComplete,
      });
      if (showLoading) setIsLoading(false);
      return;
    } // Submit flow

    if (buttonText === "Submit") {
      const handler = gameModeSubmitHandlers[gamemodeId];
      if (handler) {
        await handler({
          submittedCode,
          setIsCorrect,
          setShowIsCorrect,
          instruction: gameModeData?.instruction,
          providedCode:
            gamemodeId === "CodeCrafter"
              ? gameModeData?.replicationFile
              : gameModeData?.codingInterface,
          description: gameModeData?.description,
          subject,
          stageId,
        });
      }
      return;
    }

    if (showLoading) setIsLoading(false); // stop loading
  };

  const stageKey = `${lessonId}-${levelId}-${stageId}`;
  const isStageLocked = userStageCompleted?.[stageKey] ?? false;
  const isBrainBytes = gamemodeId === "BrainBytes";
  const isDisabled = isBrainBytes && !isStageLocked;


// true if stage is completed
const isStageCompleted = userStageCompleted?.[stageKey] ?? false;

// Disable previous if Stage1 or stage NOT completed AND not Lesson mode
const isPrevDisabled = stageId === "Stage1" || (!isStageCompleted && gamemodeId !== "Lesson");


  return (
    <>
      {/* Loading Overlay (only for Next) */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
          <Lottie
            animationData={Loading}
            loop={true}
            className="w-[50%] h-[50%]"/>
        </div>
      )}
      {/* Footer */}
      <div
        className="min-h-16 border-t-1 bg-[#11001f] border-t-purple-700 px-4 md:px-6 flex justify-between items-center text-white sticky bottom-0
        shadow-[0_-5px_20px_0_rgba(200,100,255,0.2)]"
      >
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink min-w-0">

          <ItemsUse
            setShowCodeWhisper={setShowCodeWhisper}
            gamemodeId={gamemodeId}
          />
          <div className="font-exo overflow-hidden flex-shrink">

            <p className="text-sm sm:text-base font-semibold truncate">
              {levelData
                ? `${levelData.levelOrder}. ${levelData.title}`
                : "Loading..."}
            </p>
            <p className="text-xs sm:text-sm text-[#58D28F]">
              {levelData ? `${levelData.expReward}xp` : ""}
            </p>
          </div>
        </div>
        {/* Button Section */}
<div className="flex gap-2 w-1/2 sm:w-1/3 md:w-[20%] lg:w-[15%]">
  {/* Previous Button */}
  <motion.button
    whileTap={{ scale: 0.95 }}
    whileHover={!isPrevDisabled ? { scale: 1.05, background: "#7e22ce" } : {}}
    transition={{ bounceDamping: 100 }}
    onClick={
      !isPrevDisabled
        ? () => goToPreviousStage({ subject, lessonId, levelId, stageId, navigate })
        : undefined
    }
    disabled={isPrevDisabled || isLoading}
    className={`font-bold rounded-xl w-full py-2 text-sm sm:text-base ${
      isPrevDisabled || isLoading
        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
        : "bg-[#9333EA] cursor-pointer hover:drop-shadow-[0_0_6px_rgba(126,34,206,0.4)]"
    }`}
  >
    Previous
  </motion.button>

  {/* Existing Next/Submit Button */}
  <motion.button
    whileTap={{ scale: 0.95 }}
    whileHover={!isDisabled ? { scale: 1.05, background: "#7e22ce" } : {}}
    transition={{ bounceDamping: 100 }}
    onClick={!isDisabled ? handleClick : undefined}
    disabled={isDisabled || isLoading}
    className={`font-bold rounded-xl w-full py-2 text-sm sm:text-base ${
      isDisabled || isLoading
        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
        : "bg-[#9333EA] cursor-pointer hover:drop-shadow-[0_0_6px_rgba(126,34,206,0.4)]"
    }`}
  >
    {buttonText}
  </motion.button>
</div>


        {/* Right Section */}
        <div className="flex-shrink-0">
          <p className="text-base sm:text-lg font-bold">
            {userData ? `${userData.coins} Coins` : "Loading..."}
          </p>
        </div>
      </div>
    </>
  );
}

export default GameFooter;
