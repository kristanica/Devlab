import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import LoadingSmall from "../../../assets/Lottie/loadingSmall.json";

interface RecentMissionsProps {
  isLoading: boolean;
  lastOpenedLevel: any;
  subjectIcons: Record<string, any>;
}

const RecentMissions: React.FC<RecentMissionsProps> = ({ isLoading, lastOpenedLevel, subjectIcons }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex-1 w-full lg:w-[65%] flex flex-col gap-4"
    >
      <h3 className="text-white font-exo text-xl font-bold tracking-tight px-1">
        Recent Missions
      </h3>

      {isLoading ? (
        <div className="flex-1 bg-[#0d0d12] border border-[#2a2a3c] rounded-xl flex justify-center items-center min-h-[250px]">
          <Lottie
            animationData={LoadingSmall}
            loop
            className="w-32 h-32 opacity-50"
          />
        </div>
      ) : lastOpenedLevel && Object.keys(lastOpenedLevel).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
          {Object.entries(lastOpenedLevel)
            .sort(
              ([a], [b]) =>
                ["Html", "Css", "JavaScript", "Database"].indexOf(a) -
                ["Html", "Css", "JavaScript", "Database"].indexOf(b)
            )
            .map(([subject, info]: [string, any]) => (
              <Link
                key={subject}
                to={`/Main/Lessons/${info.subject}/${info.lessonId}/${info.levelId}/${info.stageId}/${info.gameMode}`}
                className="group block"
              >
                <div className="bg-[#0d0d12] border border-[#2a2a3c] hover:border-purple-500/50 rounded-lg p-4 flex gap-4 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(147,51,234,0.1)] hover:-translate-y-1 h-full">
                  <div className="w-16 h-16 shrink-0 rounded-md bg-[#161622] border border-[#2a2a3c] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <img
                      src={subjectIcons[subject]}
                      alt={subject}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-exo text-lg text-white font-bold tracking-tight group-hover:text-purple-300 transition-colors">
                      {info.title}
                    </p>
                    <p className="text-slate-400 text-xs line-clamp-2 mt-1 leading-relaxed">
                      {info.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      ) : (
        <div className="flex-1 bg-[#0d0d12] border border-[#2a2a3c] border-dashed rounded-xl flex flex-col items-center justify-center p-8 min-h-[250px] text-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-[#161622] flex items-center justify-center mb-2">
            <span className="text-2xl">🚀</span>
          </div>
          <p className="text-slate-300 font-exo text-lg font-medium">
            No active missions
          </p>
          <p className="text-slate-500 text-sm max-w-sm">
            Head over to the lessons tab to start your first full-stack
            development challenge!
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default RecentMissions;
