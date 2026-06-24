import React from "react";
import { motion } from "framer-motion";
import Coins from "../../../assets/Images/DevCoins.png";
import defaultAvatar from "../../../assets/Images/profile_handler.png";

interface ProfileCardProps {
  userData: any;
  animatedExp: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ userData, animatedExp }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="w-full lg:w-[60%] relative rounded-xl overflow-hidden border border-[#2a2a3c] bg-[#0d0d12] shadow-xl"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${userData?.backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/90 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d12] via-[#0d0d12]/90 to-transparent" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 h-full">
        <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 relative group">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 animate-[spin_4s_linear_infinite] opacity-70 group-hover:opacity-100 transition-opacity blur-md" />
          <div className="absolute inset-1 rounded-full bg-[#161622] z-0" />
          <img
            src={userData?.profileImage || defaultAvatar}
            alt="Profile"
            className="relative z-10 w-full h-full object-cover rounded-full border-4 border-[#161622] shadow-[0_0_20px_rgba(147,51,234,0.3)] group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-3 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-widest">
            Level {userData?.userLevel || 1} Developer
          </div>

          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold text-white font-exo leading-tight tracking-tight">
            {userData?.username || "Guest"}
          </h2>

          <p className="text-slate-400 text-sm max-w-md line-clamp-2">
            {userData?.bio || "No bio set. Start coding to write your story."}
          </p>

          <div className="w-full mt-2">
            <div className="flex justify-between items-end mb-2">
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Experience
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-fuchsia-400">
                  {userData?.exp || 0} / 100 XP
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                  <img
                    src={Coins}
                    alt="Coins"
                    className="w-4 h-4 object-contain"
                  />
                  <span className="text-sm font-bold text-yellow-400">
                    {userData?.coins || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-2 w-full bg-[#1e1e2e] rounded-sm overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(animatedExp / 100) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600 shadow-[0_0_10px_rgba(217,70,239,0.5)]"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCard;
