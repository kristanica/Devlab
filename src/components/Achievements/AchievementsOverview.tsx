import React from "react";
import { motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import defaultAvatar from "../../assets/Images/profile_handler.png";

interface AchievementsOverviewProps {
  userData: any;
  HtmlBar: number;
  CssBar: number;
  JsBar: number;
  DatabaseBar: number;
}

const AchievementsOverview: React.FC<AchievementsOverviewProps> = ({
  userData,
  HtmlBar,
  CssBar,
  JsBar,
  DatabaseBar
}) => {
  return (
    <div className="shrink-0 w-full bg-[#0d0d12] border border-[#2a2a3c] rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row gap-8 shadow-xl">
      {/* User Info */}
      <div className="flex items-center gap-5 lg:w-1/3 lg:border-r border-[#2a2a3c] lg:pr-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 relative rounded-full border-2 border-[#2a2a3c] bg-[#161622] overflow-hidden">
          <img src={userData?.profileImage || defaultAvatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Developer</p>
          <p className="font-exo font-bold text-white text-2xl tracking-tight truncate">{userData?.username}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 w-max">
            <FaTrophy className="text-purple-400 text-xs" />
            <span className="text-xs text-purple-400 font-bold tracking-wider uppercase">Trophy Hunter</span>
          </div>
        </div>
      </div>

      {/* Global Progress Bars */}
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'HTML', bar: HtmlBar, color: 'bg-orange-500', glow: 'shadow-[0_0_10px_rgba(249,115,22,0.5)]' },
          { label: 'CSS', bar: CssBar, color: 'bg-cyan-500', glow: 'shadow-[0_0_10px_rgba(6,182,212,0.5)]' },
          { label: 'JavaScript', bar: JsBar, color: 'bg-yellow-500', glow: 'shadow-[0_0_10px_rgba(234,179,8,0.5)]' },
          { label: 'Database', bar: DatabaseBar, color: 'bg-emerald-500', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.5)]' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col gap-2 justify-center">
            <div className="flex justify-between items-end">
              <span className="text-slate-300 font-exo font-bold text-sm">{item.label}</span>
              <span className="text-slate-500 font-mono text-xs">{Math.round(item.bar)}%</span>
            </div>
            <div className="w-full h-2 bg-[#1e1e2e] rounded-sm overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${item.bar}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${item.color} ${item.glow}`} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsOverview;
