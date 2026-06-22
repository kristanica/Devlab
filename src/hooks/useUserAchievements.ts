import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useQuery } from "@tanstack/react-query";

export interface UserAchievement {
  achievementName: string;
  coinsReward: number;
  dateUnlocked: any;
  expReward: number;
  isClaimed: boolean;
}

export default function useUserAchievements(userId: string | undefined) {
  const fetchData = async (): Promise<Record<string, UserAchievement>> => {
    if (!userId) return {};

    const achRef = collection(db, "Users", userId, "Achievements");
    const snapshot = await getDocs(achRef);

    const achievements: Record<string, UserAchievement> = {};
    snapshot.forEach((doc) => {
      achievements[doc.id] = doc.data() as UserAchievement;
    });

    return achievements;
  };

  const { data, isLoading } = useQuery<Record<string, UserAchievement>>({
    queryKey: ["userAchievements", userId],
    queryFn: fetchData,
    enabled: !!userId,
  });

  return { data: data || {}, isLoading };
}
