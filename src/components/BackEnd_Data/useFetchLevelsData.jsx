import { useQuery } from "@tanstack/react-query";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../Firebase/Firebase";

export default function useFetchLevelsData(subject) {
  // Track Firebase user and loading state
  const [user, userLoading] = useAuthState(auth);

  const fetchData = async () => {
    if (!subject || !user) return []; // wait until user exists

    const token = await user.getIdToken(true);

    try {
      const res = await fetch(
        `
https://devlab-server-railway-master-production.up.railway.app/fireBase/getAllData/${subject}`,
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch levels data", res.status);
        return [];
      }

      return res.json();
    } catch (error) {
      console.error("Error fetching levels data:", error);
      return [];
    }
  };

  const { data: levelsData = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["lesson_data", subject],
    queryFn: fetchData,
    enabled: !!subject && !!user && !userLoading, // only run when user is ready
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return { levelsData, isLoading, isError, refetch };
}
