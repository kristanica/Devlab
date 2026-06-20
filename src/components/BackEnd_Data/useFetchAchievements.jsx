// useFetchAchievements.jsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { auth } from "../../Firebase/Firebase";

export default function useFetchAchievements(category) {
  const fetchAchievements = async () => {
    if (!category) return [];

    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated");

    const token = await currentUser.getIdToken(true);

    const { data } = await axios.get(
      `https://devlab-server-railway-master-production.up.railway.app/fireBase/achievements/${category}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return Object.keys(data || {})
      .map((key) => ({ id: key, ...data[key] }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["achievementsData", category],
    queryFn: fetchAchievements,
    enabled: !!category,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return { achievements: data, isLoading, isError, refetch };
}
