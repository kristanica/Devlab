import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { auth } from "@/services/firebase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useEditStage, { StageState } from "../../hooks/useEditStage";
// GameMode Forms
import LessonForm from "./LessonForm";
import BugBustForm from "./BugBustForm";
import CodeRushForm from "./CodeRushForm";
import CodeCrafterForm from "./CodeCrafterForm";
import BrainBytesForm from "./BrainBytesForm";

export interface AddNewStageProps {
  subject: string;
  lessonId: string;
  levelId: string;
  stageId: string;
  close: (val?: boolean) => void;
}

export default function AddNewStage({
  subject,
  lessonId,
  levelId,
  stageId,
  close,
}: AddNewStageProps): React.ReactElement {
  const gameModes: string[] = ["Lesson", "BugBust", "CodeRush", "CodeCrafter", "BrainBytes"];
  const { state, dispatch } = useEditStage();
  const [activeTab, setActiveTab] = useState<string>("Lesson");
  const queryClient = useQueryClient();
  const [localStageId, setLocalStageId] = useState<string | null>(stageId || null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  // CodeCrafter
  const [file, setFile] = useState<File | null>(null);
  const [replicateFile, setReplicateFile] = useState<string>("");

  console.log(stageId);

  // Editor visibility by subject
  const visibleEditors: Record<string, string[]> = {
    Html: ["html"],
    Css: ["html", "css"],
    JavaScript: ["html", "css", "js"],
    Database: ["sql"],
  };

  // Helper for filtering data per game mode
  const filterStateByGameMode = (stateData: any, mode: string): any => {
    const common = {
      title: stateData.title,
      description: stateData.description,
      isHidden: stateData.isHidden,
      type: mode,
      instruction: stateData.instruction,
      codingInterface: stateData.codingInterface,
    };

    switch (mode) {
      case "Lesson":
        return { ...common, blocks: stateData.blocks };
      case "BugBust":
        return { ...common };
      case "CodeRush":
        return { ...common, timer: stateData.timer };
      case "BrainBytes":
        return { ...common, choices: stateData.choices };
      case "CodeCrafter":
        return { ...common, copyCode: stateData.copyCode };
      default:
        return common;
    }
  };

  // MUTATION
  const addStageMutation = useMutation<any, Error, void>({
    mutationFn: async () => {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");
      const token = await user.getIdToken(true);
      const hasImages = state.blocks?.some(
        (block: any) => block.type === "Image" && block.value instanceof File
      );

      const updatedState = { ...state, isHidden: activeTab === "Lesson" ? false : true };
      const allowedFields = visibleEditors[subject] || [];
      const cleanedCodingInterface = Object.fromEntries(
        Object.entries(updatedState.codingInterface || {}).filter(
          ([key, val]) => allowedFields.includes(key) && typeof val === "string" && val.trim() !== ""
        )
      );
      updatedState.codingInterface = cleanedCodingInterface as StageState["codingInterface"];

      // Filter data per game mode
      const filteredState = filterStateByGameMode(updatedState, activeTab);

      if (!hasImages) {
        // JSON request
        return axios.post(
          `${import.meta.env.VITE_BACK_END}/fireBaseAdmin/addNEWStage`,
          {
            category: subject,
            lessonId,
            levelId,
            stageState: filteredState,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // FormData request for images
        const formData = new FormData();
        formData.append("category", subject);
        formData.append("lessonId", lessonId);
        formData.append("levelId", levelId);

        const processedBlocks = state.blocks.map((block: any, index: number) => {
          if (block.type === "Image" && block.value instanceof File) {
            const fileType = block.value.type.split("/")[1] || "png";
            const fieldName = `image_${block.id || index + 1}`;
            formData.append(fieldName, block.value, `${fieldName}.${fileType}`);
            return { ...block, value: fieldName };
          }
          return block;
        });

        const filteredStateWithBlocks = filterStateByGameMode(
          { ...updatedState, blocks: processedBlocks },
          activeTab
        );

        formData.append("stageState", JSON.stringify(filteredStateWithBlocks));

        return axios.post(
          `${import.meta.env.VITE_BACK_END}/fireBaseAdmin/addNEWStage`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    },
    onSuccess: async (res) => {
      const newStageId = res.data.newStageId;
      setLocalStageId(newStageId);

      toast.success("Stage added successfully!", { position: "top-center" });

      // Auto-upload video ONLY if creating new stage
      if (videoFile) {
        try {
          const user = auth.currentUser;
          if (!user) throw new Error("No authenticated user");
          const token = await user.getIdToken(true);
          const formData = new FormData();
          formData.append("video", videoFile);
          formData.append("category", subject);
          formData.append("lessonId", lessonId);
          formData.append("levelId", levelId);
          formData.append("stageId", newStageId);

          await axios.post(
            `${import.meta.env.VITE_BACK_END}/fireBaseAdmin/uploadVideo`,
            formData,
            {
              headers: { "x-source": "mobile-app", Authorization: `Bearer ${token}` },
            }
          );
        } catch (err) {
          console.error("Video upload failed:", err);
          toast.error("Video upload failed");
        }
      }
      if (file) {
        try {
          const user = auth.currentUser;
          if (!user) throw new Error("No authenticated user");
          const token = await user.getIdToken(true);
          const formData = new FormData();
          formData.append("replicateFile", file);
          formData.append("category", subject);
          formData.append("lessonId", lessonId);
          formData.append("levelId", levelId);
          formData.append("stageId", newStageId);

          const fileRes = await axios.post(
            import.meta.env.VITE_BACK_END + "/fireBaseAdmin/uploadFile",
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setReplicateFile(fileRes.data.url);
          toast.success("File uploaded successfully!");
        } catch (err) {
          console.error("File upload failed:", err);
          toast.error("File upload failed");
        }
      }

      queryClient.invalidateQueries({ queryKey: ["stages", subject, lessonId, levelId] });
    },
    onError: (error) => {
      console.error("Failed to add new stage:", error);
      toast.error("Failed to add new stage.");
    },
  });

  // HANDLE SUBMIT
  const handleSave = (e: React.FormEvent): void => {
    e.preventDefault();
    addStageMutation.mutate();
  };

  return (
    <div className="bg-[#25293B] rounded-2xl p-4 sm:p-6 relative flex items-center justify-center h-full overflow-auto scrollbar-custom">
      {/* Close */}
      <button
        onClick={() => close(false)}
        className="absolute top-3 right-3 text-white text-2xl bg-[#ff4d4d] hover:bg-[#e04444] 
          w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-md cursor-pointer"
      >
        ✕
      </button>

      <div className="flex flex-col gap-6 w-full h-full">
        <div>
          <h1 className="font-exo text-white text-xl sm:text-2xl font-bold">Select Stage Type</h1>

          <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-between gap-3 mt-5 mb-5">
            {gameModes.map((gm) => (
              <button
                key={gm}
                onClick={() => {
                  setActiveTab(gm);
                  dispatch({ type: "UPDATE_FIELD", field: "type", value: gm });
                }}
                type="button"
                className={`font-exo text-white text-xs sm:text-sm font-bold cursor-pointer
                  px-3 py-2 rounded-3xl min-w-[28%] sm:min-w-[18%]
                  transition-all duration-500 
                  ${activeTab === gm ? "bg-[#563f99] scale-105" : "bg-[#7F5AF0] hover:scale-110"}`}
              >
                {gm}
              </button>
            ))}
          </div>
        </div>

        <form
          className="flex flex-col gap-6 p-4 sm:p-6 rounded-xl bg-[#1b1f2f] shadow-md"
          onSubmit={handleSave}
        >
          {activeTab === "Lesson" && (
            <LessonForm
              state={state}
              dispatch={dispatch}
              stageData={null}
              subject={subject}
              lessonId={lessonId}
              levelId={levelId}
              stageId={localStageId || ""}
              videoFile={videoFile}
              setVideoFile={setVideoFile}
            />
          )}
          {activeTab === "BugBust" && <BugBustForm state={state} dispatch={dispatch} stageData={null} subject={subject} />}
          {activeTab === "CodeRush" && <CodeRushForm state={state} dispatch={dispatch} stageData={null} subject={subject} />}
          {activeTab === "CodeCrafter" && (
            <CodeCrafterForm
              state={state}
              dispatch={dispatch}
              stageData={null}
              subject={subject}
              lessonId={lessonId}
              levelId={levelId}
              stageId={stageId}
              replicateFile={replicateFile}
              setReplicateFile={setReplicateFile}
              file={file}
              setFile={setFile}
            />
          )}
          {activeTab === "BrainBytes" && (
            <BrainBytesForm state={state} dispatch={dispatch} stageData={null} activeTab={activeTab} />
          )}

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={addStageMutation.isPending}
              className={`font-exo font-bold text-white text-sm cursor-pointer
                w-[40%] sm:w-[30%] py-2 rounded-3xl bg-[#5FDC70] 
                hover:scale-105 hover:drop-shadow-[0_0_6px_rgba(95,220,112,0.8)]
                transition duration-300 ease-in-out
                ${addStageMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {addStageMutation.isPending ? "Saving..." : "Add Stage"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
