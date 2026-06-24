import React from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import LockAnimation from "../../../assets/Lottie/LockItem.json";
import { lessonConfig } from "./lessonConfig";

interface LessonLockedModalProps {
  subject: string;
  onClose: () => void;
}

const LessonLockedModal: React.FC<LessonLockedModalProps> = ({
  subject,
  onClose,
}) => {
  const config = lessonConfig[subject];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0d0d12] border border-[#2a2a3c] text-white p-6 md:p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl flex flex-col items-center gap-4"
      >
        <Lottie
          animationData={LockAnimation}
          loop={false}
          className="w-32 h-32"
        />
        <h2 className="text-2xl font-exo font-bold text-white tracking-tight">
          Access Denied
        </h2>
        <p className="text-slate-400 text-sm">
          You must complete the previous lessons to unlock this secure sector.
        </p>
        <button
          className={`mt-2 w-full bg-[#161622] border border-[#2a2a3c] ${config.theme.hoverBorder} hover:bg-[#1e1e2e] py-3 rounded-lg text-slate-200 font-bold transition-all`}
          onClick={onClose}
        >
          Acknowledge
        </button>
      </motion.div>
    </div>
  );
};

export default LessonLockedModal;
