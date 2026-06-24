import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiArrowDownTray } from "react-icons/hi2";
import { GoPlus, GoTrash, GoKebabHorizontal } from "react-icons/go";
import Animation from "@/assets/Lottie/LoadingLessonsLottie.json";
import Lottie from "lottie-react";
import { useIsMutating } from "@tanstack/react-query";
import Loading from "@/assets/Lottie/LoadingDots.json";

import useFetchLevelsData from '@/services/api/useFetchLevelsData';
import AddContent from "./contentManagement/AddContent";
import LessonEdit from "./contentManagement/LessonEdit";
import LevelEdit from "./contentManagement/LevelEdit";

import { useDeleteLevel } from "../hooks/useDeleteLevel";
import { useAddStage } from "../hooks/useAddStage";
import { useAddLevel } from "../hooks/useAddLevel";

import NewLevelForm from "./contentManagement/AddNewLevelForm";
import AddNewStage from "./contentManagement/AddNewStage";
import { SubjectLesson, Level, Stage } from "../types";

function ContentManagement(): React.ReactElement {
  const isMutating = useIsMutating();
  const [activeTab, setActiveTab] = useState<string>("Html");
  const { levelsData = [], isLoading } = useFetchLevelsData(activeTab) as {
    levelsData: SubjectLesson[];
    isLoading: boolean;
  };
  const subjects: string[] = ["Html", "Css", "JavaScript", "Database"];
  const addLevelMutation = useAddLevel(activeTab);

  const [showNewLevelForm, setShowNewLevelForm] = useState<boolean>(false);
  const [createLevelLessonId, setCreateLevelLessonId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [showAddStageForm, setShowAddStageForm] = useState<boolean>(false);

  const [stageId, setStageId] = useState<string | null>(null);
  const [levelId, setLevelId] = useState<string | number | null>(null);
  const [lessonId, setLessonId] = useState<string | number | null>(null);
  const [popupVisible, setPopupVisible] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [levelStages, setLevelStages] = useState<Record<string, Stage[]>>({});
  const [selectedLevelData, setSelectedLevelData] = useState<Level | null>(null);

  const deleteLevelMutation = useDeleteLevel(activeTab);
  const addStageMutation = useAddStage(activeTab);

  useEffect(() => {
    if (levelsData && Array.isArray(levelsData)) {
      const formatted: Record<string, Stage[]> = {};
      levelsData.forEach((lesson) => {
        if (lesson.levels && Array.isArray(lesson.levels)) {
          lesson.levels.forEach((level) => {
            const uniqueKey = `${lesson.Lesson}_${level.id}`;
            formatted[uniqueKey] = Array.isArray(level.stages)
              ? [...level.stages].sort((a, b) => (a.order || 0) - (b.order || 0))
              : [];
          });
        }
      });
      setLevelStages(formatted);
    } else {
      setLevelStages({});
    }
  }, [levelsData]);

  const openPopup = (): void => {
    setShowPopup(true);
    setTimeout(() => setPopupVisible(true), 20);
  };
  const closePopup = (): void => {
    setPopupVisible(false);
    setTimeout(() => setShowPopup(false), 100);
  };

  const getNextLevelId = (lesson: SubjectLesson): number => {
    if (!lesson.levels || lesson.levels.length === 0) return 1;

    // extract numeric parts of IDs
    const numericIds = lesson.levels
      .map(lvl => {
        const num = parseInt(lvl.id.replace(/\D/g, ""), 10); // remove non-digits
        return isNaN(num) ? 0 : num;
      });

    const lastId = Math.max(...numericIds);
    return lastId + 1;
  };

  const getNextStageId = (level: Level, lessonNumber: number): number => {
    if (!level.stages || level.stages.length === 0) return 1;

    // extract numeric parts of stage IDs
    const numericIds = level.stages.map(stage => {
      const num = parseInt(stage.id.replace(/\D/g, ""), 10);
      return isNaN(num) ? 0 : num;
    });

    const lastId = Math.max(...numericIds);
    return lastId + 1;
  };

  return (
    <div className="h-full overflow-hidden px-4 sm:px-6 lg:px-10">
      {isMutating > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
          <Lottie
            animationData={Loading}
            loop={true}
            className="w-[60%] h-[60%] sm:w-[40%] sm:h-[40%]"
          />
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white h-auto flex flex-col justify-between p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col sm:flex-row text-white font-exo justify-between items-center gap-4 sm:gap-0">
          <h1 className="text-[2.5rem] sm:text-[3.2rem] font-bold text-center sm:text-left bigText-laptop">
            Content Management
          </h1>
          <button
            onClick={openPopup}
            className="cursor-pointer rounded-2xl w-full sm:w-[45%] lg:w-[20%] flex gap-3 sm:gap-5 items-center p-3 justify-center bg-[#4CAF50] font-bold text-white hover:scale-105 transition duration-300 ease-in-out hover:drop-shadow-[0_0_6px_rgba(95,220,112,0.8)]"
          >
            <HiArrowDownTray className="text-2xl" />
            New Activity
          </button>
        </div>

        {/* Subject Tabs */}
        <div className="flex flex-wrap justify-center sm:justify-around gap-3 mt-5">
          {subjects.map((subject) => (
            <button
              key={subject}
              className={`font-exo rounded-2xl px-3 py-2 text-base sm:text-lg w-[45%] sm:w-[22%] font-bold text-white transition duration-500 hover:cursor-pointer ${
                activeTab === subject
                  ? "text-shadow-lg text-shadow-[#6b6bc5]"
                  : "hover:bg-gray-600"
              }`}
              onClick={() => setActiveTab(subject)}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <Lottie
          animationData={Animation}
          loop={true}
          className="w-[80%] sm:w-[60%] h-[50vh] m-auto"
        />
      ) : (
        <div className="h-[43vh] sm:h-[70%] p-4 sm:p-6 overflow-y-auto mt-4 scrollbar-custom">
          {levelsData.map((lesson) => (
            <div key={lesson.id} className="p-3 sm:p-5 flex flex-col gap-8">
              <h2 className="text-white font-exo text-3xl sm:text-5xl text-center sm:text-left bigText-laptop">
                Lesson {lesson.Lesson}
              </h2>

              <div className="flex flex-wrap justify-center gap-5">
                {lesson.levels.map((level) => (
                  <div
                    key={level.id}
                    className="relative border-[#56EBFF] border w-full sm:w-[80%] lg:w-[100%] p-4 flex flex-col gap-4 min-h-[180px] rounded-2xl bg-[#111827] transition-all duration-400"
                  >
                    {/* Level Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                      <h2 className="text-2xl sm:text-3xl font-exo font-bold w-full sm:w-[70%] text-white text-center sm:text-left mediuText-laptop">
                        {level.title}
                      </h2>
                      <div className="flex justify-center sm:justify-end gap-3">
                        <button
                          className="text-white text-2xl hover:cursor-pointer hover:bg-green-500 rounded p-2 border-gray-500 border transition"
                          onClick={() => {
                            setShowEdit(true);
                            setSelectedLevelData(level);
                            setLessonId(`Lesson${lesson.Lesson}`);
                            setLevelId(level.id);
                          }}
                        >
                          <GoKebabHorizontal />
                        </button>

                        <button
                          className="text-white text-2xl hover:cursor-pointer hover:bg-green-500 rounded p-2 border-gray-500 border transition"
                          onClick={() => {
                            setLessonId(`Lesson${lesson.Lesson}`);
                            setLevelId(level.id);

                            // get next stage ID
                            const nextStageId = getNextStageId(level, lesson.Lesson);
                            setStageId(`Stage${nextStageId}`);

                            setShowAddStageForm(true);
                          }}
                        >
                          <GoPlus />
                        </button>

                        <button
                          className="text-white text-2xl hover:cursor-pointer hover:bg-red-600 rounded p-2 border-gray-500 border transition"
                          onClick={() =>
                            deleteLevelMutation.mutate({
                              category: activeTab,
                              lessonId: `Lesson${lesson.Lesson}`,
                              levelId: level.id,
                            })
                          }
                        >
                          <GoTrash />
                        </button>
                      </div>
                    </div>

                    {/* Stage List */}
                    <div className="flex flex-wrap gap-3 mt-3">
                      <div className="border flex flex-wrap p-2 rounded-lg border-gray-500 gap-3 w-full justify-center">
                        {(() => {
                          const uniqueKey = `${lesson.Lesson}_${level.id}`;
                          const stages = levelStages[uniqueKey] || [];
                          return stages.length === 0 ? (
                            <p className="text-white font-exo text-lg">
                              No stages yet
                            </p>
                          ) : (
                            stages.map((stage) => (
                              <div
                                key={stage.id}
                                onClick={() => {
                                  setStageId(stage.id);
                                  setLessonId(lesson.Lesson);
                                  setLevelId(level.id);
                                  setShowForm(true);
                                }}
                                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white font-exo cursor-pointer hover:bg-gray-700 transition"
                              >
                                {stage.id}
                              </div>
                            ))
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}

                {/*  ADD NEW LEVEL BUTTON */}
                <button
                  onClick={() => {
                    setCreateLevelLessonId(`Lesson${lesson.Lesson}`);
                    const nextLevelId = getNextLevelId(lesson); // get next level ID
                    setLevelId(nextLevelId); // pass next level ID to form
                    setShowNewLevelForm(true);
                  }}
                  className="border-2 border-green-500 text-green-400 font-exo px-6 py-4 rounded-xl text-lg hover:bg-green-600 hover:text-white transition-all duration-300 w-full cursor-pointer"
                >
                  + Add Level
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/*For Adding a Lesson*/}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 flex bg-black/80 backdrop-blur-md items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-[90%] sm:w-[60%] lg:w-[40%]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <AddContent
                subject={activeTab}
                close={closePopup}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*EDITTING A STAGE*/}
      <AnimatePresence>
        {showForm && (
          <div
            className="fixed inset-0 flex bg-black/80 backdrop-blur-md items-center justify-center z-50"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="w-[95%] sm:w-[70%] lg:w-[40%] h-[90%] transition-all overflow-x-hidden rounded-2xl scrollbar-custom"
            >
              {lessonId !== null && levelId !== null && stageId !== null && (
                <LessonEdit
                  subject={activeTab}
                  lessonId={`Lesson${lessonId}`}
                  levelId={String(levelId)}
                  stageId={stageId}
                  setShowForm={setShowForm}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/*FOR EDITING LEVEL*/}
      <AnimatePresence>
        {showEdit && (
          <div
            className="fixed inset-0 flex bg-black/80 backdrop-blur-md items-center justify-center z-50"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="w-[95%] sm:w-[70%] lg:w-[40%] h-[90%] transition-all overflow-x-hidden rounded-2xl scrollbar-custom"
            >
              {lessonId !== null && levelId !== null && (
                <LevelEdit
                  setShowEdit={setShowEdit}
                  category={activeTab}
                  lessonId={String(lessonId)}
                  levelId={String(levelId)}
                  defaultData={selectedLevelData}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/*For Adding a LEVEL*/}
      <AnimatePresence>
        {showNewLevelForm && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-[95%] sm:w-[70%] lg:w-[45%] h-[90%] rounded-2xl overflow-hidden"
            >
              {createLevelLessonId !== null && levelId !== null && (
                <NewLevelForm
                  subject={activeTab}
                  lessonId={createLevelLessonId}
                  levelId={levelId} // pass it here
                  close={() => setShowNewLevelForm(false)}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddStageForm && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-[95%] sm:w-[70%] lg:w-[45%] h-[90%] rounded-2xl overflow-hidden"
            >
              {lessonId !== null && levelId !== null && stageId !== null && (
                <AddNewStage
                  subject={activeTab}
                  lessonId={String(lessonId)}
                  levelId={String(levelId)}
                  stageId={stageId}
                  close={() => setShowAddStageForm(false)}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ContentManagement;
