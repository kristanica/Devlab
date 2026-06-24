import React from "react";
import { motion } from "framer-motion";

interface SkillArsenalProps {
  progressData: {
    name: string;
    icon: any;
    textGlow?: string;
    value: number;
    color: string;
    glow: string;
  }[];
}

const SkillArsenal: React.FC<SkillArsenalProps> = ({ progressData }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="w-full lg:w-[40%] bg-[#0d0d12] border border-[#2a2a3c] rounded-xl p-6 sm:p-8 flex flex-col justify-center gap-5 shadow-xl"
    >
      <h3 className="text-white font-exo text-xl font-bold tracking-tight mb-2">
        Skill Arsenal
      </h3>
      <div className="flex flex-col gap-4">
        {progressData.map((subj, idx) => (
          <div className="flex items-center gap-4 group" key={subj.name}>
            <div className="w-10 h-10 rounded-lg bg-[#161622] border border-[#2a2a3c] flex items-center justify-center shrink-0 group-hover:border-slate-500 transition-colors">
              <subj.icon className={`w-5 h-5 group-hover:scale-110 transition-transform ${subj.textGlow || 'text-slate-300'}`} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-slate-200 font-medium text-sm">
                  {subj.name}
                </span>
                <span className="text-slate-400 font-mono text-xs">
                  {Math.round(subj.value)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#1e1e2e] rounded-sm overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${subj.value}%` }}
                  transition={{
                    duration: 1,
                    delay: 0.3 + idx * 0.1,
                    ease: "easeOut",
                  }}
                  className={`h-full bg-gradient-to-r ${subj.color}`}
                  style={{ boxShadow: `0 0 10px ${subj.glow}` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SkillArsenal;
