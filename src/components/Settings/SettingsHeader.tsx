import React from "react";
import { motion } from "framer-motion";
import { FaMobileAlt } from "react-icons/fa";

const SettingsHeader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="shrink-0 flex items-center justify-between bg-[#0d0d12] border border-[#2a2a3c] p-6 sm:p-8 rounded-2xl shadow-xl"
    >
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white font-exo tracking-tight">
          User Configuration
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Customize your DevLab identity and manage your account.
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.open("https://drive.google.com/file/d/1EQhmkRyEOiV8Vv-zJVzRXMLS6z99tT96/view", "_blank")}
        className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm tracking-wide bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
      >
        <FaMobileAlt /> Get Mobile App
      </motion.button>
    </motion.div>
  );
};

export default SettingsHeader;
