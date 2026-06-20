// Utils
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  html as beautifyHTML,
  css as beautifyCSS,
  js as beautifyJS,
} from "js-beautify";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
// Hooks

import useFetchGameModeData from "../../components/BackEnd_Data/useFetchGameModeData";
import useAnimatedNumber from "../../components/Custom Hooks/useAnimatedNumber";
import { useInventoryStore } from "../../ItemsLogics/Items-Store/useInventoryStore";
// Animation
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Lottie from "lottie-react";
import Loading from '../../assets/Lottie/LoadingDots.json';

import useCodeRushTimer from "../../ItemsLogics/useCodeRushTimer";
import CodeWhisper from "../../ItemsLogics/CodeWhisper";
import { BrainFilter } from "../../ItemsLogics/BrainFilter";
import codeWhisperPrompt from "../../components/OpenAI Prompts/codeWhisperPrompt";
// 
import useStoreLastOpenedLevel from "../../components/Custom Hooks/useStoreLastOpenedLevel";
import { useGameStore } from "../../components/OpenAI Prompts/useBugBustStore";
import useFetchUserProgress from "../../components/BackEnd_Data/useFetchUserProgress";



const CodeBlock = ({ code, language, color }) => {

  const [copied, setCopied] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    // Thematic background, purple border, matching LessonInstructionPanel
    <div className="relative my-4 bg-gray-900 rounded-xl overflow-hidden border border-purple-800 shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-800 px-4 py-2 border-b border-purple-800 relative">
        <p className="font-bold text-sm" style={{ color }}>
          {language.toUpperCase()}
        </p>

        <div className="relative">
          <button
            onClick={handleCopyClick}
            // Thematic purple button
            className="text-white hover:text-white text-xs bg-purple-900/50 px-2 py-1 rounded transition-all hover:bg-purple-700"
          >
            Copy
          </button>

          {/* Animated “Copied!” popup */}
          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                // Thematic purple background for popup
                className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-2 py-1 rounded-md shadow-md z-10"
              >
                Copied!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Code body */}
      <pre
        // Ensures horizontal scrolling for long lines
        className={`language-${language} m-0 p-4 whitespace-pre-wrap break-words overflow-x-auto text-sm leading-relaxed scrollbar-custom`}
      >
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};


function InstructionPanel({
  setIsCorrect,
  setShowisCorrect,
  submitAttempt,
  showPopup,
  showCodeWhisper,
  setShowCodeWhisper,
  setTimesUp,
  pauseTimer,
  resetTimerSignal
}) {
  
  
    const [aiHint, setAiHint] = useState("");
  const activeBuffs = useInventoryStore((state) => state.activeBuffs);
  const submittedCode = useGameStore((state) => state.submittedCode);
  // console.log("Current active buffs:", activeBuffs);
  const {gamemodeId } = useParams();
  const { gameModeData, levelData, subject,lessonId,levelId, stageId } = useFetchGameModeData();
  
  const { userStageCompleted } = useFetchUserProgress(subject); // or however you fetch it
const stageKey = `${lessonId}-${levelId}-${stageId}`;
const isStageCompleted = userStageCompleted?.[stageKey] ?? false;

// At the top of the component, after fetching gameModeData
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
    isStageCompleted
  );
  const { animatedValue } = useAnimatedNumber(buffApplied ? 30 : 0);
  // Format the Code to Display
  const [formattedCode, setFormattedCode] = useState({
    html: "",
    css: "",
    js: "",
    sql:""
  });
    const storeLastOpenedLevel = useStoreLastOpenedLevel();
//  Store last opened level in Firestore on first render
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



 // This is for the Code Interface display
 // Runs once when data becomes available
const fixNewlines = (code) => code?.replace(/\\n/g, "\n").trim() || "";
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
  sql: codingInterface.sql?.trim()
    ? fixNewlines(codingInterface.sql)
    : "",
});

  }, [gameModeData, subject]);
  // Highlight code after formatting
