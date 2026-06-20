import { useEffect,useState} from "react";
export default function CodeRushForm({stageData, state, dispatch ,subject}) {

const visibleEditors = {
  Html: ["html"],
  Css: ["html", "css"],
  JavaScript: ["html", "css", "js"],
  Database: ["sql"]
};
const show = (field) => visibleEditors[subject]?.includes(field);

const [minutes, setMinutes] = useState(0);
const [seconds, setSeconds] = useState(0);

useEffect(() => {
  if (stageData?.timer) {
    const total = stageData.timer;
    setMinutes(Math.floor(total / 60));
    setSeconds(total % 60);
  }
}, [stageData]);


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

      {/* Hint + Timer */}
      <div className="border-cyan-400 border rounded-2xl w-full p-4 bg-[#111827] flex flex-col gap-5">
        {/* Timer */}
<div className="h-[50%]">
  <h1 className="font-exo text-white text-[2rem] mb-[10px]">Timer:</h1>

  {/* Minutes */}
  <label className="text-white font-exo text-lg">Minutes</label>
<input
  type="number"
  value={minutes}
  onChange={(e) => {
    let m = Number(e.target.value);

    // prevent negative input
    if (m < 0) m = 0;

    setMinutes(m);

    const totalSeconds = m * 60 + seconds;
    dispatch({ type: "UPDATE_FIELD", field: "timer", value: totalSeconds });
  }}
  className="w-full p-3 text-white bg-[#0d13207c] rounded-2xl 
             focus:border-cyan-500 border border-gray-700 focus:outline-none text-3xl mb-4"
  min={0}
/>


  {/* Seconds */}
  <label className="text-white font-exo text-lg">Seconds</label>
  <input
    type="number"
    value={seconds}
    onChange={(e) => {
      let s = Number(e.target.value);

      // clamp between 0–59 to avoid weird values
      if (s < 0) s = 0;
      if (s > 59) s = 59;

      setSeconds(s);

      const totalSeconds = minutes * 60 + s;
      dispatch({ type: "UPDATE_FIELD", field: "timer", value: totalSeconds });
    }}
    className="w-full p-3 text-white bg-[#0d13207c] rounded-2xl 
               focus:border-cyan-500 border border-gray-700 focus:outline-none text-3xl"
  />
</div>

      </div>
    </>
  );
}
