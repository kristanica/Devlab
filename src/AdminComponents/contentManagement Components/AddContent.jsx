import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import InputSelector from "./Edit_Forms/InputSelector";
import TestDropDownMenu from "./Edit_Forms/TestDropDownMenu";
import { auth } from "../../Firebase/Firebase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function NewLessonForm({ subject, close }) {
  const queryClient = useQueryClient();

  // ---------------- STATE
  const [lessonState, setLessonState] = useState({
    title: "",
    description: "",
    coinsReward: 0,
    expReward: 0,
  });

  const [stageState, setStageState] = useState({
    title: "",
    description: "",
    instruction: "",
    codingInterface: { html: "", css: "", js: "", sql: "" },
    blocks: [],
  });

  const [videoFile, setVideoFile] = useState(null);
  const [localPreview, setLocalPreview] = useState("");
  const [files, setFiles] = useState({});
  const [selectedItem, setSelectedItem] = useState("");

  const visibleEditors = {
    Html: ["html"],
    Css: ["html", "css"],
    JavaScript: ["html", "css", "js"],
    Database: ["sql"],
  };

  const show = (field) => visibleEditors[subject]?.includes(field);

  // ---------------- BLOCK LOGIC
  const addBlocks = () => {
    if (!selectedItem) return;
    const maxId = stageState.blocks.length
      ? Math.max(...stageState.blocks.map((b) => b.id))
      : 0;
    const newId = maxId + 1;
    const type = selectedItem.toLowerCase() === "image" ? "Image" : selectedItem;
    setStageState((prev) => ({
      ...prev,
      blocks: [...prev.blocks, { id: newId, type, value: "" }],
    }));
    setSelectedItem("");
  };

  const updateBlock = (id, key, value) => {
    setStageState((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) =>
        b.id === id ? { ...b, [key]: value } : b
      ),
    }));
  };

  const removeBlock = (id) => {
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

  const handleFileChange = (id, file) => {
    if (!file) return;
    setFiles((prev) => ({ ...prev, [`image_${id}`]: file }));
    updateBlock(id, "value", file);
  };

  // ---------------- MUTATION LOGIC
  const createLessonMutation = useMutation({
    mutationFn: async () => {
      if (!lessonState.title.trim() || !stageState.title.trim()) {
        throw new Error("Lesson title and Stage title are required.");
      }

      const token = await auth.currentUser?.getIdToken(true);
      const formData = new FormData();
      formData.append("category", subject);
      formData.append("lessonState", JSON.stringify(lessonState));

      const allowedFields = visibleEditors[subject] || [];
      const cleanedCodingInterface = Object.fromEntries(
        Object.entries(stageState.codingInterface).filter(
          ([key, val]) => allowedFields.includes(key) && val.trim() !== ""
        )
      );

      const stageStateToSave = {
        ...stageState,
        codingInterface: cleanedCodingInterface,
      };

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

      // 🔹 Create the lesson
      const res = await axios.post(
        "https://devlab-server-railway-master-production.up.railway.app/fireBaseAdmin/addNEWLesson",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // 🔹 Upload video if present
      if (videoFile) {
        const videoForm = new FormData();
        videoForm.append("video", videoFile);
        videoForm.append("category", subject);
        videoForm.append("lessonId", res.data.nextLessonId);
        videoForm.append("levelId", "Level1");
        videoForm.append("stageId", "Stage1");

        await axios.post(
          "https://devlab-server-railway-master-production.up.railway.app/fireBaseAdmin/uploadVideo",
          videoForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Lesson created successfully!");
      queryClient.invalidateQueries(["lessons", subject]); // optional cache refresh
      close();
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.message || "Failed to create lesson.");
    },
  });

  // ---------------- SUBMIT HANDLER
  const handleSubmit = (e) => {
    e.preventDefault();
    createLessonMutation.mutate();
  };

  return (
    <div className="h-[90vh] bg-[#111827] relative text-white p-4 sm:p-6 font-exo overflow-y-auto rounded-2xl space-y-6 scrollbar-custom">
            <button
        onClick={() => close()}
        className="absolute top-3 right-3 text-white text-2xl bg-[#ff4d4d] hover:bg-[#e04444] 
          w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-md cursor-pointer"
      >
        ✕
      </button>
      {/* LESSON DETAILS */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold border-b border-gray-700 pb-2">Level Details</h2>
        <input
          placeholder="Lesson Title"
          value={lessonState.title}
          onChange={(e) => setLessonState({ ...lessonState, title: e.target.value })}
          className="p-3 bg-gray-800 rounded-xl w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <textarea
          placeholder="Lesson Description"
          value={lessonState.description}
          onChange={(e) => setLessonState({ ...lessonState, description: e.target.value })}
          className="p-3 bg-gray-800 rounded-xl w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none h-20 sm:h-24"
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <p>Coins Reward</p>
<input
  type="number"
  min="0"
  placeholder="Coins Reward"
  value={lessonState.coinsReward}
  onChange={(e) => {
    const value = Number(e.target.value);
    setLessonState({ ...lessonState, coinsReward: value < 0 ? 0 : value });
  }}
  className="flex-1 p-3 bg-gray-800 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
/>
<p>Exp Reward</p>
<input
  type="number"
  min="0"
  placeholder="EXP Reward"
  value={lessonState.expReward}
  onChange={(e) => {
    const value = Number(e.target.value);
    setLessonState({ ...lessonState, expReward: value < 0 ? 0 : value });
  }}
  className="flex-1 p-3 bg-gray-800 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
/>

        </div>
      </section>

      {/* STAGE DETAILS */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold border-b border-gray-700 pb-2">Stage Details</h2>
        <input
          placeholder="Stage Title"
          value={stageState.title}
          onChange={(e) => setStageState({ ...stageState, title: e.target.value })}
          className="p-3 bg-gray-800 rounded-xl w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <textarea
          placeholder="Stage Description"
          value={stageState.description}
          onChange={(e) => setStageState({ ...stageState, description: e.target.value })}
          className="p-3 bg-gray-800 rounded-xl w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none h-20 sm:h-24"
        />
        <textarea
          placeholder="Stage Instruction"
          value={stageState.instruction}
          onChange={(e) => setStageState({ ...stageState, instruction: e.target.value })}
          className="p-3 bg-gray-800 rounded-xl w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none h-20 sm:h-24"
        />
      </section>

      {/* CODING INTERFACE */}
      <section className="border border-cyan-400 rounded-2xl p-3 sm:p-4 space-y-4 bg-[#111827]">
        <h2 className="text-2xl font-bold mb-2">Coding Interface</h2>
        {["html", "css", "js", "sql"].map(
          (lang) =>
            show(lang) && (
              <div key={lang} className="flex flex-col">
                <label className="mb-1 font-semibold">{lang.toUpperCase()}:</label>
                <textarea
                  value={stageState.codingInterface[lang]}
                  onChange={(e) =>
                    setStageState((prev) => ({
                      ...prev,
                      codingInterface: { ...prev.codingInterface, [lang]: e.target.value },
                    }))
                  }
                  className="w-full h-20 sm:h-24 p-3 bg-[#0d13207c] rounded-2xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  placeholder={`Enter ${lang.toUpperCase()} code...`}
                />
              </div>
            )
        )}
      </section>

      {/* VIDEO UPLOAD */}
      <section className="border border-cyan-400 rounded-2xl p-3 sm:p-4 flex flex-col gap-3 bg-[#111827]">
        <h2 className="text-lg font-bold">Upload Video (Optional)</h2>
<input
  type="file"
  accept="video/*"
  onChange={(e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validate that it's a video
    if (!file.type.startsWith("video/")) {
      toast.error("Only video files are allowed!");
      e.target.value = null; // reset input so user can try again
      return;
    }
    setVideoFile(file);
    // Preview
    setLocalPreview(URL.createObjectURL(file));
  }}
  className="text-white border border-gray-600 rounded-2xl p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500"
/>
        {localPreview && (
          <video
            controls
            className="w-full max-h-52 sm:max-h-60 rounded-xl mt-2 border border-gray-700"
          >
            <source src={localPreview} type="video/mp4" />
          </video>
        )}
      </section>

      {/* BLOCKS */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#111827] border border-cyan-400 p-3 rounded-2xl">
          <TestDropDownMenu selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
          <button
            onClick={addBlocks}
            type="button"
            className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-xl transition font-semibold cursor-pointer"
          >
            Add Block
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {stageState.blocks.map((block) => (
            <div key={block.id} className="flex flex-col gap-2 bg-gray-800 p-3 rounded-2xl">
              <InputSelector
                block={block}
                dispatch={(action) => {
                  if (action.type === "UPDATE_BLOCK") updateBlock(block.id, "value", action.payload.value);
                  if (action.type === "REMOVE_BLOCK") removeBlock(block.id);
                }}
              />
              {block.type === "Image" && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(block.id, e.target.files[0])}
                  className="text-white border border-gray-600 rounded-2xl p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SUBMIT BUTTON */}
      <button
        onClick={handleSubmit}
        disabled={createLessonMutation.isPending}
        className={`w-full py-3 rounded-xl text-lg font-bold transition cursor-pointer ${
          createLessonMutation.isPending
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {createLessonMutation.isPending ? "Creating..." : "Create Lesson"}
      </button>
    </div>
  );
}
