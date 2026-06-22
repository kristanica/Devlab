import React from "react";
import { motion } from "framer-motion";
import { IoLockOpen } from "react-icons/io5";

const AuthInteractiveUI: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-[70%] relative bg-[#06060a] overflow-hidden items-center justify-center perspective-1000">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-indigo-900/10 to-[#06060a] z-0" />
      
      <motion.div
        initial={{ opacity: 0, rotateY: 15, rotateX: 5, z: -100 }}
        animate={{ opacity: 1, rotateY: -5, rotateX: 0, z: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-purple-500/30 bg-[#0c0c16]/80 backdrop-blur-xl shadow-[0_0_60px_rgba(147,51,234,0.15)] overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/20 bg-[#151525]/80">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="text-xs font-mono text-purple-300/70">auth_service@devlab:~</div>
          <div className="w-16" />
        </div>

        <div className="p-8 font-mono text-sm sm:text-base text-slate-300 leading-loose">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <span className="text-fuchsia-400">import</span> {"{ "} <span className="text-yellow-300">authenticate</span> {" }"} <span className="text-fuchsia-400">from</span> <span className="text-green-300">'@devlab/core'</span>;
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }} className="mt-4">
            <span className="text-fuchsia-400">async function</span> <span className="text-blue-300">loginDeveloper</span>(credentials) {"{"}
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.9 }} className="ml-8">
            <span className="text-purple-400">try</span> {"{"}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.6 }} className="ml-16">
            <span className="text-fuchsia-400">const</span> user = <span className="text-fuchsia-400">await</span> <span className="text-blue-300">authenticate</span>(credentials);
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 3.3 }} className="ml-16 mt-2">
            <span className="text-slate-500">// Initialize Developer Arsenal</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 4.0 }} className="ml-16">
            user.<span className="text-blue-300">unlockPotential</span>();
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 4.7 }} className="ml-16 mt-2">
            <span className="text-fuchsia-400">return</span> <span className="text-green-300">"ACCESS GRANTED"</span>;
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 5.4 }} className="ml-8">
            {"}"} <span className="text-purple-400">catch</span> (error) {"{"}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 6.1 }} className="ml-16">
            <span className="text-blue-300">handleBug</span>(error);
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 6.8 }} className="ml-8">
            {"}"}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 7.5 }}>
            {"}"}
          </motion.div>

          <motion.div className="mt-6 flex items-center gap-2">
            <span className="text-purple-400">devlab@auth {">"}</span>
            <motion.span 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-3 h-6 bg-white inline-block"
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [-20, 20, -20] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[10%] top-[20%] z-20 pointer-events-none"
      >
        <div className="px-6 py-4 rounded-xl border border-indigo-500/30 bg-[#1a1a2e]/90 backdrop-blur-md shadow-[0_0_40px_rgba(79,70,229,0.2)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner">
            <IoLockOpen className="text-white text-xl" />
          </div>
          <div>
            <div className="text-xs text-indigo-300 uppercase tracking-wider font-semibold">Security</div>
            <div className="text-lg font-bold text-white font-exo">Encrypted</div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [20, -20, 20] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute left-[10%] bottom-[25%] z-20 pointer-events-none"
      >
        <div className="px-6 py-4 rounded-xl border border-fuchsia-500/30 bg-[#1a1a2e]/90 backdrop-blur-md shadow-[0_0_40px_rgba(217,70,239,0.2)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center shadow-inner">
            <span className="text-white font-bold text-lg">{"</>"}</span>
          </div>
          <div>
            <div className="text-xs text-fuchsia-300 uppercase tracking-wider font-semibold">System</div>
            <div className="text-lg font-bold text-white font-exo">Online</div>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-16 right-16 z-20 text-right pointer-events-none">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center mb-6 ml-auto">
          <span className="text-white font-bold font-exo text-3xl leading-none">D</span>
        </div>
        <h1 className="font-exo text-5xl xl:text-7xl font-bold text-white tracking-tighter mb-4 drop-shadow-2xl">
          DevLab
        </h1>
        <p className="text-slate-300 font-light tracking-wide max-w-md ml-auto text-lg xl:text-xl drop-shadow-lg">
          The ultimate coding platform to build your arsenal, defeat bugs, and become the developer you were meant to be.
        </p>
      </div>
    </div>
  );
};

export default AuthInteractiveUI;
