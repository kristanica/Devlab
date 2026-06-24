import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../index.css";

// Components
import DataqueriesHeader from "../components/dataqueries-playground/DataqueriesHeader";
import DataqueriesSchema from "../components/dataqueries-playground/DataqueriesSchema";
import DataqueriesEditor from "../components/dataqueries-playground/DataqueriesEditor";
import DataqueriesOutput from "../components/dataqueries-playground/DataqueriesOutput";
import DBPlaygroundEval_Popup from "../features/gamemodes/popups/DbPlaygroundEvalPopUp";

// Hooks
import { useDataqueriesLogic } from "../components/dataqueries-playground/useDataqueriesLogic";

const DataqueriesPlayground: React.FC = () => {
  const {
    query,
    setQuery,
    outputHtml,
    tablesHtml,
    hasRunQuery,
    evaluationResult,
    showEvalPopup,
    setShowEvalPopup,
    isEvaluating,
    runQuery,
    resetTables,
    handleEvaluateSQL
  } = useDataqueriesLogic();

  return (
    <div className="w-full h-screen bg-[#06060a] text-slate-200 font-inter overflow-hidden flex flex-col selection:bg-emerald-500/30 relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-teal-900/10 pointer-events-none" />

      <DataqueriesHeader 
        resetTables={resetTables} 
        handleEvaluateSQL={handleEvaluateSQL} 
        runQuery={runQuery} 
        isEvaluating={isEvaluating} 
      />

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row p-4 lg:p-6 gap-6 min-h-0 w-full mx-auto">
        <div className="flex flex-col w-full lg:w-[45%] h-full gap-6">
          <DataqueriesSchema tablesHtml={tablesHtml} />
          <DataqueriesEditor query={query} setQuery={setQuery} />
        </div>

        <DataqueriesOutput hasRunQuery={hasRunQuery} outputHtml={outputHtml} />
      </div>

      <AnimatePresence>
        {showEvalPopup && evaluationResult && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl w-full"
            >
              <DBPlaygroundEval_Popup
                evaluationResult={evaluationResult}
                setShowEvalPopup={setShowEvalPopup}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataqueriesPlayground;
