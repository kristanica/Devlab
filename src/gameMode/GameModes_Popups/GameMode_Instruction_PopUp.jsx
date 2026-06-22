import { motion } from "framer-motion";
import { useGameStore } from '@/store/useGameStore';

function GameMode_Instruction_PopUp({ title, message, onClose, buttonText}) {
    const { setIsCorrect } = useGameStore.getState();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06060a]/90 backdrop-blur-md p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                className="relative overflow-hidden bg-[#0d0d12]/95 border border-[#2a2a3c] rounded-3xl p-6 sm:p-8 w-full max-w-lg text-center shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
            >
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-32 bg-purple-600/10 blur-[60px] pointer-events-none rounded-t-[50%]" />
                
                <h2 className="relative text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500 mb-6 font-exo tracking-tight drop-shadow-lg">
                    {title}
                </h2>

                <div className="relative text-slate-300 mb-8 font-inter text-sm sm:text-base leading-relaxed whitespace-pre-line text-left bg-white/[0.03] p-6 rounded-2xl border border-white/5 shadow-inner">
                    {message}
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                        setIsCorrect(false); // reset correctness for new challenge
                        onClose(); // close the popup
                    }}
                    className="relative w-full group overflow-hidden bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-exo font-bold text-lg px-8 py-3.5 rounded-xl cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300"
                >
                    <span className="relative z-10 tracking-wide uppercase text-sm sm:text-base">{buttonText}</span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out" />
                </motion.button>
            </motion.div>
        </div>
    );
}

export default GameMode_Instruction_PopUp;
