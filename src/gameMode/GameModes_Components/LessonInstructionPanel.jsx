import { useEffect, useState } from "react";
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

import useStoreLastOpenedLevel from "../../components/Custom Hooks/useStoreLastOpenedLevel";

function LessonInstructionPanel() {
  const { gameModeData, levelData, subject,lessonId,levelId, stageId } = useFetchGameModeData();
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
    const fixNewlines = (code) => code?.replace(/\\n/g, "\n").trim() || "";

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
        <Lottie animationData={Loading} loop={true} className="w-[50%] h-[50%]" />
      </div>
    );
  }

  const hasAnyCode =
    formattedCode.html || formattedCode.css || formattedCode.js || formattedCode.sql;

  const handleCopy = (code) => navigator.clipboard.writeText(code);

  return (
    // UPDATED: Thematic background, purple shadow, responsive padding, and text sizing.
    <div className="h-full w-full border-[#2a3141] border-[1px] bg-gray-800/70 backdrop-blur-sm rounded-xl text-white overflow-y-auto p-4 md:p-6 flex flex-col gap-4 font-exo scrollbar-custom">
      {/* Title */}
      {/* Reduced base font size slightly for better fit on mobile and made it responsive */}
      <h2
        className={`text-2xl md:text-[2rem] font-bold text-shadow-lg text-shadow-black ${
          gameModeData?.type === "Lesson"
            ? subject === "Html"
              ? "text-[#FF5733]"
              : subject === "Css"
              ? "text-[#1E90FF]"
              : subject === "Database"
              ? "text-[#4CAF50]"
              : subject === "JavaScript"
              ? "text-[#F7DF1E]"
              : "text-white"
            : "text-[#E35460]"
        }`}
      >
        {levelData.levelOrder}. {gameModeData.title}
      </h2>

      {/* Dynamic Blocks */}
      <div className="flex flex-col gap-4">
        {gameModeData?.blocks?.map((block) => {
          switch (block.type) {
            case "Header":
              return (
                // Responsive Header sizing
                <h3 key={block.id} className="text-xl sm:text-2xl font-bold text-shadow-lg">
                  {block.value}
                </h3>
              );
            case "Paragraph":
              return (
                // Adjusted text size for readability
                <p
                  key={block.id}
                  className="whitespace-pre-line text-justify leading-relaxed text-sm sm:text-[0.95rem]"
                >
                  {block.value}
                </p>
              );
            case "Divider":
              // Divider colors remain the same but ensure correct Tailwind style
              return (
                <div
                  key={block.id}
                  className={`my-6 h-[2px] w-full rounded-full ${
                    subject === "Html"
                      ? "bg-gradient-to-r from-[#FF7F50] to-[#FF5733]"
                      : subject === "Css"
                      ? "bg-gradient-to-r from-[#1E90FF] to-[#4169E1]"
                      : subject === "Database"
                      ? "bg-gradient-to-r from-[#66BB6A] to-[#4CAF50]"
                      : subject === "JavaScript"
                      ? "bg-gradient-to-r from-[#FFF176] to-[#F7DF1E]"
                      : ""
                  }`}
                />
              );
            case "Image":
              // Ensured max height is responsive
              return (
                <img
                  key={block.id}
                  src={block.value}
                  alt="Stage Block"
                  className="my-4 w-full max-h-[300px] md:max-h-[400px] object-contain rounded-2xl shadow-md"
                />
              );
            default:
              return null;
          }
        })}
      </div>

      {/* Instruction + Code Example */}
      {(gameModeData.instruction || hasAnyCode) && (
        // UPDATED: Thematic background for instruction area
        <div className="mt-4 p-4 bg-gray-900 rounded-2xl">
          {gameModeData.instruction && (
            <>
              <h4 className="font-bold text-lg sm:text-xl mb-2">Instruction</h4>
              <p className="whitespace-pre-line text-justify leading-relaxed text-sm">
                {gameModeData.instruction}
              </p>
            </>
          )}

          {hasAnyCode && (
            <>
              <p className="text-lg mb-2 font-bold mt-3">Code Example</p>

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
            </>
          )}
        </div>
      )}

      {/* Video Presentation */}
      {gameModeData.videoPresentation && (
        <div className="mt-6 p-4 bg-gray-900 rounded-2xl">
          <h3 className="font-bold text-lg sm:text-xl mb-2">Video Presentation</h3>
          <video
            src={gameModeData.videoPresentation}
            controls
            className="w-full rounded-xl shadow-lg"
          />
        </div>
      )}
    </div>
  );
}

// Reusable Code Block Component with “Copied!” Popup
const CodeBlock = ({ code, language, color, handleCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = () => {
    handleCopy(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    // UPDATED: Thematic background, purple border
    <div className="relative my-4 bg-gray-900 rounded-xl overflow-hidden border border-purple-800 shadow-md">
      {/* UPDATED: Thematic header background and purple border */}
      <div className="flex justify-between items-center bg-gray-800 px-4 py-2 border-b border-purple-800 relative">
        <p className="font-bold text-sm" style={{ color }}>
          {language.toUpperCase()}
        </p>

        <div className="relative">
          <button
            onClick={handleCopyClick}
            // UPDATED: Thematic purple button
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
                // UPDATED: Thematic purple background for popup
                className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-2 py-1 rounded-md shadow-md z-10"
              >
                Copied!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <pre
        // Ensures code block content is scrollable if needed
        className={`language-${language} m-0 p-4 whitespace-pre-wrap break-words overflow-x-auto text-sm leading-relaxed scrollbar-custom`}
      >
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

export default LessonInstructionPanel;