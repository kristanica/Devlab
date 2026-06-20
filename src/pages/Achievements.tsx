import React, { useState } from "react";

// Components
import AchievementsHeader from "../components/Achievements/AchievementsHeader";
import AchievementsOverview from "../components/Achievements/AchievementsOverview";
import AchievementSection from "../components/Achievements/AchievementSection";

// Data
import useFetchUserData from "../components/BackEnd_Data/useFetchUserData";
import useUserAchievements from "../components/Custom Hooks/useUserAchievements";
import useAchievementsProgressBar from "../components/Custom Hooks/useAchievementProgressBar";
import useFetchAchievements from "../components/BackEnd_Data/useFetchAchievements";
import { useClaimAchievement } from "../components/Achievements/useClaimAchievement";

const Achievements: React.FC = () => {
  const { userData } = useFetchUserData();
  const { achievements: HtmlData, isLoading: htmlLoading } =
    useFetchAchievements("Html");
  const { achievements: CssData, isLoading: cssLoading } =
    useFetchAchievements("Css");
  const { achievements: JsData, isLoading: jsLoading } =
    useFetchAchievements("JavaScript");
  const { achievements: DatabaseData, isLoading: dbLoading } =
    useFetchAchievements("Database");

  const { animatedBar: HtmlBar } = useAchievementsProgressBar(
    userData?.uid,
    "Html",
  );
  const { animatedBar: CssBar } = useAchievementsProgressBar(
    userData?.uid,
    "Css",
  );
  const { animatedBar: JsBar } = useAchievementsProgressBar(
    userData?.uid,
    "JavaScript",
  );
  const { animatedBar: DatabaseBar } = useAchievementsProgressBar(
    userData?.uid,
    "Database",
  );

  const { data: userAchievements } = useUserAchievements(userData?.uid);

  const [loadingClaim, setLoadingClaim] = useState(false);
  const claimMutation = useClaimAchievement(userData, setLoadingClaim);

  const handleClaim = (item: any) => {
    setLoadingClaim(true);
    claimMutation.mutate(item);
  };

  return (
    <div className="w-full h-full p-4 lg:p-8 flex flex-col gap-6 lg:gap-8 bg-[#06060a] min-h-0 text-slate-200 selection:bg-purple-500/30 font-inter overflow-hidden">
      <AchievementsHeader />

      <AchievementsOverview
        userData={userData}
        HtmlBar={HtmlBar}
        CssBar={CssBar}
        JsBar={JsBar}
        DatabaseBar={DatabaseBar}
      />

      <div className="flex-1 w-full flex flex-col gap-4 mt-4 overflow-y-auto min-h-0 pr-2 pb-10 scrollbar-custom">
        <AchievementSection
          subjectKey="Html"
          data={HtmlData}
          loading={htmlLoading}
          userAchievements={userAchievements}
          handleClaim={handleClaim}
        />
        <AchievementSection
          subjectKey="Css"
          data={CssData}
          loading={cssLoading}
          userAchievements={userAchievements}
          handleClaim={handleClaim}
        />
        <AchievementSection
          subjectKey="JavaScript"
          data={JsData}
          loading={jsLoading}
          userAchievements={userAchievements}
          handleClaim={handleClaim}
        />
        <AchievementSection
          subjectKey="Database"
          data={DatabaseData}
          loading={dbLoading}
          userAchievements={userAchievements}
          handleClaim={handleClaim}
        />
      </div>
    </div>
  );
};

export default Achievements;
