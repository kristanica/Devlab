import { auth } from "@/services/firebase";
import { useQuery } from "@tanstack/react-query";

const useFetchProgress = () => {
  const {
    data: userProgress,
    refetch,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userProgress"],
    queryFn: async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const token = await currentUser.getIdToken(true);

      const res = await fetch(`
${import.meta.env.VITE_BACK_END}/fireBase/userProgress`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error(`Failed to fetch user progress: ${res.status}`);
        return null;
      }

      const data = await res.json();
      console.log("Fetched data:", data)
      return data;
    },
  });

  return { userProgress, refetch, isLoading, isError };
};

export default useFetchProgress;
