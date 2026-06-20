import React from "react";
import { motion } from "framer-motion";
import { lessonConfig } from "./LessonConfig";

interface LessonHeaderProps {
  subject: string;
}

const LessonHeader: React.FC<LessonHeaderProps> = ({ subject }) => {
  const config = lessonConfig[subject];
  const Icon = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 shrink-0 w-full rounded-xl overflow-hidden border border-[#2a2a3c] bg-[#0d0d12]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-6 lg:p-10 flex flex-col lg:flex-row gap-6 lg:gap-10 items-center justify-between"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${config.theme.bgGradient} via-transparent to-transparent pointer-events-none`} />
      
      <div className="relative z-10 w-full lg:w-3/4 flex flex-col gap-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-widest w-max ${config.theme.badge}`}>
          {config.header.badge}
        </div>
        <h1 className="font-exo text-white text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          {config.header.title}
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-3xl">
          {config.header.description}
        </p>
      </div>

      <div className={`relative z-10 w-32 h-32 lg:w-48 lg:h-48 shrink-0 ${config.theme.dropShadow}`}>
        <Icon className={`w-full h-full ${config.theme.text}`} />
      </div>
    </motion.div>
  );
};

export default LessonHeader;
