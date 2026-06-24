import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";

import CorrectLottie from "../../../assets/Lottie/correctAnsLottie.json";
import WrongLottie from "../../../assets/Lottie/wrongAnsLottie.json";

interface CorrectWrongPopUpProps {
  isCorrect: boolean;
  singleFeedback: string | null;
  onContinue: () => void;
  onRetry: () => void;
}

const CorrectWrongPopUp: React.FC<CorrectWrongPopUpProps> = ({
  isCorrect,
  singleFeedback,
  onContinue,
  onRetry,
}) => {
  return (
    <AnimatePresence>
      {isCorrect ? (
        // CORRECT ANSWER POPUP
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 w-full max-w-lg text-center flex flex-col items-center gap-6">
            <Lottie
              animationData={CorrectLottie}
              loop={false}
              className="w-[55%] sm:w-[45%] h-auto"
            />
            <h1 className="font-exo font-bold text-black text-2xl sm:text-3xl">
              Correct Answer!
            </h1>
            {singleFeedback && (
              <div className="w-full max-h-40 overflow-y-auto bg-gray-100 p-4 rounded-xl shadow-inner scrollbar-custom">
                <p className="text-black text-base sm:text-lg leading-relaxed font-exo">
                  {singleFeedback}
                </p>
              </div>
            )}
            <motion.button
              onClick={onContinue}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.04 }}
              className="bg-[#9333EA] text-white px-6 py-3 rounded-2xl font-semibold 
                         text-base sm:text-lg
                         hover:bg-purple-700 transition-all 
                         hover:drop-shadow-[0_0_8px_rgba(126,34,206,0.5)] cursor-pointer"
            >
              Continue
            </motion.button>
          </div>
        </div>
      ) : (
        // WRONG ANSWER POPUP
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 w-full max-w-md text-center flex flex-col items-center gap-6">
            <Lottie
              animationData={WrongLottie}
              loop={false}
              className="w-[55%] sm:w-[45%] h-auto"
            />
            <h1 className="font-exo font-bold text-black text-2xl sm:text-3xl">
              Wrong Answer
            </h1>
            <motion.button
              onClick={onRetry}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.04 }}
              className="bg-[#9333EA] text-white px-6 py-3 rounded-2xl font-semibold 
                         text-base sm:text-lg
                         hover:bg-purple-700 transition-all 
                         hover:drop-shadow-[0_0_8px_rgba(126,34,206,0.5)] cursor-pointer"
            >
              Retry
            </motion.button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CorrectWrongPopUp;
