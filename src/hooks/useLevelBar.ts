import { useState, useEffect } from "react";
import useFetchUserData from "../services/api/useFetchUserData";

export default function useLevelBar() {
  const [animatedExp, setAnimatedExp] = useState<number>(0);
  const { userData, isLoading } = useFetchUserData();

  useEffect(() => {
    if (userData && userData.exp >= 0) {
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
