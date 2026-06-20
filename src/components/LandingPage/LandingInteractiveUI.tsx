import React from "react";
import { motion } from "framer-motion";

const LandingInteractiveUI: React.FC = () => {
  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center min-h-[450px] lg:min-h-[600px] mt-8 lg:mt-0 relative perspective-1000">
      
      {/* Main Floating Terminal */}
      <motion.div
        initial={{ opacity: 0, rotateY: -10, rotateX: 5, x: 20 }}
        animate={{ opacity: 1, rotateY: 0, rotateX: 0, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-full max-w-[500px] z-10 rounded-2xl border border-purple-500/30 bg-[#0c0c16]/80 backdrop-blur-xl shadow-[0_0_50px_rgba(147,51,234,0.2)] overflow-hidden"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/20 bg-[#151525]/80">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="text-xs font-mono text-purple-300/70">player_1@devlab:~</div>
          <div className="w-16" /> {/* spacer for balance */}
        </div>

        {/* Terminal Body */}
        <div className="p-6 font-mono text-sm sm:text-base text-slate-300 leading-loose">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-fuchsia-400">const</span> <span className="text-indigo-300">dev</span> = <span className="text-fuchsia-400">new</span> <span className="text-yellow-300">Developer</span>(<span className="text-green-300">'You'</span>);
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <span className="text-indigo-300">dev</span>.<span className="text-blue-300">equipSkill</span>(<span className="text-green-300">'React'</span>);
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            <span className="text-indigo-300">dev</span>.<span className="text-blue-300">defeatBug</span>(<span className="text-green-300">'Uncaught TypeError'</span>);
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
            className="mt-4 flex items-center gap-2"
          >
            <span className="text-purple-400">{">"}</span>
            <span className="text-green-400">Level up! Dev is now Level 99.</span>
          </motion.div>

          <motion.div 
            className="mt-2 flex items-center gap-2"
          >
            <span className="text-purple-400">{">"}</span>
            <motion.span 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-2.5 h-5 bg-white inline-block"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Floating XP Element */}
      <motion.div 
        animate={{ y: [-15, 15, -15] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 top-10 sm:-right-8 sm:top-24 z-20 pointer-events-none"
      >
        <div className="px-5 py-4 rounded-xl border border-indigo-500/30 bg-[#1a1a2e]/90 backdrop-blur-md shadow-[0_0_30px_rgba(79,70,229,0.3)] flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner">
            <span className="text-white font-bold text-sm">XP</span>
          </div>
          <div>
            <div className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">Current XP</div>
            <div className="text-lg font-bold text-white font-exo">42,069</div>
          </div>
        </div>
      </motion.div>

      {/* Floating Rank Element */}
      <motion.div 
        animate={{ y: [15, -15, 15] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -left-4 bottom-10 sm:-left-12 sm:bottom-28 z-20 pointer-events-none"
      >
        <div className="px-5 py-4 rounded-xl border border-fuchsia-500/30 bg-[#1a1a2e]/90 backdrop-blur-md shadow-[0_0_30px_rgba(217,70,239,0.3)] flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center shadow-inner">
            <span className="text-white font-bold text-sm">LVL</span>
          </div>
          <div>
            <div className="text-xs text-fuchsia-300 uppercase tracking-wider font-semibold">Rank</div>
            <div className="text-lg font-bold text-white font-exo">Master</div>
          </div>
        </div>
      </motion.div>

      {/* Background Glow for right side */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />
    </div>
  );
};

export default LandingInteractiveUI;