useEffect(() => {
  Prism.highlightAll();
}, [formattedCode]);


  // BrainBytes Options
  const [selectedOption, setSelectedOption] = useState(null);
  const [filtteredOpttions, setFilteredOptions] = useState([]);
  const [used, setUsed] = useState(false);

  const answerCheck = () => {
    if (!selectedOption) {
      toast.error("Select Answer", { position: "top-right", theme: "colored" });
      return;
    }
    const result = selectedOption === gameModeData.choices.correctAnswer;
    setIsCorrect(result);
    setShowisCorrect(true);
  };

  // Timer logic
  const FormatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (gamemodeId === "CodeRush" && gameModeData?.timer) setStarted(true);
  }, [gamemodeId, gameModeData?.timer]);

  useEffect(() => {
    if (started && gamemodeId === "CodeRush" && timer === 0) setTimesUp(true);
  }, [started, timer, gamemodeId, submitAttempt]);

  useEffect(() => {
    if (!gameModeData?.choices) return;
    let optionsArray = Object.entries(gameModeData.choices)
      .filter(([key]) => key !== "correctAnswer")
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    if (activeBuffs.includes("brainFilter")) {
      setUsed(true);
      BrainFilter(optionsArray, gameModeData.choices.correctAnswer)
        .then((filtered) => setFilteredOptions(filtered))
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
        receivedCode: gameModeData?.codingInterface || {}, // directly pass codingInterface
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
      <div className='fixed inset-0 z-50 flex items-center justify-center  bg-black/98'>
        <Lottie animationData={Loading} loop={true} className="w-[50%] h-[50%]" />
      </div>
    );
  }


const hasAnyCode =
  formattedCode.html || formattedCode.css || formattedCode.js || formattedCode.sql;


  return (

    
    <>
    <div className="h-full w-full border-[#2a3141] border-[1px] bg-gray-800/70 backdrop-blur-sm rounded-2xl text-white overflow-y-scroll p-4 md:p-6 flex flex-col gap-5 scrollbar-custom">
      {/* Responsive Title */}
      <h2 className="text-2xl md:text-[2rem] font-bold text-shadow-lg text-shadow-black text-[#E35460]">
        {levelData.levelOrder}. {gameModeData.title}
      </h2>

      {isStageCompleted && (
  <p className="text-sm text-green-400 font-exo mt-1">
    This stage is already completed
  </p>
)}

      {/* Responsive Paragraph */}
      <p className="whitespace-pre-line text-justify leading-relaxed text-sm sm:text-[0.9rem] font-exo">
        {gameModeData.description}
      </p>

      {/* BrainBytes Section */}
      {gameModeData?.type === "BrainBytes" ? (
        // Thematic container
        <div className="mt-4 p-4 bg-gray-900 rounded-2xl flex flex-col gap-3">
          <h3 className="font-bold text-lg sm:text-xl mb-2 font-exo text-shadow-lg text-shadow-black">Instruction</h3>
          <p className="mb-2 whitespace-pre-line text-justify leading-relaxed text-sm sm:text-[0.9rem] font-exo">
            {gameModeData.instruction}
          </p>
          {/* Thematic options container */}
<div className="bg-gray-900 p-3 rounded-xl text-white whitespace-pre-wrap flex flex-col justify-center overflow-hidden">
  <AnimatePresence>
    {filtteredOpttions.map(([key, value]) => (
      <motion.label
        key={key}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.3, type: "pop", stiffness: 300 }}
        className={`flex items-start gap-3 cursor-pointer p-3 m-2 rounded-xl transition-all duration-300 ${
          selectedOption === key ? "bg-purple-700 shadow-lg" : "bg-gray-800 hover:bg-purple-900/50"
        }`}
      >
        <input
          type="radio"
          name="option"
          value={key}
          checked={selectedOption === key}
          onChange={() => setSelectedOption(key)}
          className="accent-purple-500 mt-1"
          disabled={isStageCompleted} // ✅ disable if stage is completed
        />
        <span className="font-mono text-sm break-all">{key}: {value}</span>
      </motion.label>
    ))}
  </AnimatePresence>
</div>
          {/* Thematic and responsive submit button */}
<motion.button
  whileTap={{ scale: 0.95 }}
  whileHover={{ scale: 1.05, background: "#7e22ce" }}
  transition={{ bounceDamping: 100 }}
  onClick={answerCheck}
  disabled={isStageCompleted} // ✅ disable if completed
  className={`w-1/2 sm:w-1/3 md:w-[30%] py-2 self-end rounded-xl font-exo font-bold bg-[#9333EA] 
    ${isStageCompleted ? 'opacity-50 cursor-not-allowed' : 'hover:cursor-pointer hover:bg-[#7e22ce]'} 
    transition duration-300 ease-in-out hover:drop-shadow-[0_0_6px_rgba(188,168,255,0.3)]`}
>
  Submit
</motion.button>
        </div>
      ) : (
        <div className="mt-4 p-4 bg-gray-900 rounded-2xl">
          <h3 className="font-bold text-lg sm:text-xl mb-2 text-shadow-lg text-shadow-black">Instruction</h3>
          <p className="mb-2 font-exo whitespace-pre-line leading-relaxed text-sm sm:text-[0.9rem]">{gameModeData.instruction}</p>

{hasAnyCode && (
  <>
    <p className="text-lg mb-2 font-bold mt-3 font-exo">Code Example</p>

    {formattedCode.html && (
      <CodeBlock
        code={formattedCode.html}
        language="html"
        color="#FF5733"
      />
    )}
    {formattedCode.css && (
      <CodeBlock
        code={formattedCode.css}
        language="css"
        color="#1E90FF"
      />
    )}
    {formattedCode.js && (
      <CodeBlock
        code={formattedCode.js}
        language="js"
        color="#F7DF1E"
      />
    )}
    {formattedCode.sql && (
      <CodeBlock
        code={formattedCode.sql}
        language="sql"
        color="#33cc66"
      />
    )}
  </>
)}

        </div>
      )}

      {/* CodeRush Timer */}
      {gameModeData?.type === "CodeRush" && (
        // Thematic and responsive timer box
        <div className="text-4xl sm:text-[3.2rem] w-full max-w-xs m-auto p-4 flex flex-col justify-center items-center bg-gray-900 rounded-2xl relative">
          <p className="font-exo text-shadow-lg text-shadow-black text-lg sm:text-[1.5rem]">Time:</p>
          <p className="text-[#E35460]">{FormatTimer(timer)}</p>
          <AnimatePresence>
            {buffApplied && (
              <>
                {buffType === "extraTime" && (
                  <motion.span
                    key="extra-time"
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: -10, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 0.8 }}
                    transition={{ duration: 0.8 }}
                    className="absolute top-2 text-green-400 text-2xl font-bold"
                  >
                    +{animatedValue}s
                  </motion.span>
                )}
                {buffType === "timeFreeze" && (
                  <motion.span
                    key="time-freeze"
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: -10, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 0.8 }}
                    transition={{ duration: 0.8 }}
                    className="absolute top-2 text-blue-400 text-2xl font-bold"
                  >
                    Time Frozen!
                  </motion.span>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* CodeCrafter Replication */}
      {gameModeData?.type === "CodeCrafter" && gameModeData?.replicationFile && (
        // Thematic container
        <div className="mt-6 p-4 bg-gray-900 rounded-2xl flex flex-col gap-3">
          <h3 className="font-bold text-lg sm:text-xl mb-2 text-shadow-lg text-shadow-black">Replication Target</h3>
          {/* Responsive iframe height */}
          <iframe
            src={gameModeData.replicationFile}
            title="Replication Preview"
            className="w-full h-[300px] sm:h-[400px] bg-white rounded-xl shadow-md"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}

    </div>
          {/* Code Whisper */}
<AnimatePresence>
  {showCodeWhisper && (
    <CodeWhisper
      hint={aiHint}
      onClose={async () => setShowCodeWhisper(false)}
    />
  )}
</AnimatePresence>
    </>
  );
}


export default InstructionPanel;