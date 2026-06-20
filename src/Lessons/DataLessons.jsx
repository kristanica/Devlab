import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

// Assets
import DataImage from "../assets/Images/Database-Icon-Big.png";
import Animation from "../assets/Lottie/LoadingLessonsLottie.json";
import LockAnimation from "../assets/Lottie/LockItem.json";
import dbIcon from "../assets/navbarIcons/database.png"

// UI
import Lottie from "lottie-react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock } from "react-icons/fa";

// Components
import useFetchLevelsData from "../components/BackEnd_Data/useFetchLevelsData";
import useFetchUserProgress from "../components/BackEnd_Data/useFetchUserProgress";
import useSubjProgressBar from "../components/Custom Hooks/useSubjProgressBar";

function DataLessons() {
  const { levelsData, isLoading } = useFetchLevelsData("Database");
  const { userProgress, userStageCompleted, isLoading: progressLoading } =
    useFetchUserProgress("Database");
  const { animatedBar } = useSubjProgressBar("Database");

  const navigate = useNavigate();
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [expandedLevel, setExpandedLevel] = useState(null);

  return (
    <div className="h-full flex flex-col gap-3">
        {/* Upper Panel */}
        <div className="flex flex-col h-auto lg:flex-row lg:h-[40%] rounded-3xl p-5 bg-gradient-to-r from-[#4CAF50] to-[#124B15] gap-4">
          {/* Text Content */}
          <div className="w-full lg:w-3/4 flex flex-col justify-center gap-4">
            <h1 className="font-exo text-white text-[2rem] md:text-[2.8rem] lg:text-[3rem] font-bold text-shadow-lg  text-shadow-black bigText-laptop">
              {"||||"} Database: The Vault of Digital Knowledge
            </h1>
            <p className="text-white textSmall-laptop font-exo text-sm md:text-base lg:text-lg leading-relaxed text-shadow-sm text-shadow-black">
Enter the fortress of data, where every piece of information is carefully guarded and stored! As a Database Guardian, you'll master the art of organizing and retrieving data with precision. Harness the power of SQL to query vast treasures of information and keep your vault secure.
            </p>
          </div>

          {/* Image */}
          <div className="w-full lg:w-1/4 flex justify-center items-center">
            <img
              src={DataImage}
              alt=""
              className="lg:w-[55%] md:w-[25%] h-[60%] object-contain"
            />
          </div>
        </div>

      {/* Lower Panel */}
      <div className="flex flex-col lg:flex-row h-[60%] gap-4 p-3">
        {/* Left Panel - Lessons */}
        {isLoading || progressLoading ? (
          <Lottie
            animationData={Animation}
            loop
            className="w-full lg:w-3/5 h-[300px] lg:h-full mx-auto"
          />
        ) : (
          <div className="w-full lg:w-3/5 p-2 h-[400px] lg:h-full overflow-auto scrollbar-custom flex flex-col gap-4">
            {levelsData.map((lesson) => (
              <div key={lesson.id} className="flex flex-col gap-4">
                <h2 className="font-exo text-[2rem] md:text-[3rem] font-bold text-white">
                  Lesson {lesson.Lesson}
                </h2>
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.3 } },
                  }}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col overflow-y-hidden"
                >
                  {lesson.levels.map((level) => {
                    const progress = userProgress[`${lesson.id}-${level.id}`] || {};
                    const isUnlocked = progress.isActive;
                    const isExpanded = expandedLevel === `${lesson.id}-${level.id}`;
                    const toggleLevel = (lessonId, levelId) => {
                      const key = `${lessonId}-${levelId}`;
                      setExpandedLevel(prev => (prev === key ? null : key));
                    };

                    return (
                      <motion.div key={`${lesson.id}-${level.id}`} className="flex flex-col p-3 overflow-y-hidden">
                        {/* Level Card */}
                        <motion.div
                          variants={{
                            hidden: { opacity: 0, y: 100 },
                            show: { opacity: isUnlocked ? 1 : 0.4, y: 0 },
                          }}
                          whileHover={{ scale: 1.02 }}
                          className={`group w-full border flex flex-col sm:flex-row gap-3 sm:gap-5 rounded-4xl h-auto sm:h-[120px] relative ${
                            isUnlocked ? "bg-[#111827]" : "bg-[#060505]"
                          } cursor-pointer`}
                          onClick={() => {
                            if (!isUnlocked) setShowLockedModal(true);
                            else toggleLevel(lesson.id, level.id);
                          }}
                        >
                          {!isUnlocked && (
                            <div className="absolute inset-0 flex items-center justify-center text-white z-10">
                              <FaLock className="text-3xl sm:text-[3rem]" />
                            </div>
                          )}
                          <div className="bg-black text-white min-w-[60px] sm:min-w-[20%] h-[60px] sm:h-full flex justify-center items-center rounded-4xl font-bold text-xl sm:text-3xl">
                            <img src={dbIcon} alt={"Database Icon"} className="w-10 h-10" />
                          </div>
                          <div className="flex flex-col justify-center gap-1 text-white font-exo flex-1 p-4 lg:p-0">
                            <p className="text-base sm:text-[1.2rem]">{level.title}</p>
                            <p className="text-xs sm:text-[0.7rem] line-clamp-3 text-gray-400">{level.description}</p>
                          </div>
                        </motion.div>

                        {/* Stages Dropdown */}
                        <AnimatePresence>
{isExpanded && (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.2, staggerChildren: 0.1 }}
    className="p-3 bg-gray-900 rounded-2xl"
  >
    <motion.div
      className="flex flex-col gap-2"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.1 },
        },
      }}
    >
      {level.stages
        ?.filter((stage) => {
          // Always show Lesson
          if (stage.type === "Lesson") return true;
          // For other types, show only if completed
          const isStageCompleted =
            userStageCompleted[`${lesson.id}-${level.id}-${stage.id}`];
          return isStageCompleted;
        })
        .sort((a, b) => a.order - b.order)
        .map((stage) => {
          const isStageUnlocked =
            userStageCompleted[`${lesson.id}-${level.id}-${stage.id}`];
          return (
            <motion.div
              key={stage.id}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`p-2 sm:p-3 rounded-xl text-white cursor-pointer relative transition-all min-h-[100px] ${
                isStageUnlocked
                  ? "bg-[#1E1E2E] hover:bg-[#4CAF50]/80"
                  : "bg-gray-800 opacity-50"
              }`}
              onClick={() => {
                if (isStageUnlocked) {
                  navigate(
                    `/Main/Lessons/Database/${lesson.id}/${level.id}/${stage.id}/${stage.type}`
                  );
                }
              }}
            >
              {/* Title */}
              <p
                className={`font-exo ${
                  stage.type !== "Lesson" ? "text-red-400" : "text-white"
                }`}
              >
                {stage.title}
              </p>

              {/* Description */}
              <p className="text-gray-400 text-xs sm:text-sm line-clamp-3">
                {stage.description}
              </p>

              {/* Lock Overlay */}
              {!isStageUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaLock className="text-2xl sm:text-3xl text-white" />
                </div>
              )}
            </motion.div>
          );
        })}

      {/* Fallback if no Lesson stages */}
      {level.stages?.filter((stage) => stage.type === "Lesson").length === 0 && (
        <p className="text-gray-400 italic text-sm">No Lesson stages found.</p>
      )}
    </motion.div>
  </motion.div>
)}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            ))}
          </div>
        )}

        {/* Right Panel - About */}
        <div className="w-full lg:w-2/5 flex flex-col gap-4 p-3 lg:p-5">
          <h2 className="text-[1.8rem] md:text-[2.5rem] font-exo font-bold text-white text-shadow-sm text-shadow-black">
            About <span className="text-[#4CAF50]">Database</span>
          </h2>
          <p className="text-white text-sm md:text-base textSmall-laptop">
            Venture into the depths of data storage and mastery! As a Database Guardian, you’ll learn to organize and retrieve vast amounts of information efficiently. Harness the power of SQL to access and manipulate data securely, unlocking the secrets of database querying.
          </p>
        </div>
      </div>

      {/* Locked Modal */}
      {showLockedModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
          <div className="bg-[#1E1E2E] text-white p-6 md:p-8 rounded-2xl w-[90%] max-w-md text-center shadow-lg border border-gray-600 flex flex-col items-center">
            <Lottie animationData={LockAnimation} className="w-1/2 h-1/2" />
            <h2 className="text-2xl font-bold mb-2">Level Locked</h2>
            <p className="mb-4 text-sm md:text-base">
              You must complete the previous levels to unlock this stage.
            </p>
            <button
              className="bg-[#7F5AF0] px-6 py-2 rounded-2xl text-white font-bold hover:bg-[#6A4CD4] transition w-full cursor-pointer"
              onClick={() => setShowLockedModal(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataLessons;
