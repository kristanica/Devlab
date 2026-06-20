import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteProgress } from "../Functions/useDeleteProgress";
import { useDeleteSpecificAchievement } from "../Functions/useDeleteSpecificAchievement";
import DeleteConfirmationModal from "../Modals/DeleteConfirmModal";
import useFetchLevelsData from "../../../components/BackEnd_Data/useFetchLevelsData";

const categories = ["Html", "Css", "JavaScript", "Database"];

const EditUserModal = ({ visibility, closeModal, uid }) => {
  const queryClient = useQueryClient();
  const deleteProgress = useDeleteProgress();
  const deleteSpecificAchievement = useDeleteSpecificAchievement();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const users = queryClient.getQueryData(["allUser"]) || [];
  const userInfo = useMemo(() => users.find((u) => u.id === uid), [users, uid]);

  const [activeTab, setActiveTab] = useState("info");
  const [state, setState] = useState({
    username: "",
    bio: "",
    coins: 0,
    exp: 0,
    userLevel: 0,
  });

  useEffect(() => {
    if (!userInfo) return;
    setState({
      username: userInfo.username || "",
      bio: userInfo.bio || "",
      coins: userInfo.coins || 0,
      exp: userInfo.exp || 0,
      userLevel: userInfo.userLevel || 0,
    });
  }, [userInfo]);

  if (!userInfo) return null;
  const achievements = userInfo.achievements || {};

  // Fetch levels data per category
  const levelsQueries = categories.reduce((acc, category) => {
    acc[category] = useFetchLevelsData(category);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {visibility && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              transition={{ duration: 0.25 }}
              className="relative bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 text-white w-[90%] max-w-2xl rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                  {userInfo.username}'s Profile
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition text-2xl font-semibold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* TABS */}
              <div className="flex justify-around mb-6 border-b border-gray-700">
                {["info", "progress", "achievements"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-4 font-semibold text-sm transition relative ${
                      activeTab === tab
                        ? "text-cyan-400"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {tab === "info"
                      ? "User Info"
                      : tab === "progress"
                      ? "Progress"
                      : "Achievements"}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* CONTENT AREA */}
              <div className="relative h-[400px] overflow-y-auto scrollbar-custom px-1">
                <AnimatePresence mode="wait">
                  {/* INFO TAB */}
{activeTab === "info" && (
  <motion.div
    key="info"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
    className="space-y-4 p-5"
  >
    <h3 className="text-lg font-semibold text-cyan-400 mb-2 border-b border-gray-700 pb-2">
      User Information
    </h3>

    {["username", "bio", "coins", "exp", "userLevel"].map((field) => (
      <div key={field}>
        <label className="text-xs text-gray-400 uppercase">
          {field}
        </label>
        <div className="w-full p-2.5 rounded-lg bg-gray-800 text-white border border-gray-700">
          {state[field] !== "" && state[field] !== null
            ? state[field]
            : "N/A"}
        </div>
      </div>
    ))}
  </motion.div>
)}
                  {/* PROGRESS TAB */}
                  {activeTab === "progress" && (
                    <motion.div
                      key="progress"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="p-5"
                    >
                      <h3 className="text-lg font-semibold text-blue-400 mb-2 border-b border-gray-700">
                        Level Progress
                      </h3>
                      <div className="space-y-4">
                        {categories.map((category) => {
                          const { levelsData, isLoading } = levelsQueries[category];
                          const totalLevels = !isLoading
                            ? levelsData.reduce((acc, lesson) => acc + (lesson.levels?.length || 0), 0)
                            : 100;

                          const completed = userInfo.levelCount[category] || 0;
                          const percent = Math.min((completed / totalLevels) * 100, 100);

                          return (
                            <div
                              key={category}
                              className="bg-gray-800/70 rounded-lg p-4 border border-gray-700"
                            >
                              <div className="flex justify-between mb-2">
                                <p className="capitalize font-medium">{category}</p>
                                <p className="text-sm text-gray-400">
                                  {completed}/{totalLevels}
                                </p>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                <motion.div
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-3"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percent}%` }}
                                  transition={{ duration: 0.6, ease: "easeOut" }}
                                />
                              </div>
                              <button
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "progress",
                                    category,
                                    message: `Are you sure you want to reset ${category} progress?`,
                                  })
                                }
                                className="mt-2 text-xs text-red-400 hover:text-red-300 underline transition cursor-pointer"
                              >
                                Reset {category} Progress
                              </button>
                            </div>
                          );
                        })}
                      </div>

                    </motion.div>
                  )}

                  {/* ACHIEVEMENTS TAB */}
                  {activeTab === "achievements" && (
                    <motion.div
                      key="achievements"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-x-hidden p-5 "
                    >
                      <h3 className="text-lg font-semibold text-yellow-400 mb-3 border-b border-gray-700 pb-2">
                        Achievements
                      </h3>

                      {Object.keys(achievements).length > 0 ? (
                        <div className="space-y-4">
                          {Object.entries(achievements).map(([category, { quantity }]) => {
                            const maxAchievement = 10;
                            const percent = Math.min((quantity / maxAchievement) * 100, 100);

                            return (
                              <div
                                key={category}
                                className="bg-gray-800/70 rounded-lg p-4 border border-gray-700"
                              >
                                <div className="flex justify-between mb-2">
                                  <p className="capitalize font-medium text-gray-200">
                                    {category}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {quantity}/{maxAchievement}
                                  </p>
                                </div>

                                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                  <motion.div
                                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                  />
                                </div>

                                <button
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "achievement",
                                      category,
                                      message: `Are you sure you want to reset ${category} achievement?`,
                                    })
                                  }
                                  className="mt-2 text-xs text-red-400 hover:text-red-300 underline transition cursor-pointer"
                                >
                                  Reset {category} Achievement
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm mt-2">
                          No achievements yet.
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>

          {/* Confirm Delete Modal */}
          <DeleteConfirmationModal
            isOpen={!!deleteTarget}
            message={deleteTarget?.message}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={() => {
              if (!deleteTarget) return;
if (deleteTarget.type === "progress") {
  deleteProgress.mutate({ uid, subject: deleteTarget.category });
} else if (deleteTarget.type === "achievement") {
  deleteSpecificAchievement.mutate({
    uid,
    category: deleteTarget.category,
  });
}
              setDeleteTarget(null);
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default EditUserModal;
