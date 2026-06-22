// @ts-nocheck
import { auth } from "@/services/firebase";
import { useQuery } from "@tanstack/react-query";
import { useUserProgressStore } from "@/store/useUserProgressStore";

export default function useFetchUserProgress(subject) {
  const setUserProgress = useUserProgressStore((state) => state.setUserProgress);

  const fetchProgress = async () => {
    if (!subject) return null;

    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const token = await currentUser.getIdToken(true);

    const res = await fetch(
      `
${import.meta.env.VITE_BACK_END}/fireBase/userProgres/${subject}`,
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      console.error("Failed to fetch user progress", res.status);
      return null;
    }

    const data = await res.json();

    //  Store only userProgress in Zustand
    if (data?.allProgress) setUserProgress(data.allProgress);

    return data;
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["userProgress_data", subject],
    queryFn: fetchProgress,
    enabled: !!subject,
  });

  return {
    userProgress: data?.allProgress || {},
    userStageProgress: data?.allStages || {},
    userStageCompleted: data?.allStagesComplete || {},
    completedLevels: data?.completedLevels || 0,
    completedStages: data?.completedStages || 0,
    isLoading,
    isError,
    refetch,
  };
}
