import React from "react";
import { motion } from "framer-motion";

const AchievementsHeader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mt-2 shrink-0"
    >
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white font-exo tracking-tight">
          Hall of Achievements
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Track your milestones, prove your mastery, and claim your rewards.
        </p>
      </div>
    </motion.div>
  );
};

export default AchievementsHeader;
