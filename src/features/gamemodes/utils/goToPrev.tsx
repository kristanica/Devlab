import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import type { NavigateFunction } from "react-router-dom";

interface GoToPreviousStageParams {
  subject: string;
  lessonId: string;
  levelId: string;
  stageId: string;
  navigate: NavigateFunction;
}

export async function goToPreviousStage({ subject, lessonId, levelId, stageId, navigate }: GoToPreviousStageParams): Promise<void> {
  // Convert StageX to number
  const currentStageNum = parseInt(stageId.replace("Stage", ""));
  const prevStageNum = currentStageNum - 1;

  if (prevStageNum <= 0) return; // no previous stage

  // Fetch the stage data from Firestore
  const prevStageRef = doc(db, subject, lessonId, "Levels", levelId, "Stages", `Stage${prevStageNum}`);
  const prevStageSnap = await getDoc(prevStageRef);

  if (!prevStageSnap.exists()) {
    console.warn("Previous stage does not exist!");
    return;
  }

  // Navigate to previous stage
  const prevStageData = prevStageSnap.data();
  const prevGamemode = prevStageData.type || "Lesson"; // fallback

  navigate(`/Main/Lessons/${subject}/${lessonId}/${levelId}/Stage${prevStageNum}/${prevGamemode}`);
}
