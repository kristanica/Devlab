import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import SplitPane from "react-split-pane";

import { playSound } from "../components/Custom Hooks/DevlabSoundHandler";
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
  const [showPopup, setShowPopup] = useState(true);
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

  const closePopup = useCallback(() => setShowPopup(false), []);

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
        <GameHeader heart={heart} />

        <div className="relative h-[100%] flex flex-col md:flex-row p-2 md:p-3 gap-2 justify-center overflow-x-hidden">
          <div className="h-[90%] md:w-[60%] lg:w-[50%] xl:w-[40%] md:h-full w-full mx-auto">
            <InstructionPanel
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
