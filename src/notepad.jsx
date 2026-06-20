
import { motion } from "framer-motion";
import { useGameStore } from '../../components/OpenAI Prompts/useBugBustStore';

function GameMode_Instruction_PopUp({ title, message, onClose, buttonText}) {

    const { setIsCorrect } = useGameStore.getState();
    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-black/80">
        <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        className="bg-white rounded-2xl p-8 w-[90%] max-w-md text-center shadow-xl">
            <h2 className="text-4xl font-bold text-[#9333EA] mb-4 font-exo">{title}</h2>
            <p className="text-gray-700 mb-6 font-medium whitespace-pre-line font-exo">{message}</p>
<motion.button
    whileTap={{scale:0.95}}
    whileHover={{scale:1.05}}
    transition={{bounceDamping:100}}
    onClick={() => {
        setIsCorrect(false); // reset correctness for new challenge
        onClose(); // close the popup
    }}
    className="bg-[#9333EA] text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-700 cursor-pointer hover:drop-shadow-[0_0_6px_rgba(126,34,206,0.4)]">
    {buttonText}
</motion.button>
        </motion.div>
    </div>
);
}

export default GameMode_Instruction_PopUp