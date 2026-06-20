import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LandingHeader: React.FC = () => {
  return (
    <header className="relative z-10 w-full h-[10%] min-h-[80px] flex items-center justify-between px-6 sm:px-12 lg:px-20 py-4 border-b border-[#1e1e2e]/60 bg-[#06060a]/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center">
          <span className="text-white font-bold font-exo text-xl leading-none">D</span>
        </div>
        <h1 className="text-2xl sm:text-3xl text-white font-bold font-exo tracking-tight">
          DevLab
        </h1>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Link to="/Login">
          <button className="group relative px-7 py-2.5 sm:px-8 sm:py-2.5 font-medium text-white rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(147,51,234,0.1)] hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] bg-[#13131f] border border-[#2a2a3c] hover:border-purple-500/50">
            <span className="relative z-10 font-inter text-sm sm:text-base tracking-wide">Log In</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </Link>
      </motion.div>
    </header>
  );
};

export default LandingHeader;
