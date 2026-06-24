import { useEffect, useState } from "react";
import { db, auth } from "../../../services/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export const useStageAccess = (
  subject: string | undefined,
  lessonId: string | undefined,
  levelId: string | undefined,
  stageId: string | undefined
) => {
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      // Handled by router/auth guards, but we set false here
      setIsAllowed(false);
      setChecking(false);
      return;
    }

    if (!subject || !lessonId || !levelId || !stageId) {
      setIsAllowed(false);
      setErrorMessage("Invalid route parameters.");
      setChecking(false);
      return;
    }

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

    const unsubscribe = onSnapshot(
      stageRef,
      (stageSnap) => {
        if (!stageSnap.exists()) {
          setIsAllowed(false);
          setErrorMessage("This stage does not exist or has not been unlocked yet.");
          setChecking(false);
          return;
        }

        const data = stageSnap.data() as { isActive?: boolean; isCompleted?: boolean };

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

    return () => unsubscribe();
  }, [subject, lessonId, levelId, stageId]);

  return { isAllowed, checking, errorMessage };
};
