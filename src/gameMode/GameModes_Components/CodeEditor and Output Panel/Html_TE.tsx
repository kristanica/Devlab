import React, { useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import toast from "react-hot-toast";

// Code Mirror
import CodeMirror from "@uiw/react-codemirror";
import { html, htmlLanguage } from "@codemirror/lang-html";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { EditorView } from "@codemirror/view";
import { LanguageSupport } from "@codemirror/language";
import { autocompletion } from "@codemirror/autocomplete";

// Icons
import { IoLogoHtml5 } from "react-icons/io5";

// Components & UI
import Animation from "../../../assets/Lottie/OutputLottie.json";
import Evaluation_Popup from "../../GameModes_Popups/Evaluation_Popup";

// Utils
import { unlockAchievement } from "@/services/UnlockAchievement";
import { extractTags } from "../../../components/Achievements Utils/Html_KeyExtract";
import { useGameStore } from "@/store/useGameStore";
import useFetchUserProgress from "../../../components/BackEnd_Data/useFetchUserProgress";
import useFetchUserData from "../../../components/BackEnd_Data/useFetchUserData";
import useFetchGameModeData from "../../../components/BackEnd_Data/useFetchGameModeData";

// Open AI
import lessonPrompt from "../../../components/OpenAI Prompts/lessonPrompt";

const Html_TE: React.FC = () => {
  const { userData } = useFetchUserData();
  const { gamemodeId, lessonId, levelId, stageId } = useParams<{ gamemodeId: string; lessonId: string; levelId: string; stageId: string }>();
  const { gameModeData, subject } = useFetchGameModeData();
  const [description, setDescription] = useState("");

  const isCorrect = useGameStore((state) => state.isCorrect);
  const setSubmittedCode = useGameStore((state) => state.setSubmittedCode);

  const iFrame = useRef<HTMLIFrameElement>(null);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [hasRunCode, setRunCode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [code, setCode] = useState("");

  const { userStageCompleted } = useFetchUserProgress(subject);
  const stageKey = `${lessonId}-${levelId}-${stageId}`;
  const isStageCompleted = userStageCompleted?.[stageKey] === true;

  const runCode = useCallback(() => {
    if (!code.trim()) {
      toast.error("Please enter your code before running.", { position: "top-right" });
      return;
    }
    
    setRunCode(true);
    
    setTimeout(() => {
      if (!iFrame.current) return;
      const fullCode = `
        <!DOCTYPE html>
        <html lang="en">
        <head></head>
        <body>${code}</body>
        </html>`;
      const doc = iFrame.current.contentDocument || iFrame.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(fullCode);
        doc.close();
      }
    }, 0);

    if (gamemodeId !== "Lesson") {
      const usedTags = extractTags(code);
      if (usedTags.length > 0) {
        unlockAchievement(userData?.uid, "Html", "tagUsed", { usedTags, isCorrect });
      }
    }
  }, [code, gamemodeId, userData?.uid, isCorrect]);

  const handleEvaluate = useCallback(async () => {
    if (!code.trim()) {
      toast.error("Please enter your code before evaluating.", { position: "top-right" });
      return;
    }

    let currentDesc = description;
    if (gameModeData?.blocks) {
      const paragraphs = gameModeData.blocks
        .filter((block: any) => block.type === "Paragraph")
        .map((block: any) => block.value)
        .join("\n") || "";
      setDescription(paragraphs);
      currentDesc = paragraphs;
    }

    setIsEvaluating(true);
    try {
      const result = await lessonPrompt({
        receivedCode: { html: code, css: "", js: "" },
        instruction: gameModeData?.instruction,
        description: currentDesc,
        subject,
      });
      setEvaluationResult(result);
      setShowPopup(true);
    } catch (error) {
      console.error("Error evaluating code:", error);
    } finally {
      setIsEvaluating(false);
    }
  }, [code, description, gameModeData, subject]);

  const onCodeChange = useCallback((val: string) => {
    setCode(val);
    setSubmittedCode({ HTML: val });
  }, [setSubmittedCode]);

  return (
    <div className="flex flex-col gap-2 w-full h-full relative overflow-hidden">
      
      {/* Output Panel */}

      <div className="flex flex-col w-full flex-1 min-h-0 min-h-0">
        <div className="flex-1 flex flex-col bg-[#0d0d12] border border-[#2a2a3c] rounded-xl overflow-hidden shadow-xl min-h-0">
          <div className="bg-[#161622] border-b border-[#2a2a3c] px-2 py-1 shrink-0 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">
              Live Preview
            </span>
          </div>
          <div className="flex-1 bg-white relative">
            {hasRunCode ? (
              <iframe
                ref={iFrame}
                title="output"
                className="w-full h-full absolute inset-0 border-none bg-white"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col justify-center items-center bg-[#06060a]">
                <Lottie animationData={Animation} className="w-48 h-48 opacity-50 mb-4" />
                <p className="text-purple-500/50 font-exo font-bold tracking-widest uppercase text-sm border border-purple-500/20 px-6 py-2 rounded-lg bg-purple-500/5">
                  Awaiting Execution
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      

{/* Code Editor Panel */}

      <div className="flex flex-col w-full flex-1 min-h-0 gap-2 min-h-0">
        <div className="flex-1 bg-[#0d0d12] border border-[#2a2a3c] rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-0">
          
          {/* Editor Top Bar (Mac Style) */}
          <div className="bg-[#06060a] flex items-end pt-2 pl-2 pr-4 shrink-0 relative">
            <button
              className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-t-lg font-exo font-bold text-xs sm:text-sm transition-all duration-200 border-t border-x bg-[#1a1b26] text-orange-500 border-[#2a2a3c] border-b-[#1a1b26] shadow-[0_-5px_15px_rgba(0,0,0,0.3)]"
              style={{ marginBottom: "-1px" }}
            >
              <IoLogoHtml5 size={16} className="text-orange-500" />
              index.html
            </button>
            <div className="flex-1 border-b border-[#2a2a3c] self-stretch flex items-center justify-end pb-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_5px_#ff5f5680]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_5px_#ffbd2e80]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_5px_#27c93f80]" />
              </div>
            </div>
          </div>

          {/* CodeMirror */}
          <div className="flex-1 overflow-auto bg-[#1a1b26] relative z-0">
            <CodeMirror
              className="h-full text-xs sm:text-sm scrollbar-custom"
              value={code}
              onChange={onCodeChange}
              height="100%"
              width="100%"
              extensions={[
                new LanguageSupport(htmlLanguage, [autocompletion({ override: [] })]),
                html({ autoCloseTags: false }),
                EditorView.lineWrapping,
              ]}
              theme={tokyoNight}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                foldGutter: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3 w-full mt-2 shrink-0">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={runCode}
            className="px-6 py-1.5 bg-[#0d0d12] hover:bg-purple-500/10 border border-[#2a2a3c] hover:border-purple-500/50 text-slate-300 hover:text-purple-300 font-exo font-bold text-xs tracking-widest rounded-lg transition-all shadow-sm"
          >
            RUN
          </motion.button>

          {(gamemodeId === "Lesson" || isStageCompleted) && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={!isEvaluating ? { scale: 1.05 } : {}}
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className={`px-6 py-1.5 font-exo font-bold text-xs tracking-widest rounded-lg transition-all shadow-sm ${
                isEvaluating 
                  ? "bg-[#161622] border border-[#2a2a3c] text-slate-500 cursor-not-allowed" 
                  : "bg-purple-600 hover:bg-purple-500 text-white border border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              }`}
            >
              {isEvaluating ? "EVALUATING..." : "EVALUATE"}
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showPopup && evaluationResult && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-[#06060a]/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Evaluation_Popup evaluationResult={evaluationResult} setShowPopup={setShowPopup} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(Html_TE);