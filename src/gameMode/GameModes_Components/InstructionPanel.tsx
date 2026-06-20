import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  html as beautifyHTML,
  css as beautifyCSS,
  js as beautifyJS,
} from "js-beautify";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

// Icons
import { HiOutlineCode, HiOutlineInformationCircle } from "react-icons/hi";
import { MdOutlinePlayLesson } from "react-icons/md";
import { FiCheckSquare } from "react-icons/fi";

// Hooks
import useFetchGameModeData from "../../components/BackEnd_Data/useFetchGameModeData";
import useAnimatedNumber from "../../components/Custom Hooks/useAnimatedNumber";
import { useInventoryStore } from "../../ItemsLogics/Items-Store/useInventoryStore";
import useStoreLastOpenedLevel from "../../components/Custom Hooks/useStoreLastOpenedLevel";
import { useGameStore } from "../../components/OpenAI Prompts/useBugBustStore";
import useFetchUserProgress from "../../components/BackEnd_Data/useFetchUserProgress";
import useCodeRushTimer from "../../ItemsLogics/useCodeRushTimer";
import { BrainFilter } from "../../ItemsLogics/BrainFilter";

// Animation & UI
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Lottie from "lottie-react";
import Loading from "../../assets/Lottie/LoadingDots.json";
import CodeWhisper from "../../ItemsLogics/CodeWhisper";
import codeWhisperPrompt from "../../components/OpenAI Prompts/codeWhisperPrompt";

interface CodeBlockProps {
  code: string;
  language: string;
  color: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, color }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="relative my-3 bg-[#06060a] rounded-xl overflow-hidden border border-[#2a2a3c] shadow-md font-mono transition-all hover:border-[#3f3f5a]">
      <div className="flex justify-between items-center bg-[#13131f] px-3 py-1.5 border-b border-[#2a2a3c] relative">
        <div className="flex items-center gap-2">
          <HiOutlineCode className="text-slate-500" />
          <p className="font-bold text-xs tracking-widest" style={{ color }}>
            {language.toUpperCase()}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={handleCopyClick}
            className="text-slate-300 hover:text-white text-[10px] uppercase bg-[#161622] px-2 py-1 rounded border border-[#2a2a3c] transition-all hover:bg-purple-500/10 hover:border-purple-500/30 cursor-pointer"
          >
            Copy
          </button>

          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] px-2 py-1 rounded z-10 font-bold"
              >
                Copied!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <pre
        className={`language-${language} m-0 p-3 whitespace-pre-wrap break-words overflow-x-auto text-[11px] sm:text-xs leading-normal scrollbar-custom text-slate-300`}
      >
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

interface InstructionPanelProps {
  setIsCorrect?: (val: boolean) => void;
  setShowisCorrect?: (val: boolean) => void;
  submitAttempt?: (val: boolean) => void;
  showPopup?: boolean;
  showCodeWhisper?: boolean;
  setShowCodeWhisper?: (val: boolean) => void;
  setTimesUp?: (val: boolean) => void;
  pauseTimer?: boolean;
  resetTimerSignal?: boolean;
}

