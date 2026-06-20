import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
  import { auth } from "../../../Firebase/Firebase";
  function CodeCrafterForm({stageData, state, dispatch, subject, lessonId, levelId, stageId,  file,setFile,replicateFile,setReplicateFile,}) {

  const [uploading, setUploading] = useState(false);

    const visibleEditors = {
  Html: ["html"],
  Css: ["html", "css"],
  JavaScript: ["html", "css", "js"],
  Database: ["sql"]
};
const show = (field) => visibleEditors[subject]?.includes(field);

  const [localPreview, setLocalPreview] = useState("");




const handleFileChange = (e) => {
  const selected = e.target.files[0];
  if (!selected) return;

  // Validate file type
  if (!selected.name.endsWith(".html")) {
    toast.error("Only .html files are allowed!");
    e.target.value = null; // reset input so user can try again
    return;
  }

  setFile(selected); // from props

  // Create preview URL if needed
  const previewURL = URL.createObjectURL(selected);
  setLocalPreview(previewURL);

  setReplicateFile(""); // clear previous URL
};



const handleUpload = async () => {
  if (!file) return;
  setUploading(true);

  try {
    const token = await auth.currentUser.getIdToken(true);
    const formData = new FormData();
    formData.append("replicateFile", file);
    formData.append("category", subject);
    formData.append("lessonId", lessonId);
    formData.append("levelId", levelId);
    formData.append("stageId", stageId);

    const res = await axios.post(
      `https://devlab-server-railway-master-production.up.railway.app/fireBaseAdmin/uploadFile`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setReplicateFile(res.data.url);  // from props
    setLocalPreview("");
  } catch (err) {
    console.error("File upload failed:", err);
  } finally {
    setUploading(false);
  }
};

    return (
      <>
        {/* Stage Title */}
        <div className="border-cyan-400 border rounded-2xl w-[100%] h-[20%] p-4 bg-[#111827]">
          <h1 className="font-exo text-white text-[2rem] mb-[10px]">Stage Title:</h1>
          <textarea
          value={state.title || stageData?.title || ""}
            onChange={(e) =>
              dispatch({ type: "UPDATE_FIELD", field: "title", value: e.target.value })
            }
            className="w-[100%] h-auto p-4 text-white bg-[#0d13207c] rounded-2xl focus:border-cyan-500 border border-gray-700 focus:outline-none resize-none"
            placeholder="Enter stage title here."
          />
        </div>
        {/* Stage Description */}
        <div className="border-cyan-400 border rounded-2xl w-[100%] h-[20%] p-4 bg-[#111827]">
          <h1 className="font-exo text-white text-[2rem] mb-[10px]">Stage Description:</h1>
          <textarea
            value={state.description || stageData?.description || ""}
            onChange={(e) =>
              dispatch({ type: "UPDATE_FIELD", field: "description", value: e.target.value })
            }
            className="w-[100%] h-auto p-4 text-white bg-[#0d13207c] rounded-2xl focus:border-cyan-500 border border-gray-700 focus:outline-none resize-none"
            placeholder="Enter stage description here."
          />
        </div>

        {/* Instruction */}
        <div className="border-cyan-400 border rounded-2xl w-[100%] h-[20%] p-4 bg-[#111827]">
          <h1 className="font-exo text-white text-[2rem] mb-[10px]">Instruction:</h1>
          <textarea
            value={state.instruction || stageData?.instruction || ""}
            onChange={(e) =>
              dispatch({ type: "UPDATE_FIELD", field: "instruction", value: e.target.value })
            }
            className="w-[100%] h-auto p-4 text-white bg-[#0d13207c] rounded-2xl focus:border-cyan-500 border border-gray-700 focus:outline-none resize-none"
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
        {/* Hint & Replicate */}
        <div className="border-cyan-400 border rounded-2xl w-[100%] h-auto p-4 bg-[#111827] flex flex-col gap-5">
      {/* Replicate (Optional) */}
      <div className="border-cyan-400 border rounded-2xl w-[100%] h-auto p-4 bg-[#111827] flex flex-col gap-5">
        <h1 className="font-exo text-white text-[2rem] mb-[10px]">Replicate (Optional):</h1>
        <input 
          type="file" 
          accept=".html" 
          onChange={handleFileChange} 
          className="text-white border p-4 rounded-2xl cursor-pointer "/>
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="bg-[#7F5AF0] text-white rounded-lg p-2 cursor-pointer">
          {uploading ? "Uploading..." : "Upload"}
        </button>

{replicateFile && (
  <a
    href={replicateFile}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-400 underline mt-2"
  >
    View Uploaded File
  </a>
)}

        {/* HTML PREVIEW */}
{(localPreview || replicateFile || stageData?.replicationFile) && (
  <iframe
    key={localPreview || replicateFile || stageData?.replicationFile}
    src={localPreview || replicateFile || stageData?.replicationFile}
    className="w-full h-auto mt-4 rounded-xl border bg-white border-gray-700"
    title="HTML Preview"
  />
)}


      </div>
        </div>
      </>
    );
  }

  export default CodeCrafterForm;
