import React, { useEffect, useState } from "react";
import {
  html as beautifyHTML,
  css as beautifyCSS,
  js as beautifyJS,
} from "js-beautify";
import useFetchGameModeData from "../../components/BackEnd_Data/useFetchGameModeData";
import Lottie from "lottie-react";
import Loading from "../../assets/Lottie/LoadingDots.json";
import { motion, AnimatePresence } from "framer-motion";

import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

// Icons
import { HiOutlineCode, HiOutlineInformationCircle } from "react-icons/hi";
import { MdOutlinePlayLesson } from "react-icons/md";
import { FiCheckSquare } from "react-icons/fi";

import useStoreLastOpenedLevel from "../../components/Custom Hooks/useStoreLastOpenedLevel";

const LessonInstructionPanel: React.FC = () => {
  const { gameModeData, levelData, subject, lessonId, levelId, stageId } = useFetchGameModeData();
  const storeLastOpenedLevel = useStoreLastOpenedLevel();

  const [formattedCode, setFormattedCode] = useState({
    html: "",
    css: "",
    js: "",
    sql: "",
  });

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

  // Runs once when data becomes available
  useEffect(() => {
    if (!gameModeData || !subject) return;

    const codingInterface = gameModeData?.codingInterface || {};
    const fixNewlines = (code: string) => code?.replace(/\\n/g, "\n").trim() || "";

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
      sql: codingInterface.sql?.trim() || "",
    });
  }, [gameModeData, subject]);

  useEffect(() => {
    Prism.highlightAll();
  }, [formattedCode]);

  if (!levelData || !gameModeData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06060a]/90 backdrop-blur-sm">
        <Lottie animationData={Loading} loop={true} className="w-32 h-32 sm:w-48 sm:h-48" />
      </div>
    );
  }

  const hasAnyCode =
    formattedCode.html || formattedCode.css || formattedCode.js || formattedCode.sql;

  const handleCopy = (code: string) => navigator.clipboard.writeText(code);

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
    <div className="h-full w-full border border-[#2a2a3c] bg-[#0d0d12] rounded-xl text-slate-200 overflow-y-auto p-4 sm:p-5 flex flex-col gap-5 shadow-xl scrollbar-custom">
      
      {/* Title */}
      <div className={`flex flex-col gap-2 border border-[#2a2a3c] bg-gradient-to-br from-[#161622] to-[#0d0d12] p-4 rounded-xl shadow-md border-t-2 ${subjectBorder}`}>
        <div className="flex items-center gap-2">
          <MdOutlinePlayLesson className={`text-2xl ${subjectColor}`} />
          <h2 className="text-lg md:text-xl font-bold text-white font-exo tracking-tight">
            {levelData.levelOrder}. {gameModeData.title}
          </h2>
        </div>
      </div>

      {/* Dynamic Blocks */}
      <div className="flex flex-col gap-4">
        {gameModeData?.blocks?.map((block: any) => {
          switch (block.type) {
            case "Header":
              return (
                <h3 key={block.id} className="text-base sm:text-lg font-bold text-white mt-2 font-exo">
                  {block.value}
                </h3>
              );
            case "Paragraph":
              return (
                <div key={block.id} className="flex gap-3 bg-[#13131f] border border-[#2a2a3c] p-4 rounded-xl shadow-sm hover:border-[#3f3f5a] transition-colors">
                  <p className="whitespace-pre-line text-justify leading-normal text-xs sm:text-sm font-inter text-slate-300">
                    {block.value}
                  </p>
                </div>
              );
            case "Divider":
              return (
                <div
                  key={block.id}
                  className={`my-2 h-[1px] w-full rounded-full shadow-md opacity-50 ${
                    subject === "Html"
                      ? "bg-gradient-to-r from-[#FF7F50] to-[#FF5733]"
                      : subject === "Css"
                      ? "bg-gradient-to-r from-[#1E90FF] to-[#4169E1]"
                      : subject === "Database"
                      ? "bg-gradient-to-r from-[#66BB6A] to-[#4CAF50]"
                      : subject === "JavaScript"
                      ? "bg-gradient-to-r from-[#FFF176] to-[#F7DF1E]"
                      : "bg-gradient-to-r from-purple-500 to-indigo-500"
                  }`}
                />
              );
            case "Image":
              return (
                <img
                  key={block.id}
                  src={block.value}
                  alt="Stage Block"
                  className="my-2 w-full max-h-[200px] md:max-h-[250px] object-contain rounded-lg border border-[#2a2a3c] bg-[#161622]"
                />
              );
            default:
              return null;
          }
        })}
      </div>

      {/* Instruction + Code Example */}
      {(gameModeData.instruction || hasAnyCode) && (
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

              {formattedCode.html && (
                <CodeBlock
                  code={formattedCode.html}
                  language="html"
                  color="#FF5733"
                  handleCopy={handleCopy}
                />
              )}
              {formattedCode.css && (
                <CodeBlock
                  code={formattedCode.css}
                  language="css"
                  color="#1E90FF"
                  handleCopy={handleCopy}
                />
              )}
              {formattedCode.js && (
                <CodeBlock
                  code={formattedCode.js}
                  language="js"
                  color="#F7DF1E"
                  handleCopy={handleCopy}
                />
              )}
              {formattedCode.sql && (
                <CodeBlock
                  code={formattedCode.sql}
                  language="sql"
                  color="#4CAF50"
                  handleCopy={handleCopy}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Video Presentation */}
      {gameModeData.videoPresentation && (
        <div className="mt-4 flex flex-col gap-2">
          <h3 className="font-bold text-sm sm:text-base text-white font-exo border-b border-[#2a2a3c] pb-2">Video Presentation</h3>
          <video
            src={gameModeData.videoPresentation}
            controls
            className="w-full rounded-xl border border-[#2a2a3c] bg-[#161622] shadow-md"
          />
        </div>
      )}
    </div>
  );
};

// Reusable Code Block Component with “Copied!” Popup
interface CodeBlockProps {
  code: string;
  language: string;
  color: string;
  handleCopy: (code: string) => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, color, handleCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = () => {
    handleCopy(code);
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
            className="text-slate-300 hover:text-white uppercase text-[10px] bg-[#161622] px-2 py-1 rounded border border-[#2a2a3c] transition-all hover:bg-purple-500/10 hover:border-purple-500/30 cursor-pointer"
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

export default LessonInstructionPanel;