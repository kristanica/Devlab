import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LandingHeroCopy: React.FC = () => {
  return (
    <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left pt-10 lg:pt-0">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#13131f] border border-[#2a2a3c] mb-8"
      >
        <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse" />
        <span className="text-slate-300 text-xs sm:text-sm font-medium tracking-widest uppercase">The future of coding</span>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="text-[4rem] sm:text-[5.5rem] lg:text-[7rem] xl:text-[8rem] font-bold font-exo leading-[0.85] tracking-tighter text-white mb-6"
      >
        Dev<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 drop-shadow-[0_0_30px_rgba(147,51,234,0.3)]">Lab</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-slate-300 mb-8"
      >
        <span className="font-medium text-purple-400">Code.</span>{" "}
        <span className="font-medium text-fuchsia-400">Play.</span>{" "}
        <span className="font-medium text-indigo-400">Level Up.</span>
      </motion.p>

      <motion.p 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed mb-10 font-inter font-light tracking-wide"
      >
        Master full-stack web development through immersive, interactive challenges. Build your arsenal, defeat bugs, and become the developer you were meant to be.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
      >
        <Link to="/Login" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-[#06060a] font-semibold tracking-wide shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-all hover:-translate-y-1 active:scale-95 text-lg hover:bg-slate-100">
            Start Playing Free
          </button>
        </Link>
      </motion.div>
    </div>
  );
};

export default LandingHeroCopy;
