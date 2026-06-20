import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../../Firebase/Firebase";
import { doc, onSnapshot } from "firebase/firestore";

import Lottie from "lottie-react";
import loadingDots from "../../assets/Lottie/LoadingDots.json"


// Game Modes
import CodeRush from "../CodeRush";
import BrainBytes from "../BrainBytes";
import LessonPage from "../../Lessons/LessonPage";
import BugBust from "../BugBust";
import CodeCrafter from "../CodeCrafter";
import Gameover_PopUp from "../GameModes_Popups/Gameover_PopUp";

// Store
import { useAttemptStore } from "../GameModes_Utils/useAttemptStore";

const GameModeRouter = () => {
  const { subject, lessonId, levelId, stageId, gamemodeId } = useParams();
  const navigate = useNavigate();

  const [isAllowed, setIsAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [back, setBack] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const { heart, roundKey, gameOver, submitAttempt, resetHearts, loadHearts } =
    useAttemptStore();

  //  Load hearts when the component mounts
  useEffect(() => {
    loadHearts();
  }, [loadHearts]);

  //  Set back route when game is over
  useEffect(() => {
    if (gameOver) {
      setBack(`/Main/Lessons/${subject}/${lessonId}/${levelId}/Stage1/Lesson`);
    }
  }, [gameOver, subject, lessonId, levelId]);

useEffect(() => {
  const user = auth.currentUser;
  if (!user) {
    navigate("/Login");
    return;
  }

  //  Real-time stage reference
  const stageRef = doc(
    db,
    "Users",
    user.uid,
    "Progress",
    subject,
    "Lessons",
    lessonId,
    "Levels",
    levelId,
    "Stages",
    stageId
  );

  //  Listen for live updates
  const unsubscribe = onSnapshot(
    stageRef,
    (stageSnap) => {
      if (!stageSnap.exists()) {
        setIsAllowed(false);
        setErrorMessage("This stage does not exist or has not been unlocked yet.");
        setChecking(false);
        return;
      }

      const data = stageSnap.data();

      if (data.isActive === true || data.isCompleted === true) {
        setIsAllowed(true);
        setErrorMessage("");
      } else {
        setIsAllowed(false);
        setErrorMessage("This stage is locked. Complete the previous stage to unlock it.");
      }

      setChecking(false);
    },
    (error) => {
      console.error("Realtime listener error:", error);
      setErrorMessage("Error checking access. Please try again later.");
      setChecking(false);
    }
  );

  //  Clean up listener when unmounting or params change
  return () => unsubscribe();
}, [subject, lessonId, levelId, stageId, navigate]);



  console.log(isAllowed);

  //  Props for all game components
  const props = { heart, roundKey, gameOver, submitAttempt, resetHearts };

  //  Available Game Modes
  const components = {
    CodeRush: <CodeRush {...props} />,
    BrainBytes: <BrainBytes {...props} />,
    BugBust: <BugBust {...props} />,
    Lesson: <LessonPage />,
    CodeCrafter: <CodeCrafter {...props} />,
  };

  //  While checking
  if (checking)
    return (
  <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
    <Lottie animationData={loadingDots} loop className="w-[50%] h-[50%]" />
  </div>
    );

//  If not allowed
if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-center px-4">
        <div className="bg-gray-800 p-12 rounded-xl border-4 border-purple-600 shadow-2xl max-w-lg w-full">
          {/* Headline color changed to a bright purple for accent */}
          <h2 className="text-5xl font-extrabold mb-4 text-purple-400">
            [ ERROR: 403 ]
          </h2>
          <p className="text-xl font-medium mb-2 text-gray-200">
            Access to Stage Denied
          </p>
          {/* Detailed error message color remains subtle */}
          <p className="text-gray-400 mb-8">{errorMessage}</p>
          <button
            onClick={() => navigate(-1)}
            // Button changed to purple and shadow updated
            className="w-full bg-purple-700 text-white font-semibold py-3 rounded-lg hover:bg-purple-600 transition-colors duration-200 shadow-lg shadow-purple-500/50 cursor-pointer"
          >
            Go Back to Lessons
          </button>
        </div>
      </div>
    );
}

  //  If allowed, render the correct game mode
  return (
    <>
      {components[gamemodeId] || (
        <div className="flex items-center justify-center min-h-screen text-lg">
          Game Mode Not Found
        </div>
      )}

      {gameOver && (
        <Gameover_PopUp
          gameOver={gameOver}
          resetHearts={resetHearts}
          Back={back}
          subject={subject}
          lessonId={lessonId}
          levelId={levelId}
          stageId={stageId}
        />
      )}
    </>
  );
};

export default GameModeRouter;
