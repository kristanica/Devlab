import React from "react";
function BugbustForm({stageData, state, dispatch,subject}) {

  const visibleEditors = {
  Html: ["html"],
  Css: ["html", "css"],
  JavaScript: ["html", "css", "js"],
  Database: ["sql"]
};
const show = (field) => visibleEditors[subject]?.includes(field);


  return (
    <>
      {/* Stage Title */}
      <div className="border-cyan-400 border rounded-2xl w-full h-[20%] p-4 bg-[#111827]">
        <h1 className="font-exo text-white text-[2rem] mb-[10px]">Stage Title:</h1>
        <textarea
          value={state.title || stageData?.title || ""}
          onChange={(e) =>
            dispatch({ type: "UPDATE_FIELD", field: "title", value: e.target.value || stageData?.title  })
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

{/* Coding Interface Section */}
<div className="border-cyan-400 border rounded-2xl w-full p-4 bg-[#111827] mt-4">
  <h1 className="font-exo text-white text-[2rem] mb-[10px]">
    Coding Interface
  </h1>

  {/* HTML */}
  {show("html") && (
    <div className="mt-4">
      <h2 className="font-exo text-white text-lg mb-2">HTML:</h2>
      <textarea
        value={state.codingInterface.html || ""}
        onChange={(e) =>
          dispatch({
            type: "UPDATE_CODING_INTERFACE",
            field: "html",
            value: e.target.value,
          })
        }
        className="w-full h-[6rem] p-3 text-white bg-[#0d13207c] rounded-2xl
          focus:border-cyan-500 border border-gray-700 focus:outline-none resize-none"
        placeholder="Enter HTML code here..."
      />
    </div>
  )}

  {/* CSS */}
  {show("css") && (
    <div className="mt-4">
      <h2 className="font-exo text-white text-lg mb-2">CSS:</h2>
      <textarea
        value={state.codingInterface.css || ""}
        onChange={(e) =>
          dispatch({
            type: "UPDATE_CODING_INTERFACE",
            field: "css",
            value: e.target.value,
          })
        }
        className="w-full h-[6rem] p-3 text-white bg-[#0d13207c] rounded-2xl
          focus:border-cyan-500 border border-gray-700 focus:outline-none resize-none"
        placeholder="Enter CSS code here..."
      />
    </div>
  )}

  {/* JavaScript */}
  {show("js") && (
    <div className="mt-4">
      <h2 className="font-exo text-white text-lg mb-2">JavaScript:</h2>
      <textarea
        value={state.codingInterface.js || ""}
        onChange={(e) =>
          dispatch({
            type: "UPDATE_CODING_INTERFACE",
            field: "js",
            value: e.target.value,
          })
        }
        className="w-full h-[6rem] p-3 text-white bg-[#0d13207c] rounded-2xl
          focus:border-cyan-500 border border-gray-700 focus:outline-none resize-none"
        placeholder="Enter JavaScript code here..."
      />
    </div>
  )}

  {/* SQL */}
  {show("sql") && (
    <div className="mt-4">
      <h2 className="font-exo text-white text-lg mb-2">SQL:</h2>
      <textarea
        value={state.codingInterface.sql || ""}
        onChange={(e) =>
          dispatch({
            type: "UPDATE_CODING_INTERFACE",
            field: "sql",
            value: e.target.value,
          })
        }
        className="w-full h-[6rem] p-3 text-white bg-[#0d13207c] rounded-2xl
          focus:border-cyan-500 border border-gray-700 focus:outline-none resize-none"
        placeholder="Enter SQL code here..."
      />
    </div>
  )}
</div>

    </>
  );
}

export default BugbustForm;
