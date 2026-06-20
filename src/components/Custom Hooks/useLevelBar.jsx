// for Level Bar Anomation

import { useState, useEffect } from "react";
import useFetchUserData from "../BackEnd_Data/useFetchUserData";

export default function useLevelBar() {
  const [animatedExp, setAnimatedExp] = useState(0);
  const { userData, isLoading, isError, refetch } = useFetchUserData();

  useEffect(() => {
    if (userData?.exp >= 0) {
      let start = animatedExp;
      const target = userData.exp;
      const step = () => {
        if (start < target) {
          start = Math.min(start + 2, target);
          setAnimatedExp(start);
          requestAnimationFrame(step);
        } else {
          setAnimatedExp(target);
        }
      };
      requestAnimationFrame(step);
    }
  }, [userData?.exp]);

  return { animatedExp, isLoading };

}
