import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import InputSelectorComp from "./InputSelector";
import TestDropDownMenu from "./TestDropDownMenu";
import { auth } from "@/services/firebase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ContentBlock } from "../../types";

export interface AddNewLevelFormProps {
  subject: string;
  lessonId: string;
  levelId: string | number;
  close: () => void;
}

interface LevelState {
  title: string;
  description: string;
  coinsReward: number;
  expReward: number;
}

interface StageState {
  title: string;
  description: string;
  instruction: string;
  codingInterface: { html: string; css: string; js: string; sql: string };
  blocks: ContentBlock[];
  videoPresentation: string;
}

export default function AddNewLevelForm({
  subject,
  lessonId,
  levelId,
  close,
}: AddNewLevelFormProps): React.ReactElement {
  // ---------------- LEVEL STATE ----------------
  const [levelState, setLevelState] = useState<LevelState>({
    title: "",
    description: "",
    coinsReward: 0,
    expReward: 0,
  });

  // ---------------- STAGE STATE ----------------
  const [stageState, setStageState] = useState<StageState>({
    title: "",
    description: "",
    instruction: "",
    codingInterface: { html: "", css: "", js: "", sql: "" },
    blocks: [],
    videoPresentation: "",
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string>("");
  const [files, setFiles] = useState<Record<string, File>>({});
  const [selectedItem, setSelectedItem] = useState<string>("");

  // ---------------- CODING INTERFACE ----------------
  const visibleEditors: Record<string, string[]> = {
    Html: ["html"],
    Css: ["html", "css"],
    JavaScript: ["html", "css", "js"],
    Database: ["sql"],
  };
  const show = (field: string): boolean => !!visibleEditors[subject]?.includes(field);

  // ---------------- BLOCK HANDLERS ----------------
  const addBlocks = (): void => {
    if (!selectedItem) return;
    const maxId = stageState.blocks.length
      ? Math.max(...stageState.blocks.map((b) => Number(b.id)))
      : 0;
    const newId = maxId + 1;

    // Normalize block type to match backend ("Image" instead of "image")
    const type = selectedItem.toLowerCase() === "image" ? "Image" : selectedItem;

    setStageState((prev) => ({
      ...prev,
      blocks: [...prev.blocks, { id: newId, type, value: "" }],
    }));
    setSelectedItem("");
  };

  const updateBlock = (id: string | number, key: keyof ContentBlock, value: any): void => {
    setStageState((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === id ? { ...b, [key]: value } : b)),
    }));
  };

  const removeBlock = (id: string | number): void => {
    setStageState((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== id),
    }));
    setFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[`image_${id}`];
      return newFiles;
    });
  };

  const handleFileChange = (id: string | number, file: File | null): void => {
    if (!file) return;
    setFiles((prev) => ({ ...prev, [`image_${id}`]: file }));
    updateBlock(id, "value", file);
  };

  const queryClient = useQueryClient();

  // ---------------- CREATE LEVEL + STAGE ----------------
  const createLevelMutation = useMutation<any, Error, void>({
    mutationFn: async () => {
      if (!levelState.title.trim() || !stageState.title.trim()) {
        throw new Error("Level title and Stage title are required.");
      }

      const formData = new FormData();
      formData.append("category", subject);
      formData.append("lessonId", lessonId);
      formData.append("lessonState", JSON.stringify(levelState));

      // ---------------- CLEAN CODING INTERFACE ----------------
      const allowedFields = visibleEditors[subject] || [];
      const cleanedCodingInterface = Object.fromEntries(
        Object.entries(stageState.codingInterface || {}).filter(
          ([key, val]) => allowedFields.includes(key) && val.trim() !== ""
        )
      );

      const stageStateToSave = { ...stageState, codingInterface: cleanedCodingInterface };

      // ---------------- PROCESS BLOCKS ----------------
      const processedBlocks = stageStateToSave.blocks.map((block) => {
        if (block.type === "Image" && block.value instanceof File) {
          const file = block.value;
          const ext = file.type.split("/")[1] || "png";
          const fieldName = `image_${block.id}`;
          formData.append(fieldName, file, `${fieldName}.${ext}`);
          return { ...block, value: fieldName };
        }
        return block;
      });

      formData.append(
        "stageState",
        JSON.stringify({ ...stageStateToSave, blocks: processedBlocks })
      );

      // ---------------- UPLOAD LEVEL ----------------
      const res = await axios.post(
        import.meta.env.VITE_BACK_END + "/fireBaseAdmin/addNewLevel",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // ---------------- OPTIONAL VIDEO UPLOAD ----------------
      if (videoFile) {
        const user = auth.currentUser;
        if (!user) throw new Error("No authenticated user");
        const token = await user.getIdToken(true);
        const videoForm = new FormData();
        videoForm.append("video", videoFile);
        videoForm.append("category", subject);
        videoForm.append("lessonId", lessonId);
        videoForm.append("levelId", res.data.newLevelId);
        videoForm.append("stageId", "Stage1");

        await axios.post(
          import.meta.env.VITE_BACK_END + "/fireBaseAdmin/uploadVideo",
          videoForm,
          { headers: { Authorization: `Bearer ${token}`, "x-source": "mobile-app" } }
        );
      }

      return res.data;
    },
    onSuccess: () => {
      toast.success("Level created!");
      queryClient.invalidateQueries({ queryKey: ["lessons", subject] });
      close();
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.message || "Failed to create level.");
    },
  });

  return (
    <div className="h-full bg-[#111827] text-white p-6 font-exo overflow-y-auto rounded-2xl space-y-6 relative scrollbar-custom">
      <button
        onClick={() => close()}
        className="absolute top-3 right-3 text-white text-2xl bg-[#ff4d4d] hover:bg-[#e04444] 
          w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-md cursor-pointer"
      >
        ✕
      </button>
      {/* LEVEL DETAILS */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold border-b border-gray-700 pb-2">Level Details</h2>
        <div className="flex flex-col gap-3">
          <input
            className="p-3 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400"
            placeholder="Level Title"
            value={levelState.title}
            onChange={(e) =>
              setLevelState({ ...levelState, title: e.target.value })
            }
          />
          <textarea
            className="p-3 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400 resize-none"
            placeholder="Level Description"
            value={levelState.description}
            onChange={(e) =>
              setLevelState({ ...levelState, description: e.target.value })
            }
          />
          <div className="flex gap-3">
            <p>Coins Reward</p>
            <input
              type="number"
              className="flex-1 p-3 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400"
              placeholder="Coins Reward"
              value={levelState.coinsReward}
              onChange={(e) => {
                const value = Number(e.target.value);
                setLevelState({ ...levelState, coinsReward: value < 0 ? 0 : value });
              }}
            />
            <p>Exp Reward</p>
            <input
              type="number"
              className="flex-1 p-3 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400"
              placeholder="Exp Reward"
              value={levelState.expReward}
              onChange={(e) => {
                const value = Number(e.target.value);
                setLevelState({ ...levelState, expReward: value < 0 ? 0 : value });
              }}
            />
          </div>
        </div>
      </section>

      {/* STAGE DETAILS */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold border-b border-gray-700 pb-2">Stage Details</h2>
        <div className="flex flex-col gap-3">
          <input
            className="p-3 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400"
            placeholder="Stage Title"
            value={stageState.title}
            onChange={(e) =>
              setStageState({ ...stageState, title: e.target.value })
            }
          />
          <textarea
            className="p-3 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400 resize-none"
            placeholder="Stage Description"
            value={stageState.description}
            onChange={(e) =>
              setStageState({ ...stageState, description: e.target.value })
            }
          />
          <textarea
            className="p-3 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400 resize-none"
            placeholder="Stage Instruction"
            value={stageState.instruction}
            onChange={(e) =>
              setStageState({ ...stageState, instruction: e.target.value })
            }
          />
        </div>
      </section>

      {/* CODING INTERFACE */}
      <section className="border border-cyan-400 rounded-2xl p-4 space-y-4 bg-[#111827]">
        <h2 className="text-2xl font-bold mb-2">Coding Interface</h2>
        {show("html") && (
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">HTML:</label>
            <textarea
              value={stageState.codingInterface.html}
              onChange={(e) =>
                setStageState((prev) => ({
                  ...prev,
                  codingInterface: { ...prev.codingInterface, html: e.target.value },
                }))
              }
              className="w-full h-24 p-3 bg-[#0d13207c] rounded-2xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              placeholder="Enter HTML code..."
            />
          </div>
        )}
        {show("css") && (
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">CSS:</label>
            <textarea
              value={stageState.codingInterface.css}
              onChange={(e) =>
                setStageState((prev) => ({
                  ...prev,
                  codingInterface: { ...prev.codingInterface, css: e.target.value },
                }))
              }
              className="w-full h-24 p-3 bg-[#0d13207c] rounded-2xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              placeholder="Enter CSS code..."
            />
          </div>
        )}
        {show("js") && (
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">JavaScript:</label>
            <textarea
              value={stageState.codingInterface.js}
              onChange={(e) =>
                setStageState((prev) => ({
                  ...prev,
                  codingInterface: { ...prev.codingInterface, js: e.target.value },
                }))
              }
              className="w-full h-24 p-3 bg-[#0d13207c] rounded-2xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              placeholder="Enter JS code..."
            />
          </div>
        )}
        {show("sql") && (
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">SQL:</label>
            <textarea
              value={stageState.codingInterface.sql}
              onChange={(e) =>
                setStageState((prev) => ({
                  ...prev,
                  codingInterface: { ...prev.codingInterface, sql: e.target.value },
                }))
              }
              className="w-full h-24 p-3 bg-[#0d13207c] rounded-2xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              placeholder="Enter SQL code..."
            />
          </div>
        )}
      </section>

      {/* VIDEO UPLOAD */}
      <section className="border border-cyan-400 rounded-2xl p-4 flex flex-col gap-3 bg-[#111827]">
        <h2 className="text-lg font-bold">Upload Video (Optional)</h2>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            // Validate that it's a video
            if (!file.type.startsWith("video/")) {
              toast.error("Only video files are allowed!");
              e.target.value = ""; // reset input
              return;
            }
            setVideoFile(file);
            // Preview
            setLocalPreview(URL.createObjectURL(file));
          }}
          className="text-white border border-gray-600 rounded-2xl p-3 cursor-pointer"
        />
        {localPreview && (
          <video
            controls
            className="w-full max-h-60 rounded-xl mt-2 border border-gray-700"
          >
            <source src={localPreview} type="video/mp4" />
          </video>
        )}
      </section>

      {/* BLOCKS */}
      <section className="space-y-3">
        <div className="flex justify-between items-center gap-3 bg-[#111827] border border-cyan-400 p-3 rounded-2xl">
          <TestDropDownMenu selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
          <button
            onClick={addBlocks}
            type="button"
            className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-xl transition font-semibold"
          >
            Add Block
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {stageState.blocks.map((block) => (
            <div key={block.id} className="flex flex-col gap-2 bg-gray-800 p-3 rounded-2xl">
              <InputSelectorComp
                block={block}
                dispatch={(action) => {
                  if (action.type === "UPDATE_BLOCK" && action.payload) {
                    updateBlock(block.id, "value", action.payload.value);
                  }
                  if (action.type === "REMOVE_BLOCK") {
                    removeBlock(block.id);
                  }
                }}
              />
              {block.type === "Image" && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(block.id, e.target.files?.[0] || null)}
                  className="text-white border border-gray-600 rounded-2xl p-2"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SUBMIT BUTTON */}
      <button
        onClick={() => createLevelMutation.mutate()}
        disabled={createLevelMutation.isPending}
        className="w-full py-3 bg-blue-600 rounded-xl text-lg font-bold hover:bg-blue-700 transition"
      >
        {createLevelMutation.isPending ? "Processing..." : "Create Level"}
      </button>
    </div>
  );
}
