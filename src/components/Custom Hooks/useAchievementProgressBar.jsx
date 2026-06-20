import { useEffect, useState } from "react";
import useUserAchievements from "./useUserAchievements";
import useFetchAchievements from "../BackEnd_Data/useFetchAchievements";

export default function useAchievementsProgressBar(userId, subject) {
  const { achievements: allAchievements, isLoading: loadingAll } = useFetchAchievements(subject);
  const { data: userAchievements, isLoading: loadingUser } = useUserAchievements(userId);
  const [animatedBar, setAnimatedBar] = useState(0);

  //  Subject alias map to handle abbreviations
  const subjectAliases = {
    javascript: "js",
    html: "html",
    database: "db",
    css: "css",
  };

  useEffect(() => {
    if (loadingAll || loadingUser || !allAchievements) return;

    //  Normalize subject to match stored achievement prefixes
    const normalizedSubject =
      subjectAliases[subject?.toLowerCase()] || subject?.toLowerCase();

    //  Filter unlocked achievements based on normalized subject prefix
    const unlockedForSubject = Object.keys(userAchievements || {}).filter((id) =>
      id.toLowerCase().startsWith(normalizedSubject)
    );

    const totalAchievements = allAchievements.length;
    const unlockedCount = unlockedForSubject.length;

    const progress =
      totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;

    //  Smooth animation effect for progress bar
    let current = animatedBar;
    const target = progress;

    const step = () => {
      if (current < target) {
        current = Math.min(current + 1, target);
        setAnimatedBar(current);
        requestAnimationFrame(step);
      } else {
        setAnimatedBar(target);
      }
    };

    requestAnimationFrame(step);
  }, [allAchievements, userAchievements, loadingAll, loadingUser, subject]);

  return { animatedBar };
}
