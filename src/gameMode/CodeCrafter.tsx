import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import SplitPane from "react-split-pane";

import { useGameStore } from "../components/OpenAI Prompts/useBugBustStore";
import { playSound } from "../components/Custom Hooks/DevlabSoundHandler";
import { goToNextStage } from "./GameModes_Utils/Util_Navigation";
import useFetchUserData from "../components/BackEnd_Data/useFetchUserData";
import { useErrorShield } from "../ItemsLogics/ErrorShield";
import { GameModeProps } from "./BugBust"; // Use shared interface

// PopUps
import GameMode_Instruction_PopUp from "./GameModes_Popups/GameMode_Instruction_PopUp";
import LevelCompleted_PopUp from "./GameModes_Popups/LevelCompleted_PopUp";
import Gameover_PopUp from "./GameModes_Popups/Gameover_PopUp";
import LevelAlreadyCompleted from "./GameModes_Popups/LevelAlreadyComplete_PopUp";
import CorrectWrongPopUp from "./GameModes_Popups/CorrectWrong_PopUp";

// Lotties
import loadingDots from "../assets/Lottie/LoadingDots.json";

// Components
import GameHeader from "./GameModes_Components/GameHeader";
import GameFooter from "./GameModes_Components/GameFooter";
import InstructionPanel from "./GameModes_Components/InstructionPanel";
import Html_TE from "./GameModes_Components/CodeEditor and Output Panel/Html_TE";
import Css_TE from "./GameModes_Components/CodeEditor and Output Panel/Css_TE";
import JavaScript_TE from "./GameModes_Components/CodeEditor and Output Panel/JavaScript_TE";
import Database_TE from "./GameModes_Components/CodeEditor and Output Panel/Database_TE";

const CodeCrafter: React.FC<GameModeProps> = ({
  heart,
  roundKey,
  gameOver,
  submitAttempt,
  resetHearts,
}) => {
  const type = "Code Crafter";
  const navigate = useNavigate();
  const { consumeErrorShield } = useErrorShield();
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

  const { userData } = useFetchUserData();
  const userId = userData?.uid;

  // OpenAI State
  const isCorrect = useGameStore((state) => state.isCorrect);
  const showIsCorrect = useGameStore((state) => state.showIsCorrect);
  const setShowIsCorrect = useGameStore((state) => state.setShowIsCorrect);
  const singleFeedback = useGameStore((state) => state.singleFeedback);
  const clearSingleFeedback = useGameStore(
    (state) => state.clearSingleFeedback,
  );

  useEffect(() => {
    if (showIsCorrect) {
      playSound(isCorrect ? "correct" : "inCorrect");
    }
  }, [showIsCorrect, isCorrect]);

  const closePopup = useCallback(() => setShowPopup(false), []);

  const nextStageMutation = useMutation({
    mutationFn: async () => {
      setShowIsCorrect(false);
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
    clearSingleFeedback();
    nextStageMutation.mutate();
  }, [clearSingleFeedback, nextStageMutation]);

  const handleRetry = useCallback(async () => {
    setShowIsCorrect(false);
    if (await consumeErrorShield()) {
      console.log("ErrorShield consumed! Preventing heart loss.");
      return;
    }
    submitAttempt(false);
  }, [consumeErrorShield, submitAttempt, setShowIsCorrect]);

  const renderEditor = useMemo(() => {
    switch (subject) {
      case "Html":
        return <Html_TE />;
      case "Css":
        return <Css_TE />;
      case "JavaScript":
        return <JavaScript_TE />;
      case "Database":
        return <Database_TE />;
      default:
        return (
          <div className="text-white flex items-center justify-center w-full h-full font-exo text-xl">
            Invalid subject
          </div>
        );
    }
  }, [subject]);

  return (
    <>
      <div className="h-screen bg-[#06060a] flex flex-col overflow-hidden">
        <GameHeader heart={heart} />

        <div className="relative h-[100%] w-full overflow-hidden flex">
          {/* @ts-ignore */}
          <SplitPane
            className="w-full h-full flex"
            split="vertical"
            minSize={300}
            defaultSize={"35%"}
            maxSize={1000}
            paneStyle={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            }}
            resizerStyle={{
              cursor: "col-resize",
              width: "6px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "3px",
              margin: "10px 0",
              zIndex: 10,
            }}
          >
            <div className="h-full w-full flex flex-col p-2 md:p-3 overflow-hidden">
              <InstructionPanel
                showCodeWhisper={showCodeWhisper}
                setShowCodeWhisper={setShowCodeWhisper}
              />
            </div>
            <div className="h-full w-full flex flex-col p-2 md:p-3 overflow-hidden pl-0 md:pl-0">
              {renderEditor}
            </div>
          </SplitPane>
        </div>
        <GameFooter
          setLevelComplete={setLevelComplete}
          setShowCodeWhisper={setShowCodeWhisper}
          setAlreadyComplete={setAlreadyComplete}
        />
      </div>

      <AnimatePresence>
        {showPopup && (
          <GameMode_Instruction_PopUp
            title="Hey Dev!!"
            message={`Welcome to ${type} — a creative challenge where you’ll craft code to build something amazing!\nYour mission:\n🧩 Understand the task  \n💻 Write your code  \n🚀 See your creation come to life!`}
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

      <AnimatePresence>
        {gameOver && (
          <Gameover_PopUp gameOver={gameOver} resetHearts={resetHearts} />
        )}
      </AnimatePresence>

      {showIsCorrect && (
        <CorrectWrongPopUp
          isCorrect={isCorrect}
          singleFeedback={singleFeedback}
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

export default React.memo(CodeCrafter);
