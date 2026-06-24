import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock } from "react-icons/fa";
import { IoChevronDownOutline, IoPlayOutline } from "react-icons/io5";
import { lessonConfig } from "./lessonConfig";

interface LessonCurriculumProps {
  subject: string;
  levelsData: any;
  isLoading: boolean;
  userProgress: any;
  userStageCompleted: any;
  progressLoading: boolean;
  setShowLockedModal: (v: boolean) => void;
}

const LessonCurriculum: React.FC<LessonCurriculumProps> = ({
  subject,
  levelsData,
  isLoading,
  userProgress,
  userStageCompleted,
  progressLoading,
  setShowLockedModal
}) => {
  const navigate = useNavigate();
  const config = lessonConfig[subject];
  const Icon = config.icon;
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  return (
    <div className="w-full lg:w-[65%] flex flex-col gap-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-white font-exo text-2xl font-bold tracking-tight">Curriculum</h2>
      </div>

      {isLoading || progressLoading ? (
        <div className="flex flex-col gap-8 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="h-6 w-32 bg-[#1e1e2e] rounded animate-pulse" />
              <div className="flex flex-col gap-3">
                {[1, 2].map((j) => (
                  <div key={j} className="h-[5.5rem] w-full bg-[#0d0d12] border border-[#1e1e2e] rounded-xl animate-pulse flex items-center p-4 gap-4">
                    <div className="w-14 h-14 bg-[#1e1e2e] rounded-lg shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-5 w-1/3 bg-[#1e1e2e] rounded" />
                      <div className="h-4 w-2/3 bg-[#161622] rounded" />
                    </div>
                    <div className="hidden sm:block w-8 h-8 rounded-full bg-[#161622] shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {levelsData.map((lesson: any) => (
            <div key={lesson.id} className="flex flex-col gap-4">
              <h3 className={`font-exo text-xl font-bold text-white border-b border-[#2a2a3c] pb-2 ${config.theme.textLight}`}>
                Chapter {lesson.Lesson}
              </h3>
              
              <div className="flex flex-col gap-3">
                {lesson.levels.map((level: any) => {
                  const progress = userProgress[`${lesson.id}-${level.id}`] || {};
                  const isUnlocked = progress.isActive;
                  const isExpanded = expandedLevel === `${lesson.id}-${level.id}`;
                  
                  const toggleLevel = (lessonId: string, levelId: string) => {
                    const key = `${lessonId}-${levelId}`;
                    setExpandedLevel((prev) => (prev === key ? null : key));
                  };

                  return (
                    <div key={`${lesson.id}-${level.id}`} className="flex flex-col gap-2">
                      <div
                        className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer flex flex-col sm:flex-row items-center gap-4 p-4 ${
                          isUnlocked 
                            ? `bg-[#161622] border-[#2a2a3c] ${config.theme.hoverBorder} ${config.theme.hoverShadow}` 
                            : "bg-[#0d0d12] border-[#1e1e2e] opacity-70"
                        }`}
                        onClick={() => {
                          if (!isUnlocked) setShowLockedModal(true);
                          else toggleLevel(lesson.id, level.id);
                        }}
                      >
                        {/* Icon / Lock Box */}
                        <div className={`w-14 h-14 shrink-0 rounded-lg flex items-center justify-center border transition-colors ${
                          isUnlocked 
                            ? `bg-[#0d0d12] border-[#2a2a3c] ${config.theme.text} ${config.theme.hoverBorderSubtle}` 
                            : "bg-[#161622] border-[#1e1e2e] text-slate-600"
                        }`}>
                          {isUnlocked ? <Icon size={32} /> : <FaLock size={24} />}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <h4 className={`font-exo text-lg font-bold tracking-tight truncate ${isUnlocked ? "text-white" : "text-slate-400"}`}>
                            {level.title}
                          </h4>
                          <p className="text-slate-400 text-sm line-clamp-2 mt-0.5">
                            {level.description}
                          </p>
                        </div>
                        
                        {/* Chevron */}
                        {isUnlocked && (
                          <div className="hidden sm:flex w-8 h-8 rounded-full bg-[#0d0d12] items-center justify-center text-slate-400 border border-[#2a2a3c]">
                            <IoChevronDownOutline size={18} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        )}
                      </div>

                      {/* Stages Dropdown */}
                      <AnimatePresence>
                        {isExpanded && isUnlocked && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pl-6 sm:pl-[4.5rem] pr-2 py-2 flex flex-col gap-2 relative">
                              {/* Connector Line */}
                              <div className="absolute left-9 sm:left-[2.25rem] top-0 bottom-4 w-px bg-[#2a2a3c]" />

                              {level.stages
                                ?.filter((stage: any) => stage.type === "Lesson" || userStageCompleted[`${lesson.id}-${level.id}-${stage.id}`])
                                .sort((a: any, b: any) => a.order - b.order)
                                .map((stage: any) => {
                                  const isStageUnlocked = userStageCompleted[`${lesson.id}-${level.id}-${stage.id}`];
                                  const isBoss = stage.type !== "Lesson";
                                  
                                  return (
                                    <div
                                      key={stage.id}
                                      className={`relative p-3 sm:p-4 rounded-lg border transition-all cursor-pointer flex items-center gap-4 ${
                                        isStageUnlocked
                                          ? "bg-[#161622] border-[#2a2a3c] hover:bg-[#1e1e2e]"
                                          : "bg-[#0d0d12] border-[#1e1e2e] opacity-60"
                                      }`}
                                      onClick={() => {
                                        if (isStageUnlocked) {
                                          navigate(`/Main/Lessons/${subject}/${lesson.id}/${level.id}/${stage.id}/${stage.type}`);
                                        }
                                      }}
                                    >
                                      <div className={`w-3 h-3 rounded-full absolute -left-[1.35rem] sm:-left-[2.6rem] border-4 border-[#06060a] ${
                                        isStageUnlocked ? `${config.theme.bg} ${config.theme.shadow}` : "bg-[#2a2a3c]"
                                      }`} />
                                      
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          {isBoss && <span className="text-red-400 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">Challenge</span>}
                                          <p className={`font-exo font-bold ${isStageUnlocked ? "text-slate-200" : "text-slate-500"}`}>
                                            {stage.title}
                                          </p>
                                        </div>
                                        <p className="text-slate-400 text-xs sm:text-sm line-clamp-2">
                                          {stage.description}
                                        </p>
                                      </div>

                                      <div className="shrink-0 text-slate-500">
                                        {!isStageUnlocked ? <FaLock size={16} /> : <IoPlayOutline size={20} className={`${config.theme.textLight} transition-colors`} />}
                                      </div>
                                    </div>
                                  );
                                })}

                              {level.stages?.filter((stage: any) => stage.type === "Lesson").length === 0 && (
                                <p className="text-slate-500 italic text-sm ml-4">No Lesson stages found.</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonCurriculum;
