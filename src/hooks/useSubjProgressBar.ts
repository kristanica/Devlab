import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";
import useFetchUserProgress from "../services/api/useFetchUserProgress";

export default function useSubjProgressBar(subject: string) {
  const { completedLevels } = useFetchUserProgress(subject);
  const [animatedBar, setAnimatedBar] = useState(0);
  const [total, setTotal] = useState(0);

  const getTotalLevels = async () => {
    const subjectRef = collection(db, subject);
    const lessonSnapshots = await getDocs(subjectRef);

    let totalLevels = 0;

    for (const lessonDoc of lessonSnapshots.docs) {
      const levelsRef = collection(db, subject, lessonDoc.id, "Levels");
      const levelsSnapshot = await getDocs(levelsRef);
      totalLevels += levelsSnapshot.size;
    }
    setTotal(totalLevels);
  };

  useEffect(() => {
    getTotalLevels();
  }, [subject]);

  const progress = total > 0 ? (completedLevels / total) * 100 : 0;

  useEffect(() => {
    let current = animatedBar;
    const target = progress;

    const step = () => {
      if (current < target) {
        current = Math.min(current + 1, target);
        setAnimatedBar(current);
        requestAnimationFrame(step);
      } else {
        setAnimatedBar(target);
      }
    };

    requestAnimationFrame(step);
  }, [progress]);

  return { animatedBar, rawProgress: progress, total };
}
