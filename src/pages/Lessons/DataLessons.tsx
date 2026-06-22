import React, { useState } from "react";
import { lessonConfig } from "../../components/Lessons/LessonConfig";
import LessonHeader from "../../components/Lessons/LessonHeader";
import LessonAbout from "../../components/Lessons/LessonAbout";
import LessonCurriculum from "../../components/Lessons/LessonCurriculum";
import LessonLockedModal from "../../components/Lessons/LessonLockedModal";

import useFetchUserProgress from '@/services/api/useFetchUserProgress';
import useFetchLevelsData from '@/services/api/useFetchLevelsData';

const DataLessons: React.FC = () => {
  const subject = "Database";
  const { levelsData, isLoading } = useFetchLevelsData(subject);
  const {
    userProgress,
    userStageCompleted,
    isLoading: progressLoading,
  } = useFetchUserProgress(subject);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const config = lessonConfig[subject];

  return (
    <div className={`w-full h-full p-4 lg:p-8 flex flex-col gap-6 lg:gap-8 bg-[#06060a] min-h-screen text-slate-200 ${config.theme.selection} font-inter overflow-y-auto overflow-x-hidden`}>
      <LessonHeader subject={subject} />
      
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 pb-10 min-h-0">
        <LessonCurriculum 
          subject={subject}
          levelsData={levelsData}
          isLoading={isLoading}
          userProgress={userProgress}
          userStageCompleted={userStageCompleted}
          progressLoading={progressLoading}
          setShowLockedModal={setShowLockedModal}
        />
        <LessonAbout subject={subject} />
      </div>

      {showLockedModal && (
        <LessonLockedModal subject={subject} onClose={() => setShowLockedModal(false)} />
      )}
    </div>
  );
};

export default DataLessons;
