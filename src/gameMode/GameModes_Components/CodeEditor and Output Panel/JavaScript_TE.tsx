import React, { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import toast from "react-hot-toast";
import SplitPane from "react-split-pane";

// Code Mirror
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { EditorView } from "@codemirror/view";
import { autocompletion } from "@codemirror/autocomplete";

// Icons
import { IoLogoHtml5, IoLogoCss3, IoLogoJavascript } from "react-icons/io5";

// UI Components
import Animation from "../../../assets/Lottie/OutputLottie.json";
import Evaluation_Popup from "../../GameModes_Popups/Evaluation_Popup";

// Utils
import { unlockAchievement } from "../../../components/Custom Hooks/UnlockAchievement";
import { extractJsKeywords } from "../../../components/Achievements Utils/Js_KeyExtract";
import { useGameStore } from "../../../components/OpenAI Prompts/useBugBustStore";
import useFetchUserData from "../../../components/BackEnd_Data/useFetchUserData";
import useFetchGameModeData from "../../../components/BackEnd_Data/useFetchGameModeData";
import useFetchUserProgress from "../../../components/BackEnd_Data/useFetchUserProgress";

// Open AI
import lessonPrompt from "../../../components/OpenAI Prompts/lessonPrompt";

type TabTypes = "HTML" | "CSS" | "JavaScript";

export const TAB_THEMES = {
  HTML: { color: "orange", text: "text-orange-500", icon: IoLogoHtml5, label: "index.html" },
  CSS: { color: "cyan", text: "text-cyan-500", icon: IoLogoCss3, label: "styles.css" },
  JavaScript: { color: "yellow", text: "text-yellow-400", icon: IoLogoJavascript, label: "script.js" },
};

const JavaScript_TE: React.FC = () => {
  const { userData } = useFetchUserData();
  const { gamemodeId, lessonId, levelId, stageId } = useParams<{ gamemodeId: string; lessonId: string; levelId: string; stageId: string }>();
  const { gameModeData, subject } = useFetchGameModeData();
  const [description, setDescription] = useState("");

  const isCorrect = useGameStore((state) => state.isCorrect);
  const setSubmittedCode = useGameStore((state) => state.setSubmittedCode);

  const tabs: TabTypes[] = ["HTML", "CSS", "JavaScript"];
  const [activeTab, setActiveTab] = useState<TabTypes>("JavaScript");
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [code, setCode] = useState<{ HTML: string; CSS: string; JavaScript: string }>({
    HTML: "",
    CSS: "",
    JavaScript: ""
  });

  const iFrame = useRef<HTMLIFrameElement>(null);
  const [hasRunCode, setRunCode] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const consoleRef = useRef<string[]>([]);

  const getLanguageExtension = useCallback(() => {
    switch (activeTab) {
      case "HTML": return html({ autoCloseTags: false });
      case "CSS": return css();
      case "JavaScript": return javascript({ jsx: true });
      default: return html({ autoCloseTags: false });
    }
  }, [activeTab]);

  const onChange = useCallback(
    (val: string) => {
      setCode((prev) => ({ ...prev, [activeTab]: val }));
      setSubmittedCode({ [activeTab]: val });
    },
    [activeTab, setSubmittedCode]
  );

  const { userStageCompleted } = useFetchUserProgress(subject);
  const stageKey = `${lessonId}-${levelId}-${stageId}`;
  const isStageCompleted = userStageCompleted?.[stageKey] === true;

  const runCode = useCallback(() => {
    const allEmpty = !code.HTML.trim() && !code.CSS.trim() && !code.JavaScript.trim();
    if (allEmpty) {
      toast.error("Please enter your code before running.", { position: "top-right" });
      return;
    }
    
    consoleRef.current = [];
    setLogs([]);
    setRunCode(true);

    if (gamemodeId !== "Lesson") {
      const usedTags = extractJsKeywords(code.JavaScript);
      if (usedTags.length > 0) {
        unlockAchievement(userData?.uid, "JavaScript", "tagUsed", { usedTags, isCorrect });
      }
    }

    setTimeout(() => {
      if (!iFrame.current) return;
      const fullCode = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <script>
          const sendLog = (...args) => {
            const formatted = args.map((a) => {
              if (typeof a === "object") {
                try { return JSON.stringify(a, null, 2); } 
                catch { return String(a); }
              }
              return a;
            });
            window.parent.postMessage({ type: "console-log", args: formatted }, "*");
          };
          console.log = (...args) => sendLog(...args);
          console.error = (...args) => sendLog("Error:", ...args);
          console.warn = (...args) => sendLog("Warning:", ...args);
        </script>
        <style>${code.CSS}</style>
      </head>
      <body>
        ${code.HTML}
        <script>
          try {
            ${code.JavaScript}
          } catch (err) {
            sendLog("Error:", err.message);
          }
        </script>
      </body>
      </html>`;
      
      iFrame.current.srcdoc = fullCode;
    }, 0);
  }, [code, gamemodeId, userData?.uid, isCorrect]);

  const handleEvaluate = useCallback(async () => {
    const allEmpty = !code.HTML.trim() && !code.CSS.trim() && !code.JavaScript.trim();
    if (allEmpty) {
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
        receivedCode: { html: code.HTML, css: code.CSS, js: code.JavaScript },
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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "console-log") {
        consoleRef.current.push(event.data.args.join(" "));
        setLogs([...consoleRef.current]);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden flex">
      {/* @ts-ignore */}
      <SplitPane
        split="vertical"
        minSize={250}
        defaultSize="50%"
        paneStyle={{ overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}
        resizerStyle={{
          cursor: "col-resize",
          width: "6px",
          background: "rgba(255,255,255,0.07)",
          zIndex: 10,
        }}
      >
        {/* Code Editor Panel — LEFT */}
        <div className="flex flex-col h-full gap-2">
          <div className="flex-1 bg-[#0d0d12] border border-[#2a2a3c] rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-0">
            {/* Editor Top Bar (Mac Style) */}
            <div className="bg-[#06060a] flex items-end pt-2 pl-2 pr-4 shrink-0 relative">
              {tabs.map((tab) => {
                const theme = TAB_THEMES[tab];
                const isActive = activeTab === tab;
                const Icon = theme.icon;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-t-lg font-exo font-bold text-xs sm:text-sm transition-all duration-200 border-t border-x ${
                      isActive
                        ? `bg-[#1a1b26] ${theme.text} border-[#2a2a3c] border-b-[#1a1b26] shadow-[0_-5px_15px_rgba(0,0,0,0.3)]`
                        : "bg-[#06060a] text-slate-500 border-transparent hover:bg-[#161622] hover:text-slate-300 border-b-[#2a2a3c]"
                    }`}
                    style={{ marginBottom: isActive ? "-1px" : "0" }}
                  >
                    <Icon size={16} className={isActive ? theme.text : "text-slate-500"} />
                    {theme.label}
                  </button>
                );
              })}
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
                value={code[activeTab]}
                onChange={onChange}
                height="100%"
                width="100%"
                extensions={[getLanguageExtension(), autocompletion({ override: [] }), EditorView.lineWrapping]}
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
          <div className="flex justify-between items-center gap-2 w-full shrink-0">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={runCode}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold font-exo tracking-wider rounded-lg py-1.5 shadow-md transition-colors"
            >
              RUN
            </motion.button>

            {(gamemodeId === "Lesson" || isStageCompleted) && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={!isEvaluating ? { scale: 1.02 } : {}}
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className={`flex-1 font-bold font-exo tracking-wider rounded-lg py-1.5 shadow-md transition-colors ${
                  isEvaluating
                    ? "bg-[#2a2a3c] text-slate-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-500 text-white"
                }`}
              >
                {isEvaluating ? "EVALUATING..." : "EVALUATE"}
              </motion.button>
            )}
          </div>
        </div>

        {/* Live Preview + Console — RIGHT */}
        <div className="h-full flex flex-col gap-2">
          {/* Visual Output */}
          <div className="flex-[3] flex flex-col bg-[#0d0d12] border border-[#2a2a3c] rounded-xl overflow-hidden shadow-xl min-h-0">
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
                  className="w-full h-full absolute inset-0 border-none"
                  sandbox="allow-scripts allow-same-origin allow-modals allow-popups allow-top-navigation-by-user-activation"
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

          {/* Console Output */}
          <div className="flex-[1] flex flex-col bg-[#0d0d12] border border-[#2a2a3c] rounded-xl overflow-hidden shadow-xl min-h-0">
            <div className="bg-[#161622] border-b border-[#2a2a3c] px-2 py-1 shrink-0 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                Console
              </span>
            </div>
            <div className="flex-1 bg-[#06060a] p-2 overflow-auto scrollbar-custom font-mono text-sm">
              {!hasRunCode ? (
                <div className="text-slate-600 italic">No output...</div>
              ) : logs.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {logs.map((log, i) => (
                    <div key={i} className="text-slate-300 border-b border-white/5 pb-1">
                      <span className="text-slate-500 mr-2">❯</span>
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-600 italic">Console is empty</div>
              )}
            </div>
          </div>
        </div>
      </SplitPane>

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

export default React.memo(JavaScript_TE);
