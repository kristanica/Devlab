import { useEffect } from "react";
import { unlockAchievement } from "./UnlockAchievement";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../Firebase/Firebase";

export function useSubjectCheckComplete(userId, subject) {
  useEffect(() => {
    const checkSubjectCompletion = async () => {
      try {
        const subjectRef = collection(db, "Users", userId, "Progress", subject, "Lessons");
        const lessonsSnapshot = await getDocs(subjectRef);

        let allLevelsCompleted = true;

        for (const lessonDoc of lessonsSnapshot.docs) {
          const levelsRef = collection(lessonDoc.ref, "Levels");
          const levelsSnapshot = await getDocs(levelsRef);

          for (const levelDoc of levelsSnapshot.docs) {
            const levelData = levelDoc.data();
            if (!levelData.isCompleted) {
              allLevelsCompleted = false;
              break;
            }
          }
          if (!allLevelsCompleted) break;
        }

        if (allLevelsCompleted) {
          await unlockAchievement(userId, subject, "subjectComplete");
        }
      } catch (err) {
        console.error("Error checking subject completion:", err);
      }
    };

    checkSubjectCompletion();
  }, [userId, subject]);
}
