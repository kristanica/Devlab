// React
import { useState, useEffect } from "react";
import { useGameStore } from "../components/OpenAI Prompts/useBugBustStore";
import { playSound } from "../components/Custom Hooks/DevlabSoundHandler";
import { useMutation } from "@tanstack/react-query";
// Navigation (React Router)
import { useParams } from "react-router-dom";
import { goToNextStage } from "./GameModes_Utils/Util_Navigation";
import { useNavigate } from "react-router-dom";
// PopUps
import GameMode_Instruction_PopUp from "./GameModes_Popups/GameMode_Instruction_PopUp";
import LevelCompleted_PopUp from "./GameModes_Popups/LevelCompleted_PopUp";
import Gameover_PopUp from "./GameModes_Popups/Gameover_PopUp";
import LevelAlreadyCompleted from "./GameModes_Popups/LevelAlreadyComplete_PopUp";
import CorrectWrongPopUp from "./GameModes_Popups/CorrectWrong_PopUp";
// for Animation / Icons
import { AnimatePresence,motion } from "framer-motion";
import Correct from '../assets/Lottie/correctAnsLottie.json'
import laodingDots from "../assets/Lottie/LoadingDots.json"
import Wrong from '../assets/Lottie/wrongAnsLottie.json'
import Lottie from "lottie-react";
// Components
import GameHeader from "./GameModes_Components/GameHeader";
import GameFooter from "./GameModes_Components/GameFooter";
import InstructionPanel from "./GameModes_Components/InstructionPanel";
import Html_TE from "./GameModes_Components/CodeEditor and Output Panel/Html_TE";
import Css_TE from "./GameModes_Components/CodeEditor and Output Panel/Css_TE";
import JavaScript_TE from "./GameModes_Components/CodeEditor and Output Panel/JavaScript_TE";
import Database_TE from "./GameModes_Components/CodeEditor and Output Panel/Database_TE";
import useFetchUserData from "../components/BackEnd_Data/useFetchUserData";
// Items
import { useErrorShield } from "../ItemsLogics/ErrorShield";

function CodeCrafter({ heart, roundKey, gameOver, submitAttempt,resetHearts }) {
  const type = "Code Crafter";
    const navigate = useNavigate();
  const { consumeErrorShield } = useErrorShield();
  // Route params
  const { subject, lessonId, levelId ,stageId } = useParams();


  // Popups
  const [levelComplete, setLevelComplete] = useState(false);
  const [alreadyComplete, setAlreadyComplete]= useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [showCodeWhisper, setShowCodeWhisper] = useState(false);

  const { userData } = useFetchUserData();
  const userId = userData?.uid;


  //for OpenAI
  const isCorrect = useGameStore((state) => state.isCorrect);
  const showIsCorrect = useGameStore((state) => state.showIsCorrect);
  const setShowIsCorrect = useGameStore((state) => state.setShowIsCorrect);

  const singleFeedback = useGameStore((state) => state.singleFeedback);
  const clearSingleFeedback = useGameStore((state) => state.clearSingleFeedback);

    useEffect(() => {
    if (showIsCorrect) {
      if (isCorrect) {
        playSound("correct");
      } else {
        playSound("inCorrect");
      }
    }
  }, [showIsCorrect, isCorrect]);
    const nextStageMutation = useMutation({
  mutationFn: async () => {
    setShowIsCorrect(false);
    return await goToNextStage({subject,lessonId,levelId,stageId,navigate,setLevelComplete,userId,setAlreadyComplete});
  },
});

  // Dynamically render editor based on subject
  const renderEditor = () => {
    switch (subject) {
      case "Html":
        return <Html_TE />;
      case "Css":
        return <Css_TE/>;
      case "JavaScript":
        return <JavaScript_TE />;
      case "Database":
        return <Database_TE/>;
      default:
        return <div className="text-white">Invalid or missing subject.</div>;
    }
  };

  return (
    <>
      <div className="h-screen bg-[#0D1117] flex flex-col overflow-hidden">
        {/* Header */}
        <GameHeader heart={heart} />

        {/* Content */}
        <div className="relative h-[100%] flex flex-col gap-5 md:flex-row p-10 transition-all duration-500 overflow-x-hidden">
          {/* Instruction Panel */}
          <div className="h-[40%] md:w-[35%] md:h-full w-full">
            <InstructionPanel
              showCodeWhisper={showCodeWhisper}
              setShowCodeWhisper={setShowCodeWhisper}
            />
          </div>

          {/* Code Editor */}
          <div className="h-full md:w-[80%] md:h-full w-full flex">
            {renderEditor()}
          </div>
        </div>

        {/* Footer */}
        <GameFooter
          setLevelComplete={setLevelComplete}
          setShowCodeWhisper={setShowCodeWhisper}
          setAlreadyComplete={setAlreadyComplete}
        />
      </div>

      {/* Instruction PopUp */}
      <AnimatePresence>
        {showPopup && (
          <GameMode_Instruction_PopUp
            title="Hey Dev!!"
            message={`Welcome to ${type} — a creative challenge where you’ll craft code to build something amazing!
Your mission:
🧩 Understand the task  
💻 Write your code  
🚀 See your creation come to life!`}
            onClose={() => setShowPopup(false)}
            buttonText="Start Challenge"
          />
        )}
      </AnimatePresence>

      {/* Level Complete PopUp */}
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

      {/**/}
      <AnimatePresence>
        {gameOver &&(
          <Gameover_PopUp gameOver={gameOver} resetHearts={resetHearts}></Gameover_PopUp>
        )}
      </AnimatePresence>
        {showIsCorrect && (
          <CorrectWrongPopUp
            isCorrect={isCorrect}
            singleFeedback={singleFeedback}
            onContinue={() => {
              clearSingleFeedback();
              nextStageMutation.mutate();
            }}
            onRetry={async () => {
              setShowIsCorrect(false);
              if (await consumeErrorShield()) {
                console.log("ErrorShield consumed! Preventing heart loss.");
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

export default CodeCrafter;
