import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import loadingDots from "../../../assets/Lottie/LoadingDots.json";

// Game Modes
import CodeRush from "../modes/CodeRush";
import BrainBytes from "../modes/BrainBytes";
import LessonPage from "../../lessons/pages/LessonPage";
import BugBust from "../modes/BugBust";
import CodeCrafter from "../modes/CodeCrafter";
import Gameover_PopUp from "../popups/Gameover_PopUp";

// Hooks & Store
import { useAttemptStore } from "@/store/useAttemptStore";
import { useStageAccess } from "../utils/useStageAccess";
import GameModeAccessDenied from "../utils/GameModeAccessDenied";

const GameModeRouter: React.FC = () => {
  const { subject, lessonId, levelId, stageId, gamemodeId } = useParams();

  const [back, setBack] = useState<string | null>(null);

  // Authentication & Stage Validation Hook
  const { isAllowed, checking, errorMessage } = useStageAccess(
    subject,
    lessonId,
    levelId,
    stageId,
  );

  // Attempt & Hearts Logic
  const { heart, roundKey, gameOver, submitAttempt, resetHearts, loadHearts } =
    useAttemptStore();

  useEffect(() => {
    loadHearts();
  }, [loadHearts]);

  useEffect(() => {
    if (gameOver) {
      setBack(`/Main/Lessons/${subject}/${lessonId}/${levelId}/Stage1/Lesson`);
    }
  }, [gameOver, subject, lessonId, levelId]);

  // Loading State
  if (checking) {
    return (
      <div className="fixed inset-0 z-50 bg-[#06060a] flex items-center justify-center">
        <Lottie
          animationData={loadingDots}
          loop
          className="w-64 h-64 opacity-80"
        />
      </div>
    );
  }

  // Access Denied State
  if (!isAllowed) {
    return <GameModeAccessDenied errorMessage={errorMessage} />;
  }

  const props = { heart, roundKey, gameOver, submitAttempt, resetHearts };

  // Component Map
  const components: Record<string, React.ReactNode> = {
    CodeRush: <CodeRush {...props} />,
    BrainBytes: <BrainBytes {...props} />,
    BugBust: <BugBust {...props} />,
    Lesson: <LessonPage />,
    CodeCrafter: <CodeCrafter {...props} />,
  };

  return (
    <>
      {gamemodeId && components[gamemodeId] ? (
        components[gamemodeId]
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#06060a] text-white text-xl font-exo font-bold">
          <span className="text-red-500 mb-2">[ ERROR ]</span>
          Game Mode Not Found
        </div>
      )}

      {gameOver && (
        <Gameover_PopUp
          gameOver={gameOver}
          resetHearts={resetHearts}
          Back={back || ""}
          subject={subject || ""}
          lessonId={lessonId || ""}
          levelId={levelId || ""}
          stageId={stageId || ""}
        />
      )}
    </>
  );
};

export default GameModeRouter;
