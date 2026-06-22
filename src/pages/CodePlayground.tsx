// @ts-nocheck
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import "../index.css";

// Components
import PlaygroundHeader from "../components/CodePlayground/PlaygroundHeader";
import PlaygroundEditor from "../components/CodePlayground/PlaygroundEditor";
import PlaygroundPreview from "../components/CodePlayground/PlaygroundPreview";
import PlaygroundConsole from "../components/CodePlayground/PlaygroundConsole";
import CodePlaygroundEval_PopUp from "../gameMode/GameModes_Popups/CodePlaygroundEval_PopUp";

// Hooks
import { usePlaygroundLogic } from "../components/CodePlayground/usePlaygroundLogic";

const CodePlayground: React.FC = () => {
  const {
    tabs,
    activeTab,
    setActiveTab,
    run,
    evaluationResult,
    showPopup,
    setShowPopup,
    isEvaluating,
    iFrame,
    logs,
    code,
    onChange,
    runCode,
    handleEvaluate
  } = usePlaygroundLogic();

  return (
    <div className="w-full h-screen bg-[#06060a] text-slate-200 font-inter overflow-hidden flex flex-col selection:bg-purple-500/30 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-indigo-900/10 pointer-events-none" />

      <PlaygroundHeader 
        runCode={runCode} 
        handleEvaluate={handleEvaluate} 
        isEvaluating={isEvaluating} 
      />

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row p-4 lg:p-6 gap-6 min-h-0 w-full mx-auto">
        <PlaygroundEditor 
          tabs={tabs} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          code={code} 
          onChange={onChange} 
        />
        
        <div className="flex flex-col w-full lg:w-[55%] h-full gap-4">
          <PlaygroundPreview run={run} iFrameRef={iFrame} />
          <PlaygroundConsole run={run} logs={logs} />
        </div>
      </div>

      <AnimatePresence>
        {showPopup && evaluationResult && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl w-full"
            >
              <CodePlaygroundEval_PopUp
                evaluationResult={evaluationResult}
                setShowPopup={setShowPopup}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CodePlayground;
