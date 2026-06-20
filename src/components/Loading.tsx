import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Loading: React.FC = () => {
  const sentences = [
    "Establishing secure connection...",
    "Fetching developer profile...",
    "Compiling skills arsenal...",
    "Initializing DevLab environment...",
    "Preparing your coding adventure...",
  ];

  const [index, setIndex] = useState(0);

  // Cycle sentences every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % sentences.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-center items-center bg-[#06060a] overflow-hidden">
      {/* Background Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-indigo-900/5 to-[#06060a] z-0" />

      {/* Main Loader Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Rings */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-purple-500/80 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute inset-4 rounded-full border-b-2 border-l-2 border-indigo-500/80 shadow-[0_0_30px_rgba(99,102,241,0.4)]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute inset-10 rounded-full bg-gradient-to-br from-purple-600/40 to-indigo-600/40 blur-md"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-exo text-4xl font-bold tracking-tighter">D</span>
          </div>
        </div>

        {/* Dynamic Text */}
        <div className="h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={sentences[index]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-lg sm:text-xl text-purple-300 font-mono tracking-wide text-center drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            >
              {sentences[index]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-1.5 mt-6 bg-[#1a1a2e] rounded-full overflow-hidden relative">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent"
          />
        </div>
      </div>
    </div>
  );
}

export default Loading;