const InstructionPanel: React.FC<InstructionPanelProps> = ({
  setIsCorrect,
  setShowisCorrect,
  submitAttempt,
  showPopup,
  showCodeWhisper,
  setShowCodeWhisper,
  setTimesUp,
  pauseTimer,
  resetTimerSignal,
}) => {
  const [aiHint, setAiHint] = useState("");
  const activeBuffs = useInventoryStore((state) => state.activeBuffs);
  const submittedCode = useGameStore((state) => state.submittedCode);
  const { gamemodeId } = useParams();
  const { gameModeData, levelData, subject, lessonId, levelId, stageId } =
    useFetchGameModeData();

  const { userStageCompleted } = useFetchUserProgress(subject);
  const stageKey = `${lessonId}-${levelId}-${stageId}`;
  const isStageCompleted = userStageCompleted?.[stageKey] ?? false;

  useEffect(() => {
    if (isStageCompleted && gameModeData?.choices?.correctAnswer) {
      setSelectedOption(gameModeData.choices.correctAnswer);
    }
  }, [isStageCompleted, gameModeData]);

  const [timer, buffApplied, buffType] = useCodeRushTimer(
    gameModeData?.timer,
    gamemodeId,
    gameModeData,
    showPopup,
    pauseTimer,
    resetTimerSignal,
    isStageCompleted,
  );
  const { animatedValue } = useAnimatedNumber(buffApplied ? 30 : 0);
  const [formattedCode, setFormattedCode] = useState({
    html: "",
    css: "",
    js: "",
    sql: "",
  });
  const storeLastOpenedLevel = useStoreLastOpenedLevel();

  useEffect(() => {
    if (levelData && gameModeData && subject) {
      storeLastOpenedLevel.mutate({
        subject,
        gameModeData,
        lessonId,
        levelId,
        stageId,
      });
    }
  }, [levelData, gameModeData, subject]);

  const fixNewlines = (code: string) => code?.replace(/\\n/g, "\n").trim() || "";
  useEffect(() => {
    if (!gameModeData || !subject) return;
    const codingInterface = gameModeData?.codingInterface || {};
    setFormattedCode({
      html: codingInterface.html?.trim()
        ? beautifyHTML(fixNewlines(codingInterface.html), {
            indent_size: 2,
            preserve_newlines: true,
            wrap_line_length: 60,
          })
        : "",
      css: codingInterface.css?.trim()
        ? beautifyCSS(fixNewlines(codingInterface.css), {
            indent_size: 2,
            preserve_newlines: true,
            wrap_line_length: 60,
          })
        : "",
      js: codingInterface.js?.trim()
        ? beautifyJS(fixNewlines(codingInterface.js), {
            indent_size: 2,
            preserve_newlines: true,
            wrap_line_length: 60,
          })
        : "",
      sql: codingInterface.sql?.trim() ? fixNewlines(codingInterface.sql) : "",
    });
  }, [gameModeData, subject]);

  useEffect(() => {
    Prism.highlightAll();
  }, [formattedCode]);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [filtteredOpttions, setFilteredOptions] = useState<any[]>([]);
  const [used, setUsed] = useState(false);

  const answerCheck = () => {
    if (!selectedOption) {
      toast.error("Select Answer", { position: "top-right", theme: "colored" });
      return;
    }
    const result = selectedOption === gameModeData.choices.correctAnswer;
    setIsCorrect?.(result);
    setShowisCorrect?.(true);
  };

  const FormatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (gamemodeId === "CodeRush" && gameModeData?.timer) setStarted(true);
  }, [gamemodeId, gameModeData?.timer]);

  useEffect(() => {
    if (started && gamemodeId === "CodeRush" && timer === 0) setTimesUp?.(true);
  }, [started, timer, gamemodeId, submitAttempt]);

  useEffect(() => {
    if (!gameModeData?.choices) return;
    let optionsArray = Object.entries(gameModeData.choices)
      .filter(([key]) => key !== "correctAnswer")
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    if (activeBuffs.includes("brainFilter")) {
      setUsed(true);
      BrainFilter(optionsArray, gameModeData.choices.correctAnswer)
        .then((filtered: any) => setFilteredOptions(filtered))
        .catch(console.error);
    } else if (!used) {
      setFilteredOptions(optionsArray);
    }
  }, [gameModeData, activeBuffs]);

  useEffect(() => {
    if (showCodeWhisper && gameModeData) {
      const fetchAiHint = async () => {
        const result = await codeWhisperPrompt({
          description: gameModeData.description,
          instruction: gameModeData.instruction,
          receivedCode: gameModeData?.codingInterface || {},
          submittedCode: submittedCode,
        });

        if (result?.whisper) {
          setAiHint(result.whisper);
        } else {
          setAiHint("No hint available.");
        }
      };
      fetchAiHint();
    }
  }, [showCodeWhisper, gameModeData]);

  if (!levelData || !gameModeData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06060a]/80 backdrop-blur-sm">
        <Lottie
          animationData={Loading}
          loop={true}
          className="w-48 h-48 sm:w-64 sm:h-64"
        />
      </div>
    );
  }

  const hasAnyCode =
    formattedCode.html ||
    formattedCode.css ||
    formattedCode.js ||
    formattedCode.sql;

  // Determine Subject Theme Color
  const subjectColor =
    subject === "Html"
      ? "text-[#FF5733]"
      : subject === "Css"
      ? "text-[#1E90FF]"
      : subject === "Database"
      ? "text-[#4CAF50]"
      : subject === "JavaScript"
      ? "text-[#F7DF1E]"
      : "text-purple-400";

  const subjectBorder =
    subject === "Html"
      ? "border-[#FF5733]"
      : subject === "Css"
      ? "border-[#1E90FF]"
      : subject === "Database"
      ? "border-[#4CAF50]"
      : subject === "JavaScript"
      ? "border-[#F7DF1E]"
      : "border-purple-400";

  return (
    <>
      <div className="h-full w-full border border-[#2a2a3c] bg-[#0d0d12] rounded-xl text-slate-200 overflow-y-auto p-4 sm:p-5 flex flex-col gap-5 shadow-xl scrollbar-custom">
        
        {/* Dynamic Title Card */}
        <div className={`flex flex-col gap-2 border border-[#2a2a3c] bg-gradient-to-br from-[#161622] to-[#0d0d12] p-4 rounded-xl shadow-md border-t-2 ${subjectBorder}`}>
          <div className="flex items-center gap-2">
            <MdOutlinePlayLesson className={`text-2xl ${subjectColor}`} />
            <h2 className="text-lg md:text-xl font-bold text-white font-exo tracking-tight">
              {levelData.levelOrder}. {gameModeData.title}
            </h2>
          </div>
          {isStageCompleted && (
            <div className="flex items-center gap-1 mt-1 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded w-max">
              <FiCheckSquare className="text-green-400 text-[10px]" />
              <p className="text-[10px] uppercase text-green-400 font-inter font-bold tracking-wider">
                Stage Completed
              </p>
            </div>
          )}
        </div>

        {/* Description Box */}
        {gameModeData.description && (
          <div className="flex gap-3 bg-[#13131f] border border-[#2a2a3c] p-4 rounded-xl shadow-sm hover:border-[#3f3f5a] transition-colors">
            <HiOutlineInformationCircle className="text-slate-400 text-xl flex-shrink-0 mt-0.5" />
            <p className="whitespace-pre-line text-justify leading-normal text-xs sm:text-sm font-inter text-slate-300">
              {gameModeData.description}
            </p>
          </div>
        )}

        {gameModeData?.type === "BrainBytes" ? (
          <div className="flex flex-col gap-3">
            <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl shadow-inner border-l-4 border-l-purple-500">
              <h3 className="font-bold text-sm sm:text-base font-exo text-purple-200 mb-2">Instruction</h3>
              <p className="whitespace-pre-line text-justify leading-normal text-xs sm:text-sm font-inter text-slate-200">
                {gameModeData.instruction}
              </p>
            </div>
            
            <div className="flex flex-col gap-2 mt-2 w-full">
              <AnimatePresence>
                {filtteredOpttions.map(([key, value]) => (
                  <motion.label
                    key={key}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl transition-all duration-300 border shadow-sm ${
                      selectedOption === key ? "bg-purple-600/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "bg-[#161622] border-[#2a2a3c] hover:bg-[#1a1b26] hover:border-purple-500/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="option"
                      value={key}
                      checked={selectedOption === key}
                      onChange={() => setSelectedOption(key)}
                      className="accent-purple-500 mt-[2px] scale-125 flex-shrink-0 cursor-pointer"
                      disabled={isStageCompleted}
                    />
                    <span className={`font-inter text-xs sm:text-sm break-words leading-tight ${selectedOption === key ? "text-purple-100 font-bold" : "text-slate-300"}`}>{value}</span>
                  </motion.label>
                ))}
              </AnimatePresence>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={answerCheck}
              disabled={isStageCompleted}
              className={`w-full py-2.5 mt-2 rounded-lg font-exo font-bold text-sm tracking-wider shadow-md text-white
                ${isStageCompleted ? 'bg-[#2a2a3c] text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 cursor-pointer border border-purple-500/50'} 
                transition-all duration-300`}
            >
              SUBMIT ANSWER
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {gameModeData.instruction && (
              <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl shadow-inner border-l-4 border-l-purple-500">
                <h3 className="font-bold text-sm sm:text-base font-exo text-purple-200 mb-2 flex items-center gap-2">
                  <FiCheckSquare /> Instruction
                </h3>
                <p className="font-inter whitespace-pre-line leading-normal text-xs sm:text-sm text-slate-200">{gameModeData.instruction}</p>
              </div>
            )}

            {hasAnyCode && (
              <div className="mt-2">
                <p className="text-sm mb-2 font-bold font-exo text-slate-300 flex items-center gap-2 uppercase tracking-widest border-b border-[#2a2a3c] pb-2">
                  <HiOutlineCode /> Code Example
                </p>
                {formattedCode.html && <CodeBlock code={formattedCode.html} language="html" color="#FF5733" />}
                {formattedCode.css && <CodeBlock code={formattedCode.css} language="css" color="#1E90FF" />}
                {formattedCode.js && <CodeBlock code={formattedCode.js} language="js" color="#F7DF1E" />}
                {formattedCode.sql && <CodeBlock code={formattedCode.sql} language="sql" color="#33cc66" />}
              </div>
            )}
          </div>
        )}

        {/* Code Rush Timer */}
        {gameModeData?.type === "CodeRush" && (
          <div className="text-2xl sm:text-3xl w-full max-w-[200px] mx-auto my-4 p-4 flex flex-col justify-center items-center bg-[#1a1622] border-2 border-red-500/40 rounded-xl relative shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <p className="font-exo text-slate-300 text-xs sm:text-sm mb-1 uppercase tracking-wider font-bold">Time Remaining</p>
            <p className="text-[#ef4444] font-bold tracking-widest font-mono drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">{FormatTimer(timer)}</p>
            <AnimatePresence>
              {buffApplied && (
                <>
                  {buffType === "extraTime" && (
                    <motion.span
                      key="extra-time"
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -5, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.8 }}
                      transition={{ duration: 0.8 }}
                      className="absolute top-1 text-green-400 text-lg font-bold"
                    >
                      +{animatedValue}s
                    </motion.span>
                  )}
                  {buffType === "timeFreeze" && (
                    <motion.span
                      key="time-freeze"
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -5, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.8 }}
                      transition={{ duration: 0.8 }}
                      className="absolute top-1 text-blue-400 text-sm font-bold uppercase tracking-wider"
                    >
                      Frozen!
                    </motion.span>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Code Crafter Replication Target */}
        {gameModeData?.type === "CodeCrafter" && gameModeData?.replicationFile && (
          <div className="mt-4 flex flex-col gap-3">
            <h3 className="font-bold text-sm sm:text-base text-slate-300 font-exo uppercase tracking-widest border-b border-[#2a2a3c] pb-2 flex items-center gap-2">
              <HiOutlineCode /> Replication Target
            </h3>
            <iframe
              src={gameModeData.replicationFile}
              title="Replication Preview"
              className="w-full h-[200px] sm:h-[300px] bg-white rounded-xl shadow-lg border-2 border-[#2a2a3c]"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCodeWhisper && (
          <CodeWhisper
            hint={aiHint}
            onClose={async () => setShowCodeWhisper?.(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default InstructionPanel;
