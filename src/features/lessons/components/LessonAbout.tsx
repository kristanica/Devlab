import React from "react";
import { lessonConfig } from "./lessonConfig";
import { IoCheckmarkCircle } from "react-icons/io5";

interface LessonAboutProps {
  subject: string;
}

const LessonAbout: React.FC<LessonAboutProps> = ({ subject }) => {
  const config = lessonConfig[subject];
  const Icon = config.icon;

  return (
    <div className="w-full lg:w-[35%] flex flex-col gap-4">
      <h2 className="text-white font-exo text-2xl font-bold tracking-tight px-1">About {subject}</h2>
      
      <div className="bg-[#0d0d12] border border-[#2a2a3c] rounded-xl p-6 flex flex-col gap-4 sticky top-4">
        <div className={`w-12 h-12 rounded-lg border flex items-center justify-center mb-2 ${config.theme.badge}`}>
          <Icon size={28} className={config.theme.text} />
        </div>
        <h3 className="font-exo text-xl font-bold text-white">{config.about.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          {config.about.description}
        </p>
        <div className="mt-4 pt-4 border-t border-[#2a2a3c] flex flex-col gap-3">
          {config.about.checks.map((check: string, idx: number) => (
            <div key={idx} className="flex items-center gap-3 text-sm text-slate-300">
              <IoCheckmarkCircle className={config.theme.text} size={18} /> {check}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LessonAbout;
