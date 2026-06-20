import { collection, getDocs } from "firebase/firestore";
import { db } from "../../Firebase/Firebase";
import { useQuery } from "@tanstack/react-query";

export default function useUserAchievements(userId) {
  const fetchData = async () => {
    if (!userId) return {};

    const achRef = collection(db, "Users", userId, "Achievements");
    const snapshot = await getDocs(achRef);

    const achievements = {};
    snapshot.forEach((doc) => {
      achievements[doc.id] = doc.data();
    });

    return achievements;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["userAchievements", userId], // unique cache per user
    queryFn: fetchData,
  });

  return { data, isLoading };
}
