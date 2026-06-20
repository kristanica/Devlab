// Utils / Custom Hooks
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
import { AnimatePresence, motion } from "framer-motion";
import laodingDots from "../assets/Lottie/LoadingDots.json";
import Lottie from "lottie-react";
import Correct from "../assets/Lottie/correctAnsLottie.json";
import Wrong from "../assets/Lottie/wrongAnsLottie.json";
// Components
import GameHeader from "./GameModes_Components/GameHeader";
import InstructionPanel from "./GameModes_Components/InstructionPanel";
import Html_TE from "./GameModes_Components/CodeEditor and Output Panel/Html_TE";
import Css_TE from "./GameModes_Components/CodeEditor and Output Panel/Css_TE";
import JavaScript_TE from "./GameModes_Components/CodeEditor and Output Panel/JavaScript_TE";
import Database_TE from "./GameModes_Components/CodeEditor and Output Panel/Database_TE";
import GameFooter from "./GameModes_Components/GameFooter";
import useFetchUserData from "../components/BackEnd_Data/useFetchUserData";
// Items
import { useErrorShield } from "../ItemsLogics/ErrorShield";

function CodeRush({ heart, roundKey, gameOver, submitAttempt, resetHearts }) {
  const type = "Code Rush";
  const navigate = useNavigate();
  const { consumeErrorShield } = useErrorShield();
  // Route params
  const { subject, lessonId, levelId, stageId, gamemodeId } = useParams();

  // Popups
  const [levelComplete, setLevelComplete] = useState(false);
  const [alreadyComplete, setAlreadyComplete] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [showCodeWhisper, setShowCodeWhisper] = useState(false);
  const [timesUp, setTimesUp] = useState(false);

  const [pauseTimer, setPauseTimer] = useState(false);

  const { userData } = useFetchUserData();
  const userId = userData?.uid;

  const [resetTimerSignal, setResetTimerSignal] = useState(0);

const resetTimer = () => {
  setResetTimerSignal(prev => prev + 1);
};




  //for OpenAI
  const isCorrect = useGameStore((state) => state.isCorrect);
  const { loading } = useGameStore();
  const showIsCorrect = useGameStore((state) => state.showIsCorrect);
  const setShowIsCorrect = useGameStore((state) => state.setShowIsCorrect);
  const isEvaluating = useGameStore((state) => state.isEvaluating);

  const singleFeedback = useGameStore((state) => state.singleFeedback);
  const clearSingleFeedback = useGameStore((state) => state.clearSingleFeedback);

  useEffect(() => {
    if (showIsCorrect || isCorrect || isEvaluating || loading) {
      setPauseTimer(true);
    } else {
      setPauseTimer(false);
    }
  }, [showIsCorrect, isCorrect, isEvaluating]);

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
        return <Css_TE />;
      case "JavaScript":
        return <JavaScript_TE />;
      case "Database":
        return <Database_TE />;
      default:
        return <div className="text-white">Invalid subject</div>;
    }
  };

  return (
    <>
      <div
        
        className="h-screen bg-[#0D1117] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <GameHeader heart={heart} />

        {/* Content */}
        <div className="relative h-[100%] flex flex-col gap-5 md:flex-row p-10 transition-all duration-500 overflow-x-hidden">
          {/* Instruction */}
          <div className="h-[40%] md:w-[35%] md:h-full w-full">
            <InstructionPanel
              submitAttempt={submitAttempt}
              showPopup={showPopup}
              showCodeWhisper={showCodeWhisper}
              setShowCodeWhisper={setShowCodeWhisper}
              setTimesUp={setTimesUp}
              pauseTimer={pauseTimer}
              resetTimerSignal={resetTimerSignal}
            />
          </div>

          {/* Code Editor */}
          <div className="h-[60%] md:w-[80%] md:h-full w-full flex">
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
            message={`Welcome to ${type} — a fast-paced challenge where you’ll write and run code before time runs out!
            Your mission:
            🧩 Read the task  
            💻 Write your code  
            🚀 Run it before the timer hits zero!`}
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

      {/* Times Up PopUp */}
      <AnimatePresence>
        {timesUp && (
          <GameMode_Instruction_PopUp
            title="Time’s Up!"
            message="⏳ You ran out of time! Be quicker next round."
            onClose={async() => {
              setTimesUp(false); // close popup
              resetTimer(); // reset Time
                                                    if (await consumeErrorShield()) {
                          console.log(
                            "ErrorShield consumed! Preventing heart loss.");
                          return; // Do NOT call submitAttempt(false)
                        }
              submitAttempt(false); // THEN lose HP
            }}
            buttonText="Continue"
          />
        )}
      </AnimatePresence>

      {/* Game Over PopUp */}
      <AnimatePresence>
        {gameOver && (
          <Gameover_PopUp gameOver={gameOver} resetHearts={resetHearts} />
        )}
      </AnimatePresence>

      {/* Correct / Wrong Popup */}
      <AnimatePresence>
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
              resetTimer();
            }}
          />
        )}
      </AnimatePresence>
{nextStageMutation.isPending && (
  <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
    <Lottie
      animationData={laodingDots}
      loop
      className="w-[50%] h-[50%]"/>
  </div>
)}
    </>
  );
}

export default CodeRush;
