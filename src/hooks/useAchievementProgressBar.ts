import { useEffect, useState } from "react";
import useUserAchievements from "./useUserAchievements";
import useFetchAchievements from "../components/BackEnd_Data/useFetchAchievements";

export default function useAchievementsProgressBar(userId: string | undefined, subject: string) {
  const { achievements: allAchievements, isLoading: loadingAll } = useFetchAchievements(subject);
  const { data: userAchievements, isLoading: loadingUser } = useUserAchievements(userId);
  const [animatedBar, setAnimatedBar] = useState(0);

  const subjectAliases: Record<string, string> = {
    javascript: "js",
    html: "html",
    database: "db",
    css: "css",
  };

  useEffect(() => {
    if (loadingAll || loadingUser || !allAchievements) return;

    const normalizedSubject =
      subjectAliases[subject?.toLowerCase()] || subject?.toLowerCase();

    const unlockedForSubject = Object.keys(userAchievements || {}).filter((id) =>
      id.toLowerCase().startsWith(normalizedSubject)
    );

    const totalAchievements = allAchievements.length;
    const unlockedCount = unlockedForSubject.length;

    const progress =
      totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;

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
