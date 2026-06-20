// Code Mirror
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { EditorView } from "@codemirror/view";
import { htmlLanguage } from "@codemirror/lang-html";
import { LanguageSupport } from "@codemirror/language";
import { autocompletion } from "@codemirror/autocomplete";
// Ui's // PopUps
import Animation from "../../../assets/Lottie/OutputLottie.json";
import Lottie from "lottie-react";
import Evaluation_Popup from "../../GameModes_Popups/Evaluation_Popup";
import toast from "react-hot-toast"
// Utils
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { unlockAchievement } from "../../../components/Custom Hooks/UnlockAchievement";
import { extractTags } from "../../../components/Achievements Utils/Html_KeyExtract";
import { useGameStore } from "../../../components/OpenAI Prompts/useBugBustStore";
import useFetchUserProgress from "../../../components/BackEnd_Data/useFetchUserProgress";
// Data
import useFetchUserData from "../../../components/BackEnd_Data/useFetchUserData";
import useFetchGameModeData from "../../../components/BackEnd_Data/useFetchGameModeData";

// Open AI
import lessonPrompt from "../../../components/OpenAI Prompts/lessonPrompt";

function Html_TE() {
  // Data
  const { userData } = useFetchUserData();
const { gamemodeId, lessonId, levelId, stageId } = useParams();
  const { gameModeData, subject } = useFetchGameModeData();
  const [description, setDescription] = useState("");

  // Utils
  const isCorrect = useGameStore((state) => state.isCorrect);
  const setSubmittedCode = useGameStore((state) => state.setSubmittedCode);


  const iFrame = useRef(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [hasRunCode, setRunCode] = useState(false);
  //  Popup state
  const [showPopup, setShowPopup] = useState(false);
  //
  const [code, setCode] = useState("");

  const { userStageCompleted } = useFetchUserProgress(subject);

const stageKey = `${lessonId}-${levelId}-${stageId}`;
const isStageCompleted = userStageCompleted?.[stageKey] === true;


  // Run Button
  const runCode = () => {
  if (!code.trim()) {
    toast.error("Please enter your code before running.",{
      position: "top-right"
    });
    return;
  }
    setRunCode(true);
    setTimeout(() => {
      const fullCode = `
        <!DOCTYPE html>
        <html lang="en">
        <head></head>
        <body>${code}</body>
        </html>`;
      const doc =
        iFrame.current.contentDocument ||
        iFrame.current.contentWindow.document;
      doc.open();
      doc.write(fullCode);
      doc.close();
    }, 0);
    if (gamemodeId !== "Lesson") {
      const usedTags = extractTags(code);
      if (usedTags.length > 0) {
        unlockAchievement(userData?.uid, "Html", "tagUsed", { usedTags, isCorrect });
      }
    }
  };

// Eval Button (For Lesson mode Only)
  const handleEvaluate = async () => {

  if (!code.trim()) {
    toast.error("Please enter your code before evaluating.",{
      position: "top-right"
    });
    return;
  }

        if (gameModeData?.blocks) {
      const paragraphs = gameModeData.blocks
        .filter(block => block.type === "Paragraph")
        .map(block => block.value)
        .join("\n") || "";
      setDescription(paragraphs);
    }

    setIsEvaluating(true);
    try {
      const result = await lessonPrompt({
        receivedCode: {
          html: code,
          css: "",
          js: "",
        },
        instruction: gameModeData.instruction,
        description: description,
        subject,
      });
      setEvaluationResult(result);
      setShowPopup(true);

    } catch (error) {
      console.error("Error evaluating code:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 w-full lg:h-full md:h-full h-[100vh]">
      
      {/* Code Editor Panel */}
      <div 
        className="bg-[#191a26] h-[55%] md:h-full w-full md:w-1/2 rounded-2xl flex flex-col gap-3 items-center p-3 
                  border-[#2a3141] border-[1px]"
      >
        <div className="flex-1 min-h-0 overflow-auto w-full scrollbar-custom">
          <CodeMirror
            className="text-[1rem] h-full"
            value={code}
              onChange={(val) => {setCode(val)
                setSubmittedCode({ HTML: val })
              }}
            height="100%"
            width="100%"
            extensions={[
              new LanguageSupport(htmlLanguage, [autocompletion({ override: [] })]),
              html({ autoCloseTags: false }),
              EditorView.lineWrapping,
            ]}
            theme={tokyoNight}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-around w-full">
          {/* RUN BUTTON */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05, background: "#7e22ce" }}
            transition={{ bounceDamping: 100 }}
            onClick={runCode}
            // RESPONSIVE PADDING/FONT SIZE
            className="bg-[#9333EA] text-white font-bold rounded-xl p-2 sm:p-3 w-[45%] hover:cursor-pointer hover:drop-shadow-[0_0_6px_rgba(126,34,206,0.4)] text-sm sm:text-base">
            RUN
          </motion.button>
    {(gamemodeId === "Lesson" || isStageCompleted) && (
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05, background: "#7e22ce" }}
        transition={{ bounceDamping: 100 }}
        onClick={handleEvaluate}
        disabled={isEvaluating}
        // RESPONSIVE PADDING/FONT SIZE
        className={`font-bold rounded-xl text-white p-2 sm:p-3 w-[45%] text-sm sm:text-base ${
          isEvaluating 
            ? "bg-gray-600 opacity-50 cursor-not-allowed" 
            : "bg-[#9333EA] hover:cursor-pointer hover:drop-shadow-[0_0_6px_rgba(126,34,206,0.4)]"
        }`}
      >
        {isEvaluating ? "Evaluating..." : "EVALUATE"}
      </motion.button>
    )}
        </div>
      </div>

      {/* Output Panel */}
      <div 
        className="h-[45%] mb-2 md:h-full w-full md:w-1/2 rounded-2xl bg-[#F8F3FF] border-[#2a3141] border-[1px]">
        {hasRunCode ? (
          <iframe
            ref={iFrame}
            title="output"
            className="w-full h-full rounded-xl"
          />
        ) : (
          <div className="w-full h-full flex items-center flex-col justify-center">
            {/* Reduced Lottie size for mobile */}
            <Lottie animationData={Animation} loop={true} className="w-[50%] h-[50%] sm:w-[70%] sm:h-[70%]" />
            {/* Responsive text size */}
            <p className="text-sm text-center p-2">
              YOUR CODE RESULTS WILL APPEAR HERE WHEN YOU RUN YOUR PROJECT
            </p>
          </div>
        )}
      </div>

      {/* Evaluation Popup */}
      <AnimatePresence>
        {showPopup && evaluationResult && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
              <Evaluation_Popup evaluationResult={evaluationResult} setShowPopup={setShowPopup}/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Html_TE;