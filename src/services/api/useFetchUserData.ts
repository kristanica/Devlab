import { auth } from "@/services/firebase";
import { useQuery } from "@tanstack/react-query";

const useFetchUserData = () => {
  const {data: userData,refetch,isLoading,isError,isFetching} = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      const token = await currentUser.getIdToken(true);
      const uid = currentUser.uid;

      const fetchUrl = `${import.meta.env.VITE_BACK_END}/fireBase/getSpecificUser/${uid}`;
      console.log("[useFetchUserData] Fetching:", fetchUrl);
      const res = await fetch(fetchUrl, {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        console.error(`[useFetchUserData] Failed to fetch user: ${res.status}`);
        return null;
      }
      const data = await res.json();
      console.log("[useFetchUserData] Received data:", data);
      return { ...data, uid };
    },
  });
  return { userData, refetch, isLoading, isError ,isFetching};
};
export default useFetchUserData;
