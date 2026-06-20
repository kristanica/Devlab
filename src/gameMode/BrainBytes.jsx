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
        <AnimatePresence>
          {isCorrect ? (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-lg p-8 w-[80%] max-w-md text-center flex flex-col items-center gap-4"> 
                <Lottie animationData={Correct} loop={false} className="w-[70%] h-[70%]"/>
                <h1 className="font-exo font-bold text-black text-3xl">Correct Answer</h1>
<motion.button
  onClick={() => nextStageMutation.mutate()}
  whileTap={{ scale: 0.95 }}
  whileHover={{ scale: 1.05 }}
  className="bg-[#9333EA] text-white px-6 py-2 rounded-xl font-semibold hover:bg-purple-700 hover:drop-shadow-[0_0_6px_rgba(126,34,206,0.4)] cursor-pointer">
  Continue
</motion.button>

              </div>
            </div>
          ) : (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-lg p-8 w-[80%] max-w-md text-center flex flex-col items-center gap-4"> 
                <Lottie animationData={Wrong} loop={false} className="w-[100%] h-[100%]"/>
                <h1 className="font-exo font-bold text-black text-3xl">Wrong Answer</h1> 
                <motion.button
        onClick={async () => {
          setShowisCorrect(false);
          //  Check for Error Shield first
          if (await consumeErrorShield()) {
            
            return; // Do NOT call submitAttempt(false)
          }
          submitAttempt(false);
        }}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ bounceDamping: 100 }}
                  className="bg-[#9333EA] text-white px-6 py-2 rounded-xl font-semibold hover:bg-purple-700 hover:drop-shadow-[0_0_6px_rgba(126,34,206,0.4)] cursor-pointer ">
                  Retry
                </motion.button>
              </div>
            </div>
          )}
        </AnimatePresence>
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
