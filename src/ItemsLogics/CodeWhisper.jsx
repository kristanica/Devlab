import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInventoryStore } from "./Items-Store/useInventoryStore";
import { useGameStore } from "../components/OpenAI Prompts/useBugBustStore";
import Lottie from "lottie-react";
import smallLoading from "../assets/Lottie/loadingSmall.json";

const CodeWhisper = ({ hint, onClose }) => {
  const { removeBuff } = useInventoryStore.getState();
  const loadingHint = useGameStore((state) => state.loadingHint);

  useEffect(() => {
    const removeRevealHint = async () => {
      removeBuff("revealHint");
      console.log("revealHint buff removed from userBuff.");
    };
    removeRevealHint();
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed top-0 left-0 w-full h-full bg-black/60 backdrop-blur-sm flex items-center justify-center border z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-[#1E212F] border border-purple-700 rounded-2xl shadow-2xl min-w-[350px] max-w-lg p-6 text-center relative"
        >
          <h2 className="text-4xl font-exo font-bold mb-5 text-purple-400 drop-shadow-lg">
            ✨ Code Whisper ✨
          </h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#15171F] rounded-xl p-5 max-h-64 overflow-y-auto shadow-inner scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-[#15171F] flex items-center justify-center"
          >
            {loadingHint ? (
<div className="flex flex-col items-center justify-center text-center w-full h-full gap-4">
  <p className="font-exo text-[1rem] text-gray-400 animate-pulse">
    Generating hint...
  </p>
  <Lottie
    animationData={smallLoading}
    loop={true}
    className="w-20 h-20"
  />
</div>

            ) : (
              <p className="font-exo text-[1.2rem] text-gray-300">{hint}</p>
            )}
          </motion.div>

          {!loadingHint && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{
                scale: 1.05,
                background: "linear-gradient(to right, #8B5CF6, #7C3AED)",
                boxShadow: "0px 0px 15px rgba(139,92,246,0.6)",
              }}
              transition={{ bounceDamping: 100 }}
              className="mt-6 px-6 py-3 text-white rounded-xl font-bold bg-purple-600 hover:cursor-pointer shadow-md "
              onClick={() => setTimeout(onClose, 300)}
            >
              Got it!
            </motion.button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CodeWhisper;
