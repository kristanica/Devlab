import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";

export interface LastOpenedLevelVariables {
  subject: string;
  gameModeData: {
    description?: string;
    title?: string;
    type?: string;
    [key: string]: any;
  };
  lessonId: string;
  levelId: string;
  stageId: string;
}

export default function useStoreLastOpenedLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subject, gameModeData, lessonId, levelId, stageId }: LastOpenedLevelVariables) => {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      const userRef = doc(db, "Users", user.uid);

      const levelInfo = {
        description: gameModeData.description || "",
        lessonId: lessonId || "UnknownLesson",
        levelId: levelId || "UnknownLevel",
        stageId: stageId || "",
        subject,
        title: gameModeData.title || "",
        gameMode: gameModeData.type || "",
      };

      await setDoc(
        userRef,
        { lastOpenedLevel: { [subject]: levelInfo } },
        { merge: true }
      );

      console.log(`Stored lastOpenedLevel for ${subject}`);
      return levelInfo;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    },

    onError: (error: any) => {
      console.error("Error updating lastOpenedLevel:", error);
    },
  });
}
