import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

function InputSelector({ block, dispatch }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    //If block.value is a File (newly uploaded)
    if (block.type === "Image" && block.value instanceof File) {
      const objectUrl = URL.createObjectURL(block.value);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }

    //If block.value is an existing URL (from Firestore or server)
    if (block.type === "Image" && typeof block.value === "string") {
      setPreview(block.value);
      return;
    }

    // Default: no preview
    setPreview(null);
  }, [block.value, block.type]);


const handleChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  // Validate that the file is an image
  if (!file.type.startsWith("image/")) {
    toast.error("Only image files are allowed!");
    e.target.value = null; // reset input so user can try again
    return;
  }
  // Dispatch the file to your state management
  dispatch({
    type: "UPDATE_BLOCK",
    payload: { id: block.id, value: file },
  });


};

  // Divider block
  if (block.type === "Divider") {
    return (
      <div className="border border-dashed border-gray-600 rounded-2xl my-3 h-6 bg-[#111827] opacity-50 flex justify-center items-center">
        <p className="text-gray-400 text-xs">--- Divider ---</p>
        <button
          type="button"
          onClick={() => dispatch({ type: "REMOVE_BLOCK", id: block.id })}
          className="ml-2 bg-red-500 hover:bg-red-600 text-white rounded-xl px-2 py-0.5 text-xs"
        >
          ✕
        </button>
      </div>
    );
  }

  // Image block with preview (existing or new)
  if (block.type === "Image") {
    return (
      <div className="border border-gray-600 rounded-2xl p-3 mt-2 bg-[#111827]">
        <p className="text-white text-sm mb-2">Image Block</p>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="text-white border w-full rounded-2xl py-2 px-3 cursor-pointer relative z-10 opacity-0"
          />
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 border border-gray-600 rounded-2xl pointer-events-none">
            Click or drag an image here
          </div>
        </div>
        {/* Show preview if available */}
        {preview && (
          <div className="mt-3 flex justify-center">
            <img
              src={preview}
              alt="Preview"
              className="max-h-40 rounded-xl border border-gray-700 object-contain"
            />
          </div>
        )}
        <button
          type="button"
          onClick={() => dispatch({ type: "REMOVE_BLOCK", id: block.id })}
          className="mt-3 bg-red-500 hover:bg-red-600 text-white rounded-xl px-3 py-1 text-sm"
        >
          Remove
        </button>
      </div>
    );
  }

  // Default block
  return (
    <div className="border border-gray-600 rounded-2xl p-3 mt-2 bg-[#111827]">
      <p className="text-white text-sm mb-2">
        Block Type: <span className="font-bold">{block.type}</span>
      </p>
      <textarea
        value={block.value}
        onChange={(e) =>
          dispatch({
            type: "UPDATE_BLOCK",
            payload: {
              id: block.id,
              value: e.target.value,
            },
          })
        }
        className="w-full h-[4rem] p-2 text-white bg-[#0d13207c] rounded-2xl focus:border-cyan-500 border border-gray-700 focus:outline-none resize-none"
        placeholder={`Enter content for ${block.type} block`}
      />
      <button
        type="button"
        onClick={() => dispatch({ type: "REMOVE_BLOCK", id: block.id })}
        className="mt-2 bg-red-500 hover:bg-red-600 text-white rounded-xl px-3 py-1 text-sm"
      >
        Remove
      </button>
    </div>
  );
}

export default InputSelector;
