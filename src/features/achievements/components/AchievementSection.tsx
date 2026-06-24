import React from "react";
import { FaTrophy, FaLock } from "react-icons/fa";
import { ACHIEVEMENTS_THEME } from "./AchievementConfig";

interface AchievementSectionProps {
  subjectKey: string;
  data: any[];
  loading: boolean;
  userAchievements: any;
  handleClaim: (item: any) => void;
}

const AchievementSection: React.FC<AchievementSectionProps> = ({
  subjectKey,
  data,
  loading,
  userAchievements,
  handleClaim
}) => {
  const theme = ACHIEVEMENTS_THEME[subjectKey as keyof typeof ACHIEVEMENTS_THEME];
  const SubjectIcon = theme.icon;

  return (
    <div className="flex flex-col gap-6 mb-12">
      <div className="flex items-center gap-3 border-b border-[#2a2a3c] pb-3 sticky top-0 z-20 bg-[#06060a] pt-2">
        <div className="w-10 h-10 rounded-lg bg-[#161622] border border-[#2a2a3c] flex items-center justify-center">
          <SubjectIcon className={`text-xl ${theme.text}`} />
        </div>
        <h2 className={`font-exo text-2xl font-bold tracking-tight ${theme.text}`}>
          {theme.title}
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[#0d0d12] border border-[#1e1e2e] rounded-xl h-56 animate-pulse flex flex-col p-5 gap-4">
              <div className="w-12 h-12 bg-[#161622] rounded-full self-center" />
              <div className="h-4 bg-[#161622] rounded w-3/4 self-center mt-2" />
              <div className="h-3 bg-[#161622] rounded w-full mt-2" />
              <div className="h-3 bg-[#161622] rounded w-5/6 self-center" />
              <div className="mt-auto h-8 bg-[#161622] rounded-lg w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
          {data?.map((item) => {
            const isUnlocked = !!userAchievements?.[item.id];
            const isClaimed = isUnlocked && userAchievements[item.id]?.isClaimed;

            return (
              <div
                key={item.id}
                className={`relative group flex flex-col items-center text-center p-6 rounded-xl border transition-all duration-300 h-full ${
                  isUnlocked
                    ? `bg-[#0d0d12] border-[#2a2a3c] ${theme.borderHover} ${theme.shadow}`
                    : "bg-[#06060a] border-[#1e1e2e] opacity-60 grayscale hover:grayscale-0"
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all mb-4 ${
                  isClaimed
                    ? "bg-green-500/10 border-green-500/30 text-green-500"
                    : isUnlocked 
                      ? `bg-[#161622] border-[#2a2a3c] ${theme.text} ${theme.glow}`
                      : "bg-[#0d0d12] border-[#1e1e2e] text-slate-600"
                }`}>
                  {isClaimed ? <FaTrophy size={28} /> : isUnlocked ? <SubjectIcon size={32} /> : <FaLock size={24} />}
                </div>

                <h3 className={`font-exo font-bold text-lg mb-2 tracking-tight ${isUnlocked ? "text-white" : "text-slate-400"}`}>
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-3">
                  {item.description}
                </p>

                <button
                  onClick={() => isUnlocked && !isClaimed && handleClaim(item)}
                  disabled={!isUnlocked || isClaimed}
                  className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border ${
                    isClaimed
                      ? "bg-[#161622] border-[#2a2a3c] text-green-500 cursor-default"
                      : isUnlocked
                        ? `bg-${theme.color}-500/10 border-${theme.color}-500/30 ${theme.text} hover:bg-${theme.color}-500 hover:text-black`
                        : "bg-[#0d0d12] border-[#1e1e2e] text-slate-600 cursor-not-allowed"
                  }`}
                >
                  {isClaimed ? "Claimed" : isUnlocked ? "Claim Reward" : "Locked"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AchievementSection;
