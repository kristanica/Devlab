import React, { useState } from "react";
import { useEditLevel } from "./BackEndFuntions/useEditLevel";
import { toast } from "react-toastify";
function LevelEdit({ 
  setShowEdit, 
  category, 
  lessonId, 
  levelId, 
  defaultData = {} 
}) {

  const { mutate: editLevel, isLoading } = useEditLevel(category);
  //  Local state for form fields
  const [state, setState] = useState({
    title: defaultData.title || "",
    description: defaultData.description || "",
    coinsReward: defaultData.coinsReward || 0,
    expReward: defaultData.expReward || 0,
  });

  //  Generic input handler
  const handleChange = (key, value) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  //  Save handler
  const handleSave = () => {
    editLevel(
      {
        category,
        lessonId,
        levelId,
        state,
      },
      {
        onSuccess: () => {
          toast.success("Level updated successfully!");
          setShowEdit(false);
        },
        onError: (error) => {
          console.error(error);
          toast.error("Error updating level. Please try again.");
        }
      }
    );
  };

  return (
    <div className="mt-4">
      <div
        className="rounded-2xl bg-[#111827] p-5 sm:p-7 border border-gray-700 
        flex flex-col gap-6 font-exo text-white"
      >
        {/* Title */}
        <div className="flex flex-col gap-2">
          <label className="text-lg font-semibold">Title</label>
          <input
            type="text"
            value={state.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full p-3 rounded-lg bg-[#1f2937] border border-gray-600 
            focus:border-[#56EBFF] focus:outline-none transition-all"
            placeholder="Enter title"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="text-lg font-semibold">Description</label>
          <textarea
            rows={4}
            value={state.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full p-3 rounded-lg bg-[#1f2937] border border-gray-600 
            focus:border-[#56EBFF] focus:outline-none transition-all resize-none"
            placeholder="Enter description"
          />
        </div>

        {/* Coins + Exp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Coins */}
          <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold">Coins Reward</label>
<input
  type="number"
  min="0"
  value={state.coinsReward}
  onChange={(e) => handleChange("coinsReward", Math.max(0, Number(e.target.value)))}
  className="w-full p-3 rounded-lg bg-[#1f2937] border border-gray-600 
  focus:border-[#56EBFF] focus:outline-none transition-all"
  placeholder="0"
/>

          </div>

          {/* EXP */}
          <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold">EXP Reward</label>
<input
  type="number"
  min="0"
  value={state.expReward}
  onChange={(e) => handleChange("expReward", Math.max(0, Number(e.target.value)))}
  className="w-full p-3 rounded-lg bg-[#1f2937] border border-gray-600 
  focus:border-[#56EBFF] focus:outline-none transition-all"
  placeholder="0"
/>

          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 w-full sm:w-[70%] mx-auto">
          
          {/* Save */}
          <button
            disabled={isLoading}
            onClick={handleSave}
            className="p-3 text-lg rounded-xl w-full sm:w-[45%] bg-[#4CAF50] 
            hover:bg-[#45a049] hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>

          {/* Cancel */}
          <button
            onClick={() => setShowEdit(false)}
            className="p-3 text-lg rounded-xl w-full sm:w-[45%] bg-gray-700 
            hover:bg-gray-600 hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

export default LevelEdit;
