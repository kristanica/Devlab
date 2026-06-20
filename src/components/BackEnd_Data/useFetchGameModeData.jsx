import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { auth } from "../../Firebase/Firebase";

export default function useFetchGameModeData() {
  const { subject, lessonId, levelId, stageId, gamemodeId } = useParams();

  const fetchGameMode = async () => {
    if (!subject || !lessonId || !levelId || !stageId) return null;

    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated");

    const token = await currentUser.getIdToken(true);

    const { data } = await axios.get(
      `
https://devlab-server-railway-master-production.up.railway.app/fireBase/getGameMode/${subject}/${lessonId}/${levelId}/${stageId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return data;
  };

  const { data = {}, isLoading, isError, refetch } = useQuery({
    queryKey: ["gameModeData", subject, lessonId, levelId, stageId],
    queryFn: fetchGameMode,
    enabled: !!subject && !!lessonId && !!levelId && !!stageId,
  });

  return {
    gameModeData: data.stage || null,  
    levelData: data.level || null,
    subject,
    lessonId,
    levelId,
    stageId,
    gamemodeId,
    isLoading,
    isError,
    refetch,
  };
}
