// Utils / Custom Hooks
import { useState, useEffect } from "react";
import { playSound } from "../components/Custom Hooks/DevlabSoundHandler";
import { useMutation } from "@tanstack/react-query";
// Navigation
import { useParams } from "react-router-dom";
import { goToNextStage } from "./GameModes_Utils/Util_Navigation";
import { useNavigate } from "react-router-dom";
// Pop Ups
import GameMode_Instruction_PopUp from "./GameModes_Popups/GameMode_Instruction_PopUp";
import LevelCompleted_PopUp from "./GameModes_Popups/LevelCompleted_PopUp";
import LevelAlreadyCompleted from "./GameModes_Popups/LevelAlreadyComplete_PopUp";
import CorrectWrongPopUp from "./GameModes_Popups/CorrectWrong_PopUp";
// Animation
import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import laodingDots from "../assets/Lottie/LoadingDots.json"
import Correct from '../assets/Lottie/correctAnsLottie.json';
import Wrong from '../assets/Lottie/wrongAnsLottie.json';
// Components
import GameHeader from "./GameModes_Components/GameHeader";
import InstructionPanel from "./GameModes_Components/InstructionPanel";
import Gameover_PopUp from "./GameModes_Popups/Gameover_PopUp";
import GameFooter from "./GameModes_Components/GameFooter";

import { useErrorShield } from "../ItemsLogics/ErrorShield";

import useFetchUserData from "../components/BackEnd_Data/useFetchUserData";

function BrainBytes({ heart, roundKey, gameOver, submitAttempt, resetHearts }) {
  const type = "Brain Bytes";
  const {  consumeErrorShield } = useErrorShield();
  const navigate = useNavigate();
  // Route params
  const { subject, lessonId, levelId ,stageId } = useParams();

  // Popups
  const [levelComplete, setLevelComplete] = useState(false);
  const [alreadyComplete, setAlreadyComplete] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [showCodeWhisper, setShowCodeWhisper] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showisCorrect, setShowisCorrect] = useState(false);

  const { userData, } = useFetchUserData();
  const userId = userData?.uid;
  // Dynamic editor rendering

    useEffect(() => {
    if (showisCorrect) {
      if (isCorrect) {
        playSound("correct");
      } else {
        playSound("inCorrect");
      }
    }
  }, [showisCorrect, isCorrect]);

  const nextStageMutation = useMutation({
  mutationFn: async () => {
    setShowisCorrect(false);
    return await goToNextStage({subject,lessonId,levelId,stageId,navigate,setLevelComplete,userId,setAlreadyComplete});
  },
});


  return (
    <>
      {/* Main Content */}
      <div key={roundKey} className="h-screen bg-[#0D1117] flex flex-col">
        {/* Header */}
        <GameHeader heart={heart} />

        {/* Content */}
        <div className="h-[83%] flex flex-col md:flex-row p-10 gap-5 justify-center">
          {/* Instruction Panel */}
          <div className="h-[90%] md:w-[40%] md:h-full w-full">
            <InstructionPanel
              setIsCorrect={setIsCorrect} 
              setShowisCorrect={setShowisCorrect}
              showCodeWhisper={showCodeWhisper}
              setShowCodeWhisper={setShowCodeWhisper}
            />
          </div>
        </div>
        {/* Footer */}
        <GameFooter
          setLevelComplete={setLevelComplete}
          setShowCodeWhisper={setShowCodeWhisper}
          isCorrect={isCorrect}
          setAlreadyComplete={setAlreadyComplete}
        />
      </div>
      {/*Game Over Popup*/ }
      <AnimatePresence>
        {gameOver &&(
          <Gameover_PopUp gameOver={gameOver} resetHearts={resetHearts}></Gameover_PopUp>
        )}
      </AnimatePresence>
      {/* Instruction Pop Up */}
      <AnimatePresence>
        {showPopup && (
          <GameMode_Instruction_PopUp
            title="Hey Dev!!"
            message={`Welcome to ${type} — a test of your logic and knowledge!
Your mission:
🧠 Read the question carefully
💡 Choose or write the correct answer
🏆 Prove your coding smarts and earn your reward!`}
            onClose={() => setShowPopup(false)}
            buttonText="Start Challenge"
          />
        )}
      </AnimatePresence>

      {/* Level Complete Pop Up */}
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
      {/* Correct / Wrong Answer PopUps */}
      {showisCorrect && (
        <CorrectWrongPopUp
          isCorrect={isCorrect}
          singleFeedback={null}
          onContinue={() => nextStageMutation.mutate()}
          onRetry={async () => {
            setShowisCorrect(false);
            if (await consumeErrorShield()) {
              return;
            }
            submitAttempt(false);
          }}
        />
      )}
{nextStageMutation.isPending && (
  <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
    <Lottie
      animationData={laodingDots}
      loop
      className="w-[50%] h-[50%]"
    />
  </div>
)}

    </>
  );
}

export default BrainBytes;
