import React from "react";
import { motion } from "framer-motion";
import { MdArrowBackIos } from "react-icons/md";
import { FaPlay, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface PlaygroundHeaderProps {
  handleEvaluate: () => void;
  runCode: () => void;
  isEvaluating: boolean;
}

const PlaygroundHeader: React.FC<PlaygroundHeaderProps> = ({ handleEvaluate, runCode, isEvaluating }) => {
  const navigate = useNavigate();

  return (
    <div className="relative z-10 w-full shrink-0 bg-[#0d0d12] border-b border-[#2a2a3c] h-16 flex items-center px-6 justify-between shadow-lg">
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/main")}
          className="w-10 h-10 rounded-lg bg-[#161622] border border-[#2a2a3c] flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/50 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          <MdArrowBackIos className="ml-1" />
        </motion.button>
        <div className="flex flex-col">
          <h1 className="font-exo font-bold text-xl text-white tracking-tight leading-none">
            Code Playground
          </h1>
          <span className="text-xs text-purple-400 font-mono font-bold tracking-widest uppercase">
            DevLab Environment
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleEvaluate}
          disabled={isEvaluating}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all text-sm font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaRobot />
          {isEvaluating ? "Analyzing..." : "Evaluate"}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={runCode}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500 transition-all text-sm font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(147,51,234,0.4)]"
        >
          <FaPlay /> Run Code
        </motion.button>
      </div>
    </div>
  );
};

export default PlaygroundHeader;
