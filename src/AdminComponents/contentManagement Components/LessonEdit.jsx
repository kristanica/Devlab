// Firestore
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "../../Firebase/Firebase";
// Utils
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useEditStage from "./Edit_Forms/useEditStage";
import axios from "axios";
import { useDeleteStage } from "./BackEndFuntions/useDeleteStage";
// GameMode Forms
import CodeRushForm from "./Edit_Forms/CodeRushForm";
import CodeCrafterForm from "./Edit_Forms/CodeCrafterForm";
import BugBustForm from "./Edit_Forms/BugbustForm";
import BrainBytesForm from "./Edit_Forms/BrainBytesForm";
import LessonForm from "./Edit_Forms/LessonForm";
// Lottie
import Lottie from "lottie-react";
import LoadingAnim from "../../assets/Lottie/LoadingDots.json";

function LessonEdit({ subject, lessonId, levelId, stageId, setShowForm }) {
  const gameModes = [
    "Lesson",
    "BugBust",
    "CodeRush",
    "CodeCrafter",
    "BrainBytes",
  ];
  const { state, dispatch } = useEditStage();

  const [stageData, setStageData] = useState(null);
  const [activeTab, setActiveTab] = useState("Lesson");
  const [loading, setLoading] = useState(true);
  const [videoFile, setVideoFile] = useState(null);

  const [replicateFile, setReplicateFile] = useState(""); // new
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (stageData?.replicationFile) {
      setReplicateFile(stageData.replicationFile);
    }
  }, [stageData]);

  // Fetch stage
  useEffect(() => {
    fetchStage();
  }, [subject, lessonId, levelId, stageId]);
  useEffect(() => {
    if (stageData?.type) {
      setActiveTab(stageData.type);
      dispatch({ type: "UPDATE_FIELD", field: "type", value: stageData.type });
    }
  }, [stageData]);

  const deleteStageMutation = useDeleteStage(subject, lessonId, levelId);

  const fetchStage = async () => {
    try {
      setLoading(true);
      const stageRef = doc(
        db,
        subject,
        lessonId,
        "Levels",
        levelId,
        "Stages",
        stageId
      );
      const stageSnap = await getDoc(stageRef);
      if (stageSnap.exists()) {
        setStageData(stageSnap.data());
      } else {
        setStageData(null);
      }
    } catch (error) {
      console.error("Failed to fetch stage:", error);
      toast.error("Failed to load stage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch({
      type: "UPDATE_ALL_FIELDS",
      payload: {
        title: stageData?.title || "",
        description: stageData?.description || "",
        isHidden: stageData?.isHidden ?? activeTab !== "Lesson",
        type: stageData?.type || "",
        instruction: stageData?.instruction || "",
        codingInterface: stageData?.codingInterface || {
          html: "",
          css: "",
          js: "",
          sql: "",
        },
        timer: stageData?.timer || "",
        choices: stageData?.choices || [],
        blocks: stageData?.blocks || [],
        copyCode: stageData?.copyCode || "",
      },
    });
  }, [stageData, activeTab]);

  // Filter function for game mode
  const filterStateByGameMode = (state, activeTab) => {
    const common = {
      title: state.title,
      description: state.description,
      isHidden: state.isHidden,
      type: activeTab,
      instruction: state.instruction,
      codingInterface: state.codingInterface,
    };

    switch (activeTab) {
      case "Lesson":
        return { ...common, blocks: state.blocks };
      case "BugBust":
        return { ...common };
      case "CodeRush":
        return { ...common, timer: state.timer };
      case "BrainBytes":
        return { ...common, choices: state.choices };
      case "CodeCrafter":
        return { ...common, copyCode: state.copyCode };
      default:
        return common;
    }
  };
  const visibleEditors = {
    Html: ["html"],
    Css: ["html", "css"],
    JavaScript: ["html", "css", "js"],
    Database: ["sql"],
  };

  // Save handler
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const token = await auth.currentUser.getIdToken(true);
      const hasImages = state.blocks?.some(
        (block) => block.type === "Image" && block.value instanceof File
      );
      let response;
      // Automatically set isHidden
      const updatedState = {
        ...state,
        isHidden: activeTab === "Lesson" ? false : true,
      };
      if (!hasImages) {
        // JSON save
        const allowedFields = visibleEditors[subject] || [];

        const cleanedCodingInterface = Object.fromEntries(
          Object.entries(updatedState.codingInterface || {}).filter(
            ([key, val]) => allowedFields.includes(key) && val.trim() !== ""
          )
        );
        updatedState.codingInterface = cleanedCodingInterface;
        const filteredState = filterStateByGameMode(updatedState, activeTab);
        response = await axios.post(
          `
https://devlab-server-railway-master-production.up.railway.app/fireBaseAdmin/editStage`,
          {
            category: subject,
            lessonId,
            levelId,
            stageId,
            state: filteredState,
            stageType: state?.type || activeTab,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // FormData save
        const formData = new FormData();
        formData.append("category", subject);
        formData.append("lessonId", lessonId);
        formData.append("levelId", levelId);
        formData.append("stageId", stageId);
        formData.append("stageType", state?.type || activeTab);

        const processedBlocks = state.blocks.map((block, index) => {
          if (block.type === "Image" && block.value instanceof File) {
            const fileType = block.value.type.split("/")[1] || "png";
            const fieldName = `image_${block.id || index + 1}`;
            formData.append(
              fieldName,
              block.value,
              `image_${block.id || index + 1}.${fileType}`
            );
            return { ...block, value: fieldName };
          }
          return block;
        });

        const filteredState = filterStateByGameMode(
          { ...updatedState, blocks: processedBlocks },
          activeTab
        );
        formData.append("state", JSON.stringify(filteredState));

        response = await axios.post(
          `
https://devlab-server-railway-master-production.up.railway.app/fireBaseAdmin/editStage`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      toast.success("Stage updated successfully!", {
        position: "top-center",
        theme: "colored",
      });
      await fetchStage();
    } catch (error) {
      console.error("Failed to save stage:", error);
      toast.error("Failed to save stage.");
    }
  };

  return (
    <div className="bg-[#25293B] rounded-2xl p-4 sm:p-6 relative min-h-[400px] flex items-center justify-center ">
      {/* Close Button */}
      <button
        onClick={() => setShowForm(false)}
        className="absolute top-3 right-3 text-white text-2xl bg-[#ff4d4d] hover:bg-[#e04444] 
          w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-md cursor-pointer"
      >
        ✕
      </button>

      {/*  Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3">
          <Lottie
            animationData={LoadingAnim}
            loop={true}
            className="w-24 h-24"
          />
          <p className="text-white font-exo text-sm">Loading stage data...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full">
          <div>
            <h1 className="font-exo text-white text-xl sm:text-2xl font-bold">
              Select Stage Type
            </h1>

            <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-between gap-3 mt-5 mb-5">
              {gameModes.map((gm) => {
                const isLocked = stageId === "Stage1"; // only Lesson allowed

                return (
                  <button
                    key={gm}
                    disabled={isLocked && gm !== "Lesson"}
                    className={`font-exo text-white text-xs sm:text-sm font-bold cursor-pointer
        px-3 py-2 rounded-3xl min-w-[28%] sm:min-w-[18%]
        transition-all duration-500 
        ${
          activeTab === gm
            ? "bg-[#563f99] scale-105"
            : isLocked && gm !== "Lesson"
            ? "bg-gray-500 opacity-60 cursor-not-allowed"
            : "bg-[#7F5AF0] hover:scale-110"
        }`}
                    onClick={() => {
                      if (isLocked && gm !== "Lesson") return; // block mode change
                      setActiveTab(gm);
                      dispatch({
                        type: "UPDATE_FIELD",
                        field: "type",
                        value: gm,
                      });
                    }}
                  >
                    {gm}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Forms */}
          <form className="flex flex-col gap-6 p-4 sm:p-6 rounded-xl bg-[#1b1f2f] shadow-md">
            {activeTab === "Lesson" && (
              <LessonForm
                state={state}
                dispatch={dispatch}
                stageData={stageData}
                subject={subject}
                lessonId={lessonId}
                levelId={levelId}
                stageId={stageId}
                videoFile={videoFile}
                setVideoFile={setVideoFile}
              />
            )}
            {activeTab === "BugBust" && (
              <BugBustForm
                state={state}
                dispatch={dispatch}
                stageData={stageData}
                subject={subject}
              />
            )}
            {activeTab === "CodeRush" && (
              <CodeRushForm
                state={state}
                dispatch={dispatch}
                stageData={stageData}
                subject={subject}
              />
            )}
            {activeTab === "CodeCrafter" && (
              <CodeCrafterForm
                state={state}
                dispatch={dispatch}
                stageData={stageData}
                subject={subject}
                lessonId={lessonId}
                levelId={levelId}
                stageId={stageId}
                file={file}
                setFile={setFile}
                replicateFile={replicateFile}
                setReplicateFile={setReplicateFile}
              />
            )}
            {activeTab === "BrainBytes" && (
              <BrainBytesForm
                state={state}
                dispatch={dispatch}
                stageData={stageData}
                activeTab={activeTab}
              />
            )}

            {/* Buttons */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                disabled={stageId === "Stage1"}
                onClick={() => {
                  if (stageId === "Stage1") return; // extra safety
                  deleteStageMutation.mutate(stageId, {
                    onSuccess: () => setShowForm(false),
                  });
                }}
                className={`font-exo font-bold text-white text-sm cursor-pointer
    w-[40%] sm:w-[30%] py-2 rounded-3xl transition duration-300 ease-in-out
    ${
      stageId === "Stage1"
        ? "bg-gray-500 opacity-60 cursor-not-allowed"
        : "bg-[#E35460] hover:scale-105 hover:drop-shadow-[0_0_6px_rgba(255,99,71,0.8)]"
    }`}
              >
                {stageId === "Stage1"
                  ? "Locked"
                  : deleteStageMutation.isLoading
                  ? "Deleting..."
                  : "Delete"}
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="font-exo font-bold text-white text-sm cursor-pointer
                  w-[40%] sm:w-[30%] py-2 rounded-3xl bg-[#5FDC70] 
                  hover:scale-105 hover:drop-shadow-[0_0_6px_rgba(95,220,112,0.8)]
                  transition duration-300 ease-in-out"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default LessonEdit;
