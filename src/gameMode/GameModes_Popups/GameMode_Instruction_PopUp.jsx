import { motion } from "framer-motion";
import { useGameStore } from '../../components/OpenAI Prompts/useBugBustStore';

function GameMode_Instruction_PopUp({ title, message, onClose, buttonText}) {
    const { setIsCorrect } = useGameStore.getState();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg">
            <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
                className="bg-[#1A0B2E]/90 border border-purple-500 rounded-2xl p-8 w-[90%] max-w-md text-center shadow-[0_0_20px_rgba(128,0,255,0.7)]">
                <h2 className="text-4xl font-bold text-purple-400 mb-4 font-exo drop-shadow-[0_0_6px_rgba(128,0,255,0.8)]">
                    {title}
                </h2>

                <p className="text-gray-300 mb-6 font-medium whitespace-pre-line font-exo">
                    {message}
                </p>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(128,0,255,0.6)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => {
                        setIsCorrect(false); // reset correctness for new challenge
                        onClose(); // close the popup
                    }}
                    className="bg-purple-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-700 cursor-pointer shadow-[0_0_10px_rgba(128,0,255,0.6)] hover:drop-shadow-[0_0_15px_rgba(128,0,255,0.8)]"
                >
                    {buttonText}
                </motion.button>
            </motion.div>
        </div>
    );
}

export default GameMode_Instruction_PopUp;
