import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import SplitPane from "react-split-pane";

import { playSound } from "@/utils/DevlabSoundHandler";
import { goToNextStage } from "./GameModes_Utils/Util_Navigation";
import { useErrorShield } from "../ItemsLogics/ErrorShield";
import useFetchUserData from "../components/BackEnd_Data/useFetchUserData";
import { GameModeProps } from "./BugBust"; // Use shared interface

// Pop Ups
import GameMode_Instruction_PopUp from "./GameModes_Popups/GameMode_Instruction_PopUp";
import LevelCompleted_PopUp from "./GameModes_Popups/LevelCompleted_PopUp";
import LevelAlreadyCompleted from "./GameModes_Popups/LevelAlreadyComplete_PopUp";
import CorrectWrongPopUp from "./GameModes_Popups/CorrectWrong_PopUp";
import Gameover_PopUp from "./GameModes_Popups/Gameover_PopUp";

import loadingDots from "../assets/Lottie/LoadingDots.json";

// Components
import GameHeader from "./GameModes_Components/GameHeader";
import InstructionPanel from "./GameModes_Components/InstructionPanel";
import GameFooter from "./GameModes_Components/GameFooter";

const BrainBytes: React.FC<GameModeProps> = ({
  heart,
  roundKey,
  gameOver,
  submitAttempt,
  resetHearts,
}) => {
  const type = "Brain Bytes";
  const { consumeErrorShield } = useErrorShield();
  const navigate = useNavigate();
  const { subject, lessonId, levelId, stageId } = useParams<{
    subject: string;
    lessonId: string;
    levelId: string;
    stageId: string;
  }>();

  const [levelComplete, setLevelComplete] = useState(false);
  const [alreadyComplete, setAlreadyComplete] = useState(false);
  const popupKey = "hasSeenPopup_BrainBytes";
  const [showPopup, setShowPopup] = useState(() => {
    return localStorage.getItem(popupKey) ? false : true;
  });
  const [showCodeWhisper, setShowCodeWhisper] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showisCorrect, setShowisCorrect] = useState(false);

  const { userData } = useFetchUserData();
  const userId = userData?.uid;

  useEffect(() => {
    if (showisCorrect) {
      playSound(isCorrect ? "correct" : "inCorrect");
    }
  }, [showisCorrect, isCorrect]);

  const closePopup = useCallback(() => {
    localStorage.setItem(popupKey, "true");
    setShowPopup(false);
  }, []);

  const nextStageMutation = useMutation({
    mutationFn: async () => {
      setShowisCorrect(false);
      return await goToNextStage({
        subject,
        lessonId,
        levelId,
        stageId,
        navigate,
        setLevelComplete,
        userId,
        setAlreadyComplete,
      });
    },
  });

  const handleContinue = useCallback(() => {
    nextStageMutation.mutate();
  }, [nextStageMutation]);

  const handleRetry = useCallback(async () => {
    setShowisCorrect(false);
    if (await consumeErrorShield()) {
      return;
    }
    submitAttempt(false);
  }, [consumeErrorShield, submitAttempt, setShowisCorrect]);

  return (
    <>
      <div
        key={roundKey}
        className="h-screen bg-[#06060a] flex flex-col overflow-hidden"
      >
        <GameHeader heart={heart} setShowPopup={setShowPopup} />

        <div className="relative h-full flex flex-col p-4 md:p-6 justify-center items-center overflow-x-hidden w-full mx-auto">
          {/* Centered wide instruction box to reduce dead space */}
          <div className="w-full md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-5xl flex flex-col shrink-0 relative z-10 my-auto">
            <InstructionPanel
              className="h-auto max-h-[80vh] md:max-h-[85vh]"
              setIsCorrect={setIsCorrect}
              setShowisCorrect={setShowisCorrect}
              showCodeWhisper={showCodeWhisper}
              setShowCodeWhisper={setShowCodeWhisper}
            />
          </div>
        </div>

        <GameFooter
          setLevelComplete={setLevelComplete}
          setShowCodeWhisper={setShowCodeWhisper}
          isCorrect={isCorrect}
          setAlreadyComplete={setAlreadyComplete}
        />
      </div>

      <AnimatePresence>
        {gameOver && (
          <Gameover_PopUp gameOver={gameOver} resetHearts={resetHearts} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPopup && (
          <GameMode_Instruction_PopUp
            title="Hey Dev!!"
            message={`Welcome to ${type} — a test of your logic and knowledge!\nYour mission:\n🧠 Read the question carefully\n💡 Choose or write the correct answer\n🏆 Prove your coding smarts and earn your reward!`}
            onClose={closePopup}
            buttonText="Start Challenge"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {levelComplete && (
          <LevelCompleted_PopUp
            subj={subject}
            lessonId={lessonId}
            LevelId={levelId}
            heartsRemaining={heart}
            setLevelComplete={setLevelComplete}
            resetHearts={resetHearts}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alreadyComplete && (
          <LevelAlreadyCompleted
            subj={subject}
            lessonId={lessonId}
            LevelId={levelId}
          />
        )}
      </AnimatePresence>

      {showisCorrect && (
        <CorrectWrongPopUp
          isCorrect={isCorrect}
          singleFeedback={null}
          onContinue={handleContinue}
          onRetry={handleRetry}
        />
      )}

      {nextStageMutation.isPending && (
        <div className="fixed inset-0 z-50 bg-[#06060a]/80 backdrop-blur-sm flex items-center justify-center">
          <Lottie animationData={loadingDots} loop className="w-64 h-64" />
        </div>
      )}
    </>
  );
};

export default React.memo(BrainBytes);
