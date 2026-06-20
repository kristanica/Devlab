import React from "react";
import { motion } from "framer-motion";

const LandingAmbientLights: React.FC = () => {
  return (
    <>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-700/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-700/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <motion.div 
        animate={{ y: [0, -30, 0], opacity: [0.1, 0.2, 0.1] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[60%] w-[30%] h-[30%] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" 
      />
    </>
  );
};

export default LandingAmbientLights;
