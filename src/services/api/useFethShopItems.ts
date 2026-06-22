// BackEnd_Data/useFetchShopItems.jsx
import { auth } from "@/services/firebase";
import { useQuery } from "@tanstack/react-query";

// Query function
export const fetchShopItems = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const token = await currentUser.getIdToken(true);

  try {
    const res = await fetch(
      import.meta.env.VITE_BACK_END + "/fireBase/Shop",
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      console.error("Something went wrong fetching shop items:", res.status);
      return [];
    }

    const data = await res.json();
    return data ?? [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Custom Hook (optimized for prefetch)
const useFetchShopItems = () => {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ShopItems"],
    queryFn: fetchShopItems,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return { shopItems: data, isLoading, error };
};

export default useFetchShopItems;
