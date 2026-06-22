import React, { useState } from "react";
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
import { useGameStore } from "@/store/useGameStore";
import { gameModeSubmitHandlers } from "../GameModes_Utils/gameModeSubmitHandler";

// Lottie
import Lottie from "lottie-react";
import Loading from "../../assets/Lottie/LoadingDots.json";
import CoinsIcon from "../../assets/Images/DevCoins.png";

interface GameFooterProps {
  setLevelComplete: (val: boolean) => void;
  setShowCodeWhisper: (val: boolean) => void;
  setAlreadyComplete: (val: boolean) => void;
  isCorrect?: boolean;
}

const GameFooter: React.FC<GameFooterProps> = ({
  setLevelComplete,
  setShowCodeWhisper,
  setAlreadyComplete,
}) => {
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
  const { userStageCompleted } = useFetchUserProgress(subject);

  const submittedCode = useGameStore((state: any) => state.submittedCode);
  const setIsCorrect = useGameStore((state: any) => state.setIsCorrect);
  const setShowIsCorrect = useGameStore((state: any) => state.setShowIsCorrect);
  const [isLoading, setIsLoading] = useState(false);

  const buttonText =
    gamemodeId === "Lesson" || gamemodeId === "BrainBytes" ? "Next" : "Submit";
  const showLoading = buttonText === "Next";

  const handleClick = async () => {
    if (showLoading) setIsLoading(true);

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
    }

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

    if (showLoading) setIsLoading(false);
  };

  const stageKey = `${lessonId}-${levelId}-${stageId}`;
  const isStageLocked = userStageCompleted?.[stageKey] ?? false;
  const isBrainBytes = gamemodeId === "BrainBytes";
  const isDisabled = isBrainBytes && !isStageLocked;

  const isStageCompleted = userStageCompleted?.[stageKey] ?? false;
  const isPrevDisabled = stageId === "Stage1" || (!isStageCompleted && gamemodeId !== "Lesson");

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06060a]/80 backdrop-blur-sm">
          <Lottie animationData={Loading} loop={true} className="w-64 h-64" />
        </div>
      )}

      <div className="h-14 md:h-16 shrink-0 bg-[#06060a]/95 backdrop-blur-md border-t border-[#1e1e2e] px-4 md:px-6 py-2 flex justify-between items-center text-slate-200 sticky bottom-0 z-20 font-inter shadow-[0_-4px_30px_rgba(0,0,0,0.6)]">
        
        {/* Left: Items & Level Info */}
        <div className="flex items-center gap-4 flex-1 justify-start min-w-0 overflow-hidden">
          <ItemsUse setShowCodeWhisper={setShowCodeWhisper} gamemodeId={gamemodeId} />
          <div className="flex flex-col hidden sm:flex truncate">
            <p className="text-xs md:text-sm font-bold text-white tracking-wide truncate">
              {levelData ? `${levelData.levelOrder}. ${levelData.title}` : "Loading..."}
            </p>
            <p className="text-[10px] md:text-xs font-semibold text-emerald-400 uppercase tracking-widest mt-0.5">
              {levelData ? `+ ${levelData.expReward} XP` : ""}
            </p>
          </div>
        </div>

        {/* Center: Actions */}
        <div className="flex items-center gap-3 justify-center shrink-0">
          {/* Previous Button */}
          <button
            onClick={!isPrevDisabled ? () => goToPreviousStage({ subject, lessonId, levelId, stageId, navigate }) : undefined}
            disabled={isPrevDisabled || isLoading}
            className={`px-5 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 ${
              isPrevDisabled || isLoading
                ? "bg-[#0d0d12] border border-[#1e1e2e] text-slate-600 cursor-not-allowed"
                : "bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:text-white hover:bg-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer"
            }`}
          >
            Previous
          </button>

          {/* Next/Submit Button */}
          <button
            onClick={!isDisabled ? handleClick : undefined}
            disabled={isDisabled || isLoading}
            className={`px-8 md:px-10 py-2 rounded-lg text-xs md:text-sm font-bold tracking-wide transition-all duration-300 ${
              isDisabled || isLoading
                ? "bg-[#0d0d12] border border-[#1e1e2e] text-slate-600 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-[1.02] cursor-pointer border border-purple-500/50"
            }`}
          >
            {buttonText}
          </button>
        </div>

        {/* Right: Coins */}
        <div className="flex items-center gap-3 flex-1 justify-end hidden sm:flex">
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg shadow-inner">
            <img src={CoinsIcon} alt="Coins" className="w-4 h-4 md:w-5 md:h-5 object-contain drop-shadow-md" />
            <p className="text-sm md:text-base font-bold text-yellow-400 drop-shadow-sm">
              {userData ? userData.coins : "0"}
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default GameFooter;
