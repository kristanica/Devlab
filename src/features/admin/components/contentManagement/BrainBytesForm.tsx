import React from "react";
import { Stage } from "../../types";

export interface BrainBytesFormProps {
  stageData: Stage | null;
  state: any;
  dispatch: React.Dispatch<any>;
  activeTab: string;
}

export default function BrainBytesForm({
  stageData,
  state,
  dispatch,
  activeTab,
}: BrainBytesFormProps): React.ReactElement {
  return (
    <>
      {/* Stage Title */}
      <div className="border-cyan-400 border rounded-2xl w-full h-[20%] p-4 bg-[#111827]">
        <h1 className="font-exo text-white text-[2rem] mb-[10px]">Stage Title:</h1>
        <textarea
          value={state.title || stageData?.title || ""}
          onChange={(e) =>
            dispatch({ type: "UPDATE_FIELD", field: "title", value: e.target.value })
          }
          className="w-full h-auto p-4 text-white bg-[#0d13207c] rounded-2xl 
                    focus:border-cyan-500 border border-gray-700 focus:outline-none resize-none"
          placeholder="Enter stage title here."
        />
      </div>
      {/* Stage Description */}
      <div className="border-cyan-400 border rounded-2xl w-full h-[20%] p-4 bg-[#111827]">
        <h1 className="font-exo text-white text-[2rem] mb-[10px]">Stage Description:</h1>
        <textarea
          value={state.description || stageData?.description || ""}
          onChange={(e) =>
            dispatch({ type: "UPDATE_FIELD", field: "description", value: e.target.value })
          }
          className="w-full h-auto p-4 text-white bg-[#0d13207c] rounded-2xl 
                    focus:border-cyan-500 border border-gray-700 focus:outline-none resize-none"
          placeholder="Enter stage description here."
        />
      </div>

      {/* Instruction */}
      <div className="border-cyan-400 border rounded-2xl w-full h-[20%] p-4 bg-[#111827]">
        <h1 className="font-exo text-white text-[2rem] mb-[10px]">Instruction:</h1>
        <textarea
          value={state.instruction || stageData?.instruction || ""}
          onChange={(e) =>
            dispatch({ type: "UPDATE_FIELD", field: "instruction", value: e.target.value })
          }
          className="w-full h-auto p-4 text-white bg-[#0d13207c] rounded-2xl 
                    focus:border-cyan-500 border border-gray-700 focus:outline-none resize-none"
          placeholder="Enter instructions for this stage."
        />
      </div>

      {/* Choices */}
      <div className="border-cyan-400 border rounded-2xl w-full h-auto p-4 bg-[#111827] flex flex-col justify-around gap-4">
        <input
          value={state.choices?.a || (stageData?.choices as any)?.a || ""}
          onChange={(e) =>
            dispatch({ type: "UPDATE_FIELD_CHOICES", field: "a", value: e.target.value })
          }
          type="text"
          placeholder={`A: ${(stageData?.choices as any)?.a || ""}`}
          className="border h-auto rounded-2xl border-gray-700 bg-[#0d13207c] p-2 text-white font-exo focus:border-cyan-500 focus:outline-none"
        />
        <input
          value={state.choices?.b || (stageData?.choices as any)?.b || ""}
          onChange={(e) =>
            dispatch({ type: "UPDATE_FIELD_CHOICES", field: "b", value: e.target.value })
          }
          type="text"
          placeholder={`B: ${(stageData?.choices as any)?.b || ""}`}
          className="border h-auto rounded-2xl border-gray-700 bg-[#0d13207c] p-2 text-white font-exo focus:border-cyan-500 focus:outline-none"
        />
        <input
          value={state.choices?.c || (stageData?.choices as any)?.c || ""}
          onChange={(e) =>
            dispatch({ type: "UPDATE_FIELD_CHOICES", field: "c", value: e.target.value })
          }
          type="text"
          placeholder={`C: ${(stageData?.choices as any)?.c || ""}`}
          className="border h-auto rounded-2xl border-gray-700 bg-[#0d13207c] p-2 text-white font-exo focus:border-cyan-500 focus:outline-none"
        />
        <input
          value={state.choices?.d || (stageData?.choices as any)?.d || ""}
          onChange={(e) =>
            dispatch({ type: "UPDATE_FIELD_CHOICES", field: "d", value: e.target.value })
          }
          type="text"
          placeholder={`D: ${(stageData?.choices as any)?.d || ""}`}
          className="border h-auto rounded-2xl border-gray-700 bg-[#0d13207c] p-2 text-white font-exo focus:border-cyan-500 focus:outline-none"
        />
        <input
          value={state.choices?.correctAnswer || (stageData?.choices as any)?.correctAnswer || ""}
          onChange={(e) =>
            dispatch({
              type: "UPDATE_FIELD_CHOICES",
              field: "correctAnswer",
              value: e.target.value,
            })
          }
          type="text"
          placeholder={`Correct Answer: ${(stageData?.choices as any)?.correctAnswer || ""}`}
          className="border h-auto rounded-2xl border-gray-700 bg-[#0d13207c] p-2 text-white font-exo focus:border-cyan-500 focus:outline-none"
        />
      </div>
    </>
  );
}
