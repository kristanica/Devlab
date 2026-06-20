import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auth,db } from "../../Firebase/Firebase";
import { doc, setDoc } from "firebase/firestore";

export default function useStoreLastOpenedLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subject, gameModeData, lessonId, levelId, stageId }) => {
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
        gameMode: gameModeData.type,
      };

      await setDoc(
        userRef,
        { lastOpenedLevel: { [subject]: levelInfo } },
        { merge: true }
      );

      console.log(`Stored lastOpenedLevel for ${subject}`);
      return levelInfo;
    },

    //  Auto refresh the dashboard userData query after updating
    onSuccess: () => {
      queryClient.invalidateQueries(["userData"]);
    },

    onError: (error) => {
      console.error("Error updating lastOpenedLevel:", error);
    },
  });
}
